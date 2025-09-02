import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const AnalyticsModal = ({ isOpen, onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('30');
  const { user } = useAuth();

  const fetchAnalytics = useCallback(async () => {
    if (!user?._id) {
      console.log('No user available for analytics fetch');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/analytics/provider/${user._id}?timeframe=${timeframe}`
      );
      
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [user?._id, timeframe]);

  useEffect(() => {
    if (isOpen && user?._id) {
      fetchAnalytics();
    }
  }, [isOpen, fetchAnalytics, user]);

  // Close modal if user becomes null (logout)
  useEffect(() => {
    if (isOpen && !user) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  if (!isOpen) return null;

  // Don't render if user is null
  if (!user) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
              <p className="text-gray-600">Detailed insights about your services</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : analytics ? (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Total Bookings</p>
                        <p className="text-3xl font-bold">{analytics.overview.totalBookings}</p>
                      </div>
                      <i className="fas fa-calendar-check text-3xl text-blue-200"></i>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Completed</p>
                        <p className="text-3xl font-bold">{analytics.overview.completedBookings}</p>
                        <p className="text-sm text-green-100">{analytics.overview.completionRate}% rate</p>
                      </div>
                      <i className="fas fa-check-circle text-3xl text-green-200"></i>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Total Revenue</p>
                        <p className="text-3xl font-bold">₹{analytics.overview.totalRevenue.toLocaleString()}</p>
                      </div>
                      <i className="fas fa-rupee-sign text-3xl text-purple-200"></i>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100">Avg Rating</p>
                        <p className="text-3xl font-bold">{analytics.overview.avgRating}</p>
                        <p className="text-sm text-orange-100">{analytics.overview.totalReviews} reviews</p>
                      </div>
                      <i className="fas fa-star text-3xl text-orange-200"></i>
                    </div>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Rating Distribution */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
                    <div className="space-y-3">
                      {Object.entries(analytics.ratingDistribution).reverse().map(([rating, count]) => (
                        <div key={rating} className="flex items-center">
                          <span className="w-8 text-sm text-gray-600">{rating}★</span>
                          <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${analytics.overview.totalReviews > 0 ? (count / analytics.overview.totalReviews) * 100 : 0}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Distribution */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
                    <div className="space-y-3">
                      {analytics.statusDistribution.map((status) => (
                        <div key={status._id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              status._id === 'completed' ? 'bg-green-500' :
                              status._id === 'pending' ? 'bg-yellow-500' :
                              status._id === 'in-progress' ? 'bg-blue-500' :
                              status._id === 'cancelled' ? 'bg-red-500' :
                              'bg-gray-500'
                            }`}></div>
                            <span className="text-sm text-gray-700 capitalize">{status._id}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{status.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Popular Services */}
                {analytics.popularServices.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Services</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Service
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Bookings
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Revenue
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {analytics.popularServices.map((service, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {service.serviceName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {service.count}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ₹{service.revenue.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Monthly Trends */}
                {analytics.monthlyTrends.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
                    <div className="space-y-2">
                      {analytics.monthlyTrends.slice(-10).map((trend, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <span className="text-sm text-gray-600">
                            {trend._id.day}/{trend._id.month}/{trend._id.year}
                          </span>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-blue-600">{trend.bookings} bookings</span>
                            <span className="text-green-600">₹{trend.revenue}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-chart-line text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-500">No analytics data available</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnalyticsModal;
