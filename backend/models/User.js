const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian mobile number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  userType: {
    type: String,
    enum: ['user', 'provider', 'admin'],
    default: 'user'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: function() {
      return this.userType === 'provider' ? 'pending' : 'approved';
    }
  },
  profileImage: {
    type: String,
    default: ''
  },
  // OAuth fields
  googleId: {
    type: String,
    sparse: true
  },
  facebookId: {
    type: String,
    sparse: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Provider specific fields
  providerDetails: {
    businessName: {
      type: String,
      required: function() { return this.userType === 'provider'; }
    },
    companyName: {
      type: String,
      required: function() { return this.userType === 'provider'; }
    },
    gstNumber: {
      type: String,
      required: function() { return this.userType === 'provider'; }
      // GST format validation removed - only size check remains
    },
    panNumber: {
      type: String,
      required: function() { return this.userType === 'provider'; },
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number']
    },
    businessType: {
      type: String,
      enum: ['individual', 'partnership', 'private_limited', 'llp', 'other'],
      required: function() { return this.userType === 'provider'; }
    },
    businessAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      landmark: String
    },
    description: String,
    services: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    }],
    experience: Number,
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    documents: [{
      type: String,
      url: String
    }],
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String
    },
    isBusinessDetailsComplete: {
      type: Boolean,
      default: false
    },
    // Performance tracking fields
    completedServices: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    lastServiceDate: {
      type: Date
    }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('name').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual setter for name
userSchema.virtual('name').set(function(name) {
  const nameParts = name.split(' ');
  this.firstName = nameParts[0];
  this.lastName = nameParts.slice(1).join(' ') || '';
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getSignedJwtToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function() {
  const crypto = require('crypto');
  
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
