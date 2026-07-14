require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const { connectDB } = require('../config/db');

const seedAdmin = async () => {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error('Error: ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be configured in server/.env');
    process.exit(1);
  }

  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log(`Checking for existing admin account with email: ${email}...`);
    let admin = await User.findOne({ email });

    if (admin) {
      console.log('Admin account found. Updating password and name...');
      admin.name = name;
      admin.password = password;
      admin.role = 'admin'; // Force role to be admin
      await admin.save();
      console.log('Admin account updated successfully!');
    } else {
      console.log('Creating new admin account...');
      admin = new User({
        name,
        email,
        password,
        role: 'admin'
      });
      await admin.save();
      console.log('Admin account created successfully!');
    }

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding admin failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
