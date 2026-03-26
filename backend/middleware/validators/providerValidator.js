const { body, query } = require('express-validator');

// Get provider bookings validation
const getProviderBookingsValidation = [
  query('status').optional().isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
];

// Update booking status validation
const updateBookingStatusValidation = [
  body('status')
    .isIn(['confirmed', 'rejected'])
    .withMessage('Status must be either confirmed or rejected'),
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
];

module.exports = {
  getProviderBookingsValidation,
  updateBookingStatusValidation
};