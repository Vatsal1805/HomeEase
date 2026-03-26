const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get user profile
// @access  Private
const getUserProfile = async (req, res) => {
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
};

// @desc    Update user profile
// @access  Private
const updateUserProfile = async (req, res) => {
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
};

module.exports = {
  getUserProfile,
  updateUserProfile
};