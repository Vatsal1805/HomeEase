const { body } = require('express-validator');

// Update user profile validation
const updateUserProfileValidation = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid Indian mobile number'),
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),
  // Provider business details validation - only validate if providerDetails is present
  body('providerDetails.companyName')
    .optional()
    .if(body('providerDetails').exists())
    .isLength({ min: 1, max: 100 })
    .withMessage('Company name must be between 1 and 100 characters'),
  body('providerDetails.businessName')
    .optional()
    .if(body('providerDetails').exists())
    .isLength({ min: 1, max: 100 })
    .withMessage('Business name must be between 1 and 100 characters'),
  body('providerDetails.gstNumber')
    .optional()
    .if(body('providerDetails').exists())
    .isLength({ max: 15 })
    .withMessage('GST number cannot exceed 15 characters'),
  body('providerDetails.panNumber')
    .optional()
    .if(body('providerDetails').exists())
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Please enter a valid PAN number')
];

module.exports = {
  updateUserProfileValidation
};