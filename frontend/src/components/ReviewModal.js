import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ReviewModal = ({ booking, isOpen, onClose, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitReview = async () => {
    if (rating === 0) {
  toast.error('Please select a rating', { duration: 2000 });
      return;
    }

    if (comment.trim().length < 10) {
  toast.error('Please write at least 10 characters in your review', { duration: 2000 });
      return;
    }

    try {
      setLoading(true);
      
      // Validate booking data
      if (!booking || !booking.services || booking.services.length === 0) {
    toast.error('Invalid booking data', { duration: 2000 });
        return;
      }

      // Get the first service from booking
      const serviceItem = booking.services[0];
      if (!serviceItem) {
    toast.error('No service found in booking', { duration: 2000 });
        return;
      }

      // Extract service ID - handle different data structures
      let serviceId;
      if (serviceItem.service) {
        serviceId = typeof serviceItem.service === 'object' 
          ? serviceItem.service._id 
          : serviceItem.service;
      } else {
    toast.error('Service information not available', { duration: 2000 });
        return;
      }

      // Extract provider ID - handle different data structures  
      let providerId;
      if (booking.provider) {
        providerId = typeof booking.provider === 'object' 
          ? booking.provider._id 
          : booking.provider;
      } else if (serviceItem.service && serviceItem.service.provider) {
        // Fallback: get provider from service if not available at booking level
        providerId = typeof serviceItem.service.provider === 'object'
          ? serviceItem.service.provider._id
          : serviceItem.service.provider;
      } else {
    toast.error('Provider information not available', { duration: 2000 });
        return;
      }

      console.log('Submitting review with:', {
        bookingId: booking._id,
        serviceId,
        providerId,
        rating,
        comment: comment.trim()
      });
      
      const response = await axios.post(
        '/api/reviews',
        {
          bookingId: booking._id,
          serviceId,
          providerId,
          rating,
          comment: comment.trim()
        }
      );

      if (response.data.success) {
  toast.success('Review submitted successfully', { duration: 2000 });
        onReviewSubmitted(response.data.review);
        onClose();
        // Reset form
        setRating(0);
        setComment('');
      }
    } catch (error) {
      console.error('Review submission error:', error);
  toast.error(error.response?.data?.message || 'Failed to submit review', { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !booking) return null;

  return (
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
        className="bg-white rounded-xl max-w-md w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Rate Your Experience</h3>
            <p className="text-sm text-gray-600">Booking #{booking.bookingId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto"
          style={{ maxHeight: 'calc(90vh - 140px)' }}
        >
          {/* Service Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Service Details</h4>
            <div className="space-y-1 text-sm text-gray-600">
              {booking.services.map((service, index) => (
                <div key={index}>
                  • {service.service?.name || 'Service'} (₹{service.price})
                </div>
              ))}
              <div className="mt-2 pt-2 border-t border-gray-200">
                <span className="font-medium">Provider: </span>
                {booking.provider?.firstName} {booking.provider?.lastName}
              </div>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How was your experience?
            </label>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-3xl transition-colors duration-200 focus:outline-none"
                >
                  <i
                    className={`fas fa-star ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  ></i>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center mt-2 text-sm text-gray-600">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share your feedback
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience with this service..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows="4"
              maxLength="500"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">Minimum 10 characters required</p>
              <p className="text-xs text-gray-500">{comment.length}/500</p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="text-sm font-medium text-blue-900 mb-2">
              <i className="fas fa-lightbulb mr-2"></i>
              Tips for a helpful review
            </h5>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Comment on the quality of service</li>
              <li>• Mention if the provider was on time</li>
              <li>• Share if you'd recommend this service</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t flex-shrink-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Skip for Now
          </button>
          <button
            onClick={handleSubmitReview}
            disabled={loading || rating === 0 || comment.trim().length < 10}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading && <i className="fas fa-spinner fa-spin mr-2"></i>}
            Submit Review
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReviewModal;
