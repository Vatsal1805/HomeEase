const { body } = require('express-validator');

// Create booking validation
const createBookingValidation = [
  body('services')
    .isArray({ min: 1 })
    .withMessage('At least one service must be selected')
    .custom((services) => {
      // Validate each service has serviceId
      const hasAllServiceIds = services.every(s => s.serviceId);
      if (!hasAllServiceIds) {
        throw new Error('Each service must have a serviceId field');
      }
      return true;
    }),
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
];

// Update booking status validation
const updateBookingStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status')
];

// Add booking rating validation
const addBookingRatingValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
];

// Update service status validation
const updateServiceStatusValidation = [
  body('serviceStatus')
    .isIn(['not-started', 'on-the-way', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Valid service status is required'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

module.exports = {
  createBookingValidation,
  updateBookingStatusValidation,
  addBookingRatingValidation,
  updateServiceStatusValidation
};