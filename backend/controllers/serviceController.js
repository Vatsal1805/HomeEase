const Service = require('../models/Service');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all services with filters
// @access  Public
const getAllServices = async (req, res) => {
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
      limit = 20,
      pincode,
      nearbyOnly
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
    
    let services;
    let total;

    if (pincode && nearbyOnly === 'true') {
      // Filter services by providers in the same pincode
      const nearbyProviders = await User.find({
        userType: 'provider',
        approvalStatus: 'approved',
        $or: [
          { 'providerDetails.businessAddress.pincode': pincode },
          { 'address.pincode': pincode }
        ]
      }).select('_id');

      const providerIds = nearbyProviders.map(provider => provider._id);
      query.provider = { $in: providerIds };

      services = await Service.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('provider', 'firstName lastName rating totalRatings providerDetails.businessAddress address');

      total = await Service.countDocuments(query);
    } else {
      // Regular query without location filtering
      services = await Service.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('provider', 'firstName lastName rating totalRatings providerDetails.businessAddress address');

      total = await Service.countDocuments(query);
    }

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
};

// @desc    Get nearby providers and services count by pincode
// @access  Public
const getNearbyStats = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode',
        errors: errors.array()
      });
    }

    const { pincode } = req.query;

    // Find providers with matching pincode
    const nearbyProviders = await User.find({
      userType: 'provider',
      approvalStatus: 'approved',
      $or: [
        { 'providerDetails.businessAddress.pincode': pincode },
        { 'address.pincode': pincode }
      ]
    }).select('_id');

    const providerIds = nearbyProviders.map(provider => provider._id);

    // Count services from these providers
    const nearbyServicesCount = await Service.countDocuments({
      provider: { $in: providerIds },
      isActive: true
    });

    // Get category breakdown
    const categoryBreakdown = await Service.aggregate([
      {
        $match: {
          provider: { $in: providerIds },
          isActive: true
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        pincode,
        providersCount: nearbyProviders.length,
        servicesCount: nearbyServicesCount,
        categoryBreakdown: categoryBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Nearby stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Get provider's services
// @access  Private (Provider only)
const getMyServices = async (req, res) => {
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
};

// @desc    Get single service
// @access  Public
const getServiceById = async (req, res) => {
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
};

// @desc    Get services by category
// @access  Public
const getServicesByCategory = async (req, res) => {
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
};

// @desc    Create new service (Provider only)
// @access  Private
const createService = async (req, res) => {
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
};

// @desc    Update service (Provider only - own services)
// @access  Private
const updateService = async (req, res) => {
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
};

// @desc    Delete service (Provider only - own services)
// @access  Private
const deleteService = async (req, res) => {
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
};

module.exports = {
  getAllServices,
  getNearbyStats,
  getMyServices,
  getServiceById,
  getServicesByCategory,
  createService,
  updateService,
  deleteService
};