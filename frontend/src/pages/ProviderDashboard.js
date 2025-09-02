import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import AnalyticsModal from '../components/AnalyticsModal';
import ServiceStatusModal from '../components/ServiceStatusModal';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    rejectedBookings: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    averageRating: 0,
    totalServices: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    if (!user) {
      setShowAnalytics(false);
      setShowStatusModal(false);
      setSelectedBooking(null);
      return;
    }

    if (user.userType !== 'provider') {
      toast.error('Access denied. Provider account required.');
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get('/api/provider/dashboard');
      
      if (response.data.success) {
        const newStats = {
          totalBookings: response.data.data.stats.totalBookings || 0,
          completedBookings: response.data.data.stats.completedBookings || 0,
          pendingBookings: response.data.data.stats.pendingBookings || 0,
          confirmedBookings: response.data.data.stats.confirmedBookings || 0,
          rejectedBookings: 0,
          totalEarnings: response.data.data.stats.totalEarnings || 0,
          monthlyEarnings: 0,
          averageRating: 0,
          totalServices: 0
        };
        
        setStats(newStats);
        setRecentBookings(response.data.data.recentBookings);
      }
      
    } catch (error) {
      toast.error('Failed to load dashboard data');
      
      if (stats.totalBookings === 0) {
        setStats({
          totalBookings: 0,
          completedBookings: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
          totalEarnings: 0
        });
        setRecentBookings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const response = await axios.put(`/api/provider/bookings/${bookingId}/status`, {
        status: action === 'approve' ? 'confirmed' : 'rejected'
      });

      if (response.data.success) {
        toast.success(`Booking ${action === 'approve' ? 'approved' : 'declined'} successfully`);
        // Refresh dashboard data
        fetchDashboardData();
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      toast.error(`Failed to ${action} booking`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.firstName}!</h1>
              <p className="text-gray-600">Manage your services and track your business performance.</p>
            </div>
            <button
              onClick={() => setShowAnalytics(true)}
              className="mt-4 sm:mt-0 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-300 flex items-center"
            >
              <i className="fas fa-chart-line mr-2"></i>
              View Analytics
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {console.log('🎯 Rendering stats cards with values:', stats)}
          <motion.div
            className="bg-white rounded-lg shadow-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-calendar-check text-blue-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-check-circle text-green-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedBookings}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-clock text-orange-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-check text-blue-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.confirmedBookings}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-rupee-sign text-purple-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Bookings */}
        <motion.div
          className="bg-white rounded-lg shadow-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          </div>
          <div className="p-6">
            {recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking._id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {booking.customer?.firstName} {booking.customer?.lastName}
                        </h3>
                        <div className="mt-2 space-y-1">
                          {booking.services.map((service, index) => (
                            <p key={index} className="text-sm text-gray-600">
                              {service.service?.name} - ₹{service.service?.price}
                            </p>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Scheduled: {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                        </p>
                        {booking.address && (
                          <p className="text-sm text-gray-500">
                            {booking.address.street}, {booking.address.city}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          booking.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : booking.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>

                        {/* Service Status */}
                        {booking.status === 'confirmed' && (
                          <div className="flex flex-col items-end space-y-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              booking.serviceStatus === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : booking.serviceStatus === 'in-progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : booking.serviceStatus === 'on-the-way'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.serviceStatus 
                                ? booking.serviceStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                                : 'Not Started'
                              }
                            </span>
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowStatusModal(true);
                              }}
                              className="px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 transition-colors"
                            >
                              Update Status
                            </button>
                          </div>
                        )}
                        
                        {booking.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleBookingAction(booking._id, 'approve')}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleBookingAction(booking._id, 'decline')}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-calendar-times text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-600">No bookings yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="bg-white rounded-lg shadow-card p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-user-edit text-primary-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Update Profile</h3>
            <p className="text-gray-600 mb-4">Manage your professional information</p>
            <button 
              onClick={() => navigate('/profile')}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Update Profile
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-card p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-tools text-green-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Services</h3>
            <p className="text-gray-600 mb-4">Add or update your service offerings</p>
            <button 
              onClick={() => navigate('/manage-services')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Manage Services
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-card p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-chart-line text-blue-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Analytics</h3>
            <p className="text-gray-600 mb-4">Track your performance and earnings</p>
            <button 
              onClick={() => setShowAnalytics(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Analytics
            </button>
          </div>
        </motion.div>

        {/* Analytics Modal */}
        <AnalyticsModal 
          isOpen={showAnalytics} 
          onClose={() => setShowAnalytics(false)} 
        />

        {/* Service Status Modal */}
        <ServiceStatusModal
          booking={selectedBooking}
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedBooking(null);
          }}
          onUpdate={(updatedBooking) => {
            // Update the booking in recentBookings
            setRecentBookings(prev => 
              prev.map(booking => 
                booking._id === updatedBooking._id 
                  ? { ...booking, ...updatedBooking }
                  : booking
              )
            );
            // Refresh dashboard data
            fetchDashboardData();
          }}
        />
      </div>
    </div>
  );
};

export default ProviderDashboard;
