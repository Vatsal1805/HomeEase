import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const ProviderBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter === 'all' ? {} : { status: filter };
      const response = await axios.get('/api/provider/bookings', { params });
      
      if (response.data.success) {
        setBookings(response.data.data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!user || user.userType !== 'provider') {
      navigate('/');
      return;
    }

    fetchBookings();
  }, [user, navigate, fetchBookings]);

  const handleBookingAction = async (bookingId, action) => {
    try {
      const response = await axios.put(`/api/provider/bookings/${bookingId}/status`, {
        status: action === 'approve' ? 'confirmed' : 'rejected'
      });

      if (response.data.success) {
        toast.success(`Booking ${action === 'approve' ? 'approved' : 'declined'} successfully`);
        fetchBookings(); // Refresh bookings
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      toast.error(`Failed to ${action} booking`);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-800',
      confirmed: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage and track all your service bookings</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Bookings' },
              { key: 'pending', label: 'Pending Approval' },
              { key: 'confirmed', label: 'Confirmed' },
              { key: 'in-progress', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
              { key: 'rejected', label: 'Rejected' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <motion.div
                key={booking._id}
                className="bg-white rounded-lg shadow-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Booking #{booking.bookingId}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Created on {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Name:</span>{' '}
                        {booking.customer?.firstName} {booking.customer?.lastName}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span> {booking.customer?.email}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span> {booking.customer?.phone}
                      </p>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Services</h4>
                    <div className="space-y-2">
                      {booking.services.map((service, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{service.service?.name}</span>
                          <span className="font-medium">₹{service.service?.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Schedule & Address */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Schedule</h4>
                      <p className="text-sm text-gray-600">
                        <i className="fas fa-calendar mr-2"></i>
                        {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                      </p>
                    </div>
                    {booking.address && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Service Address</h4>
                        <p className="text-sm text-gray-600">
                          <i className="fas fa-map-marker-alt mr-2"></i>
                          {booking.address.street}, {booking.address.city} - {booking.address.pincode}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {booking.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-3">
                    <button
                      onClick={() => handleBookingAction(booking._id, 'approve')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <i className="fas fa-check mr-2"></i>
                      Approve Booking
                    </button>
                    <button
                      onClick={() => handleBookingAction(booking._id, 'decline')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <i className="fas fa-times mr-2"></i>
                      Decline Booking
                    </button>
                  </div>
                )}

                {booking.notes?.customer && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Customer Notes</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {booking.notes.customer}
                    </p>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-card p-12 text-center">
              <i className="fas fa-calendar-times text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? "You don't have any bookings yet."
                  : `No ${filter} bookings found.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderBookings;
