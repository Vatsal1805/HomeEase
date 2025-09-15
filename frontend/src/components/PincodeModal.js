import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast'; // If you use toast in this file, set duration: 2000 for all popups

const PincodeModal = ({ isOpen, onClose, onPincodeSubmit }) => {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 6) {
      setPincode(value);
      setError('');
      setStats(null);
      
      // Auto-fetch stats when 6 digits are entered
      if (value.length === 6) {
        fetchStats(value);
      }
    }
  };

  const fetchStats = async (pincodeValue) => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`/api/services/nearby-stats?pincode=${pincodeValue}`);
      const statsData = response.data.data;
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Unable to find services in this area');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    if (onPincodeSubmit) {
      onPincodeSubmit({
        pincode,
        stats
      });
    }
    onClose();
  };

  const handleClose = () => {
    setPincode('');
    setStats(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                  <i className="fas fa-map-marker-alt text-primary-600 text-lg"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Find Nearby Services</h2>
                  <p className="text-sm text-gray-600">Enter your pincode to discover local providers</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Pincode Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Enter your 6-digit pincode
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={pincode}
                  onChange={handlePincodeChange}
                  placeholder="e.g., 110001"
                  className={`w-full pl-12 pr-12 py-4 text-lg font-mono border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                    error 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : pincode.length === 6 && stats
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                        : 'border-gray-300'
                  }`}
                  maxLength="6"
                  autoFocus
                />
                <i className="fas fa-map-pin absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                
                {loading && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                  </div>
                )}
                
                {pincode.length === 6 && stats && !loading && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <i className="fas fa-check-circle text-green-500 text-lg"></i>
                  </div>
                )}
              </div>
              
              {/* Progress indicator */}
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {pincode.length}/6 digits
                </span>
                <div className="flex space-x-1">
                  {[...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index < pincode.length 
                          ? 'bg-primary-500' 
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center"
              >
                <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                <span className="text-sm text-red-700">{error}</span>
              </motion.div>
            )}

            {/* Stats Display */}
            {pincode.length === 6 && stats && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-green-800 flex items-center">
                    <i className="fas fa-check-circle mr-2"></i>
                    Services available in {stats.pincode}
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    ✓ Location verified
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                    <div className="text-2xl font-bold text-green-700">{stats.providersCount}</div>
                    <div className="text-xs text-gray-600 font-medium">Providers</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                    <div className="text-2xl font-bold text-green-700">{stats.servicesCount}</div>
                    <div className="text-xs text-gray-600 font-medium">Services</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                    <div className="text-2xl font-bold text-green-700">
                      {Object.keys(stats.categoryBreakdown).length}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">Categories</div>
                  </div>
                </div>

                {stats.servicesCount === 0 && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <span className="text-xs text-yellow-700 flex items-center">
                      <i className="fas fa-info-circle mr-2"></i>
                      No services available in this area yet
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Popular Pincodes */}
            {pincode.length === 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Popular areas:</p>
                <div className="flex flex-wrap gap-2">
                  {['110001', '400001', '560001', '700001', '600001'].map((code) => (
                    <button
                      key={code}
                      onClick={() => {
                        setPincode(code);
                        fetchStats(code);
                      }}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors font-mono"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={pincode.length !== 6}
              className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Checking...
                </>
              ) : (
                <>
                  <i className="fas fa-search mr-2"></i>
                  Find Services
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PincodeModal;
