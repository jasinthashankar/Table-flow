const mongoose = require('mongoose');

const restaurantTableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: [true, 'Table number is required'],
      unique: true,
      trim: true
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [20, 'Capacity cannot exceed 20']
    },
    location: {
      type: String,
      default: 'Main Dining Room',
      trim: true
    },
    seatingType: {
      type: String,
      required: [true, 'Seating type is required'],
      enum: {
        values: ['window', 'garden', 'couple', 'family', 'group', 'standard'],
        message: 'Invalid seating type'
      }
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'reserved', 'occupied', 'cleaning', 'unavailable'],
        message: 'Invalid table status'
      },
      default: 'available'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    notes: {
      type: String,
      default: '',
      maxlength: [200, 'Notes cannot exceed 200 characters']
    }
  },
  { timestamps: true }
);

restaurantTableSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const RestaurantTable = mongoose.model('RestaurantTable', restaurantTableSchema);
module.exports = RestaurantTable;
