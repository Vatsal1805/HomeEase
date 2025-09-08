import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    // Provider business details
    providerDetails: {
      companyName: '',
      businessName: '',
      gstNumber: '',
      panNumber: '',
      businessType: '',
      businessAddress: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        landmark: ''
      },
      description: '',
      experience: '',
      bankDetails: {
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: ''
      }
    }
  });

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const profileResponse = await axios.get('/api/users/profile');
      if (profileResponse.data.success) {
        const userData = profileResponse.data.data;
        setProfileData({
          name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          email: userData.email || '',
          phone: userData.phone || '',
          address: {
            street: userData.address?.street || '',
            city: userData.address?.city || '',
            state: userData.address?.state || '',
            pincode: userData.address?.pincode || '',
            landmark: userData.address?.landmark || ''
          },
          providerDetails: {
            companyName: userData.providerDetails?.companyName || '',
            businessName: userData.providerDetails?.businessName || '',
            gstNumber: userData.providerDetails?.gstNumber || '',
            panNumber: userData.providerDetails?.panNumber || '',
            businessType: userData.providerDetails?.businessType || '',
            businessAddress: {
              street: userData.providerDetails?.businessAddress?.street || '',
              city: userData.providerDetails?.businessAddress?.city || '',
              state: userData.providerDetails?.businessAddress?.state || '',
              pincode: userData.providerDetails?.businessAddress?.pincode || '',
              landmark: userData.providerDetails?.businessAddress?.landmark || ''
            },
            description: userData.providerDetails?.description || '',
            experience: userData.providerDetails?.experience || '',
            bankDetails: {
              accountHolderName: userData.providerDetails?.bankDetails?.accountHolderName || '',
              accountNumber: userData.providerDetails?.bankDetails?.accountNumber || '',
              ifscCode: userData.providerDetails?.bankDetails?.ifscCode || '',
              bankName: userData.providerDetails?.bankDetails?.bankName || ''
            }
          }
        });
      } else {
        // Fallback to user context data if API fails
        if (user) {
          setProfileData({
            name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            email: user.email || '',
            phone: user.phone || '',
            address: {
              street: user.address?.street || '',
              city: user.address?.city || '',
              state: user.address?.state || '',
              pincode: user.address?.pincode || '',
              landmark: user.address?.landmark || ''
            },
            providerDetails: {
              companyName: user.providerDetails?.companyName || '',
              businessName: user.providerDetails?.businessName || '',
              gstNumber: user.providerDetails?.gstNumber || '',
              panNumber: user.providerDetails?.panNumber || '',
              businessType: user.providerDetails?.businessType || '',
              businessAddress: {
                street: user.providerDetails?.businessAddress?.street || '',
                city: user.providerDetails?.businessAddress?.city || '',
                state: user.providerDetails?.businessAddress?.state || '',
                pincode: user.providerDetails?.businessAddress?.pincode || '',
                landmark: user.providerDetails?.businessAddress?.landmark || ''
              },
              description: user.providerDetails?.description || '',
              experience: user.providerDetails?.experience || '',
              bankDetails: {
                accountHolderName: user.providerDetails?.bankDetails?.accountHolderName || '',
                accountNumber: user.providerDetails?.bankDetails?.accountNumber || '',
                ifscCode: user.providerDetails?.bankDetails?.ifscCode || '',
                bankName: user.providerDetails?.bankDetails?.bankName || ''
              }
            }
          });
        }
      }
      
      // Fetch bookings based on user type
      if (user?.userType === 'provider') {
        const bookingsResponse = await axios.get('/api/provider/bookings');
        if (bookingsResponse.data.success) {
          const bookingsData = bookingsResponse.data.data.bookings || [];
          setBookings(bookingsData);
        }
      } else if (user?.userType === 'user') {
        const bookingsResponse = await axios.get('/api/bookings/my-bookings');
        if (bookingsResponse.data.success) {
          setBookings(bookingsResponse.data.data || []);
        }
      }
      // Admins don't need bookings data
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        toast.error('Please login again');
        navigate('/login');
      } else {
        toast.error('Failed to load profile data');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchUserData();
  }, [user, navigate, fetchUserData]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      
      // Prepare data based on user type
      let updateData = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address
      };

      // Only include provider details if user is a provider
      if (user?.userType === 'provider') {
        updateData.providerDetails = profileData.providerDetails;
      }
      
      const response = await axios.put('/api/users/profile', updateData);
      
      if (response.data.success) {
        // Update the user context with new data
        updateUser(response.data.data);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(err.msg);
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setUpdating(false);
    }
  };

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

  const getTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'bookings':
        return renderBookings();
      case 'profile':
        return renderProfileSettings();
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stats Cards */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-calendar-check text-primary-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{Array.isArray(bookings) ? bookings.length : 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-check-circle text-green-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {Array.isArray(bookings) ? bookings.filter(b => b.status === 'completed').length : 0}
              </p>
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
                {Array.isArray(bookings) ? bookings.filter(b => b.status === 'pending').length : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Provider-specific stats */}
        {user?.userType === 'provider' && user?.providerDetails && (
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-rupee-sign text-emerald-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{user.providerDetails.totalEarnings?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Bookings</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : !Array.isArray(bookings) || bookings.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-calendar-times text-4xl text-gray-300 mb-3"></i>
            <p className="text-gray-500">No bookings yet</p>
          </div>
        ) : (
          bookings.slice(0, 3).map((booking) => (
            <div key={booking._id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-tools text-primary-600"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {booking.services?.[0]?.service?.name || `Booking #${booking.bookingId}`}
                    {booking.services?.length > 1 && ` +${booking.services.length - 1} more`}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.scheduledDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">My Bookings</h2>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-calendar-times text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No bookings yet</h3>
          <p className="text-gray-500 mb-4">Start by booking your first service!</p>
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
            <div key={booking._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {booking.serviceId?.name || 'Service'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
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
                      <i className="fas fa-map-marker-alt mr-2 text-primary-500"></i>
                      {booking.address && typeof booking.address === 'object' 
                        ? `${booking.address.street || ''}, ${booking.address.city || ''}, ${booking.address.state || ''} ${booking.address.pincode || ''}`.replace(/,\s*,/g, ',').replace(/^\s*,\s*/, '').replace(/,\s*$/, '')
                        : booking.address || 'Address not specified'
                      }
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-rupee-sign mr-2 text-primary-500"></i>
                      ₹{booking.totalAmount}
                    </div>
                  </div>
                  {booking.notes && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">
                        <i className="fas fa-sticky-note mr-2"></i>
                        {booking.notes}
                      </p>
                    </div>
                  )}
                  {booking.providerNotes && (
                    <div className="mt-2">
                      <p className="text-sm text-blue-600">
                        <i className="fas fa-user-tie mr-2"></i>
                        Provider Notes: {booking.providerNotes}
                      </p>
                    </div>
                  )}
                </div>
                <div className="ml-6 text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  {booking.status === 'completed' && (
                    <div className="mt-2">
                      <button className="text-sm text-primary-600 hover:text-primary-700">
                        Rate Service
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfileSettings = () => (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
      
      <form onSubmit={handleProfileUpdate} className="space-y-8">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="10-digit mobile number"
                required
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={profileData.address.street}
                onChange={(e) => setProfileData({
                  ...profileData, 
                  address: {...profileData.address, street: e.target.value}
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your street address"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={profileData.address.city}
                  onChange={(e) => setProfileData({
                    ...profileData, 
                    address: {...profileData.address, city: e.target.value}
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your city"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={profileData.address.state}
                  onChange={(e) => setProfileData({
                    ...profileData, 
                    address: {...profileData.address, state: e.target.value}
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your state"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  value={profileData.address.pincode}
                  onChange={(e) => setProfileData({
                    ...profileData, 
                    address: {...profileData.address, pincode: e.target.value}
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="6-digit pincode"
                  maxLength={6}
                  pattern="\d{6}"
                />
                <p className="text-xs text-gray-500 mt-1">Required for finding nearby services</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Landmark
                </label>
                <input
                  type="text"
                  value={profileData.address.landmark}
                  onChange={(e) => setProfileData({
                    ...profileData, 
                    address: {...profileData.address, landmark: e.target.value}
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Nearby landmark"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Provider Business Details */}
        {user?.userType === 'provider' && (
          <>
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={profileData.providerDetails?.companyName || ''}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      providerDetails: {...profileData.providerDetails, companyName: e.target.value}
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={profileData.providerDetails?.businessName || ''}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      providerDetails: {...profileData.providerDetails, businessName: e.target.value}
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number *
                  </label>
                  <input
                    type="text"
                    value={profileData.providerDetails.gstNumber}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      providerDetails: {...profileData.providerDetails, gstNumber: e.target.value.toUpperCase()}
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PAN Number *
                  </label>
                  <input
                    type="text"
                    value={profileData.providerDetails.panNumber}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      providerDetails: {...profileData.providerDetails, panNumber: e.target.value.toUpperCase()}
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <select
                    value={profileData.providerDetails.businessType}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      providerDetails: {...profileData.providerDetails, businessType: e.target.value}
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Business Type</option>
                    <option value="individual">Individual</option>
                    <option value="partnership">Partnership</option>
                    <option value="private_limited">Private Limited</option>
                    <option value="llp">LLP</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (in years)
                  </label>
                  <input
                    type="number"
                    value={profileData.providerDetails.experience}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      providerDetails: {...profileData.providerDetails, experience: e.target.value}
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="0"
                    max="50"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
                <textarea
                  value={profileData.providerDetails.description}
                  onChange={(e) => setProfileData({
                    ...profileData, 
                    providerDetails: {...profileData.providerDetails, description: e.target.value}
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="4"
                  placeholder="Describe your business and services..."
                />
              </div>
            </div>

            {/* Business Address */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={profileData.providerDetails.businessAddress.street}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      providerDetails: {
                        ...profileData.providerDetails, 
                        businessAddress: {...profileData.providerDetails.businessAddress, street: e.target.value}
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={profileData.providerDetails.businessAddress.city}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      providerDetails: {
                        ...profileData.providerDetails, 
                        businessAddress: {...profileData.providerDetails.businessAddress, city: e.target.value}
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={profileData.providerDetails.businessAddress.state}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      providerDetails: {
                        ...profileData.providerDetails, 
                        businessAddress: {...profileData.providerDetails.businessAddress, state: e.target.value}
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={profileData.providerDetails.businessAddress.pincode}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      providerDetails: {
                        ...profileData.providerDetails, 
                        businessAddress: {...profileData.providerDetails.businessAddress, pincode: e.target.value}
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    maxLength={6}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={profileData.providerDetails.businessAddress.landmark}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      providerDetails: {
                        ...profileData.providerDetails, 
                        businessAddress: {...profileData.providerDetails.businessAddress, landmark: e.target.value}
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={profileData.providerDetails.bankDetails.accountHolderName}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      providerDetails: {
                        ...profileData.providerDetails, 
                        bankDetails: {...profileData.providerDetails.bankDetails, accountHolderName: e.target.value}
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={profileData.providerDetails.bankDetails.accountNumber}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      providerDetails: {
                        ...profileData.providerDetails, 
                        bankDetails: {...profileData.providerDetails.bankDetails, accountNumber: e.target.value}
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={profileData.providerDetails.bankDetails.ifscCode}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      providerDetails: {
                        ...profileData.providerDetails, 
                        bankDetails: {...profileData.providerDetails.bankDetails, ifscCode: e.target.value.toUpperCase()}
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    maxLength={11}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={profileData.providerDetails.bankDetails.bankName}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      providerDetails: {
                        ...profileData.providerDetails, 
                        bankDetails: {...profileData.providerDetails.bankDetails, bankName: e.target.value}
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* User Type Information */}
        {user?.userType === 'provider' && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Provider Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
              <div>User Type: Service Provider</div>
              <div>Status: {user.approvalStatus}</div>
              <div>Business Details: {user.providerDetails?.isBusinessDetailsComplete ? 'Complete' : 'Incomplete'}</div>
            </div>
            {!user.providerDetails?.isBusinessDetailsComplete && (
              <div className="mt-2 text-sm text-orange-600">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                Please complete your business details to add services.
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updating}
            className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
          >
            {updating ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );

  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'fas fa-tachometer-alt' },
    ...(user?.userType !== 'admin' ? [{ id: 'bookings', name: 'My Bookings', icon: 'fas fa-calendar-alt' }] : []),
    { id: 'profile', name: 'Profile Settings', icon: 'fas fa-user-cog' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('homeease_token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
    toast.success('Logged out successfully');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please login to view your profile</h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors duration-300"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-user text-2xl text-white"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                <p className="text-gray-600">{user.email}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                  user.userType === 'provider' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.userType === 'provider' ? 'Service Provider' : 'Customer'}
                </span>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <i className={`${tab.icon} mr-3`}></i>
                    {tab.name}
                  </button>
                ))}
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 transition-all duration-300"
                >
                  <i className="fas fa-sign-out-alt mr-3"></i>
                  Logout
                </button>
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {getTabContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
