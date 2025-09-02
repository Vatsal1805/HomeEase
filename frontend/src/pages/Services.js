import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Services = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
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
      const response = await axios.get('/api/services');
      setServices(response.data.data.services);
    } catch (error) {
      toast.error('Failed to load services');
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
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
  }, [location]);

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
                      <span>{service.provider?.name || 'Professional'}</span>
                    </div>
                  </div>

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
    </div>
  );
};

export default Services;
