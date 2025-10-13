const User = require('../models/User');
const Merchant = require('../models/Merchant');
const { HTTP_STATUS } = require('../config/constants');

// @desc Protect routes with authentication
// @route Middleware
// @access Protected
exports.protect = async (req, res, next) => {
  try {
    // Debug authentication
    console.log('🔐 Auth Debug:', {
      isAuthenticated: req.isAuthenticated(),
      hasUser: !!req.user,
      sessionID: req.sessionID,
      userEmail: req.user?.email,
      userId: req.user?._id,
      userModelName: req.user?.constructor?.modelName,
      method: req.method,
      url: req.url
    });

    // Check if user is authenticated via session
    if (!req.isAuthenticated() || !req.user) {
      console.log('❌ Authentication failed - no session or user');
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Not authorized to access this route. Please sign in.',
      });
    }

    // Ensure user object has required properties
    if (!req.user._id && !req.user.id) {
      console.error('❌ User object missing ID:', req.user);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Invalid user session. Please sign in again.',
      });
    }

    // Normalize user ID (handle both _id and id)
    if (!req.user._id && req.user.id) {
      req.user._id = req.user.id;
    }

    // CRITICAL FIX: Determine if merchant by checking model name
    const isMerchant = req.user.constructor?.modelName === 'Merchant' ||
                       req.user.collection?.collectionName === 'merchants' ||
                       !!req.user.businessName;

    console.log('🔍 User Type Check:', {
      userId: req.user._id,
      email: req.user.email,
      isMerchant,
      modelName: req.user.constructor?.modelName,
      hasBusinessName: !!req.user.businessName
    });

    // Set merchant flag if this is a merchant
    if (isMerchant) {
      req.merchant = req.user;
      console.log('✅ Merchant authenticated:', {
        merchantId: req.merchant._id,
        businessName: req.merchant.businessName
      });
    }

    next();
  } catch (err) {
    console.error('❌ Authentication error:', err);
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
exports.isMerchant = (req, res, next) => {
  console.log('🏪 Checking if user is merchant:', {
    hasMerchant: !!req.merchant,
    merchantId: req.merchant?._id,
    merchantEmail: req.merchant?.email,
    businessName: req.merchant?.businessName
  });

  if (!req.merchant) {
    console.log('❌ Not a merchant - access denied');
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: 'Only merchants can access this route',
    });
  }

  console.log('✅ Merchant access granted');
  next();
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
      const isMerchant = req.user.constructor?.modelName === 'Merchant' ||
                         req.user.collection?.collectionName === 'merchants' ||
                         !!req.user.businessName;

      if (isMerchant) {
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