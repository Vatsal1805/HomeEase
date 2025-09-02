const express = require('express');
const Service = require('../models/Service');
const { body, validationResult, query } = require('express-validator');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/services
// @desc    Get all services with filters
// @access  Public
router.get('/', [
  query('category').optional().isIn(['plumbing', 'electrical', 'cleaning', 'carpentry', 'ac-service', 'painting']),
  query('search').optional().isString(),
  query('minPrice').optional().isNumeric(),
  query('maxPrice').optional().isNumeric(),
  query('sortBy').optional().isIn(['price', 'rating', 'name', 'createdAt']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }

    const {
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const services = await Service.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('provider', 'firstName lastName rating totalRatings');

    const total = await Service.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        services,
        pagination: {
          page: Number(page),
          pages: Math.ceil(total / limit),
          total,
          limit: Number(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   GET /api/services/my-services
// @desc    Get provider's services
// @access  Private (Provider only)
router.get('/my-services', auth, async (req, res) => {
  try {
    // Check if user is a provider
    if (req.user.userType !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Provider account required.'
      });
    }

    const services = await Service.find({ provider: req.user._id })
      .populate('provider', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: services
    });

  } catch (error) {
    console.error('Get provider services error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   GET /api/services/:id
// @desc    Get single service
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'firstName lastName rating totalRatings providerDetails');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (!service.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Service is not available'
      });
    }

    res.status(200).json({
      success: true,
      data: { service }
    });

  } catch (error) {
    console.error('Get service error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   GET /api/services/category/:category
// @desc    Get services by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    // Validate category
    const validCategories = ['plumbing', 'electrical', 'cleaning', 'carpentry', 'ac-service', 'painting'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    const services = await Service.find({ 
      category, 
      isActive: true 
    })
    .sort({ rating: -1, totalBookings: -1 })
    .populate('provider', 'firstName lastName rating totalRatings');

    res.status(200).json({
      success: true,
      data: { services }
    });

  } catch (error) {
    console.error('Get services by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   POST /api/services
// @route   POST /api/services
// @desc    Create new service (Provider only)
// @access  Private
router.post('/', auth, [
  body('name')
    .notEmpty()
    .withMessage('Service name is required')
    .isLength({ max: 100 })
    .withMessage('Service name cannot exceed 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Service description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .isIn(['plumbing', 'electrical', 'cleaning', 'carpentry', 'ac-service', 'painting'])
    .withMessage('Invalid category'),
  body('price')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('duration')
    .isInt({ min: 15 })
    .withMessage('Duration must be at least 15 minutes')
], async (req, res) => {
  try {
    // Check if user is a provider
    if (req.user.userType !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Provider account required.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Add provider information to service
    const serviceData = {
      ...req.body,
      provider: req.user._id
    };

    const service = await Service.create(serviceData);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });

  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   PUT /api/services/:id
// @desc    Update service (Provider only - own services)
// @access  Private
router.put('/:id', auth, [
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
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('duration')
    .optional()
    .isInt({ min: 15 })
    .withMessage('Duration must be at least 15 minutes')
], async (req, res) => {
  try {
    // Check if user is a provider
    if (req.user.userType !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Provider account required.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Find service and check ownership
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if the service belongs to the provider
    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }

    // Update service
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('provider', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService
    });

  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/services/:id
// @desc    Delete service (Provider only - own services)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is a provider
    if (req.user.userType !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Provider account required.'
      });
    }

    // Find service and check ownership
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if the service belongs to the provider
    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this service'
      });
    }

    // Delete service
    await Service.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });

  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
