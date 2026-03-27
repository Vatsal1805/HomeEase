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
    .trim()
    .notEmpty()
    .withMessage('Service name is required')
    .isLength({ max: 100 })
    .withMessage('Service name cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Service description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['plumbing', 'electrical', 'cleaning', 'carpentry', 'ac-service', 'painting'])
    .withMessage('Invalid category. Must be one of: plumbing, electrical, cleaning, carpentry, ac-service, painting'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .toFloat()
    .custom((value) => {
      if (isNaN(value)) {
        throw new Error('Price must be a valid number');
      }
      if (value <= 0) {
        throw new Error('Price must be greater than 0');
      }
      return true;
    }),
  body('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .toInt()
    .custom((value) => {
      if (isNaN(value)) {
        throw new Error('Duration must be a valid number');
      }
      if (value < 15) {
        throw new Error('Duration must be at least 15 minutes');
      }
      return true;
    }),
  body('image')
    .trim()
    .notEmpty()
    .withMessage('Service image is required')
    .custom((value) => {
      // More flexible URL validation for image URLs
      try {
        new URL(value);
        return true;
      } catch (e) {
        throw new Error('Service image must be a valid URL (e.g., https://example.com/image.jpg)');
      }
    }),
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
    .toFloat()
    .custom((value) => {
      if (value !== undefined && (isNaN(value) || value < 0)) {
        throw new Error('Price must be a positive number');
      }
      return true;
    }),
  body('duration')
    .optional()
    .toInt()
    .custom((value) => {
      if (value !== undefined && (isNaN(value) || value < 15)) {
        throw new Error('Duration must be at least 15 minutes');
      }
      return true;
    }),
  body('image')
    .optional()
    .trim()
    .custom((value) => {
      if (value) {
        try {
          new URL(value);
          return true;
        } catch (e) {
          throw new Error('Service image must be a valid URL (e.g., https://example.com/image.jpg)');
        }
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