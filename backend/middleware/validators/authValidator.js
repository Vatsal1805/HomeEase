const { body } = require('express-validator');

// Auth validation rules
const registerValidation = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid Indian mobile number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('userType')
    .isIn(['user', 'provider', 'admin'])
    .withMessage('User type must be user, provider, or admin'),
  body('providerDetails.businessName')
    .if(body('userType').equals('provider'))
    .notEmpty()
    .withMessage('Business name is required for providers'),
  body('providerDetails.companyName')
    .if(body('userType').equals('provider'))
    .notEmpty()
    .withMessage('Company name is required for providers'),
  body('providerDetails.gstNumber')
    .if(body('userType').equals('provider'))
    .notEmpty()
    .withMessage('GST number is required for providers'),
  body('providerDetails.panNumber')
    .if(body('userType').equals('provider'))
    .notEmpty()
    .withMessage('PAN number is required for providers')
    .isLength({ min: 10, max: 10 })
    .withMessage('PAN number must be exactly 10 characters')
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Invalid PAN format. Example: ABCDE1234F (5 letters + 4 digits + 1 letter)'),
  body('providerDetails.businessType')
    .if(body('userType').equals('provider'))
    .notEmpty()
    .withMessage('Business type is required for providers')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email')
];

const resetPasswordValidation = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
};