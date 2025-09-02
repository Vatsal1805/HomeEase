import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const { user } = useAuth();

  const fetchReviews = useCallback(async (page = 1) => {
    if (!user?._id) {
      console.log('No user available for reviews fetch');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/reviews/provider/${user._id}?page=${page}&limit=10`
      );

      if (response.data.success) {
        setReviews(response.data.reviews);
        setCurrentPage(response.data.pagination.currentPage);
        setTotalPages(response.data.pagination.totalPages);
        setTotalReviews(response.data.pagination.totalReviews);
        setAverageRating(response.data.averageRating);
      }
    } catch (error) {
      console.error('Reviews fetch error:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (user?._id) {
      fetchReviews();
    }
  }, [user, fetchReviews]);

  const handlePageChange = (page) => {
    fetchReviews(page);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i
        key={index}
        className={`fas fa-star ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      ></i>
    ));
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Customer Reviews</h1>
          <p className="text-gray-600">See what customers are saying about your services</p>
        </motion.div>

        {/* Rating Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-card p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">{averageRating}</div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <p className="text-gray-600">{totalReviews} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Breakdown</h3>
              {Object.entries(getRatingDistribution()).reverse().map(([rating, count]) => (
                <div key={rating} className="flex items-center mb-2">
                  <span className="text-sm text-gray-600 w-8">{rating}★</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${totalReviews > 0 ? (count / totalReviews) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Reviews List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-card"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Reviews</h2>
          </div>

          {reviews.length > 0 ? (
            <>
              <div className="divide-y divide-gray-200">
                {reviews.map((review) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-primary-600 font-semibold">
                            {review.user.firstName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {review.user.firstName} {review.user.lastName}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-sm text-gray-600">({review.rating})</span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{review.comment}</p>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Service: <span className="font-medium">{review.service.name}</span>
                      </div>
                      {review.booking && (
                        <div className="text-sm text-gray-500">
                          Booking: #{review.booking.bookingId}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalReviews)} of {totalReviews} reviews
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <i className="fas fa-star text-4xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-600">
                Complete some services to start receiving customer reviews
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ReviewsPage;
