import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import AuthModal from '../auth/AuthModal';
import CartSidebar from '../cart/CartSidebar';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { getTotalItems, isCartOpen, closeCart, toggleCart } = useCart();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    try {
      console.log('Initiating logout process...');
      logout();
      navigate('/');
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Error during logout process:', error);
      // Force logout even if there's an error
      logout();
      navigate('/');
    }
  };

  return (
    <>
      <header className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold text-primary-500">
                HomeEase
              </Link>
            </div>

            {/* Search Bar - Hidden on mobile and for providers/admins */}
            {user?.userType !== 'provider' && user?.userType !== 'admin' && (
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <form onSubmit={handleSearch} className="w-full relative">
                  <div className="relative">
                    <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for services..."
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full 
                               focus:border-primary-500 focus:outline-none transition-colors
                               bg-gray-50 focus:bg-white"
                    />
                  </div>
                </form>
              </div>
            )}

            {/* Navigation - Hidden on mobile */}
            <nav className="hidden md:flex space-x-8">
              {user?.userType === 'admin' ? (
                // Admin Navigation
                <>
                  <Link
                    to="/admin/dashboard"
                    className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/pending-providers"
                    className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
                  >
                    Pending Providers
                  </Link>
                  <Link
                    to="/admin/users"
                    className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
                  >
                    Users
                  </Link>
                  <Link
                    to="/admin/services"
                    className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
                  >
                    Services
                  </Link>
                </>
              ) : user?.userType === 'provider' ? (
                // Provider Navigation
                <>
                  <Link
                    to="/provider-dashboard"
                    className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/provider-bookings"
                    className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/manage-services"
                    className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
                  >
                    My Services
                  </Link>
                  <Link
                    to="/reviews"
                    className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
                  >
                    Reviews
                  </Link>
                </>
              ) : (
                // Customer Navigation
                <>
                  <Link
                    to="/"
                    className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    to="/services"
                    className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
                  >
                    Services
                  </Link>
                  <Link
                    to="/my-bookings"
                    className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/about"
                    className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
                  >
                    About Us
                  </Link>
                  <Link
                    to="/contact"
                    className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
                  >
                    Contact
                  </Link>
                </>
              )}
            </nav>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              {/* Cart button - Hidden for providers and admins */}
              {user?.userType !== 'provider' && user?.userType !== 'admin' && (
                <button
                  onClick={toggleCart}
                  className="relative p-2 text-gray-700 hover:text-primary-500 transition-colors"
                >
                  <i className="fas fa-shopping-cart text-xl"></i>
                                    {getTotalItems() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {getTotalItems()}
                      </span>
                    )}
                </button>
              )}

              {/* Auth buttons */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-500 transition-colors">
                    <i className="fas fa-user-circle text-xl"></i>
                    <span className="hidden sm:block">{user?.firstName}</span>
                    <i className="fas fa-chevron-down text-sm"></i>
                  </button>
                  
                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      {user?.userType === 'admin' ? (
                        // Admin dropdown menu
                        <>
                          <Link
                            to="/admin/dashboard"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <i className="fas fa-tachometer-alt mr-2"></i>
                            Admin Dashboard
                          </Link>
                          <Link
                            to="/admin/pending-providers"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <i className="fas fa-user-clock mr-2"></i>
                            Pending Providers
                          </Link>
                          <Link
                            to="/admin/users"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <i className="fas fa-users mr-2"></i>
                            Manage Users
                          </Link>
                          <Link
                            to="/profile"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <i className="fas fa-user mr-2"></i>
                            Profile
                          </Link>
                        </>
                      ) : user?.userType === 'provider' ? (
                        // Provider dropdown menu
                        <>
                          <Link
                            to="/provider-dashboard"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <i className="fas fa-tachometer-alt mr-2"></i>
                            Dashboard
                          </Link>
                          <Link
                            to="/manage-services"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <i className="fas fa-cogs mr-2"></i>
                            Manage Services
                          </Link>
                          <Link
                            to="/profile"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <i className="fas fa-user mr-2"></i>
                            Profile
                          </Link>
                        </>
                      ) : (
                        // Customer dropdown menu
                        <>
                          <Link
                            to="/profile"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <i className="fas fa-user mr-2"></i>
                            Profile
                          </Link>
                          <Link
                            to="/my-bookings"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <i className="fas fa-calendar mr-2"></i>
                            My Bookings
                          </Link>
                        </>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <i className="fas fa-sign-out-alt mr-2"></i>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex space-x-3">
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="px-4 py-2 border-2 border-primary-500 text-primary-500 rounded-lg hover:bg-primary-500 hover:text-white transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleAuthClick('register')}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-700 hover:text-primary-500 transition-colors"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
            </div>
          </div>

          {/* Mobile search bar - Hidden for providers and admins */}
          {user?.userType !== 'provider' && user?.userType !== 'admin' && (
            <div className="md:hidden pb-4">
              <form onSubmit={handleSearch} className="relative">
                <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for services..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full 
                           focus:border-primary-500 focus:outline-none transition-colors
                           bg-gray-50 focus:bg-white"
                />
              </form>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-4">
              {user?.userType === 'admin' ? (
                // Admin Mobile Navigation
                <>
                  <Link
                    to="/admin/dashboard"
                    className="block text-gray-700 hover:text-primary-500 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/pending-providers"
                    className="block text-gray-700 hover:text-primary-500 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Pending Providers
                  </Link>
                  <Link
                    to="/admin/users"
                    className="block text-gray-700 hover:text-primary-500 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Manage Users
                  </Link>
                  <Link
                    to="/admin/services"
                    className="block text-gray-700 hover:text-primary-500 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Manage Services
                  </Link>
                  {isAuthenticated && (
                    <Link
                      to="/profile"
                      className="block text-gray-700 hover:text-primary-500 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  )}
                </>
              ) : user?.userType === 'provider' ? (
                // Provider Mobile Navigation
                <>
                  <Link
                    to="/provider-dashboard"
                    className="block text-gray-700 hover:text-primary-500 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/provider-bookings"
                    className="block text-gray-700 hover:text-primary-500 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/manage-services"
                    className="block text-gray-700 hover:text-primary-500 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Services
                  </Link>
                  <Link
                    to="/reviews"
                    className="block text-gray-700 hover:text-primary-500 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Reviews
                  </Link>
                  {isAuthenticated && (
                    <Link
                      to="/profile"
                      className="block text-gray-700 hover:text-primary-500 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  )}
                </>
              ) : (
                // Customer Mobile Navigation
                <>
                  <Link
                    to="/"
                    className="block text-gray-700 hover:text-primary-500 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/services"
                    className="block text-gray-700 hover:text-primary-500 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Services
                  </Link>
                  {isAuthenticated && (
                    <Link
                      to="/my-bookings"
                      className="block text-gray-700 hover:text-primary-500 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Bookings
                    </Link>
                  )}
                  <Link
                    to="/about"
                    className="block text-gray-700 hover:text-primary-500 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About Us
                  </Link>
                  <Link
                    to="/contact"
                    className="block text-gray-700 hover:text-primary-500 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                  {isAuthenticated && (
                    <>
                      {user?.userType !== 'admin' && user?.userType !== 'provider' && (
                        <>
                          <Link
                            to="/profile"
                            className="block text-gray-700 hover:text-primary-500 font-medium"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Profile
                          </Link>
                          <Link
                            to="/my-bookings"
                            className="block text-gray-700 hover:text-primary-500 font-medium"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            My Bookings
                          </Link>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
              
              {!isAuthenticated && (
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleAuthClick('login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 border-2 border-primary-500 text-primary-500 rounded-lg hover:bg-primary-500 hover:text-white transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      handleAuthClick('register');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={setAuthMode}
      />

      {/* Cart Sidebar - Hidden for providers */}
      {user?.userType !== 'provider' && (
        <CartSidebar 
          isOpen={isCartOpen}
          onClose={closeCart}
        />
      )}
    </>
  );
};

export default Header;
