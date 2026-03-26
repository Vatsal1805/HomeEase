const express = require('express');
const { auth } = require('../middleware/auth');
const userController = require('../controllers/userController');
const { updateUserProfileValidation } = require('../middleware/validators/userValidator');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, userController.getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, updateUserProfileValidation, userController.updateUserProfile);

module.exports = router;
