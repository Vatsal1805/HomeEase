const express = require('express');
const { auth } = require('../middleware/auth');
const serviceController = require('../controllers/serviceController');
const { 
  getServicesValidation, 
  nearbyStatsValidation, 
  createServiceValidation, 
  updateServiceValidation 
} = require('../middleware/validators/serviceValidator');

const router = express.Router();

// @route   GET /api/services
// @desc    Get all services with filters
// @access  Public
router.get('/', getServicesValidation, serviceController.getAllServices);

// @route   GET /api/services/nearby-stats
// @desc    Get nearby providers and services count by pincode
// @access  Public
router.get('/nearby-stats', nearbyStatsValidation, serviceController.getNearbyStats);

// @route   GET /api/services/my-services
// @desc    Get provider's services
// @access  Private (Provider only)
router.get('/my-services', auth, serviceController.getMyServices);

// @route   GET /api/services/category/:category
// @desc    Get services by category
// @access  Public
router.get('/category/:category', serviceController.getServicesByCategory);

// @route   GET /api/services/:id
// @desc    Get single service
// @access  Public
router.get('/:id', serviceController.getServiceById);

// @route   POST /api/services
// @desc    Create new service (Provider only)
// @access  Private
router.post('/', auth, createServiceValidation, serviceController.createService);

// @route   PUT /api/services/:id
// @desc    Update service (Provider only - own services)
// @access  Private
router.put('/:id', auth, updateServiceValidation, serviceController.updateService);

// @route   DELETE /api/services/:id
// @desc    Delete service (Provider only - own services)
// @access  Private
router.delete('/:id', auth, serviceController.deleteService);

module.exports = router;