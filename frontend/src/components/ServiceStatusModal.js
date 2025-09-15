import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ServiceStatusModal = ({ booking, isOpen, onClose, onUpdate }) => {
  const [status, setStatus] = useState(booking?.serviceStatus || 'not-started');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: 'not-started', label: 'Not Started', color: 'bg-gray-500', icon: 'fas fa-clock' },
    { value: 'on-the-way', label: 'On the Way', color: 'bg-blue-500', icon: 'fas fa-route' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-500', icon: 'fas fa-cog' },
    { value: 'completed', label: 'Completed', color: 'bg-green-500', icon: 'fas fa-check-circle' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500', icon: 'fas fa-times-circle' }
  ];

  const handleUpdateStatus = async () => {
    try {
      setLoading(true);
      
      const response = await axios.put(
        `/api/bookings/${booking._id}/service-status`,
        { serviceStatus: status, notes }
      );

      if (response.data.success) {
        toast.success('Service status updated successfully', { duration: 2000 });
        onUpdate(response.data.data.booking);
        onClose();
      }
    } catch (error) {
      console.error('Status update error:', error);
  toast.error(error.response?.data?.message || 'Failed to update status', { duration: 2000 });
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl max-w-md w-full max-h-[85vh] sm:max-h-[90vh] flex flex-col my-4 mx-2 sm:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b flex-shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Update Service Status</h3>
            <p className="text-xs sm:text-sm text-gray-600">Booking #{booking.bookingId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <i className="fas fa-times text-lg sm:text-xl"></i>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-grow">
          {/* Current Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Status
            </label>
            <div className="flex items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                statusOptions.find(opt => opt.value === booking.serviceStatus)?.color || 'bg-gray-500'
              }`}></div>
              <span className="text-sm font-medium text-gray-900 capitalize">
                {booking.serviceStatus?.replace('-', ' ') || 'Not Started'}
              </span>
            </div>
          </div>

          {/* New Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Update to
            </label>
            <div className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
              {statusOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-2 sm:p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    status === option.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={status === option.value}
                    onChange={(e) => setStatus(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-3 h-3 rounded-full mr-3 ${option.color}`}></div>
                  <i className={`${option.icon} mr-3 text-gray-500 text-sm`}></i>
                  <span className="text-sm font-medium text-gray-900">
                    {option.label}
                  </span>
                  {status === option.value && (
                    <i className="fas fa-check ml-auto text-primary-500"></i>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this status update..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows="2"
              maxLength="500"
            />
            <p className="text-xs text-gray-500 mt-1">{notes.length}/500 characters</p>
          </div>

          {/* Status History - Collapsed by default */}
          {booking.serviceStatusHistory && booking.serviceStatusHistory.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recent Status Updates
              </label>
              <div className="max-h-24 overflow-y-auto space-y-1 bg-gray-50 rounded-lg p-2">
                {booking.serviceStatusHistory.slice(-2).map((history, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                        statusOptions.find(opt => opt.value === history.status)?.color || 'bg-gray-500'
                      }`}></div>
                      <span className="text-gray-600 capitalize">
                        {history.status.replace('-', ' ')}
                      </span>
                    </div>
                    <span className="text-gray-500">
                      {new Date(history.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t flex-shrink-0 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateStatus}
            disabled={loading || status === booking.serviceStatus}
            className="px-3 sm:px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm sm:text-base"
          >
            {loading && <i className="fas fa-spinner fa-spin mr-2"></i>}
            <span className="hidden sm:inline">Update Status</span>
            <span className="sm:hidden">Update</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ServiceStatusModal;
