import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LocationInput = ({ 
  onLocationSelect, 
  placeholder = "Enter your pincode", 
  className = "",
  showStats = true 
}) => {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 6) {
      setPincode(value);
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
      const response = await axios.get(`/api/services/nearby-stats?pincode=${pincodeValue}`);
      const statsData = response.data.data;
      setStats(statsData);
      
      if (onLocationSelect) {
        onLocationSelect({
          pincode: pincodeValue,
          stats: statsData
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Unable to fetch location data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={pincode}
          onChange={handlePincodeChange}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          maxLength="6"
        />
        <i className="fas fa-map-marker-alt absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        {loading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
          </div>
        )}
      </div>

      {pincode.length === 6 && stats && showStats && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-800">
              Services available in {stats.pincode}
            </span>
            <span className="text-xs text-green-600">
              ✓ Location verified
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white rounded p-2">
              <div className="text-lg font-bold text-green-700">{stats.providersCount}</div>
              <div className="text-xs text-gray-600">Providers</div>
            </div>
            <div className="bg-white rounded p-2">
              <div className="text-lg font-bold text-green-700">{stats.servicesCount}</div>
              <div className="text-xs text-gray-600">Services</div>
            </div>
            <div className="bg-white rounded p-2">
              <div className="text-lg font-bold text-green-700">
                {Object.keys(stats.categoryBreakdown).length}
              </div>
              <div className="text-xs text-gray-600">Categories</div>
            </div>
          </div>

          {stats.servicesCount === 0 && (
            <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
              <i className="fas fa-exclamation-triangle mr-1"></i>
              No services available in this area yet
            </div>
          )}
        </div>
      )}

      {pincode.length === 6 && !stats && !loading && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-sm text-red-700">
            <i className="fas fa-exclamation-circle mr-2"></i>
            Unable to find services in this area
          </span>
        </div>
      )}
    </div>
  );
};

export default LocationInput;
