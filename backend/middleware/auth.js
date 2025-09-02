const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Auth header received:', authHeader);
    
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    // Validate token format (basic check)
    if (!token || token.split('.').length !== 3) {
      console.log('Malformed token received:', token);
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    console.log('Attempting to verify token:', token.substring(0, 20) + '...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully, user ID:', decoded.id);
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('User not found in database for ID:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User found:', user.email, 'Type:', user.userType);
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    let message = 'Token is not valid';
    if (error.name === 'JsonWebTokenError') {
      if (error.message.includes('invalid signature')) {
        message = 'Token signature is invalid';
      } else if (error.message.includes('jwt malformed')) {
        message = 'Token is malformed';
      } else {
        message = 'Token is invalid';
      }
    } else if (error.name === 'TokenExpiredError') {
      message = 'Token has expired';
    }
    
    res.status(401).json({
      success: false,
      message
    });
  }
};

// Provider auth middleware
const providerAuth = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  if (req.user.userType !== 'provider') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Provider only.'
    });
  }
  next();
};

// Admin auth middleware
const adminAuth = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  if (req.user.userType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
  next();
};

module.exports = { auth, providerAuth, adminAuth };
