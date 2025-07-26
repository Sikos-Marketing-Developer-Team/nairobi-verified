const User = require('../models/User');
const Merchant = require('../models/Merchant');
const { HTTP_STATUS } = require('../config/constants');

// @desc Protect routes with authentication
// @route Middleware
// @access Protected
exports.protect = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }

  try {
    if (req.user.businessName) {
      req.merchant = req.user;
    }
    next();
  } catch (err) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }
};

// @desc Grant access to specific roles
// @route Middleware
// @access Protected roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (req.user && !roles.includes(req.user.role)) {
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
  if (!req.merchant) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: 'Only merchants can access this route',
    });
  }
  next();
};