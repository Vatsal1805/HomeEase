const express = require('express');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { auth, providerAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/provider/dashboard
// @desc    Get provider dashboard data
// @access  Private (Provider only)
router.get('/dashboard', auth, providerAuth, async (req, res) => {
  try {
    const providerId = req.user.id;

    // Get provider's services
    const services = await Service.find({ provider: providerId });
    const serviceIds = services.map(service => service._id);

    // Get bookings for provider's services
    const bookings = await Booking.find({
      $or: [
        { provider: providerId },
        { 'services.service': { $in: serviceIds } }
      ]
    }).populate('customer', 'firstName lastName email phone')
      .populate('services.service', 'name price')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    
    const totalEarnings = bookings
      .filter(b => b.status === 'completed')
      .reduce((total, booking) => {
        return total + booking.services.reduce((serviceTotal, service) => {
          return serviceTotal + (service.service.price * service.quantity);
        }, 0);
      }, 0);

    // Get recent bookings (last 10)
    const recentBookings = bookings.slice(0, 10);

    const responseData = {
      stats: {
        totalBookings,
        completedBookings,
        pendingBookings,
        confirmedBookings,
        totalEarnings
      },
      recentBookings
    };

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Provider dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   GET /api/provider/bookings
// @desc    Get all bookings for provider
// @access  Private (Provider only)
router.get('/bookings', auth, providerAuth, async (req, res) => {
  try {
    const providerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    // Get provider's services
    const services = await Service.find({ provider: providerId });
    const serviceIds = services.map(service => service._id);

    // Build query - check both provider field and services
    const query = {
      $or: [
        { provider: providerId },
        { 'services.service': { $in: serviceIds } }
      ]
    };

    if (status) {
      query.status = status;
    }

    // Get bookings with pagination
    const bookings = await Booking.find(query)
      .populate('customer', 'firstName lastName email phone')
      .populate('services.service', 'name price duration')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBookings: total
      }
    });

  } catch (error) {
    console.error('Provider bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   PUT /api/provider/bookings/:id/status
// @desc    Update booking status (approve/decline)
// @access  Private (Provider only)
router.put('/bookings/:id/status', auth, providerAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const providerId = req.user.id;

    // Validate status
    if (!['confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "confirmed" or "rejected"'
      });
    }

    // Get provider's services
    const services = await Service.find({ provider: providerId });
    const serviceIds = services.map(service => service._id);

    // Find booking and verify it belongs to this provider
    const booking = await Booking.findOne({
      _id: id,
      'services.service': { $in: serviceIds }
    }).populate('customer', 'firstName lastName email')
      .populate('services.service', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or access denied'
      });
    }

    // Update booking status
    booking.status = status;
    if (reason) {
      booking.providerNotes = reason;
    }
    booking.updatedAt = new Date();

    await booking.save();

    res.json({
      success: true,
      message: `Booking ${status === 'confirmed' ? 'approved' : 'declined'} successfully`,
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

module.exports = router;
