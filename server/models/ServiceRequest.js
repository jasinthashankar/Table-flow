const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true,
      index: true
    },
    requestType: {
      type: String,
      required: [true, 'Request type is required'],
      enum: {
        values: ['water', 'cleaning', 'assistance', 'birthday_setup', 'bill_request', 'other'],
        message: 'Invalid request type'
      }
    },
    message: {
      type: String,
      default: '',
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal'
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'cancelled'],
      default: 'open'
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

serviceRequestSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
module.exports = ServiceRequest;
