const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
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

    const { name, firstName, lastName, email, phone, address, providerDetails } = req.body;
    
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.user.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }

    const updateData = {};
    
    // Handle name field (if provided, split into firstName and lastName)
    if (name !== undefined) {
      const nameParts = name.trim().split(' ');
      updateData.firstName = nameParts[0];
      updateData.lastName = nameParts.slice(1).join(' ') || '';
    }
    
    // Handle individual name fields
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    // Handle provider details
    if (req.user.userType === 'provider' && providerDetails) {
      const currentUser = await User.findById(req.user.id);
      const currentProviderDetails = currentUser.providerDetails || {};
      
      updateData.providerDetails = {
        ...currentProviderDetails,
        ...providerDetails
      };

      // Check if business details are complete
      const requiredFields = ['companyName', 'businessName', 'gstNumber', 'panNumber', 'businessType'];
      const isComplete = requiredFields.every(field => 
        updateData.providerDetails[field] && updateData.providerDetails[field].trim() !== ''
      );
      
      updateData.providerDetails.isBusinessDetailsComplete = isComplete;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
