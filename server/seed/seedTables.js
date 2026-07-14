/**
 * Seed script — TableFlow Restaurant Tables
 * Upserts 12 tables into Atlas with new status/isActive schema fields.
 * Run: node server/seed/seedTables.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const RestaurantTable = require('../models/RestaurantTable');
const { connectDB } = require('../config/db');

const tables = [
  { tableNumber: 'T01', capacity: 2, location: 'Window Bay', seatingType: 'couple', status: 'available', isActive: true, notes: 'Street-facing window seat for two' },
  { tableNumber: 'T02', capacity: 2, location: 'Window Bay', seatingType: 'couple', status: 'available', isActive: true, notes: 'Corner window with garden view' },
  { tableNumber: 'T03', capacity: 2, location: 'Garden Terrace', seatingType: 'window', status: 'available', isActive: true, notes: 'Open terrace with natural light' },
  { tableNumber: 'T04', capacity: 4, location: 'Main Hall', seatingType: 'standard', status: 'available', isActive: true, notes: 'Central dining hall table' },
  { tableNumber: 'T05', capacity: 4, location: 'Main Hall', seatingType: 'standard', status: 'available', isActive: true, notes: 'Central dining hall table' },
  { tableNumber: 'T06', capacity: 4, location: 'Garden Terrace', seatingType: 'garden', status: 'available', isActive: true, notes: 'Shaded garden seating area' },
  { tableNumber: 'T07', capacity: 6, location: 'Private Booth', seatingType: 'family', status: 'available', isActive: true, notes: 'Semi-private high-back booth' },
  { tableNumber: 'T08', capacity: 6, location: 'Private Booth', seatingType: 'family', status: 'available', isActive: true, notes: 'Semi-private high-back booth' },
  { tableNumber: 'T09', capacity: 8, location: 'Banquet Room', seatingType: 'group', status: 'available', isActive: true, notes: 'Group celebration table' },
  { tableNumber: 'T10', capacity: 8, location: 'Banquet Room', seatingType: 'group', status: 'available', isActive: true, notes: 'Large event table' },
  { tableNumber: 'T11', capacity: 10, location: 'Banquet Room', seatingType: 'group', status: 'available', isActive: true, notes: 'Extended party table' },
  { tableNumber: 'T12', capacity: 4, location: 'Mezzanine', seatingType: 'standard', status: 'available', isActive: true, notes: 'Elevated mezzanine dining' }
];

const seed = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to MongoDB Atlas');

    let inserted = 0;
    let updated = 0;

    for (const tableData of tables) {
      const result = await RestaurantTable.findOneAndUpdate(
        { tableNumber: tableData.tableNumber },
        { $set: tableData },
        { upsert: true, new: true, runValidators: true }
      );
      if (result._id) {
        const wasNew = !await RestaurantTable.findOne({ tableNumber: tableData.tableNumber, createdAt: { $ne: result.createdAt } });
        console.log(`  [OK] Table ${tableData.tableNumber} — ${tableData.seatingType} × ${tableData.capacity} (${tableData.location})`);
        inserted++;
      }
    }

    const total = await RestaurantTable.countDocuments({ isActive: true });
    console.log(`\n[Seed] Done — ${tables.length} tables upserted. Active tables in DB: ${total}`);
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error:', err.message);
    process.exit(1);
  }
};

seed();
