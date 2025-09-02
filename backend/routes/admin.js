const express = require('express');
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments({ userType: 'user' });
    const totalProviders = await User.countDocuments({ userType: 'provider' });
    const pendingProviders = await User.countDocuments({ 
      userType: 'provider', 
      approvalStatus: 'pending' 
    });
    const approvedProviders = await User.countDocuments({ 
      userType: 'provider', 
      approvalStatus: 'approved' 
    });
    const totalServices = await Service.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Revenue Analytics - Fixed field path to pricing.total
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    const monthlyRevenue = await Booking.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) }
        } 
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$pricing.total' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Booking Status Analytics
    const bookingsByStatus = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top Services - Only from completed bookings
    const topServices = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$services' },
      { 
        $lookup: {
          from: 'services',
          localField: 'services.service',
          foreignField: '_id',
          as: 'serviceDetails'
        }
      },
      { $unwind: '$serviceDetails' },
      {
        $group: {
          _id: '$serviceDetails._id',
          name: { $first: '$serviceDetails.name' },
          bookings: { $sum: 1 },
          revenue: { $sum: '$services.price' }
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 5 }
    ]);

    // Growth Analytics (last 12 months)
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            userType: '$userType'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Provider Performance - Only from completed bookings
    const providerStats = await Booking.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$provider',
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' },
          completedBookings: { $sum: 1 } // All are completed in this query
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'providerInfo'
        }
      },
      { $unwind: '$providerInfo' },
      {
        $project: {
          name: { $concat: ['$providerInfo.firstName', ' ', '$providerInfo.lastName'] },
          email: '$providerInfo.email',
          totalBookings: 1,
          totalRevenue: 1,
          completedBookings: 1,
          completionRate: {
            $multiply: [
              { $divide: ['$completedBookings', '$totalBookings'] },
              100
            ]
          }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    // Recent activity
    const recentUsers = await User.find({ userType: 'user' })
      .select('firstName lastName email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentProviders = await User.find({ userType: 'provider' })
      .select('firstName lastName email approvalStatus createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentBookings = await Booking.find({ status: 'completed' })
      .populate('customer', 'firstName lastName email')
      .populate('provider', 'firstName lastName')
      .populate('services.service', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Add totalAmount field for compatibility with frontend
    const recentBookingsWithTotal = recentBookings.map(booking => {
      const bookingObj = booking.toObject();
      bookingObj.totalAmount = bookingObj.pricing?.total || 
        bookingObj.services.reduce((total, service) => 
          total + (service.price * service.quantity), 0);
      return bookingObj;
    });

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          totalProviders,
          pendingProviders,
          approvedProviders,
          totalServices,
          totalBookings,
          totalRevenue: totalRevenue[0]?.total || 0,
          monthlyRevenue,
          bookingsByStatus,
          topServices,
          userGrowth,
          providerStats
        },
        recentActivity: {
          recentUsers,
          recentProviders,
          recentBookings: recentBookingsWithTotal
        }
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/pending-providers
// @desc    Get all pending provider requests
// @access  Private (Admin only)
router.get('/pending-providers', auth, adminAuth, async (req, res) => {
  try {
    const pendingProviders = await User.find({
      userType: 'provider',
      approvalStatus: 'pending'
    }).select('firstName lastName email phone createdAt providerDetails');

    res.status(200).json({
      success: true,
      data: pendingProviders
    });
  } catch (error) {
    console.error('Get pending providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/approve-provider/:id
// @desc    Approve or reject provider
// @access  Private (Admin only)
router.put('/approve-provider/:id', auth, adminAuth, async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid approval status. Must be "approved" or "rejected"'
      });
    }

    const provider = await User.findById(req.params.id);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    if (provider.userType !== 'provider') {
      return res.status(400).json({
        success: false,
        message: 'User is not a provider'
      });
    }

    provider.approvalStatus = status;
    if (reason) {
      provider.rejectionReason = reason;
    }

    await provider.save();

    res.status(200).json({
      success: true,
      message: `Provider ${status} successfully`,
      data: {
        provider: {
          id: provider._id,
          name: `${provider.firstName} ${provider.lastName}`,
          email: provider.email,
          status: provider.approvalStatus
        }
      }
    });
  } catch (error) {
    console.error('Approve provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, userType, search } = req.query;
    
    let query = {};
    
    if (userType && userType !== 'all') {
      query.userType = userType;
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('firstName lastName email phone userType approvalStatus isActive createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          pages: Math.ceil(total / limit),
          total,
          limit: Number(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/services
// @desc    Get all services with pagination
// @access  Private (Admin only)
router.get('/services', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    
    let query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const services = await Service.find(query)
      .populate('provider', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

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

// @route   DELETE /api/admin/service/:id
// @desc    Delete service
// @access  Private (Admin only)
router.delete('/service/:id', auth, adminAuth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

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

// @route   PUT /api/admin/user/:id/status
// @desc    Update user status (active/inactive)
// @access  Private (Admin only)
router.put('/user/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, userType, search, status } = req.query;
    
    let query = {};
    
    if (userType && userType !== 'all') {
      query.userType = userType;
    }
    
    if (status && status !== 'all') {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('firstName lastName email userType isActive approvalStatus createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          pages: Math.ceil(total / limit),
          total,
          limit: Number(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/user/:id
// @desc    Delete user (ban user)
// @access  Private (Admin only)
router.delete('/user/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting admin users
    if (user.userType === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/reviews
// @desc    Get all reviews with pagination
// @access  Private (Admin only)
router.get('/reviews', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, rating, search } = req.query;
    
    let query = {};
    
    if (rating && rating !== 'all') {
      query.rating = Number(rating);
    }
    
    if (search) {
      query.$or = [
        { comment: { $regex: search, $options: 'i' } }
      ];
    }

    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName email')
      .populate('provider', 'firstName lastName email')
      .populate('service', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: Number(page),
          pages: Math.ceil(total / limit),
          total,
          limit: Number(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/review/:id
// @desc    Delete review
// @access  Private (Admin only)
router.delete('/review/:id', auth, adminAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/statistics
// @desc    Get detailed statistics for admin dashboard
// @access  Private (Admin only)
router.get('/statistics', auth, adminAuth, async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments({ userType: 'customer' });
    const totalProviders = await User.countDocuments({ userType: 'provider' });
    const activeUsers = await User.countDocuments({ userType: 'customer', isActive: true });
    const activeProviders = await User.countDocuments({ userType: 'provider', isActive: true });
    
    // Service statistics
    const totalServices = await Service.countDocuments();
    const activeServices = await Service.countDocuments({ isActive: true });
    
    // Booking statistics
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    
    // Review statistics
    const totalReviews = await Review.countDocuments();
    const averageRating = await Review.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers
        },
        providers: {
          total: totalProviders,
          active: activeProviders,
          inactive: totalProviders - activeProviders
        },
        services: {
          total: totalServices,
          active: activeServices,
          inactive: totalServices - activeServices
        },
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          pending: pendingBookings
        },
        reviews: {
          total: totalReviews,
          averageRating: averageRating[0]?.avgRating || 0
        }
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
