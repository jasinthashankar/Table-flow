require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({ name: String });
const TestModel = mongoose.model('Test', testSchema);

const runTest = async () => {
  try {
    console.log('Testing connection to MongoDB Atlas...');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in server/.env variables');
    }

    if (process.env.MONGODB_URI.includes('localhost') || process.env.MONGODB_URI.includes('127.0.0.1')) {
      throw new Error('MONGODB_URI points to localhost. A real MongoDB Atlas connection is required.');
    }

    const hostRedacted = process.env.MONGODB_URI.replace(/:[^@]+@/, ':****@');
    console.log(`Configured URI (Redacted): ${hostRedacted}`);

    // 1. Connect to MongoDB Atlas
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('Connection: SUCCESS');
    console.log('Mongoose readyState:', mongoose.connection.readyState);
    console.log('Database Name:', mongoose.connection.db.databaseName);

    // 2. Insert a temporary document
    console.log('Inserting test document...');
    const doc = await TestModel.create({ name: 'TableFlowTestGuest' });
    const storedId = doc._id;
    console.log('Insert Result: SUCCESS - Stored ID:', storedId);

    // 3. Disconnect
    console.log('Disconnecting from database...');
    await mongoose.connection.close();
    console.log('Disconnect: SUCCESS - readyState:', mongoose.connection.readyState);

    // 4. Reconnect
    console.log('Reconnecting to database...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('Reconnect: SUCCESS - readyState:', mongoose.connection.readyState);

    // 5. Find document by stored ID
    console.log('Finding document by stored ID...');
    const readDoc = await TestModel.findById(storedId);
    if (!readDoc) {
      throw new Error('Verification failed: Document could not be found after reconnection.');
    }
    console.log('Read Result: SUCCESS - Found document name:', readDoc.name);

    // 6. Delete document
    console.log('Deleting test document...');
    await TestModel.findByIdAndDelete(storedId);
    console.log('Delete: SUCCESS');

    // 7. Verify deletion
    console.log('Confirming document deletion...');
    const verifyDoc = await TestModel.findById(storedId);
    if (verifyDoc) {
      throw new Error('Verification failed: Document still exists after deletion.');
    }
    console.log('Delete Verification: SUCCESS (Document is gone)');

    console.log('\n======================================');
    console.log('🏆 DATABASE Atlas CRUD VERIFICATION: PASSED');
    console.log('======================================\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('\n======================================');
    console.error('❌ DATABASE Atlas CRUD VERIFICATION: FAILED');
    console.error('Error Details:', err.message);
    console.error('======================================\n');
    process.exit(1);
  }
};

runTest();
