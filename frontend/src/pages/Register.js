import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: 'user',
    providerDetails: {
      businessName: '',
      companyName: '',
      gstNumber: '',
      panNumber: '',
      businessType: ''
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('providerDetails.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        providerDetails: {
          ...formData.providerDetails,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

    const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast.error('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    // Validate Indian mobile number format
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      toast.error('Please enter a valid Indian mobile number (10 digits starting with 6-9)');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    // Validate provider details if userType is provider
    if (formData.userType === 'provider') {
      if (!formData.providerDetails.businessName.trim()) {
        toast.error('Business name is required for providers');
        return false;
      }
      if (!formData.providerDetails.companyName.trim()) {
        toast.error('Company name is required for providers');
        return false;
      }
      if (!formData.providerDetails.gstNumber.trim()) {
        toast.error('GST number is required for providers');
        return false;
      }
      if (!formData.providerDetails.panNumber.trim()) {
        toast.error('PAN number is required for providers');
        return false;
      }
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.providerDetails.panNumber)) {
        toast.error('Please enter a valid PAN number (e.g., ABCDE1234F)');
        return false;
      }
      if (!formData.providerDetails.businessType.trim()) {
        toast.error('Business type is required for providers');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        userType: formData.userType
      };

      // Add provider details if userType is provider
      if (formData.userType === 'provider') {
        registrationData.providerDetails = formData.providerDetails;
      }

      const result = await register(registrationData);
      
      if (result.success) {
        if (formData.userType === 'provider') {
          toast.success('Registration successful! Your account is pending admin approval. You will be notified once approved.', {
            duration: 6000,
          });
          navigate('/login?message=provider-pending');
        } else {
          toast.success('Registration successful! Welcome to HomeEase!');
          navigate('/');
        }
      } else {
        toast.error(result.message || 'Registration failed');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full space-y-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-primary-600">HomeEase</h1>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join HomeEase and get access to trusted home services
          </p>
        </div>

        {/* Registration Form */}
        <motion.div
          className="bg-white py-8 px-6 shadow-card rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <div className="relative">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your first name"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-user h-5 w-5 text-gray-400"></i>
                </div>
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <div className="relative">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your last name"
                />
                <i className="fas fa-user absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
                <i className="fas fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 9876543210"
                />
                <i className="fas fa-phone absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter 10-digit Indian mobile number (without +91)</p>
            </div>

            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative">
                  <input
                    type="radio"
                    name="userType"
                    value="user"
                    checked={formData.userType === 'user'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                    formData.userType === 'user'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <div className="text-center">
                      <i className="fas fa-user text-2xl mb-2"></i>
                      <div className="font-medium">Customer</div>
                      <div className="text-xs text-gray-500">Book services</div>
                    </div>
                  </div>
                </label>

                <label className="relative">
                  <input
                    type="radio"
                    name="userType"
                    value="provider"
                    checked={formData.userType === 'provider'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                    formData.userType === 'provider'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <div className="text-center">
                      <i className="fas fa-tools text-2xl mb-2"></i>
                      <div className="font-medium">Provider</div>
                      <div className="text-xs text-gray-500">Offer services</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Provider Details - Show only when userType is provider */}
            {formData.userType === 'provider' && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Provider Details</h3>
                
                {/* Business Name */}
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <div className="relative">
                    <input
                      id="businessName"
                      name="providerDetails.businessName"
                      type="text"
                      required
                      value={formData.providerDetails.businessName}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your business name"
                    />
                    <i className="fas fa-store absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <input
                      id="companyName"
                      name="providerDetails.companyName"
                      type="text"
                      required
                      value={formData.providerDetails.companyName}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your company name"
                    />
                    <i className="fas fa-building absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>

                {/* GST Number */}
                <div>
                  <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number
                  </label>
                  <div className="relative">
                    <input
                      id="gstNumber"
                      name="providerDetails.gstNumber"
                      type="text"
                      required
                      value={formData.providerDetails.gstNumber}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your GST number"
                    />
                    <i className="fas fa-file-invoice absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>

                {/* PAN Number */}
                <div>
                  <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    PAN Number
                  </label>
                  <div className="relative">
                    <input
                      id="panNumber"
                      name="providerDetails.panNumber"
                      type="text"
                      required
                      value={formData.providerDetails.panNumber}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., ABCDE1234F"
                      maxLength="10"
                      style={{ textTransform: 'uppercase' }}
                    />
                    <i className="fas fa-id-card absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Format: 5 letters + 4 numbers + 1 letter</p>
                </div>

                {/* Business Type */}
                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type
                  </label>
                  <div className="relative">
                    <select
                      id="businessType"
                      name="providerDetails.businessType"
                      required
                      value={formData.providerDetails.businessType}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select business type</option>
                      <option value="individual">Individual</option>
                      <option value="partnership">Partnership</option>
                      <option value="private_limited">Private Limited</option>
                      <option value="llp">Limited Liability Partnership (LLP)</option>
                      <option value="other">Other</option>
                    </select>
                    <i className="fas fa-briefcase absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Create a password"
                />
                <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
                <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="accept-terms"
                name="accept-terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 transform hover:scale-105'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  <>
                    <i className="fas fa-user-plus mr-2"></i>
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Social Registration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or register with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
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
        </motion.div>

        {/* Sign in link */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in here
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
