const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  services: [{
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  scheduledTime: {
    type: String,
    required: [true, 'Scheduled time is required']
  },
  customerInfo: {
    firstName: String,
    lastName: String,
    phone: String,
    email: String
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      default: 'India'
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^\d{6}$/, 'Please enter a valid pincode']
    },
    landmark: String
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    serviceCharges: {
      type: Number,
      default: 99
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['cod', 'card', 'upi'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  serviceStatus: {
    type: String,
    enum: ['not-started', 'on-the-way', 'in-progress', 'completed', 'cancelled'],
    default: 'not-started'
  },
  serviceStatusHistory: [{
    status: {
      type: String,
      enum: ['not-started', 'on-the-way', 'in-progress', 'completed', 'cancelled']
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  promoCode: {
    code: String,
    discount: Number
  },
  notes: {
    customer: String,
    provider: String,
    admin: String
  },
  providerNotes: String,
  rating: {
    value: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    ratedAt: Date
  },
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String
}, {
  timestamps: true
});

// Generate booking ID before saving
bookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    this.bookingId = 'HE' + Date.now().toString(36).toUpperCase() + 
                     Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Index for efficient queries
bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ provider: 1, scheduledDate: 1 });
bookingSchema.index({ status: 1, scheduledDate: 1 });
bookingSchema.index({ bookingId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
