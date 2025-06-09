const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate users using JWT
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required. Please login.' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found or session expired' 
      });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error during authentication' 
    });
  }
};

// Middleware to check if user is an admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin privileges required.' 
    });
  }
};

// Middleware to check if user is a merchant
exports.isMerchant = (req, res, next) => {
  if (req.user && req.user.role === 'merchant') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Access denied. Merchant account required.' 
    });
  }
};

// Middleware to check if user is a client
exports.isClient = (req, res, next) => {
  if (req.user && req.user.role === 'client') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Access denied. Client account required.' 
    });
  }
};

// Middleware to restrict access to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. ${roles.join(' or ')} privileges required.` 
      });
    }
    
    next();
  };
};