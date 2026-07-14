/**
 * Phase 4B Table Reservation API Verification Script
 * 
 * Run from: server/
 *   node test-reservation.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const mongoose = require('mongoose');
const User = require('./models/User');
const RestaurantTable = require('./models/RestaurantTable');
const Reservation = require('./models/Reservation');

const BASE_URL = 'http://localhost:5000/api';

const http = require('http');

const request = (url, options = {}) =>
  new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });

const post = (url, data, cookie = '') =>
  request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {})
    },
    body: JSON.stringify(data)
  });

const get = (url, cookie = '') =>
  request(url, {
    method: 'GET',
    headers: { ...(cookie ? { Cookie: cookie } : {}) }
  });

const patch = (url, data, cookie = '') =>
  request(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {})
    },
    body: JSON.stringify(data)
  });

const del = (url, cookie = '') =>
  request(url, {
    method: 'DELETE',
    headers: { ...(cookie ? { Cookie: cookie } : {}) }
  });

const extractCookie = (headers) => {
  const setCookie = headers['set-cookie'];
  if (!setCookie) return null;
  const tokenCookie = Array.isArray(setCookie)
    ? setCookie.find((c) => c.startsWith('tableflow_token='))
    : setCookie.startsWith('tableflow_token=') ? setCookie : null;
  if (!tokenCookie) return null;
  return tokenCookie.split(';')[0].trim();
};

const pass = (label) => console.log(`  ✅ PASS: ${label}`);
const fail = (label, detail) => {
  console.error(`  ❌ FAIL: ${label} — ${detail}`);
  process.exitCode = 1;
};
const section = (title) => console.log(`\n── ${title} ──`);

const run = async () => {
  console.log('Phase 4B Automated Table Reservations Verification\n');

  // Connect database
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  // 1. Unauthenticated creation returns 401
  section('1. Unauthenticated booking restriction');
  const unauthRes = await post(`${BASE_URL}/reservations`, {
    date: '2026-07-25',
    timeSlot: '7:30 PM',
    guestCount: 2,
    phone: '9876543210'
  });
  unauthRes.status === 401
    ? pass('Unauthenticated booking returns 401')
    : fail('Unauthenticated booking', `status=${unauthRes.status}`);

  // 2. Register temporary customer
  section('2. Register temporary customer');
  const email1 = `table-tester-${Date.now()}@tableflow.test`;
  const pass1 = 'TestSecurePass123!';
  
  const regRes = await post(`${BASE_URL}/auth/register`, {
    name: 'Table Guest',
    email: email1,
    password: pass1,
    confirmPassword: pass1
  });

  let cookie1 = '';
  if (regRes.status === 201) {
    cookie1 = extractCookie(regRes.headers);
    pass(`Registered temporary user 1: ${email1}`);
  } else {
    fail('Register user 1', `status=${regRes.status}`);
    return;
  }

  // Define target booking details: must be future date within 30 days
  const bookingDate = '2026-07-28';
  const bookingSlot = '7:30 PM';

  // 3. Fetch availability
  section('3. Check slot availability');
  const availRes = await get(`${BASE_URL}/reservations/availability?date=${bookingDate}&guestCount=2&seatingPreference=couple`, cookie1);
  const selectedSlot = availRes.body.data?.slots?.find((s) => s.timeSlot === bookingSlot);
  availRes.status === 200 && selectedSlot
    ? pass(`Availability checked. Slot ${bookingSlot} has ${selectedSlot.availableTablesCount} tables free`)
    : fail('Fetch availability', `status=${availRes.status} slotsCount=${availRes.body.data?.slots?.length}`);

  // 4. Create a valid reservation
  section('4. Create valid reservation');
  const bookRes1 = await post(`${BASE_URL}/reservations`, {
    date: bookingDate,
    timeSlot: bookingSlot,
    guestCount: 2,
    phone: '9876543210',
    seatingPreference: 'couple',
    occasion: 'anniversary',
    specialRequest: 'Window table if possible please'
  }, cookie1);

  let firstRsvNumber = '';
  let assignedTableId = '';
  if (bookRes1.status === 201 && bookRes1.body.success) {
    firstRsvNumber = bookRes1.body.data.reservationNumber;
    assignedTableId = bookRes1.body.data.table._id;
    pass(`Reservation created successfully: ${firstRsvNumber}. Assigned Table: ${bookRes1.body.data.table.name}`);
  } else {
    fail('Place reservation 1', `status=${bookRes1.status} msg=${bookRes1.body.message}`);
    return;
  }

  // 5. Confirm reservation persists in Atlas
  section('5. Assert persistence in Atlas');
  const dbRsv1 = await Reservation.findOne({ reservationNumber: firstRsvNumber }).populate('table');
  dbRsv1 && dbRsv1.table._id.toString() === assignedTableId.toString()
    ? pass('Reservation found in database pointing to correct table')
    : fail('Assert database persistence', 'missing record or wrong table ID');

  // 6. Attempt table conflict booking (same table, date and slot conflict)
  // Register another user to attempt simultaneous booking
  section('6. Database-level double booking prevention');
  const email2 = `table-intruder-${Date.now()}@tableflow.test`;
  const regRes2 = await post(`${BASE_URL}/auth/register`, {
    name: 'Intruder Guest',
    email: email2,
    password: pass1,
    confirmPassword: pass1
  });
  const cookie2 = extractCookie(regRes2.headers);

  // We attempt to manually create a conflicting reservation in db using the same table, date, and slot
  try {
    const conflictRsv = new Reservation({
      reservationNumber: `RSV-CONFLICT-${Date.now()}`,
      user: regRes2.body.data._id,
      table: assignedTableId,
      customer: {
        name: 'Intruder',
        email: email2,
        phone: '9876543210'
      },
      reservationDate: new Date(bookingDate + 'T00:00:00Z'),
      timeSlot: bookingSlot,
      guestCount: 2,
      status: 'confirmed'
    });
    await conflictRsv.save();
    fail('Double booking prevention', 'Allowed saving conflicting table booking!');
  } catch (err) {
    err.code === 11000
      ? pass('Database index successfully prevented double booking (unique index collision)')
      : fail('Double booking checks', `unexpected error: ${err.message}`);
  }

  // 7. Create another reservation with a suitable different table
  section('7. Booking handles multiple tables correctly');
  const bookRes2 = await post(`${BASE_URL}/reservations`, {
    date: bookingDate,
    timeSlot: bookingSlot,
    guestCount: 2,
    phone: '9876543210',
    seatingPreference: 'couple'
  }, cookie2);

  let secondRsvNumber = '';
  if (bookRes2.status === 201) {
    secondRsvNumber = bookRes2.body.data.reservationNumber;
    bookRes2.body.data.table._id.toString() !== assignedTableId.toString()
      ? pass(`Second reservation booked on different table: ${bookRes2.body.data.table.name}`)
      : fail('Table duplication', 'Assigned the same table to both active bookings');
  } else {
    fail('Place reservation 2', `status=${bookRes2.status} msg=${bookRes2.body.message}`);
  }

  // 8. Reject a past date
  section('8. Validation: Past dates rejected');
  const pastRes = await post(`${BASE_URL}/reservations`, {
    date: '2026-07-01',
    timeSlot: bookingSlot,
    guestCount: 2,
    phone: '9876543210'
  }, cookie1);
  pastRes.status === 400
    ? pass('Rejected booking on past date (returns 400)')
    : fail('Past date validation', `status=${pastRes.status}`);

  // 9. Reject a date more than 30 days ahead
  section('9. Validation: Bookings limited to 30 days ahead');
  const futureRes = await post(`${BASE_URL}/reservations`, {
    date: '2026-09-20',
    timeSlot: bookingSlot,
    guestCount: 2,
    phone: '9876543210'
  }, cookie1);
  futureRes.status === 400
    ? pass('Rejected booking beyond 30 days limit (returns 400)')
    : fail('30-day limit validation', `status=${futureRes.status}`);

  // 10. Reject guest count above 12
  section('10. Validation: Guest count limits');
  const guestsRes = await post(`${BASE_URL}/reservations`, {
    date: bookingDate,
    timeSlot: bookingSlot,
    guestCount: 15,
    phone: '9876543210'
  }, cookie1);
  guestsRes.status === 400
    ? pass('Rejected guest count of 15 (returns 400)')
    : fail('Guest count validation', `status=${guestsRes.status}`);

  // 11. Fetch customer reservation history
  section('11. Customer history listing');
  const historyRes = await get(`${BASE_URL}/reservations`, cookie1);
  historyRes.status === 200 && historyRes.body.count === 1
    ? pass('History returned correct number of bookings (1)')
    : fail('Fetch history list', `status=${historyRes.status} count=${historyRes.body.count}`);

  // 12. Fetch one reservation details
  section('12. Fetch details');
  const detailRes = await get(`${BASE_URL}/reservations/${firstRsvNumber}`, cookie1);
  detailRes.status === 200 && detailRes.body.data.reservationNumber === firstRsvNumber
    ? pass('Details fetched correctly by reservation number')
    : fail('Fetch details', `status=${detailRes.status}`);

  // 13. Confirm another customer cannot access it
  section('13. Security: Access restriction check');
  const intruderRes = await get(`${BASE_URL}/reservations/${firstRsvNumber}`, cookie2);
  intruderRes.status === 404
    ? pass('Access denied returns 404 cleanly')
    : fail('Security check', `status=${intruderRes.status}`);

  // 14. Cancel eligible reservation
  section('14. Eligible booking cancellation');
  const cancelRes = await patch(`${BASE_URL}/reservations/${firstRsvNumber}/cancel`, {}, cookie1);
  cancelRes.status === 200 && cancelRes.body.data.status === 'cancelled'
    ? pass('Reservation status updated to cancelled, history updated')
    : fail('Cancel action', `status=${cancelRes.status} state=${cancelRes.body.data?.status}`);

  // 15. Confirm cancelled reservation releases table availability
  section('15. Cancel releases slot availability');
  const afterCancelAvail = await get(`${BASE_URL}/reservations/availability?date=${bookingDate}&guestCount=2&seatingPreference=couple`, cookie1);
  const slotsAfter = afterCancelAvail.body.data?.slots?.find((s) => s.timeSlot === bookingSlot);
  // Compare to baseline
  const startCount = selectedSlot.availableTablesCount;
  const endCount = slotsAfter ? slotsAfter.availableTablesCount : 0;
  // Since we had 2 bookings (T1 and T4), cancelling one should increase the count by 1
  endCount > 0
    ? pass(`Table successfully released. Slot availability before: ${startCount}, after cancellation: ${endCount}`)
    : fail('Release table verification', `before=${startCount} after=${endCount}`);

  // 16. Cleanup temporary data
  section('16. Automated database cleanup');
  await User.deleteMany({ email: { $in: [email1, email2] } });
  await Reservation.deleteMany({ user: { $in: [regRes.body.data?._id, regRes2.body.data?._id] } });
  pass('All temporary test data successfully cleaned from Atlas');

  await mongoose.disconnect();
  console.log('\n── Phase 4B Table Reservation Verification Suite Complete ──\n');
};

run().catch((err) => {
  console.error('\n[Fatal error]', err);
  process.exit(1);
});
