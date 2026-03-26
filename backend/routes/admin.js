const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const { 
  approveProviderValidation,
  updateUserStatusValidation,
  getUsersValidation,
  getServicesValidation,
  getReviewsValidation
} = require('../middleware/validators/adminValidator');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', auth, adminAuth, adminController.getDashboardStats);

// @route   GET /api/admin/pending-providers
// @desc    Get all pending provider requests
// @access  Private (Admin only)
router.get('/pending-providers', auth, adminAuth, adminController.getPendingProviders);

// @route   PUT /api/admin/approve-provider/:id
// @desc    Approve or reject provider
// @access  Private (Admin only)
router.put('/approve-provider/:id', auth, adminAuth, approveProviderValidation, adminController.approveProvider);

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin only)
router.get('/users', auth, adminAuth, getUsersValidation, adminController.getUsers);

// @route   GET /api/admin/services
// @desc    Get all services with pagination
// @access  Private (Admin only)
router.get('/services', auth, adminAuth, getServicesValidation, adminController.getServices);

// @route   PUT /api/admin/user/:id/status
// @desc    Update user status (active/inactive)
// @access  Private (Admin only)
router.put('/user/:id/status', auth, adminAuth, updateUserStatusValidation, adminController.updateUserStatus);

// @route   DELETE /api/admin/user/:id
// @desc    Delete user (ban user)
// @access  Private (Admin only)
router.delete('/user/:id', auth, adminAuth, adminController.deleteUser);

// @route   DELETE /api/admin/service/:id
// @desc    Delete service
// @access  Private (Admin only)
router.delete('/service/:id', auth, adminAuth, adminController.deleteService);

// @route   GET /api/admin/reviews
// @desc    Get all reviews with pagination
// @access  Private (Admin only)
router.get('/reviews', auth, adminAuth, getReviewsValidation, adminController.getReviews);

// @route   DELETE /api/admin/review/:id
// @desc    Delete review
// @access  Private (Admin only)
router.delete('/review/:id', auth, adminAuth, adminController.deleteReview);

// @route   GET /api/admin/statistics
// @desc    Get detailed statistics for admin dashboard
// @access  Private (Admin only)
router.get('/statistics', auth, adminAuth, adminController.getDetailedStats);

module.exports = router;