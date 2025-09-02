const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Service = require('../models/Service');
const User = require('../models/User');
const { auth, providerAuth, adminAuth } = require('../middleware/auth');
const mongoose = require('mongoose');

// @route   GET /api/analytics/provider/:providerId
// @desc    Get provider analytics
// @access  Private (Provider/Admin)
router.get('/provider/:providerId', auth, providerAuth, async (req, res) => {
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

    // Calculate rating distribution
    let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (reviewStats.length > 0 && reviewStats[0].ratingDistribution) {
      reviewStats[0].ratingDistribution.forEach(rating => {
        ratingDistribution[rating]++;
      });
    }

    const analytics = {
      overview: {
        totalBookings,
        completedBookings,
        completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0,
        totalRevenue: revenueData.length > 0 ? revenueData[0].totalRevenue : 0,
        avgOrderValue: revenueData.length > 0 ? Math.round(revenueData[0].avgOrderValue) : 0,
        totalReviews: reviewStats.length > 0 ? reviewStats[0].totalReviews : 0,
        avgRating: reviewStats.length > 0 ? Math.round(reviewStats[0].avgRating * 10) / 10 : 0
      },
      ratingDistribution,
      popularServices,
      monthlyTrends,
      statusDistribution,
      timeframe: parseInt(timeframe)
    };

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Provider analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/analytics/admin
// @desc    Get admin analytics (overall platform stats)
// @access  Private (Admin only)
router.get('/admin', auth, adminAuth, async (req, res) => {
  try {
    const { timeframe = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    // User stats
    const totalUsers = await User.countDocuments({ userType: 'user' });
    const totalProviders = await User.countDocuments({ userType: 'provider' });
    const newUsers = await User.countDocuments({ 
      userType: 'user',
      createdAt: { $gte: startDate }
    });
    const newProviders = await User.countDocuments({ 
      userType: 'provider',
      createdAt: { $gte: startDate }
    });

    // Booking stats
    const totalBookings = await Booking.countDocuments({ createdAt: { $gte: startDate } });
    const completedBookings = await Booking.countDocuments({ 
      status: 'completed',
      createdAt: { $gte: startDate }
    });

    // Revenue stats
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

    // Top providers by bookings
    const topProviders = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$provider',
          bookingsCount: { $sum: 1 },
          revenue: { $sum: '$pricing.total' }
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
          providerName: '$providerInfo.firstName',
          bookingsCount: 1,
          revenue: 1
        }
      },
      { $sort: { bookingsCount: -1 } },
      { $limit: 10 }
    ]);

    // Service category performance
    const categoryPerformance = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      { $unwind: '$services' },
      {
        $lookup: {
          from: 'services',
          localField: 'services.service',
          foreignField: '_id',
          as: 'serviceInfo'
        }
      },
      { $unwind: '$serviceInfo' },
      {
        $group: {
          _id: '$serviceInfo.category',
          bookings: { $sum: 1 },
          revenue: { $sum: { $multiply: ['$services.price', '$services.quantity'] } }
        }
      },
      { $sort: { bookings: -1 } }
    ]);

    const analytics = {
      users: {
        totalUsers,
        totalProviders,
        newUsers,
        newProviders
      },
      bookings: {
        totalBookings,
        completedBookings,
        completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0
      },
      revenue: {
        totalRevenue: revenueData.length > 0 ? revenueData[0].totalRevenue : 0,
        avgOrderValue: revenueData.length > 0 ? Math.round(revenueData[0].avgOrderValue) : 0
      },
      topProviders,
      categoryPerformance,
      timeframe: parseInt(timeframe)
    };

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
