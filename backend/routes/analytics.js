const express = require('express');
const router = express.Router();
const { auth, providerAuth, adminAuth } = require('../middleware/auth');
const {
  getProviderAnalytics,
  getServiceAnalytics,
  getPlatformAnalytics
} = require('../controllers/analyticsController');

// @route   GET /api/analytics/provider/:providerId
// @desc    Get provider analytics
// @access  Private (Provider/Admin)
router.get('/provider/:providerId', auth, providerAuth, getProviderAnalytics);

// @route   GET /api/analytics/admin
// @desc    Get admin analytics (overall platform stats)  
// @access  Private (Admin only)
router.get('/admin', auth, adminAuth, getPlatformAnalytics);

// @route   GET /api/analytics/service/:serviceId
// @desc    Get service-specific analytics
// @access  Private (Provider/Admin)
router.get('/service/:serviceId', auth, providerAuth, getServiceAnalytics);

module.exports = router;
