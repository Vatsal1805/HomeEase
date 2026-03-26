const { body, query } = require('express-validator');

// Approve provider validation
const approveProviderValidation = [
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be either approved or rejected'),
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
];

// Update user status validation
const updateUserStatusValidation = [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Get users validation
const getUsersValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('userType').optional().isIn(['user', 'provider', 'admin', 'all']),
  query('search').optional().isString()
];

// Get services validation
const getServicesValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isIn(['plumbing', 'electrical', 'cleaning', 'carpentry', 'ac-service', 'painting', 'all']),
  query('search').optional().isString()
];

// Get reviews validation
const getReviewsValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('rating').optional().isIn(['1', '2', '3', '4', '5', 'all']),
  query('search').optional().isString()
];

module.exports = {
  approveProviderValidation,
  updateUserStatusValidation,
  getUsersValidation,
  getServicesValidation,
  getReviewsValidation
};