const express = require('express');
const { auth, providerAuth } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');
const { createReviewValidation } = require('../middleware/validators/reviewValidator');

const router = express.Router();

// @route   POST /api/reviews
// @desc    Create a review after service completion
// @access  Private (User only)
router.post('/', auth, createReviewValidation, reviewController.createReview);

// @route   GET /api/reviews/provider/:providerId
// @desc    Get all reviews for a provider
// @access  Private (Provider)
router.get('/provider/:providerId', auth, providerAuth, reviewController.getProviderReviews);

// @route   GET /api/reviews/service/:serviceId
// @desc    Get all reviews for a service
// @access  Public
router.get('/service/:serviceId', reviewController.getServiceReviews);

module.exports = router;
