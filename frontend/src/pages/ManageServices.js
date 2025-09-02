import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const ManageServices = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    image: '',
    tags: ''
  });

  const categories = [
    'cleaning',
    'plumbing',
    'electrical',
    'carpentry',
    'painting',
    'gardening',
    'appliance-repair',
    'pest-control',
    'home-maintenance',
    'other'
  ];

  useEffect(() => {
    // Don't run checks if user is still loading
    if (!user) return;

    console.log('ManageServices - User data:', user);
    if (user.providerDetails) {
      console.log('ManageServices - Provider details:', {
        companyName: user.providerDetails.companyName,
        businessName: user.providerDetails.businessName,
        isVerified: user.providerDetails.isVerified,
        services: user.providerDetails.services?.length || 0
      });
    }

    // Redirect if not a provider
    if (user.userType !== 'provider') {
      toast.error('Access denied. Provider account required.');
      navigate('/');
      return;
    }

    // Check if business details are complete - show warning but allow access
    if (user.userType === 'provider') {
      if (!user.providerDetails) {
        toast.error('Provider details not found. Please complete your profile first.');
        // Allow access but show error - they can't create services without business details
      } else if (!user.providerDetails.isBusinessDetailsComplete) {
        toast.error('Please complete your business details in your profile to create new services.');
        // Allow access but show warning - they can view existing services
      }
    }

    fetchProviderServices();
  }, [user, navigate]);

  const fetchProviderServices = async () => {
    try {
      const response = await axios.get('/api/services/my-services');
      if (response.data.success) {
        setServices(response.data.data || []);
      } else {
        setServices([]);
        toast.error(response.data.message || 'Failed to fetch services');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
      setLoading(false);
      toast.error('Failed to fetch services');
    }
  };

  const handleAddServiceClick = () => {
    if (!user.providerDetails?.isBusinessDetailsComplete) {
      toast.error('Please complete your business details in your profile before adding services.');
      navigate('/profile');
      return;
    }
    setShowAddForm(!showAddForm);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if business details are complete before allowing service creation
    if (!user.providerDetails?.isBusinessDetailsComplete) {
      toast.error('Please complete your business details in your profile before creating services.');
      navigate('/profile');
      return;
    }
    
    try {
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await axios.post('/api/services', serviceData);
      
      if (response.data.success) {
        toast.success('Service added successfully!');
        setServices([...services, response.data.data]);
        setFormData({
          name: '',
          description: '',
          category: '',
          price: '',
          duration: '',
          image: '',
          tags: ''
        });
        setShowAddForm(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add service');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await axios.delete(`/api/services/${serviceId}`);
      setServices(services.filter(service => service._id !== serviceId));
      toast.success('Service deleted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete service');
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Services</h1>
              <p className="mt-2 text-gray-600">Add, edit, and manage your service offerings</p>
            </div>
            <button
              onClick={handleAddServiceClick}
              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              {showAddForm ? 'Cancel' : 'Add Service'}
            </button>
          </div>
        </div>

        {/* Business Details Warning */}
        {user && user.userType === 'provider' && !user.providerDetails?.isBusinessDetailsComplete && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-yellow-600 mr-3"></i>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Business Details Required</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Complete your business details in your profile to start creating services.
                  <button
                    onClick={() => navigate('/profile')}
                    className="ml-2 font-medium underline hover:no-underline"
                  >
                    Complete Profile
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add Service Form */}
        {showAddForm && (
          <motion.div
            className="bg-white rounded-lg shadow-card p-6 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Service</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., House Cleaning"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 1500"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 120"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe your service in detail..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., deep cleaning, weekly, affordable"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add Service
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Services List */}
        <div className="bg-white rounded-lg shadow-card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Services</h2>
          </div>
          <div className="p-6">
            {services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <motion.div
                    key={service._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {service.image && (
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-primary-600">₹{service.price}</span>
                      <span className="text-sm text-gray-500">{service.duration} min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {service.category}
                      </span>
                      <button
                        onClick={() => handleDeleteService(service._id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <i className="fas fa-trash text-sm"></i>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-tools text-4xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
                <p className="text-gray-600 mb-6">Start by adding your first service offering</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Your First Service
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageServices;
