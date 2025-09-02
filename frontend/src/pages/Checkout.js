import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, getTotalPrice } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed with checkout');
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, navigate]);

  // Pre-populate form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerInfo: {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
          email: user.email || ''
        }
      }));
    }
  }, [user]);

  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    customerInfo: {
      firstName: '',
      lastName: '',
      phone: '',
      email: ''
    },
    address: {
      street: '',
      city: '',
      pincode: ''
    },
    payment: {
      method: 'cod'
    },
    notes: ''
  });  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };  const validateForm = () => {
    if (!formData.address.street.trim()) {
      toast.error('Please enter your street address');
      return false;
    }
    if (!formData.address.city.trim()) {
      toast.error('Please enter your city');
      return false;
    }
    if (!formData.address.pincode.trim()) {
      toast.error('Please enter your pincode');
      return false;
    }
    if (!formData.customerInfo.phone.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }
    if (!formData.customerInfo.firstName.trim()) {
      toast.error('Please enter your first name');
      return false;
    }
    if (!formData.customerInfo.lastName.trim()) {
      toast.error('Please enter your last name');
      return false;
    }
    if (!formData.customerInfo.email.trim()) {
      toast.error('Please enter your email');
      return false;
    }
    if (!formData.scheduledDate) {
      toast.error('Please select a preferred date');
      return false;
    }
    if (!formData.scheduledTime) {
      toast.error('Please select a preferred time');
      return false;
    }
    return true;
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Additional validation for booking data
    if (!cartItems || cartItems.length === 0) {
      toast.error('No services selected for booking');
      return;
    }

    // Validate that all cart items have valid IDs
    const invalidServices = cartItems.filter(item => !item._id);
    if (invalidServices.length > 0) {
      toast.error('Some services have invalid data. Please refresh and try again.');
      return;
    }

    // Validate date format
    if (!formData.scheduledDate || isNaN(new Date(formData.scheduledDate).getTime())) {
      toast.error('Please select a valid date');
      return;
    }

    setLoading(true);

    try {
      // Prepare booking data with all services in a single booking
      const bookingData = {
        services: cartItems.map(service => ({
          service: service._id,
          quantity: 1
        })),
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        customerInfo: formData.customerInfo,
        address: formData.address,
        payment: formData.payment,
        ...(formData.notes && { notes: formData.notes })
      };

      const response = await axios.post('/api/bookings', bookingData);
      const booking = response.data?.data?.booking;
      
      clearCart();
      toast.success('Booking confirmed successfully!');
      
      if (booking) {
        navigate(`/booking-confirmation/${booking.bookingId}`, { 
          state: { 
            bookingData: formData,
            services: cartItems,
            total: getTotalPrice(),
            booking: booking
          }
        });
      } else {
        // Fallback if no booking ID available
        navigate('/my-bookings');
      }
    } catch (error) {
      console.error('Booking error:', error);
      console.log('Error response:', error.response?.data);
      console.log('Request data:', {
        services: cartItems.map(service => ({
          service: service._id,
          quantity: 1
        })),
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        customerInfo: formData.customerInfo,
        address: formData.address,
        payment: formData.payment
      });
      
      if (error.response?.data?.errors) {
        // Show specific validation errors
        error.response.data.errors.forEach(err => {
          toast.error(`${err.param || err.path || 'Field'}: ${err.msg || err.message}`);
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't render if user is not authenticated (will redirect in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some services to your cart to proceed with checkout</p>
          <button
            onClick={() => navigate('/services')}
            className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors duration-300"
          >
            Browse Services
          </button>
        </motion.div>
      </div>
    );
  }

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Details</h2>
              
              <div className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="customerInfo.firstName"
                        value={formData.customerInfo.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter your first name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="customerInfo.lastName"
                        value={formData.customerInfo.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter your last name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="customerInfo.email"
                        value={formData.customerInfo.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="customerInfo.phone"
                        value={formData.customerInfo.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Service Address</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleInputChange}
                        placeholder="House number, building, street"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          placeholder="Enter city"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          name="address.pincode"
                          value={formData.address.pincode}
                          onChange={handleInputChange}
                          placeholder="6-digit pincode"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleInputChange}
                      min={minDate}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time *
                    </label>
                    <select
                      name="scheduledTime"
                      value={formData.scheduledTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="cod"
                        name="payment.method"
                        value="cod"
                        checked={true}
                        readOnly
                        className="mr-3"
                      />
                      <div>
                        <label htmlFor="cod" className="text-sm font-medium text-blue-800">
                          Cash on Delivery
                        </label>
                        <p className="text-xs text-blue-600 mt-1">
                          Pay when your service is completed. No advance payment required.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Any special instructions or requirements..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((service) => (
                  <div key={service._id} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                      <i className="fas fa-tools text-white"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-600">
                        {service.provider ? 
                          `${service.provider.firstName || ''} ${service.provider.lastName || ''}`.trim() || 'Professional'
                          : 'Professional'
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{service.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{getTotalPrice()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-semibold">₹50</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>₹{getTotalPrice() + 50}</span>
                </div>
              </div>

              {/* Booking Button */}
              <button
                onClick={handleBooking}
                disabled={loading}
                className={`w-full mt-6 py-4 rounded-lg font-semibold text-white transition-all duration-300 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-500 hover:bg-primary-600 transform hover:scale-105'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <i className="fas fa-calendar-check mr-2"></i>
                    Confirm Booking
                  </>
                )}
              </button>

              {/* Security Note */}
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center text-green-700">
                  <i className="fas fa-shield-alt mr-2"></i>
                  <span className="text-sm">Your booking is secure and protected</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
