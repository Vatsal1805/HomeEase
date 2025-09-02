const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
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
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Please enter a valid PAN number'),
  body('providerDetails.businessType')
    .if(body('userType').equals('provider'))
    .notEmpty()
    .withMessage('Business type is required for providers')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, phone, password, userType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    // Create user object with basic details
    const userData = {
      firstName,
      lastName,
      email,
      phone,
      password,
      userType
    };

    // If userType is provider, validate and add provider details
    if (userType === 'provider') {
      const { providerDetails } = req.body;
      if (!providerDetails) {
        return res.status(400).json({
          success: false,
          message: 'Provider details are required for provider registration'
        });
      }
      userData.providerDetails = providerDetails;
    }

    // Create user
    const user = await User.create(userData);

    // Generate JWT token
    const token = user.getSignedJwtToken();

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user - automatically detects user type
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email only - automatically detect user type
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Check provider approval status
    if (user.userType === 'provider' && user.approvalStatus !== 'approved') {
      if (user.approvalStatus === 'pending') {
        return res.status(401).json({
          success: false,
          message: 'Your provider account is pending approval. Please wait for admin approval.',
          approvalStatus: 'pending'
        });
      } else if (user.approvalStatus === 'rejected') {
        return res.status(401).json({
          success: false,
          message: 'Your provider account has been rejected. Please contact support.',
          approvalStatus: 'rejected'
        });
      }
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = user.getSignedJwtToken();

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('providerDetails.services');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // TODO: Send email with reset URL
    // For now, just return the token for testing
    res.status(200).json({
      success: true,
      message: 'Password reset token sent',
      resetToken // Remove this in production
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   PUT /api/auth/reset-password/:resettoken
// @desc    Reset password
// @access  Public
router.put('/reset-password/:resettoken', [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Get hashed token
    const crypto = require('crypto');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate JWT token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      data: { token }
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Debug route to check OAuth configuration
router.get('/oauth-status', (req, res) => {
  const googleConfigured = process.env.GOOGLE_CLIENT_ID && 
                           process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id';
  const facebookConfigured = process.env.FACEBOOK_APP_ID && 
                            process.env.FACEBOOK_APP_ID !== 'your_facebook_app_id';
  
  res.json({
    oauth_status: {
      google: {
        configured: googleConfigured,
        client_id: process.env.GOOGLE_CLIENT_ID ? 
          (googleConfigured ? 'Set (hidden)' : process.env.GOOGLE_CLIENT_ID) : 'Not set'
      },
      facebook: {
        configured: facebookConfigured,
        app_id: process.env.FACEBOOK_APP_ID ? 
          (facebookConfigured ? 'Set (hidden)' : process.env.FACEBOOK_APP_ID) : 'Not set'
      },
      message: googleConfigured || facebookConfigured ? 
        'OAuth is configured and ready to use' : 
        'OAuth needs real credentials - check OAUTH_SETUP.md for instructions'
    }
  });
});

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Generate JWT token for the user
      const token = jwt.sign(
        { 
          userId: req.user._id,
          email: req.user.email,
          role: req.user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

// Facebook OAuth routes
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Generate JWT token for the user
      const token = jwt.sign(
        { 
          userId: req.user._id,
          email: req.user.email,
          role: req.user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
    } catch (error) {
      console.error('Facebook callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

module.exports = router;
