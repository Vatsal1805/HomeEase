import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import PincodeModal from '../components/PincodeModal';

const Services = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState({
    enabled: false,
    pincode: '',
    stats: null
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const categories = [
    { id: 'all', name: 'All Services', icon: 'fas fa-th-large' },
    { id: 'plumbing', name: 'Plumbing', icon: 'fas fa-wrench' },
    { id: 'electrical', name: 'Electrical', icon: 'fas fa-bolt' },
    { id: 'carpentry', name: 'Carpentry', icon: 'fas fa-hammer' },
    { id: 'cleaning', name: 'Cleaning', icon: 'fas fa-broom' },
    { id: 'ac-service', name: 'AC Service', icon: 'fas fa-snowflake' },
    { id: 'painting', name: 'Wall Paint', icon: 'fas fa-paint-roller' },
  ];

  const fetchServices = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (locationFilter.enabled && locationFilter.pincode) {
        params.append('pincode', locationFilter.pincode);
        params.append('nearbyOnly', 'true');
      }
      
      const response = await axios.get(`/api/services?${params.toString()}`);
      setServices(response.data.data.services);
    } catch (error) {
      toast.error('Failed to load services');
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyStats = async (pincode) => {
    try {
      setLoadingStats(true);
      const response = await axios.get(`/api/services/nearby-stats?pincode=${pincode}`);
      setLocationFilter(prev => ({
        ...prev,
        stats: response.data.data
      }));
    } catch (error) {
      toast.error('Failed to load nearby statistics');
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLocationToggle = async (enabled) => {
    if (enabled) {
      // Get user's pincode from profile
      let userPincode = '';
      if (user?.address?.pincode) {
        userPincode = user.address.pincode;
      } else if (user?.providerDetails?.businessAddress?.pincode) {
        userPincode = user.providerDetails.businessAddress.pincode;
      }

      if (userPincode) {
        setLocationFilter({
          enabled: true,
          pincode: userPincode,
          stats: null
        });
        await fetchNearbyStats(userPincode);
      } else {
        // Show beautiful modal instead of prompt
        setShowPincodeModal(true);
      }
    } else {
      setLocationFilter({
        enabled: false,
        pincode: '',
        stats: null
      });
    }
  };

  const handlePincodeSubmit = (locationData) => {
    setLocationFilter({
      enabled: true,
      pincode: locationData.pincode,
      stats: locationData.stats
    });
    setShowPincodeModal(false);
  };

  const filterServices = useCallback(() => {
    let filtered = services;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  }, [services, selectedCategory, searchTerm]);

  useEffect(() => {
    fetchServices();
    
    // Check if we came from a category link
    const urlParams = new URLSearchParams(location.search);
    const category = urlParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [location, locationFilter.enabled, locationFilter.pincode]);

  useEffect(() => {
    filterServices();
  }, [filterServices]);

  const handleAddToCart = (service) => {
    if (!isAuthenticated) {
      toast.error('Please login to add services to cart');
      navigate('/login?redirect=/services');
      return;
    }
    
    addToCart({
      _id: service._id,
      name: service.name,
      price: service.price,
      provider: service.provider,
      image: service.image,
      duration: service.duration
    });
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    // Update URL without page reload
    const newUrl = categoryId === 'all' ? '/services' : `/services?category=${categoryId}`;
    window.history.pushState({}, '', newUrl);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {user?.userType === 'provider' ? 'Browse Services' : 'Our Services'}
            </h1>
            <p className="text-lg text-gray-600">
              {user?.userType === 'provider' 
                ? 'Explore available services in the marketplace' 
                : 'Find the perfect service for your home'
              }
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </motion.div>

        {/* Location Filter */}
        {user && user.userType === 'user' && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl shadow-lg p-6 max-w-4xl mx-auto border border-primary-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <i className="fas fa-map-marker-alt text-primary-600 text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Location-Based Search</h3>
                    <p className="text-sm text-gray-600">Find service providers near you</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 font-medium">
                    {locationFilter.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={locationFilter.enabled}
                      onChange={(e) => handleLocationToggle(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500 shadow-sm"></div>
                  </label>
                </div>
              </div>

              {locationFilter.enabled && locationFilter.pincode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-primary-200 pt-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <i className="fas fa-location-dot text-primary-500 mr-2"></i>
                      <span className="text-sm text-gray-600">
                        Showing services near pincode: 
                        <span className="font-bold text-primary-700 ml-1">{locationFilter.pincode}</span>
                      </span>
                    </div>
                    <button
                      onClick={() => setShowPincodeModal(true)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      Change
                    </button>
                  </div>
                  
                  {loadingStats && (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500 mr-2"></div>
                      <span className="text-sm text-gray-600">Loading nearby services...</span>
                    </div>
                  )}
                  
                  {locationFilter.stats && !loadingStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-primary-100">
                        <div className="text-2xl font-bold text-primary-600">{locationFilter.stats.providersCount}</div>
                        <div className="text-xs text-gray-600 font-medium">Nearby Providers</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-green-100">
                        <div className="text-2xl font-bold text-green-600">{locationFilter.stats.servicesCount}</div>
                        <div className="text-xs text-gray-600 font-medium">Available Services</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-blue-100">
                        <div className="text-2xl font-bold text-blue-600">
                          {Object.keys(locationFilter.stats.categoryBreakdown).length}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Service Categories</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-yellow-100">
                        <div className="text-2xl font-bold text-yellow-600">
                          {locationFilter.stats.servicesCount > 0 ? '4.5★' : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Avg Rating</div>
                      </div>
                    </div>
                  )}

                  {locationFilter.stats && locationFilter.stats.servicesCount === 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
                      <i className="fas fa-info-circle text-yellow-600 mr-3"></i>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">No services available in this area</p>
                        <p className="text-xs text-yellow-700">Try searching in a nearby area or disable location filter</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {!locationFilter.enabled && (
                <div className="border-t border-primary-200 pt-4">
                  <div className="flex items-center justify-center py-3 text-gray-500">
                    <i className="fas fa-globe mr-2"></i>
                    <span className="text-sm">Showing all services from all locations</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Category Filter */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 shadow-md'
                }`}
              >
                <i className={`${category.icon} mr-2`}></i>
                {category.name}
              </button>
            ))}
          </div>
          
          {/* Location Filter Results */}
          {locationFilter.enabled && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <i className="fas fa-map-marker-alt mr-2"></i>
                Showing services near {locationFilter.pincode}
                <button
                  onClick={() => handleLocationToggle(false)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No services found</h3>
            <p className="text-gray-500">Try adjusting your search or category filter</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, index) => (
              <motion.div
                key={service._id}
                className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Service Image */}
                <div className="h-48 bg-gradient-to-br from-primary-500 to-secondary-500 relative overflow-hidden">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="fas fa-tools text-6xl text-white opacity-50"></i>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-800">
                      ₹{service.price}
                    </span>
                  </div>
                </div>

                {/* Service Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                    <div className="flex items-center text-yellow-500">
                      <i className="fas fa-star text-sm"></i>
                      <span className="ml-1 text-sm text-gray-600">
                        {service.rating || '4.5'}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-gray-500 text-sm">
                      <i className="fas fa-clock mr-1"></i>
                      <span>{service.duration || '1-2 hours'}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <i className="fas fa-user mr-1"></i>
                      <span>{service.provider?.firstName} {service.provider?.lastName}</span>
                    </div>
                  </div>

                  {/* Provider Location Info */}
                  {locationFilter.enabled && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-green-700">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                            <i className="fas fa-map-marker-alt text-green-600 text-xs"></i>
                          </div>
                          <span className="font-medium">
                            {service.provider?.providerDetails?.businessAddress?.city || 
                             service.provider?.address?.city || 'Local Area'} • {' '}
                            {service.provider?.providerDetails?.businessAddress?.pincode || 
                             service.provider?.address?.pincode || locationFilter.pincode}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                            <i className="fas fa-location-dot mr-1"></i>
                            Nearby
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {user?.userType !== 'provider' && (
                    <button
                      onClick={() => handleAddToCart(service)}
                      className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors duration-300 flex items-center justify-center"
                    >
                      <i className="fas fa-cart-plus mr-2"></i>
                      Add to Cart
                    </button>
                  )}
                  
                  {user?.userType === 'provider' && (
                    <div className="w-full bg-gray-100 text-gray-600 py-3 rounded-lg font-semibold text-center">
                      <i className="fas fa-info-circle mr-2"></i>
                      Service Provider View
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pincode Modal */}
      <PincodeModal
        isOpen={showPincodeModal}
        onClose={() => setShowPincodeModal(false)}
        onPincodeSubmit={handlePincodeSubmit}
      />
    </div>
  );
};

export default Services;
