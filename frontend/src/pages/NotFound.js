import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 404 Icon */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-6">
            <i className="fas fa-tools text-6xl text-white"></i>
          </div>
          
          <motion.h1
            className="text-6xl md:text-8xl font-bold text-primary-600 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            404
          </motion.h1>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            The page you're looking for seems to have taken a coffee break. 
            Don't worry, our services are still running smoothly!
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <i className="fas fa-home mr-2"></i>
            Go Home
          </Link>
          
          <Link
            to="/services"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-white text-primary-500 border-2 border-primary-500 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <i className="fas fa-list mr-2"></i>
            Browse Services
          </Link>
        </motion.div>

        {/* Help Section */}
        <motion.div
          className="mt-12 p-6 bg-white rounded-2xl shadow-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Need Help Finding Something?
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Link
              to="/services"
              className="flex items-center text-gray-600 hover:text-primary-600 transition-colors duration-300"
            >
              <i className="fas fa-tools mr-2 text-primary-500"></i>
              Browse All Services
            </Link>
            
            <Link
              to="/login"
              className="flex items-center text-gray-600 hover:text-primary-600 transition-colors duration-300"
            >
              <i className="fas fa-user mr-2 text-primary-500"></i>
              Login / Register
            </Link>
            
            <Link
              to="/contact"
              className="flex items-center text-gray-600 hover:text-primary-600 transition-colors duration-300"
            >
              <i className="fas fa-envelope mr-2 text-primary-500"></i>
              Contact Support
            </Link>
            
            <Link
              to="/about"
              className="flex items-center text-gray-600 hover:text-primary-600 transition-colors duration-300"
            >
              <i className="fas fa-info-circle mr-2 text-primary-500"></i>
              About HomeEase
            </Link>
          </div>
        </motion.div>

        {/* Fun Fact */}
        <motion.div
          className="mt-8 p-4 bg-blue-50 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center justify-center text-blue-700">
            <i className="fas fa-lightbulb mr-2"></i>
            <span className="text-sm">
              <strong>Did you know?</strong> We've completed over 10,000 home services with a 4.8-star rating!
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
