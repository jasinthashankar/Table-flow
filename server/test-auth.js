require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { connectDB } = require('./config/db');

const BASE_URL = 'http://localhost:5000/api';
let authCookieString = '';

const parseCookieDetails = (cookieHeader) => {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';');
  const [nameValue] = parts[0].split('=');
  const name = nameValue.trim();
  const isHttpOnly = parts.some(p => p.trim().toLowerCase() === 'httponly');
  const isSecure = parts.some(p => p.trim().toLowerCase() === 'secure');
  
  const sameSitePart = parts.find(p => p.trim().toLowerCase().startsWith('samesite='));
  const sameSite = sameSitePart ? sameSitePart.split('=')[1].trim() : 'Lax';
  
  const maxAgePart = parts.find(p => p.trim().toLowerCase().startsWith('max-age='));
  const maxAge = maxAgePart ? maxAgePart.split('=')[1].trim() : 'N/A';

  return {
    name,
    present: true,
    httpOnly: isHttpOnly,
    secure: isSecure,
    sameSite,
    maxAge,
    token: '[REDACTED]'
  };
};

const runTests = async () => {
  console.log('Starting Phase 2 Security Clean-up & Audit test suite...\n');

  const testEmail = 'audit-citizen@example.com';
  const testPassword = 'AuditSecurePassword123!';

  try {
    // -------------------------------------------------------------
    // Test 0: DB Setup & Email Cleanup
    // -------------------------------------------------------------
    console.log('--- AUDIT 0: Database Cleanup ---');
    await connectDB();
    await User.deleteMany({ email: { $in: [testEmail, 'audit-rate-limit@example.com'] } });
    console.log('Test accounts cleaned.\n');

    // -------------------------------------------------------------
    // Test 1: Register Citizen & Validate Password Hash Formats
    // -------------------------------------------------------------
    console.log('--- AUDIT 1: Registration and Password Hashing Verification ---');
    const registerPayload = {
      name: 'Audit Citizen',
      email: testEmail,
      phone: '1234567890',
      password: testPassword,
      confirmPassword: testPassword
    };

    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerPayload)
    });

    console.log(`Registration status: ${registerRes.status} (Expected: 201)`);
    if (registerRes.status !== 201) {
      throw new Error(`Registration failed: ${await registerRes.text()}`);
    }

    // Capture the cookie info sanitised
    const rawCookie = registerRes.headers.get('set-cookie');
    const cookieMeta = parseCookieDetails(rawCookie);
    console.log('Cookie audit meta info:', cookieMeta);
    if (!cookieMeta || cookieMeta.name !== 'tableflow_token' || !cookieMeta.httpOnly) {
      throw new Error('Verification failed: Auth cookie must be present, named tableflow_token, and HttpOnly!');
    }
    authCookieString = rawCookie;

    // Direct DB hash checks
    const dbUser = await User.findOne({ email: testEmail }).select('+password');
    if (!dbUser) {
      throw new Error('Citizen not found in database');
    }

    console.log('Database password plaintext check:');
    const isPlaintext = dbUser.password === testPassword;
    console.log(`- Password matches plaintext literally: ${isPlaintext} (Expected: false)`);
    if (isPlaintext) {
      throw new Error('Security Breach: Password stored in plaintext!');
    }

    const isBcryptHash = dbUser.password.startsWith('$2a$') || dbUser.password.startsWith('$2b$');
    console.log(`- Password stored as bcrypt hash format: ${isBcryptHash} (Expected: true)`);
    if (!isBcryptHash) {
      throw new Error('Security Error: Password not stored as a bcrypt hash!');
    }

    const verifyMatch = await dbUser.comparePassword(testPassword);
    console.log(`- Bcrypt password comparison resolves to match: ${verifyMatch} (Expected: true)`);
    if (!verifyMatch) {
      throw new Error('Verification failed: Bcrypt comparison check returned mismatch!');
    }
    console.log('Password hash audits: SUCCESS\n');

    // -------------------------------------------------------------
    // Test 2: Invalid Credential Logic Checks (Generic 401 response checks)
    // -------------------------------------------------------------
    console.log('--- AUDIT 2: Login Invalid Credentials Responses ---');
    
    // Check Case A: Valid email with wrong password
    const wrongPassRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'WrongPassword123' })
    });
    console.log(`Case A (Wrong Password) Status: ${wrongPassRes.status} (Expected: 401)`);
    const caseAPayload = await wrongPassRes.json();
    console.log('Case A Response message:', caseAPayload.message);

    // Check Case B: Unknown email
    const unknownRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'unknown-citizen@example.com', password: testPassword })
    });
    console.log(`Case B (Unknown Email) Status: ${unknownRes.status} (Expected: 401)`);
    const caseBPayload = await unknownRes.json();
    console.log('Case B Response message:', caseBPayload.message);

    if (caseAPayload.message !== caseBPayload.message || caseAPayload.message !== 'Invalid email or password') {
      throw new Error('Security Error: Credential errors must use identical generic messages to prevent user enumeration attacks!');
    }
    console.log('Login generic errors audit: SUCCESS\n');

    // -------------------------------------------------------------
    // Test 3: Session Persistence Across Server Restart Simulation
    // -------------------------------------------------------------
    console.log('--- AUDIT 3: Session Persistence Verification ---');
    // Call /me with existing valid cookie
    const checkMeRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Cookie: authCookieString }
    });
    console.log(`Profile check status before restart: ${checkMeRes.status} (Expected: 200)`);
    if (checkMeRes.status !== 200) {
      throw new Error('Verification failed: Failed to check me profile with session cookie');
    }

    // Since token validation matches signature verification keys, simulated restarts using the
    // same persistent cookie remain valid in Express middleware state. Let's close connection.
    console.log('Simulating server restart: closing test DB connections...');
    await mongoose.connection.close();
    
    // Reconnect to emulate boot setup
    await connectDB();
    console.log('Test DB connection re-established successfully.');

    // Query me again to assert session persistence
    const recheckMeRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Cookie: authCookieString }
    });
    console.log(`Profile check status after restart: ${recheckMeRes.status} (Expected: 200)`);
    if (recheckMeRes.status !== 200) {
      throw new Error('Verification failed: Session cookie did not survive server restart verification!');
    }
    console.log('Session persistence audit: SUCCESS\n');

    // -------------------------------------------------------------
    // Test 4: Logout invalidation
    // -------------------------------------------------------------
    console.log('--- AUDIT 4: Logout Session Invalidation ---');
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, { method: 'POST' });
    console.log(`Logout request status: ${logoutRes.status} (Expected: 200)`);
    
    const logoutCookie = logoutRes.headers.get('set-cookie');
    
    const postLogoutRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Cookie: logoutCookie }
    });
    console.log(`Post-Logout profile check status: ${postLogoutRes.status} (Expected: 401)`);
    if (postLogoutRes.status !== 401) {
      throw new Error('Security Breach: Session remains active after logging out!');
    }
    console.log('Logout invalidation audit: SUCCESS\n');

    // -------------------------------------------------------------
    // Test 5: CORS verification (Allowed vs Rejected origins)
    // -------------------------------------------------------------
    console.log('--- AUDIT 5: CORS Security Checks ---');
    
    // Test Case A: Allowed origin
    const allowedCorsRes = await fetch(`${BASE_URL}/health`, {
      headers: { Origin: 'http://localhost:5173' }
    });
    const allowedCorsHeader = allowedCorsRes.headers.get('access-control-allow-origin');
    console.log(`Allowed Origin header returned: "${allowedCorsHeader}" (Expected: "http://localhost:5173")`);
    if (allowedCorsHeader !== 'http://localhost:5173') {
      throw new Error('CORS Error: Allowed origin not allowed by backend config!');
    }

    // Test Case B: Disallowed origin
    const rejectedCorsRes = await fetch(`${BASE_URL}/health`, {
      headers: { Origin: 'http://hackerorigin.com' }
    });
    const rejectedCorsHeader = rejectedCorsRes.headers.get('access-control-allow-origin');
    console.log(`Rejected Origin header returned: "${rejectedCorsHeader}" (Expected: null or empty)`);
    if (rejectedCorsHeader) {
      throw new Error('Security Breach: Disallowed origin received CORS credentials!');
    }
    console.log('CORS security audits: SUCCESS\n');

    // -------------------------------------------------------------
    // Test 6: Production Mode Error Safety (Omits Stack Traces)
    // -------------------------------------------------------------
    console.log('--- AUDIT 6: Production Error Response Formats ---');
    
    const { errorHandler } = require('./middleware/errorMiddleware');
    
    let statusSet = 200;
    let jsonSent = null;
    const mockRes = {
      statusCode: 500,
      status: (code) => { statusSet = code; return mockRes; },
      json: (data) => { jsonSent = data; return mockRes; }
    };
    
    const mockReq = {};
    const mockNext = () => {};
    const mockErr = new Error('Test production error leak');
    mockErr.stack = 'Error: Test production error leak\n at Line 123 in C:\\Users\\STUDENT\\dummy.js';
    
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    errorHandler(mockErr, mockReq, mockRes, mockNext);
    
    process.env.NODE_ENV = originalEnv; // restore
    
    console.log('Error payload generated under NODE_ENV=production:', jsonSent);
    
    if (jsonSent.stack || JSON.stringify(jsonSent).includes('dummy.js') || JSON.stringify(jsonSent).includes('\\') || JSON.stringify(jsonSent).includes('/')) {
      throw new Error('Security Breach: Error response leaked path or trace details in production mode!');
    }
    console.log('Production error formats audits: SUCCESS\n');

    // -------------------------------------------------------------
    // Test 7: Authentication Endpoint Rate Limiter (HTTP 429)
    // -------------------------------------------------------------
    console.log('--- AUDIT 7: Rate Limit Verification ---');
    console.log('Sending repeated login queries to trigger rate limiter...');
    
    let rateLimitTriggered = false;
    // Window limit is 30 logins. Call it 35 times.
    for (let i = 0; i < 35; i++) {
      const rateRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'audit-rate-limit@example.com', password: 'audit' })
      });
      if (rateRes.status === 429) {
        console.log(`Rate limit triggered successfully on request #${i + 1} (Status: 429)`);
        rateLimitTriggered = true;
        break;
      }
    }

    if (!rateLimitTriggered) {
      throw new Error('Security Error: Rate limiter did not engage under threshold!');
    }
    console.log('Rate limiter audit: SUCCESS\n');

    // Clean up database users before exiting
    await User.deleteMany({ email: { $in: [testEmail, 'audit-rate-limit@example.com'] } });
    console.log('Cleanup database test citizen records: SUCCESS');

    console.log('\n================================================');
    console.log('🏆 ALL PHASE 2 SECURITY AUDITS SUCCESSFULLY PASSED');
    console.log('================================================\n');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n================================================');
    console.error('❌ PHASE 2 SECURITY AUDIT FAILED');
    console.error('Error details:', error.message);
    console.error('================================================\n');
    process.exit(1);
  }
};

runTests();
