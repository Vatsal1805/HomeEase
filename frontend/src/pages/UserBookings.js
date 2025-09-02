import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReviewModal from '../components/ReviewModal';

const UserBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/bookings/my-bookings');
      
      if (response.data.success) {
        let filteredBookings = response.data.data || [];
        
        if (filter !== 'all') {
          filteredBookings = filteredBookings.filter(booking => booking.status === filter);
        }
        
        setBookings(filteredBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      if (error.response?.status === 401) {
        toast.error('Please login again');
        navigate('/login');
      } else {
        toast.error('Failed to load bookings');
      }
    } finally {
      setLoading(false);
    }
  }, [filter, navigate]);

  useEffect(() => {
    if (!user || user.userType !== 'user') {
      navigate('/');
      return;
    }

    fetchBookings();
  }, [user, navigate, fetchBookings]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Bookings' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'rejected', label: 'Rejected' }
  ];

  if (!user || user.userType !== 'user') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">My Bookings</h1>
            
            {/* Filter Dropdown */}
            <div className="flex items-center space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={fetchBookings}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-300 flex items-center"
              >
                <i className="fas fa-refresh mr-2"></i>
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-calendar-check text-blue-600"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-clock text-yellow-600"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookings.filter(b => b.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-check-circle text-blue-600"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-check-double text-green-600"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookings.filter(b => b.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <motion.div
            className="bg-white rounded-2xl shadow-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {filter === 'all' ? 'All Bookings' : `${filterOptions.find(f => f.value === filter)?.label} Bookings`}
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                <span className="ml-2 text-gray-600">Loading bookings...</span>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-calendar-times text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
                </h3>
                <p className="text-gray-500 mb-4">
                  {filter === 'all' 
                    ? 'Start by booking your first service!' 
                    : 'Try changing the filter to see other bookings.'
                  }
                </p>
                <button
                  onClick={() => navigate('/services')}
                  className="bg-primary-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors duration-300"
                >
                  Browse Services
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <motion.div
                    key={booking._id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 mr-3">
                            Booking #{booking.bookingId}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        
                        {/* Services List */}
                        <div className="mb-3">
                          <h4 className="font-medium text-gray-900 mb-2">Services:</h4>
                          <div className="space-y-1">
                            {booking.services?.map((serviceItem, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  {serviceItem.service?.name || 'Service'} (x{serviceItem.quantity || 1})
                                </span>
                                <span className="font-medium">
                                  ₹{(serviceItem.service?.price || serviceItem.price || 0) * (serviceItem.quantity || 1)}
                                </span>
                              </div>
                            )) || (
                              <span className="text-gray-500 text-sm">No services found</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <i className="fas fa-calendar mr-2 text-primary-500"></i>
                            {new Date(booking.scheduledDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-clock mr-2 text-primary-500"></i>
                            {booking.scheduledTime || 'Time not specified'}
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-rupee-sign mr-2 text-primary-500"></i>
                            ₹{booking.totalAmount}
                          </div>
                          <div className="flex items-center md:col-span-2 lg:col-span-3">
                            <i className="fas fa-map-marker-alt mr-2 text-primary-500"></i>
                            {booking.address ? `${booking.address.street}, ${booking.address.city} - ${booking.address.pincode}` : 'Address not specified'}
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-600">
                              <i className="fas fa-sticky-note mr-2 text-blue-500"></i>
                              <span className="font-medium">Your Notes:</span> {booking.notes}
                            </p>
                          </div>
                        )}

                        {booking.providerNotes && (
                          <div className="mb-3">
                            <p className="text-sm text-green-600">
                              <i className="fas fa-user-tie mr-2"></i>
                              <span className="font-medium">Provider Notes:</span> {booking.providerNotes}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center text-xs text-gray-500">
                          <i className="fas fa-clock mr-1"></i>
                          Booked on {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="ml-6 flex flex-col items-end space-y-2">
                        {booking.status === 'completed' && (
                          <button 
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowReviewModal(true);
                            }}
                            className="text-sm text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1 rounded-lg transition-colors duration-300"
                          >
                            <i className="fas fa-star mr-1"></i>
                            Rate Service
                          </button>
                        )}
                        
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button className="text-sm text-red-600 hover:text-red-700 bg-red-50 px-3 py-1 rounded-lg transition-colors duration-300">
                            <i className="fas fa-times mr-1"></i>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Review Modal */}
        <ReviewModal
          booking={selectedBooking}
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedBooking(null);
          }}
          onReviewSubmitted={(review) => {
            toast.success('Review submitted successfully!');
            // You could update the booking to show it's been reviewed
            fetchBookings();
          }}
        />
      </div>
    </div>
  );
};

export default UserBookings;
