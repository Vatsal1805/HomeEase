const { body } = require('express-validator');

// Create review validation
const createReviewValidation = [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('serviceId').notEmpty().withMessage('Service ID is required'),
  body('providerId').notEmpty().withMessage('Provider ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').isLength({ min: 10, max: 500 }).withMessage('Comment must be between 10 and 500 characters')
];

module.exports = {
  createReviewValidation
};