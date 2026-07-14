const mongoose = require('mongoose');

const waitlistEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    guestName: {
      type: String,
      required: [true, 'Guest name is required'],
      trim: true,
      maxlength: [60, 'Guest name cannot exceed 60 characters']
    },
    guestPhone: {
      type: String,
      required: [true, 'Guest phone is required'],
      trim: true
    },
    guestCount: {
      type: Number,
      required: [true, 'Guest count is required'],
      min: [1, 'Guest count must be at least 1'],
      max: [20, 'Guest count cannot exceed 20']
    },
    seatingPreference: {
      type: String,
      enum: ['any', 'window', 'garden', 'couple', 'family', 'group', 'standard'],
      default: 'any'
    },
    status: {
      type: String,
      enum: ['waiting', 'notified', 'seated', 'cancelled', 'expired'],
      default: 'waiting'
    },
    estimatedWaitMinutes: {
      type: Number,
      default: null,
      min: [0, 'Estimated wait cannot be negative']
    },
    notes: {
      type: String,
      default: '',
      maxlength: [300, 'Notes cannot exceed 300 characters']
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Only one active waitlist entry per user at a time
waitlistEntrySchema.index(
  { user: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['waiting', 'notified'] } }
  }
);

waitlistEntrySchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const WaitlistEntry = mongoose.model('WaitlistEntry', waitlistEntrySchema);
module.exports = WaitlistEntry;
