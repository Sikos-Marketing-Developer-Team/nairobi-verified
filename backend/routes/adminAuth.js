const express = require('express');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware for admin login
const validateAdminLogin = [
  check('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  check('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array().map(err => err.msg).join(', ') 
      });
    }
    next();
  }
];

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for admin user
    const user = await User.findOne({ email, role: 'admin' }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log the admin in via session
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error logging in admin'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Admin login successful',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin,
          permissions: ['read', 'write', 'delete', 'admin'] // Admin has all permissions
        }
      });
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login'
    });
  }
};

// @desc    Admin logout
// @route   POST /api/auth/admin/logout
// @access  Private (Admin)
const adminLogout = async (req, res) => {
  try {
    // Only allow admin logout
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    req.logout((err) => {
      if (err) {
        console.error('Admin logout error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error logging out admin'
        });
      }
      
      req.session.destroy((err) => {
        if (err) {
          console.error('Admin session destroy error:', err);
          return res.status(500).json({
            success: false,
            message: 'Error destroying admin session'
          });
        }
        res.status(200).json({
          success: true,
          message: 'Admin logout successful'
        });
      });
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin logout'
    });
  }
};

// @desc    Check admin authentication
// @route   GET /api/auth/admin/check
// @access  Private (Admin)
const adminCheck = async (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user || req.user.role !== 'admin') {
      return res.status(200).json({
        success: true,
        isAuthenticated: false,
        user: null
      });
    }

    res.status(200).json({
      success: true,
      isAuthenticated: true,
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        role: req.user.role,
        lastLogin: req.user.lastLogin,
        permissions: ['read', 'write', 'delete', 'admin']
      }
    });
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin check'
    });
  }
};

// Routes
router.post('/login', validateAdminLogin, adminLogin);
router.post('/logout', protect, authorize('admin'), adminLogout);
router.get('/check', adminCheck);

module.exports = router;
