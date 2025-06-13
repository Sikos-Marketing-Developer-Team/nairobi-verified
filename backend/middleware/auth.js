const User = require('../models/User');
const Merchant = require('../models/Merchant');

// Protect routes
exports.protect = async (req, res, next) => {
  // Check if user is authenticated via session
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // User is already attached to req by passport
    if (req.user.businessName) {
      // This is a merchant
      req.merchant = req.user;
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (req.user && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is a merchant
exports.isMerchant = (req, res, next) => {
  if (!req.merchant) {
    return res.status(403).json({
      success: false,
      error: 'Only merchants can access this route'
    });
  }
  next();
};