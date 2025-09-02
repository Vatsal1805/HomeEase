const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { auth, providerAuth } = require('../middleware/auth');
const { validationResult, body } = require('express-validator');

// @route   POST /api/reviews
// @desc    Create a review after service completion
// @access  Private (User only)
router.post('/', 
  auth,
  [
    body('bookingId').notEmpty().withMessage('Booking ID is required'),
    body('serviceId').notEmpty().withMessage('Service ID is required'),
    body('providerId').notEmpty().withMessage('Provider ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').isLength({ min: 10, max: 500 }).withMessage('Comment must be between 10 and 500 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed', 
          errors: errors.array() 
        });
      }

      const { bookingId, serviceId, providerId, rating, comment } = req.body;

      // Check if booking exists and is completed
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      if (booking.customer.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to review this booking' });
      }

      if (booking.status !== 'completed') {
        return res.status(400).json({ success: false, message: 'Can only review completed services' });
      }

      // Check if review already exists
      const existingReview = await Review.findOne({ 
        booking: bookingId, 
        service: serviceId,
        user: req.user.id 
      });

      if (existingReview) {
        return res.status(400).json({ success: false, message: 'Review already exists for this service' });
      }

      // Create review
      const review = new Review({
        booking: bookingId,
        service: serviceId,
        user: req.user.id,
        provider: providerId,
        rating,
        comment
      });

      await review.save();

      // Populate the review
      await review.populate([
        { path: 'user', select: 'firstName lastName' },
        { path: 'service', select: 'name' }
      ]);

      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        review
      });

    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// @route   GET /api/reviews/provider/:providerId
// @desc    Get all reviews for a provider
// @access  Private (Provider)
router.get('/provider/:providerId', auth, providerAuth, async (req, res) => {
  try {
    const { providerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Verify provider access
    if (req.user.id !== providerId && req.user.userType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const reviews = await Review.find({ provider: providerId, isVisible: true })
      .populate('user', 'firstName lastName')
      .populate('service', 'name')
      .populate('booking', 'bookingId scheduledDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments({ provider: providerId, isVisible: true });
    const totalPages = Math.ceil(totalReviews / limit);

    // Calculate average rating
    const avgRating = await Review.aggregate([
      { $match: { provider: new mongoose.Types.ObjectId(providerId), isVisible: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    res.json({
      success: true,
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      averageRating: avgRating.length > 0 ? Math.round(avgRating[0].avgRating * 10) / 10 : 0
    });

  } catch (error) {
    console.error('Get provider reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/reviews/service/:serviceId
// @desc    Get all reviews for a service
// @access  Public
router.get('/service/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ service: serviceId, isVisible: true })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments({ service: serviceId, isVisible: true });
    const totalPages = Math.ceil(totalReviews / limit);

    // Calculate average rating
    const avgRating = await Review.aggregate([
      { $match: { service: new mongoose.Types.ObjectId(serviceId), isVisible: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    res.json({
      success: true,
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      averageRating: avgRating.length > 0 ? Math.round(avgRating[0].avgRating * 10) / 10 : 0
    });

  } catch (error) {
    console.error('Get service reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
