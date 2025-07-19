const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const asyncHandler = require('express-async-handler');

// Protect admin routes
const protectAdmin = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if it's an admin user
    if (!decoded.isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Get admin user from token
    const admin = await AdminUser.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is deactivated'
      });
    }

    // Check if account is locked
    if (admin.accountLocked) {
      return res.status(423).json({
        success: false,
        message: 'Admin account is locked'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
});

// Check admin permissions
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    next();
  };
};

// Check admin role
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient role privileges'
      });
    }
    next();
  };
};

module.exports = {
  protectAdmin,
  checkPermission,
  checkRole
};
