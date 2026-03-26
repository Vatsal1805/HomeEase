const express = require('express');
const { auth, providerAuth } = require('../middleware/auth');
const providerController = require('../controllers/providerController');
const { 
  getProviderBookingsValidation, 
  updateBookingStatusValidation 
} = require('../middleware/validators/providerValidator');

const router = express.Router();

// @route   GET /api/provider/dashboard
// @desc    Get provider dashboard data
// @access  Private (Provider only)
router.get('/dashboard', auth, providerAuth, providerController.getDashboardData);

// @route   GET /api/provider/bookings
// @desc    Get all bookings for provider
// @access  Private (Provider only)
router.get('/bookings', auth, providerAuth, getProviderBookingsValidation, providerController.getProviderBookings);

// @route   PUT /api/provider/bookings/:id/status
// @desc    Update booking status (approve/decline)
// @access  Private (Provider only)
router.put('/bookings/:id/status', auth, providerAuth, updateBookingStatusValidation, providerController.updateBookingStatus);

module.exports = router;
