const jwt = require('jsonwebtoken');
const User = require('../models/User');
const VendorSubscription = require('../models/VendorSubscription');

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Middleware to check if user is authenticated (session-based)
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
// (Implement M-Pesa service for payment processing, including access token generation, STK push initiation, and payment verification.)
  }
};

const isEmailVerified = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Email verification check error:', error);
    res.status(401).json({ message: 'Invalid token or server error' });
  }
};

module.exports = { isAuthenticated, isEmailVerified };

// Middleware to check if user is authenticated (JWT-based)
exports.protect = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated. Please log in.' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found or session expired' });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

// Middleware to check if user is an admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

// Middleware to check if user is a merchant
exports.isMerchant = (req, res, next) => {
  if (req.user && req.user.role === 'merchant') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Merchant account required.' });
  }
};

// Middleware to check if user is a client
exports.isClient = (req, res, next) => {
  if (req.user && req.user.role === 'client') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Client account required.' });
  }
};

// Middleware to restrict access to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. ${roles.join(' or ')} privileges required.` 
      });
    }
    
    next();
  };
};

// Middleware to check if merchant is verified
exports.isVerifiedMerchant = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (req.user.role !== 'merchant') {
      return res.status(403).json({ message: 'Access denied. Merchant account required.' });
    }
    
    if (!req.user.isVerified) {
      return res.status(403).json({ 
        message: 'Your merchant account is not verified yet. Please complete verification.' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Merchant verification check error:', error);
    res.status(500).json({ message: 'Server error during verification check' });
  }
};

// Middleware to check if merchant has active subscription
exports.hasActiveSubscription = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (req.user.role !== 'merchant') {
      return res.status(403).json({ message: 'Access denied. Merchant account required.' });
    }
    
    // Check for active subscription
    const activeSubscription = await VendorSubscription.findOne({
      vendor: req.user._id,
      status: 'active',
      endDate: { $gt: new Date() }
    });
    
    if (!activeSubscription) {
      return res.status(403).json({ 
        message: 'You need an active subscription to perform this action' 
      });
    }
    
    // Attach subscription to request for potential use in controllers
    req.subscription = activeSubscription;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ message: 'Server error during subscription check' });
  }
};

// Middleware to check if user is not authenticated
// Middleware to check if user is not authenticated
exports.isNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.status(403).json({ message: 'Already authenticated' });
};

// Middleware to check if user is authenticated (JWT-based)
exports.protect = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated. Please log in.' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found or session expired' });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

// Middleware to check if user is an admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

// Middleware to check if user is a merchant
exports.isMerchant = (req, res, next) => {
  if (req.user && req.user.role === 'merchant') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Merchant account required.' });
  }
};

// Middleware to check if user is a client
exports.isClient = (req, res, next) => {
  if (req.user && req.user.role === 'client') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Client account required.' });
  }
};

// Middleware to restrict access to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. ${roles.join(' or ')} privileges required.` 
      });
    }
    
    next();
  };
};

// Middleware to check if merchant is verified
exports.isVerifiedMerchant = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (req.user.role !== 'merchant') {
      return res.status(403).json({ message: 'Access denied. Merchant account required.' });
    }
    
    if (!req.user.isVerified) {
      return res.status(403).json({ 
        message: 'Your merchant account is not verified yet. Please complete verification.' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Merchant verification check error:', error);
    res.status(500).json({ message: 'Server error during verification check' });
  }
};

// Middleware to check if merchant has active subscription
exports.hasActiveSubscription = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (req.user.role !== 'merchant') {
      return res.status(403).json({ message: 'Access denied. Merchant account required.' });
    }
    
    // Check for active subscription
    const activeSubscription = await VendorSubscription.findOne({
      vendor: req.user._id,
      status: 'active',
      endDate: { $gt: new Date() }
    });
    
    if (!activeSubscription) {
      return res.status(403).json({ 
        message: 'You need an active subscription to perform this action' 
      });
    }
    
    // Attach subscription to request for potential use in controllers
    req.subscription = activeSubscription;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ message: 'Server error during subscription check' });
  }
};
// (Implement M-Pesa service for payment processing, including access token generation, STK push initiation, and payment verification.)
