const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    reservationNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    // Top-level guest contact fields (replaces nested customer subdoc)
    guestName: {
      type: String,
      required: [true, 'Guest name is required'],
      trim: true,
      maxlength: [60, 'Guest name cannot exceed 60 characters']
    },
    guestEmail: {
      type: String,
      required: [true, 'Guest email is required'],
      lowercase: true,
      trim: true
    },
    guestPhone: {
      type: String,
      required: [true, 'Guest phone is required'],
      trim: true
    },
    reservationDate: {
      type: Date,
      required: true,
      index: true
    },
    timeSlot: {
      type: String,
      required: true
    },
    guestCount: {
      type: Number,
      required: true,
      min: [1, 'Guest count must be at least 1'],
      max: [20, 'Guest count cannot exceed 20']
    },
    seatingPreference: {
      type: String,
      enum: ['any', 'window', 'garden', 'couple', 'family', 'group', 'standard'],
      default: 'any'
    },
    // Admin-assigned table
    assignedTable: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantTable',
      default: null
    },
    occasion: {
      type: String,
      enum: ['none', 'birthday', 'anniversary', 'date', 'family_dinner', 'business', 'other'],
      default: 'none'
    },
    specialRequest: {
      type: String,
      maxlength: [500, 'Special request cannot exceed 500 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'guest_arrived', 'seated', 'completed', 'cancelled', 'no_show'],
      default: 'pending'
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        note: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

// Compound partial unique index to prevent double bookings on confirmed/seated reservations
reservationSchema.index(
  { assignedTable: 1, reservationDate: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: {
      assignedTable: { $ne: null },
      status: { $in: ['confirmed', 'guest_arrived', 'seated'] }
    }
  }
);

reservationSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
