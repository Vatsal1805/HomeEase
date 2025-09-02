const express = require('express');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post('/', auth, [
  body('services')
    .isArray({ min: 1 })
    .withMessage('At least one service must be selected'),
  body('scheduledDate')
    .isISO8601()
    .withMessage('Valid scheduled date is required'),
  body('scheduledTime')
    .notEmpty()
    .withMessage('Scheduled time is required'),
  body('customerInfo.firstName')
    .notEmpty()
    .withMessage('First name is required'),
  body('customerInfo.lastName')
    .notEmpty()
    .withMessage('Last name is required'),
  body('customerInfo.phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Valid phone number is required'),
  body('customerInfo.email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('address.street')
    .notEmpty()
    .withMessage('Street address is required'),
  body('address.city')
    .notEmpty()
    .withMessage('City is required'),
  body('address.pincode')
    .matches(/^\d{6}$/)
    .withMessage('Valid pincode is required'),
  body('payment.method')
    .isIn(['cod', 'card', 'upi'])
    .withMessage('Valid payment method is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      services,
      scheduledDate,
      scheduledTime,
      customerInfo,
      address,
      payment,
      promoCode
    } = req.body;

    // Validate and calculate pricing
    let subtotal = 0;
    const serviceDetails = [];
    let primaryProvider = null; // For backward compatibility

    for (const serviceItem of services) {
      const service = await Service.findById(serviceItem.service);
      if (!service || !service.isActive) {
        return res.status(400).json({
          success: false,
          message: `Service ${serviceItem.service} not found or inactive`
        });
      }

      // Set the primary provider to the first service's provider
      if (!primaryProvider && service.provider) {
        primaryProvider = service.provider;
      }

      const quantity = serviceItem.quantity || 1;
      const price = service.price * quantity;
      subtotal += price;

      serviceDetails.push({
        service: service._id,
        quantity,
        price: service.price
      });
    }

    // Apply service charges
    const serviceCharges = 99;
    
    // Apply promo code discount (if any)
    let discount = 0;
    const promoCodes = {
      'FIRST10': 0.10,
      'SAVE50': 50,
      'WELCOME': 0.15
    };

    if (promoCode && promoCodes[promoCode.toUpperCase()]) {
      const promoValue = promoCodes[promoCode.toUpperCase()];
      if (promoValue < 1) {
        // Percentage discount
        discount = Math.round(subtotal * promoValue);
      } else {
        // Fixed amount discount
        discount = promoValue;
      }
    }

    const total = subtotal + serviceCharges - discount;

    // Generate unique booking ID
    const bookingId = 'HE' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

    // Create booking
    const booking = await Booking.create({
      bookingId,
      customer: req.user.id,
      provider: primaryProvider, // Set the primary provider
      services: serviceDetails,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      customerInfo,
      address,
      pricing: {
        subtotal,
        serviceCharges,
        discount,
        total
      },
      payment: {
        method: payment.method,
        status: payment.method === 'cod' ? 'pending' : 'pending'
      },
      promoCode: promoCode ? {
        code: promoCode.toUpperCase(),
        discount
      } : undefined
    });

    // Populate the booking with service details
    await booking.populate('services.service');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get user bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('services.service', 'name price category provider')
      .populate('provider', 'firstName lastName email phone')
      .populate({
        path: 'services.service',
        populate: {
          path: 'provider',
          select: 'firstName lastName email phone'
        }
      })
      .sort({ createdAt: -1 });

    // Add totalAmount field for compatibility
    const bookingsWithTotal = bookings.map(booking => {
      const bookingObj = booking.toObject();
      bookingObj.totalAmount = bookingObj.pricing?.total || 
        bookingObj.services.reduce((total, service) => 
          total + (service.price * service.quantity), 0);
      return bookingObj;
    });

    res.status(200).json({
      success: true,
      data: bookingsWithTotal
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings'
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Public (for now)
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('services.service')
      .populate('customer', 'firstName lastName email phone')
      .populate('provider', 'firstName lastName email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { booking }
    });

  } catch (error) {
    console.error('Get booking error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   GET /api/bookings/booking-id/:bookingId
// @desc    Get booking by booking ID
// @access  Public
router.get('/booking-id/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId })
      .populate('services.service')
      .populate('customer', 'firstName lastName email phone')
      .populate('provider', 'firstName lastName email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { booking }
    });

  } catch (error) {
    console.error('Get booking by booking ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Private (Admin/Provider)
router.put('/:id/status', [
  body('status')
    .isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update status
    booking.status = status;

    if (status === 'completed') {
      booking.completedAt = new Date();
      
      // Update provider profile statistics
      await updateProviderStats(booking.provider);
    } else if (status === 'cancelled') {
      booking.cancelledAt = new Date();
      booking.cancellationReason = req.body.reason || 'No reason provided';
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   POST /api/bookings/:id/rating
// @desc    Add rating to completed booking
// @access  Public
router.post('/:id/rating', [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rating, comment } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed bookings'
      });
    }

    if (booking.rating.value) {
      return res.status(400).json({
        success: false,
        message: 'Booking already rated'
      });
    }

    // Add rating
    booking.rating = {
      value: rating,
      comment: comment || '',
      ratedAt: new Date()
    };

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Rating added successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   PUT /api/bookings/:id/service-status
// @desc    Update service status (provider only)
// @access  Private (Provider)
router.put('/:id/service-status', auth, [
  body('serviceStatus')
    .isIn(['not-started', 'on-the-way', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Valid service status is required'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { serviceStatus, notes } = req.body;
    const booking = await Booking.findById(req.params.id).populate('services.service');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is a provider for any of the services in this booking
    let isAuthorizedProvider = false;
    
    if (req.user.userType === 'admin') {
      isAuthorizedProvider = true;
    } else if (req.user.userType === 'provider') {
      // Check if the current user is the provider for any service in this booking
      for (const serviceItem of booking.services) {
        if (serviceItem.service && serviceItem.service.provider && 
            serviceItem.service.provider.toString() === req.user.id) {
          isAuthorizedProvider = true;
          break;
        }
      }
    }

    if (!isAuthorizedProvider) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Update service status
    booking.serviceStatus = serviceStatus;
    
    // Add to status history
    booking.serviceStatusHistory.push({
      status: serviceStatus,
      updatedAt: new Date(),
      updatedBy: req.user.id,
      notes: notes || ''
    });

    // If service is completed, also update main status
    if (serviceStatus === 'completed') {
      booking.status = 'completed';
      booking.completedAt = new Date();
      
      // Update provider profile statistics
      await updateProviderStats(booking.provider);
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Service status updated successfully',
      data: { 
        booking: {
          _id: booking._id,
          serviceStatus: booking.serviceStatus,
          status: booking.status,
          serviceStatusHistory: booking.serviceStatusHistory
        }
      }
    });

  } catch (error) {
    console.error('Update service status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Helper function to update provider statistics
async function updateProviderStats(providerId) {
  try {
    if (!providerId) return;

    // Get all completed bookings for this provider
    const completedBookings = await Booking.find({
      provider: providerId,
      status: 'completed'
    }).populate('services.service', 'price');

    // Calculate total earnings from completed bookings
    let totalEarnings = 0;
    let totalServices = 0;

    completedBookings.forEach(booking => {
      booking.services.forEach(service => {
        totalEarnings += service.service.price * service.quantity;
        totalServices += service.quantity;
      });
    });

    // Update provider's business details using direct update to avoid validation issues
    const updateData = {
      'providerDetails.completedServices': totalServices,
      'providerDetails.totalEarnings': totalEarnings,
      'providerDetails.lastServiceDate': new Date()
    };

    await User.findByIdAndUpdate(providerId, { $set: updateData });
    console.log(`✅ Provider ${providerId} stats updated: ${totalServices} services, ₹${totalEarnings} earnings`);
  } catch (error) {
    console.error('Error updating provider stats:', error);
  }
}

module.exports = router;
