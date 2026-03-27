const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const emailService = require('../services/emailService');

// @desc    Create new booking
// @access  Private
const createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Booking validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg,
          value: err.value
        }))
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

    // Validate services exist and are active
    const serviceIds = services.map(s => s.serviceId);
    console.log('Looking for services with IDs:', serviceIds);
    
    const foundServices = await Service.find({
      _id: { $in: serviceIds },
      isActive: true
    }).populate('provider', 'firstName lastName');

    console.log('Found services:', foundServices.length, 'Expected:', serviceIds.length);
    
    if (foundServices.length !== serviceIds.length) {
      console.error('Service mismatch - Service IDs:', serviceIds);
      console.error('Found service IDs:', foundServices.map(s => s._id));
      return res.status(400).json({
        success: false,
        message: 'One or more services are not available',
        requestedServices: serviceIds,
        foundServices: foundServices.map(s => s._id)
      });
    }

    // Calculate pricing
    let subtotal = 0;
    const serviceItems = services.map(item => {
      const service = foundServices.find(s => s._id.toString() === item.serviceId);
      const itemTotal = service.price * item.quantity;
      subtotal += itemTotal;
      
      return {
        service: service._id,
        quantity: item.quantity,
        price: service.price
      };
    });

    // Apply promo code if provided
    let discount = 0;
    if (promoCode) {
      // TODO: Implement promo code validation
      // For now, just apply a basic discount
      if (promoCode.toUpperCase() === 'FIRSTBOOKING') {
        discount = subtotal * 0.1; // 10% discount
      }
    }

    const total = subtotal - discount;
    
    // Generate booking ID
    const bookingCount = await Booking.countDocuments();
    const bookingId = `HE${String(bookingCount + 1).padStart(6, '0')}`;

    // Determine provider - for now use first service's provider
    const primaryProvider = foundServices[0].provider._id;

    // Create booking
    const booking = await Booking.create({
      bookingId,
      customer: req.user._id,
      provider: primaryProvider,
      services: serviceItems,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      customerInfo,
      address,
      payment,
      pricing: {
        subtotal,
        discount,
        total
      },
      promoCode: promoCode ? {
        code: promoCode.toUpperCase(),
        discount
      } : undefined
    });

    // Populate the booking with service details
    await booking.populate('services.service');

    // Send confirmation email to customer
    try {
      const emailResult = await emailService.sendBookingStatusNotification(booking, 'pending');
      if (emailResult.success) {
        console.log(`📧 Booking confirmation email sent for booking ${booking.bookingId}`);
      } else {
        console.log(`⚠️ Failed to send booking confirmation email: ${emailResult.error}`);
      }
    } catch (emailError) {
      console.error('Error sending booking confirmation email:', emailError);
      // Don't fail the request if email fails
    }

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
};

// @desc    Get user's bookings
// @access  Private
const getMyBookings = async (req, res) => {
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
};

// @desc    Get booking by ID
// @access  Private
const getBookingById = async (req, res) => {
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
};

// @desc    Get booking by booking ID
// @access  Public
const getBookingByBookingId = async (req, res) => {
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
};

// @desc    Update booking status
// @access  Private (Admin/Provider)
const updateBookingStatus = async (req, res) => {
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
    const oldStatus = booking.status;
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

    // Send email notification if status changed
    if (oldStatus !== status) {
      try {
        // Populate booking with customer details for email
        await booking.populate('customer', 'firstName lastName email');
        
        const emailResult = await emailService.sendBookingStatusNotification(booking, status);
        if (emailResult.success) {
          console.log(`📧 Email notification sent for booking ${booking.bookingId} status change to ${status}`);
        } else {
          console.log(`⚠️ Failed to send email notification: ${emailResult.error}`);
        }
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the request if email fails
      }
    }

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
};

// @desc    Add rating to completed booking
// @access  Private (Customer)
const addBookingRating = async (req, res) => {
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
};

// @desc    Update service status (provider only)
// @access  Private (Provider)
const updateServiceStatus = async (req, res) => {
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
    const oldServiceStatus = booking.serviceStatus;
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

    // Send email notification if service status changed
    if (oldServiceStatus !== serviceStatus) {
      try {
        // Populate booking with customer details for email
        await booking.populate('customer', 'firstName lastName email');
        await booking.populate('services.service', 'name');
        
        const emailResult = await emailService.sendServiceStatusNotification(booking, serviceStatus);
        if (emailResult.success) {
          console.log(`📧 Service status email sent for booking ${booking.bookingId} status change to ${serviceStatus}`);
        } else {
          console.log(`⚠️ Failed to send service status email: ${emailResult.error}`);
        }
      } catch (emailError) {
        console.error('Error sending service status email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'Service status updated successfully',
      data: { 
        booking: {
          _id: booking._id,
          bookingId: booking.bookingId,
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
};

// Helper function to update provider statistics
async function updateProviderStats(providerId) {
  try {
    // Get all completed bookings for this provider
    const completedBookings = await Booking.find({
      provider: providerId,
      status: 'completed'
    }).populate('services.service');

    // Calculate total earnings and booking count
    const totalBookings = completedBookings.length;
    let totalEarnings = 0;

    completedBookings.forEach(booking => {
      booking.services.forEach(service => {
        totalEarnings += service.price * service.quantity;
      });
    });

    // Update provider profile
    await User.findByIdAndUpdate(providerId, {
      'providerDetails.totalBookings': totalBookings,
      'providerDetails.totalEarnings': totalEarnings,
      'providerDetails.completedBookings': totalBookings
    });

  } catch (error) {
    console.error('Error updating provider stats:', error);
  }
}

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  getBookingByBookingId,
  updateBookingStatus,
  addBookingRating,
  updateServiceStatus
};