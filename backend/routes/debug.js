const express = require('express');
const jwt = require('jsonwebtoken');
const Booking = require('../models/Booking');

const router = express.Router();

// @route   POST /api/debug/validate-token
// @desc    Validate JWT token format and content
// @access  Public (for debugging)
router.post('/validate-token', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.json({
        valid: false,
        error: 'No token provided'
      });
    }

    // Check token format
    const parts = token.split('.');
    if (parts.length !== 3) {
      return res.json({
        valid: false,
        error: 'Token format invalid - should have 3 parts separated by dots'
      });
    }

    // Try to decode without verification first
    let decoded;
    try {
      decoded = jwt.decode(token);
    } catch (error) {
      return res.json({
        valid: false,
        error: 'Token cannot be decoded',
        details: error.message
      });
    }

    // Try to verify with secret
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      return res.json({
        valid: true,
        decoded: verified,
        message: 'Token is valid'
      });
    } catch (error) {
      return res.json({
        valid: false,
        error: 'Token verification failed',
        details: error.message,
        decoded: decoded // Still show decoded content
      });
    }

  } catch (error) {
    res.status(500).json({
      valid: false,
      error: 'Server error during validation',
      details: error.message
    });
  }
});

// @route   GET /api/debug/bookings
// @desc    Debug bookings data
// @access  Public (for debugging)
router.get('/bookings', async (req, res) => {
  try {
    const allBookings = await Booking.find().limit(3);
    
    const bookingsByStatus = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' }
        }
      }
    ]);

    // Try to get revenue using services fallback
    const revenueFromServices = await Booking.aggregate([
      { $unwind: '$services' },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: { $multiply: ['$services.price', '$services.quantity'] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalBookings: await Booking.countDocuments(),
        allBookings,
        bookingsByStatus,
        revenueFromServices,
        firstBooking: allBookings[0] || null
      }
    });
  } catch (error) {
    console.error('Debug bookings error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
