const { body, query } = require('express-validator');

// Service query validation
const getServicesValidation = [
  query('category').optional().isIn(['plumbing', 'electrical', 'cleaning', 'carpentry', 'ac-service', 'painting']),
  query('search').optional().isString(),
  query('minPrice').optional().isNumeric(),
  query('maxPrice').optional().isNumeric(),
  query('sortBy').optional().isIn(['price', 'rating', 'name', 'createdAt']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('pincode').optional().matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),
  query('nearbyOnly').optional().isBoolean()
];

// Nearby stats validation
const nearbyStatsValidation = [
  query('pincode').isLength({ min: 6, max: 6 }).matches(/^\d{6}$/).withMessage('Pincode must be 6 digits')
];

// Create service validation
const createServiceValidation = [
  body('name')
    .notEmpty()
    .withMessage('Service name is required')
    .isLength({ max: 100 })
    .withMessage('Service name cannot exceed 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Service description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .isIn(['plumbing', 'electrical', 'cleaning', 'carpentry', 'ac-service', 'painting'])
    .withMessage('Invalid category'),
  body('price')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('duration')
    .isInt({ min: 15 })
    .withMessage('Duration must be at least 15 minutes'),
  body('image')
    .notEmpty()
    .withMessage('Service image is required')
    .isURL()
    .withMessage('Service image must be a valid URL')
];

// Update service validation
const updateServiceValidation = [
  body('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Service name cannot exceed 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .optional()
    .isIn(['plumbing', 'electrical', 'cleaning', 'carpentry', 'ac-service', 'painting'])
    .withMessage('Invalid category'),
  body('price')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('duration')
    .optional()
    .isInt({ min: 15 })
    .withMessage('Duration must be at least 15 minutes'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Service image must be a valid URL')
    .custom((value) => {
      if (value !== undefined && value.trim() === '') {
        throw new Error('Service image cannot be empty');
      }
      return true;
    })
];

module.exports = {
  getServicesValidation,
  nearbyStatsValidation,
  createServiceValidation,
  updateServiceValidation
};