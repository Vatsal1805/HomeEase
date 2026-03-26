const express = require('express');
const { auth } = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');
const { 
  createBookingValidation, 
  updateBookingStatusValidation, 
  addBookingRatingValidation, 
  updateServiceStatusValidation 
} = require('../middleware/validators/bookingValidator');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post('/', auth, createBookingValidation, bookingController.createBooking);

// @route   GET /api/bookings/my-bookings
// @desc    Get user's bookings
// @access  Private
router.get('/my-bookings', auth, bookingController.getMyBookings);

// @route   GET /api/bookings/booking-id/:bookingId
// @desc    Get booking by booking ID
// @access  Public
router.get('/booking-id/:bookingId', bookingController.getBookingByBookingId);

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', auth, bookingController.getBookingById);

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Private (Admin/Provider)
router.put('/:id/status', auth, updateBookingStatusValidation, bookingController.updateBookingStatus);

// @route   PUT /api/bookings/:id/rating
// @desc    Add rating to completed booking
// @access  Private (Customer)
router.put('/:id/rating', auth, addBookingRatingValidation, bookingController.addBookingRating);

// @route   PUT /api/bookings/:id/service-status
// @desc    Update service status (provider only)
// @access  Private (Provider)
router.put('/:id/service-status', auth, updateServiceStatusValidation, bookingController.updateServiceStatus);

module.exports = router;