const User = require('../models/User');
const Merchant = require('../models/Merchant');
const { HTTP_STATUS } = require('../config/constants');

// @desc Protect routes with authentication
// @route Middleware
// @access Protected
exports.protect = async (req, res, next) => {
  try {
    // Check if user is authenticated via session
    if (!req.isAuthenticated() || !req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Not authorized to access this route. Please sign in.',
      });
    }

    // Ensure user object has required properties
    if (!req.user._id && !req.user.id) {
      console.error('User object missing ID:', req.user);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Invalid user session. Please sign in again.',
      });
    }

    // Normalize user ID (handle both _id and id)
    if (!req.user._id && req.user.id) {
      req.user._id = req.user.id;
    }

    // Check if user is a merchant
    if (req.user.businessName || req.user.role === 'merchant') {
      req.merchant = req.user;
    }

    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Authentication failed. Please try again.',
    });
  }
};

// @desc Grant access to specific roles
// @route Middleware
// @access Protected roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Not authorized to access this route',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

// @desc Check if user is a merchant
// @route Middleware
// @access Protected
// middleware/auth.js - Add this if missing
exports.isMerchant = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    // If user is admin, allow access
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the merchant they're trying to access
    const merchant = await Merchant.findById(req.params.id);
    
    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Check if merchant belongs to this user
    // This assumes your Merchant model has an 'owner' field that references User
    if (merchant.owner && merchant.owner.toString() === req.user.id) {
      req.merchant = merchant; // Set merchant in request
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this merchant'
    });

  } catch (error) {
    console.error('isMerchant middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error in merchant authorization'
    });
  }
};



// @desc Optional authentication - doesn't fail if user is not authenticated
// @route Middleware
// @access Public/Optional
exports.optionalAuth = async (req, res, next) => {
  try {
    if (req.isAuthenticated() && req.user) {
      // Normalize user ID
      if (!req.user._id && req.user.id) {
        req.user._id = req.user.id;
      }
      
      // Check if user is a merchant
      if (req.user.businessName || req.user.role === 'merchant') {
        req.merchant = req.user;
      }
    }
    next();
  } catch (err) {
    console.error('Optional auth error:', err);
    // Continue without authentication
    next();
  }
};