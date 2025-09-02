import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  const services = [
    {
      id: 'plumbing',
      name: 'Plumbing',
      icon: 'fas fa-wrench',
      description: 'Expert plumbing repairs and installations',
    },
    {
      id: 'electrical',
      name: 'Electrical',
      icon: 'fas fa-bolt',
      description: 'Safe and reliable electrical services',
    },
    {
      id: 'carpentry',
      name: 'Carpentry',
      icon: 'fas fa-hammer',
      description: 'Custom woodwork and furniture repair',
    },
    {
      id: 'cleaning',
      name: 'Cleaning',
      icon: 'fas fa-broom',
      description: 'Professional home and office cleaning',
    },
    {
      id: 'ac-service',
      name: 'AC Service',
      icon: 'fas fa-snowflake',
      description: 'Air conditioning repair and maintenance',
    },
    {
      id: 'painting',
      name: 'Wall Paint',
      icon: 'fas fa-paint-roller',
      description: 'Interior and exterior painting services',
    },
  ];

  const handleServiceClick = (serviceId) => {
    // Only allow navigation to services for regular users (not providers or admins)
    if (user?.userType === 'user' || !user) {
      window.location.href = `/services?category=${serviceId}`;
    }
  };

  // Admin Dashboard Content
  const AdminHome = () => (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-8 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome back, Admin {user?.firstName || user?.name}!
          </h1>
          <p className="text-xl opacity-90">
            Manage the HomeEase platform and oversee all operations
          </p>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <i className="fas fa-tachometer-alt text-blue-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard</h3>
            <p className="text-gray-600 mb-4">View platform overview and analytics</p>
            <Link
              to="/admin/dashboard"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to Dashboard
            </Link>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <i className="fas fa-users text-green-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Users</h3>
            <p className="text-gray-600 mb-4">Manage users and providers</p>
            <Link
              to="/admin/users"
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Manage Users
            </Link>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <i className="fas fa-cogs text-purple-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Services</h3>
            <p className="text-gray-600 mb-4">Manage platform services</p>
            <Link
              to="/admin/services"
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Manage Services
            </Link>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <i className="fas fa-star text-yellow-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviews</h3>
            <p className="text-gray-600 mb-4">Monitor platform reviews</p>
            <Link
              to="/admin/reviews"
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              View Reviews
            </Link>
          </motion.div>
        </div>

        {/* Platform Statistics */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-card mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Platform Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-users text-blue-600 text-2xl"></i>
              </div>
              <div className="text-2xl font-bold text-gray-900">-</div>
              <div className="text-gray-600">Total Users</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-user-tie text-green-600 text-2xl"></i>
              </div>
              <div className="text-2xl font-bold text-gray-900">-</div>
              <div className="text-gray-600">Active Providers</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-calendar-check text-purple-600 text-2xl"></i>
              </div>
              <div className="text-2xl font-bold text-gray-900">-</div>
              <div className="text-gray-600">Total Bookings</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-rupee-sign text-yellow-600 text-2xl"></i>
              </div>
              <div className="text-2xl font-bold text-gray-900">-</div>
              <div className="text-gray-600">Revenue</div>
            </div>
          </div>
        </motion.div>

        {/* Admin Actions */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/admin/pending-providers"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <i className="fas fa-clock text-orange-600"></i>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Pending Approvals</h4>
                <p className="text-gray-600 text-sm">Review provider applications</p>
              </div>
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <i className="fas fa-ban text-red-600"></i>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">User Management</h4>
                <p className="text-gray-600 text-sm">Ban or manage user accounts</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Provider Dashboard Content
  const ProviderHome = () => (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl p-8 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome back, {user?.firstName || user?.name}!
          </h1>
          <p className="text-xl opacity-90">
            Manage your services and grow your business with HomeEase
          </p>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <i className="fas fa-tachometer-alt text-blue-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard</h3>
            <p className="text-gray-600 mb-4">View your business overview</p>
            <Link
              to="/provider-dashboard"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to Dashboard
            </Link>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <i className="fas fa-calendar-check text-green-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Bookings</h3>
            <p className="text-gray-600 mb-4">Manage service requests</p>
            <Link
              to="/provider-bookings"
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              View Bookings
            </Link>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <i className="fas fa-tools text-purple-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Services</h3>
            <p className="text-gray-600 mb-4">Add and manage services</p>
            <Link
              to="/manage-services"
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Manage Services
            </Link>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <i className="fas fa-user-cog text-orange-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile</h3>
            <p className="text-gray-600 mb-4">Update business details</p>
            <Link
              to="/profile"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Update Profile
            </Link>
          </motion.div>
        </div>

        {/* Business Status */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-card mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                user?.approvalStatus === 'approved' ? 'bg-green-500' : 
                user?.approvalStatus === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-gray-700">
                Account Status: <span className="font-medium capitalize">{user?.approvalStatus}</span>
              </span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                user?.providerDetails?.isBusinessDetailsComplete ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-gray-700">
                Business Details: <span className="font-medium">
                  {user?.providerDetails?.isBusinessDetailsComplete ? 'Complete' : 'Incomplete'}
                </span>
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-3 bg-blue-500"></div>
              <span className="text-gray-700">
                User Type: <span className="font-medium">Service Provider</span>
              </span>
            </div>
          </div>
          
          {(!user?.providerDetails?.isBusinessDetailsComplete || user?.approvalStatus === 'pending') && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <i className="fas fa-exclamation-triangle text-yellow-600 mr-3 mt-1"></i>
                <div>
                  <h4 className="text-yellow-800 font-medium mb-1">Action Required</h4>
                  <p className="text-yellow-700 text-sm">
                    {!user?.providerDetails?.isBusinessDetailsComplete && 
                      "Please complete your business details to start adding services. "
                    }
                    {user?.approvalStatus === 'pending' && 
                      "Your account is pending approval from our admin team."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Tips for Providers */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Tips for Success</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                <i className="fas fa-star text-green-600"></i>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Maintain Quality</h4>
                <p className="text-gray-600 text-sm">Deliver excellent service to earn positive reviews and build your reputation.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                <i className="fas fa-clock text-blue-600"></i>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Be Responsive</h4>
                <p className="text-gray-600 text-sm">Respond quickly to booking requests to increase your chances of getting hired.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                <i className="fas fa-image text-purple-600"></i>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Add Photos</h4>
                <p className="text-gray-600 text-sm">Include high-quality photos of your work to attract more customers.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                <i className="fas fa-handshake text-orange-600"></i>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Professional Service</h4>
                <p className="text-gray-600 text-sm">Always maintain professionalism and clear communication with clients.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // If user is an admin, show admin-specific home page
  if (user?.userType === 'admin') {
    return <AdminHome />;
  }

  // If user is a provider, show provider-specific home page
  if (user?.userType === 'provider') {
    return <ProviderHome />;
  }

  // Regular home page for customers and guests

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1973&q=80')`
          }}
        ></div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/80 to-secondary-600/80"></div>
        
        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Every Home Deserves The
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
              Ease Of Excellence
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Professional home services at your fingertips. Book trusted experts for all your home maintenance needs.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              to="/services"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Get Started
              <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">Choose from our wide range of professional services</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                className="bg-white rounded-2xl p-8 text-center shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-primary-200"
                onClick={() => handleServiceClick(service.id)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <i className={`${service.icon} text-2xl text-white`}></i>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.name}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose HomeEase?</h2>
            <p className="text-xl text-gray-600">We make home services simple, reliable, and affordable</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: 'fas fa-shield-alt',
                title: 'Trusted Professionals',
                description: 'All our service providers are verified, trained, and insured for your peace of mind.'
              },
              {
                icon: 'fas fa-clock',
                title: 'Quick & Reliable',
                description: 'Same-day service available. We value your time and arrive when we say we will.'
              },
              {
                icon: 'fas fa-dollar-sign',
                title: 'Transparent Pricing',
                description: 'No hidden fees. You know exactly what you pay before the work begins.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <i className={`${feature.icon} text-2xl text-white`}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Book Your Service?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of satisfied customers who trust HomeEase for their home service needs.
            </p>
            <Link
              to="/services"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Browse Services
              <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
