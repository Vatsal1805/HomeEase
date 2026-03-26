const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Service = require('../models/Service');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get provider analytics
const getProviderAnalytics = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { timeframe = '30' } = req.query; // days

    // Verify provider access
    if (req.user.id !== providerId && req.user.userType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    // Total bookings
    const totalBookings = await Booking.countDocuments({ 
      provider: providerId,
      createdAt: { $gte: startDate }
    });

    // Completed bookings
    const completedBookings = await Booking.countDocuments({ 
      provider: providerId,
      status: 'completed',
      createdAt: { $gte: startDate }
    });

    // Revenue
    const revenueData = await Booking.aggregate([
      {
        $match: {
          provider: new mongoose.Types.ObjectId(providerId),
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.total' },
          avgOrderValue: { $avg: '$pricing.total' }
        }
      }
    ]);

    // Reviews and ratings
    const reviewStats = await Review.aggregate([
      {
        $match: {
          provider: new mongoose.Types.ObjectId(providerId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    // Popular services
    const popularServices = await Booking.aggregate([
      {
        $match: {
          provider: new mongoose.Types.ObjectId(providerId),
          createdAt: { $gte: startDate }
        }
      },
      { $unwind: '$services' },
      {
        $group: {
          _id: '$services.service',
          count: { $sum: '$services.quantity' },
          revenue: { $sum: { $multiply: ['$services.price', '$services.quantity'] } }
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'serviceInfo'
        }
      },
      { $unwind: '$serviceInfo' },
      {
        $project: {
          serviceName: '$serviceInfo.name',
          count: 1,
          revenue: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Monthly trends
    const monthlyTrends = await Booking.aggregate([
      {
        $match: {
          provider: new mongoose.Types.ObjectId(providerId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$pricing.total' },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Status distribution
    const statusDistribution = await Booking.aggregate([
      {
        $match: {
          provider: new mongoose.Types.ObjectId(providerId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalBookings,
          completedBookings,
          completionRate: totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(2) : 0,
          totalRevenue: revenueData.length > 0 ? revenueData[0].totalRevenue : 0,
          avgOrderValue: revenueData.length > 0 ? revenueData[0].avgOrderValue : 0
        },
        reviews: {
          totalReviews: reviewStats.length > 0 ? reviewStats[0].totalReviews : 0,
          avgRating: reviewStats.length > 0 ? reviewStats[0].avgRating : 0,
          ratingDistribution: reviewStats.length > 0 ? reviewStats[0].ratingDistribution : []
        },
        popularServices,
        monthlyTrends,
        statusDistribution,
        timeframe: parseInt(timeframe)
      }
    });

  } catch (error) {
    console.error('Provider analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch provider analytics' 
    });
  }
};

// Get service analytics
const getServiceAnalytics = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { timeframe = '30' } = req.query;

    // Verify service ownership
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (service.provider.toString() !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    // Service bookings
    const bookingStats = await Booking.aggregate([
      {
        $match: {
          'services.service': new mongoose.Types.ObjectId(serviceId),
          createdAt: { $gte: startDate }
        }
      },
      { $unwind: '$services' },
      {
        $match: {
          'services.service': new mongoose.Types.ObjectId(serviceId)
        }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalQuantity: { $sum: '$services.quantity' },
          totalRevenue: { $sum: { $multiply: ['$services.price', '$services.quantity'] } },
          avgQuantity: { $avg: '$services.quantity' }
        }
      }
    ]);

    // Service reviews
    const reviewStats = await Review.aggregate([
      {
        $match: {
          service: new mongoose.Types.ObjectId(serviceId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    // Peak booking times
    const peakTimes = await Booking.aggregate([
      {
        $match: {
          'services.service': new mongoose.Types.ObjectId(serviceId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    res.json({
      success: true,
      data: {
        service: {
          id: service._id,
          name: service.name,
          category: service.category
        },
        stats: bookingStats.length > 0 ? bookingStats[0] : {
          totalBookings: 0,
          totalQuantity: 0,
          totalRevenue: 0,
          avgQuantity: 0
        },
        reviews: reviewStats.length > 0 ? reviewStats[0] : {
          totalReviews: 0,
          avgRating: 0
        },
        peakTimes,
        timeframe: parseInt(timeframe)
      }
    });

  } catch (error) {
    console.error('Service analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch service analytics' 
    });
  }
};

// Get platform analytics (admin only)
const getPlatformAnalytics = async (req, res) => {
  try {
    const { timeframe = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    // Platform overview
    const totalUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
    const totalProviders = await User.countDocuments({ 
      userType: 'provider', 
      createdAt: { $gte: startDate } 
    });
    const totalServices = await Service.countDocuments({ createdAt: { $gte: startDate } });
    const totalBookings = await Booking.countDocuments({ createdAt: { $gte: startDate } });

    // Revenue
    const revenueData = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.total' },
          avgOrderValue: { $avg: '$pricing.total' }
        }
      }
    ]);

    // Top categories
    const topCategories = await Service.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // User growth
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          newUsers: { $sum: 1 },
          newProviders: {
            $sum: { $cond: [{ $eq: ['$userType', 'provider'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Top providers by revenue
    const topProviders = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$provider',
          totalRevenue: { $sum: '$pricing.total' },
          totalBookings: { $sum: 1 }
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
          providerName: '$providerInfo.name',
          totalRevenue: 1,
          totalBookings: 1
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProviders,
          totalServices,
          totalBookings,
          totalRevenue: revenueData.length > 0 ? revenueData[0].totalRevenue : 0,
          avgOrderValue: revenueData.length > 0 ? revenueData[0].avgOrderValue : 0
        },
        topCategories,
        userGrowth,
        topProviders,
        timeframe: parseInt(timeframe)
      }
    });

  } catch (error) {
    console.error('Platform analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch platform analytics' 
    });
  }
};

module.exports = {
  getProviderAnalytics,
  getServiceAnalytics,
  getPlatformAnalytics
};