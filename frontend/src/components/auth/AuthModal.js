import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AuthModal = ({ isOpen, onClose, mode = 'login' }) => {
  const [currentMode, setCurrentMode] = useState(mode);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <i className="fas fa-times text-gray-500"></i>
          </button>

          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <h1 className="text-2xl font-bold text-primary-600">HomeEase</h1>
            </Link>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              {currentMode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {currentMode === 'login'
                ? 'Sign in to your account to continue'
                : 'Join HomeEase for trusted home services'
              }
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              onClick={() => setCurrentMode('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                currentMode === 'login'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setCurrentMode('register')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                currentMode === 'register'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Register
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-3">
            <Link
              to={currentMode === 'login' ? '/login' : '/register'}
              onClick={onClose}
              className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-600 transition-colors duration-300 flex items-center justify-center"
            >
              <i className={`fas ${currentMode === 'login' ? 'fa-sign-in-alt' : 'fa-user-plus'} mr-2`}></i>
              {currentMode === 'login' ? 'Go to Login' : 'Go to Register'}
            </Link>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-300"
              >
                <i className="fab fa-google text-red-500 mr-2"></i>
                Google
              </button>

              <button
                type="button"
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-300"
              >
                <i className="fab fa-facebook text-blue-600 mr-2"></i>
                Facebook
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {currentMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setCurrentMode(currentMode === 'login' ? 'register' : 'login')}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {currentMode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
