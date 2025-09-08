import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { cleanupAuthState } from '../utils/authUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Clean up any invalid tokens before initializing
  const isValidToken = cleanupAuthState();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(isValidToken ? localStorage.getItem('homeease_token') : null);

  // Set up axios defaults
  useEffect(() => {
    // Configure axios base URL
    axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    if (token) {
      // Validate token format before using it
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        console.log('Invalid token format detected, clearing token');
        localStorage.removeItem('homeease_token');
        setToken(null);
        setUser(null);
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }

    // Add response interceptor to handle token errors
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Only handle auth errors if we have a user (avoid errors during logout)
        if (user && error.response?.status === 401 && 
            (error.response?.data?.message?.includes('jwt') || 
             error.response?.data?.message?.includes('Token') ||
             error.response?.data?.message?.includes('signature') ||
             error.response?.data?.message?.includes('malformed') ||
             error.response?.data?.message?.includes('Invalid token') ||
             error.response?.data?.message?.includes('User not found'))) {
          // Token is invalid or user doesn't exist, logout user
          console.log('Invalid token or user not found, logging out user');
          logout();
        }
        return Promise.reject(error);
      }
    );

    // Clean up interceptor
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token, user]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/auth/me');
          setUser(response.data.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email: credentials.email,
        password: credentials.password
      });

      const { user, token } = response.data.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('homeease_token', token);
      
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Sending registration data:', userData);
      
      const response = await axios.post('/api/auth/register', userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const { user, token } = response.data.data;
      
      // Only set user and token if user is approved (not pending)
      if (user.userType === 'provider' && user.approvalStatus === 'pending') {
        // For pending providers, don't log them in automatically
        return { success: true, user, pending: true };
      } else {
        setUser(user);
        setToken(token);
        localStorage.setItem('homeease_token', token);
        return { success: true, user };
      }
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error request:', error.request);
      
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  };

  const logout = () => {
    try {
      console.log('Logging out user...');
      
      // Clear user state first to prevent any additional API calls
      setUser(null);
      setToken(null);
      
      // Clear localStorage
      localStorage.removeItem('homeease_token');
      
      // Clear axios default headers
      delete axios.defaults.headers.common['Authorization'];
      
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      // Force clear even if there's an error
      setUser(null);
      setToken(null);
      localStorage.removeItem('homeease_token');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
