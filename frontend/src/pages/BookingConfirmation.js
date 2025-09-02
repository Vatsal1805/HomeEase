import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId: urlBookingId } = useParams();
  const { bookingData, services, total, booking } = location.state || {};

  // If no booking data, redirect to my bookings
  if (!bookingData && !booking) {
    navigate('/my-bookings');
    return null;
  }

  // Use booking ID from URL, booking object, or generate a fallback
  const bookingId = urlBookingId || booking?.bookingId || `HE${Date.now().toString().slice(-6)}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-check text-3xl text-white"></i>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Your service booking has been successfully confirmed. We'll contact you shortly.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Details */}
          <motion.div
            className="bg-white rounded-2xl shadow-card p-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <i className="fas fa-info-circle mr-2 text-primary-500"></i>
              Booking Details
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600">Booking ID:</span>
                <span className="font-semibold text-primary-600">{bookingId}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600">Date:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(bookingData.scheduledDate || bookingData.preferredDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600">Time:</span>
                <span className="font-semibold text-gray-900">{bookingData.scheduledTime || bookingData.preferredTime}</span>
              </div>
              
              <div className="py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600 block mb-1">Address:</span>
                <span className="text-gray-900">{typeof bookingData.address === 'string' ? bookingData.address : `${bookingData.address.street}, ${bookingData.address.city}, ${bookingData.address.pincode}`}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600">Phone:</span>
                <span className="font-semibold text-gray-900">{bookingData.customerInfo?.phone || bookingData.phone}</span>
              </div>
              
              {bookingData.notes && (
                <div className="py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600 block mb-1">Special Instructions:</span>
                  <span className="text-gray-900">{bookingData.notes}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Service Summary */}
          <motion.div
            className="bg-white rounded-2xl shadow-card p-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <i className="fas fa-list mr-2 text-primary-500"></i>
              Service Summary
            </h2>
            
            <div className="space-y-4 mb-6">
              {services.map((service, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    <i className="fas fa-tools text-white"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-600">
                      {typeof service.provider === 'string' 
                        ? service.provider 
                        : service.provider?.firstName && service.provider?.lastName
                          ? `${service.provider.firstName} ${service.provider.lastName}`
                          : service.provider?.name || 'Professional'
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{service.price}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Fee</span>
                <span className="font-semibold">₹50</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                <span>Total Paid</span>
                <span>₹{total + 50}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* What's Next Section */}
        <motion.div
          className="bg-white rounded-2xl shadow-card p-6 mt-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <i className="fas fa-clock mr-2 text-primary-500"></i>
            What's Next?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-phone text-2xl text-blue-600"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Confirmation Call</h3>
              <p className="text-sm text-gray-600">
                Our team will call you within 30 minutes to confirm the booking details.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-user-check text-2xl text-green-600"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Professional Assigned</h3>
              <p className="text-sm text-gray-600">
                A verified professional will be assigned to your booking within 2 hours.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-tools text-2xl text-purple-600"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Service Completed</h3>
              <p className="text-sm text-gray-600">
                Our professional will arrive on time and complete the service efficiently.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="text-center mt-8 space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <button
            onClick={() => navigate('/profile')}
            className="w-full sm:w-auto px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors duration-300"
          >
            <i className="fas fa-user mr-2"></i>
            View My Bookings
          </button>
          
          <button
            onClick={() => navigate('/services')}
            className="w-full sm:w-auto px-6 py-3 bg-white text-primary-500 border-2 border-primary-500 rounded-lg font-semibold hover:bg-primary-50 transition-colors duration-300"
          >
            <i className="fas fa-plus mr-2"></i>
            Book Another Service
          </button>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          className="bg-primary-50 rounded-2xl p-6 mt-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            Our customer support team is here to help you 24/7
          </p>
          <div className="flex justify-center space-x-6">
            <div className="flex items-center text-primary-600">
              <i className="fas fa-phone mr-2"></i>
              <span className="font-semibold">+91 9876543210</span>
            </div>
            <div className="flex items-center text-primary-600">
              <i className="fas fa-envelope mr-2"></i>
              <span className="font-semibold">support@homeease.com</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
