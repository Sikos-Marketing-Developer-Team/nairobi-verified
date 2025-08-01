const AdminUser = require('../models/AdminUser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { HTTP_STATUS } = require('../config/constants');

// Helper to construct admin full name
const getAdminFullName = (admin) => admin.name || `${admin.firstName} ${admin.lastName}`;

// @desc    Login admin
// @route   POST /api/admin/auth/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Please provide email and password',
    });
  }

  // Hardcoded admin credentials for emergency access
  if (
    email === 'admin@nairobiverified.com' &&
    password === 'SuperAdmin123!'
  ) {
    // Return a mock admin user object
    const mockAdmin = {
      _id: 'hardcoded-admin-id',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@nairobiverified.com',
      role: 'super_admin',
    };
    const token = jwt.sign({ id: mockAdmin._id, role: mockAdmin.role, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
    return res.status(200).json({
      success: true,
      token,
      admin: {
        id: mockAdmin._id,
        firstName: mockAdmin.firstName,
        lastName: mockAdmin.lastName,
        name: getAdminFullName(mockAdmin),
        email: mockAdmin.email,
        role: mockAdmin.role,
      },
    });
  }

  // Fallback to normal DB check
  const admin = await AdminUser.findOne({ email }).select('+password');
  if (!admin) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  if (admin.accountLocked) {
    return res.status(HTTP_STATUS.LOCKED).json({
      success: false,
      message: 'Account is locked due to multiple failed login attempts',
    });
  }

  const isMatch = await admin.matchPassword(password);
  if (!isMatch) {
    await admin.trackFailedLogin();
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  await admin.resetFailedLoginAttempts();
  admin.lastLogin = new Date();
  await admin.save();

  const token = admin.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token,
    admin: {
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      name: getAdminFullName(admin),
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      lastLogin: admin.lastLogin,
    },
  });
});

// @desc    Get current admin
// @route   GET /api/admin/auth/me
// @access  Private (Admin)
const getCurrentAdmin = asyncHandler(async (req, res) => {
  // Handle hardcoded admin
  if (req.admin.id === 'hardcoded-admin-id') {
    return res.status(200).json({
      success: true,
      admin: {
        id: req.admin.id,
        firstName: req.admin.firstName,
        lastName: req.admin.lastName,
        name: getAdminFullName(req.admin),
        email: req.admin.email,
        role: req.admin.role,
        permissions: req.admin.permissions,
        lastLogin: new Date(),
        isActive: req.admin.isActive,
      },
    });
  }

  const admin = await AdminUser.findById(req.admin.id);

  res.status(200).json({
    success: true,
    admin: {
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      name: getAdminFullName(admin),
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      lastLogin: admin.lastLogin,
      isActive: admin.isActive,
    },
  });
});

// @desc    Logout admin
// @route   POST /api/admin/auth/logout
// @access  Private (Admin)
const logoutAdmin = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin logged out successfully',
  });
});

// @desc    Update admin password
// @route   PUT /api/admin/auth/updatepassword
// @access  Private (Admin)
const updatePassword = asyncHandler(async (req, res) => {
  const admin = await AdminUser.findById(req.admin.id).select('+password');

  if (!(await admin.matchPassword(req.body.currentPassword))) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Current password is incorrect',
    });
  }

  admin.password = req.body.newPassword;
  await admin.save();

  const token = admin.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token,
    message: 'Password updated successfully',
  });
});

// @desc    Update admin profile
// @route   PUT /api/admin/auth/updateprofile
// @access  Private (Admin)
const updateProfile = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
  };

  const admin = await AdminUser.findByIdAndUpdate(req.admin.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    admin,
  });
});

// @desc    Get admin activity log
// @route   GET /api/admin/auth/activity
// @access  Private (Admin)
const getAdminActivityLog = asyncHandler(async (req, res) => {
  const admin = await AdminUser.findById(req.admin.id).select('activityLog');

  res.status(200).json({
    success: true,
    activityLog: admin.activityLog,
  });
});

// @desc    Update admin settings
// @route   PUT /api/admin/auth/settings
// @access  Private (Admin)
const updateAdminSettings = asyncHandler(async (req, res) => {
  const admin = await AdminUser.findById(req.admin.id);

  if (req.body.theme) {
    admin.settings.theme = req.body.theme;
  }

  if (req.body.language) {
    admin.settings.language = req.body.language;
  }

  if (req.body.notifications) {
    admin.settings.notifications = { ...admin.settings.notifications, ...req.body.notifications };
  }

  if (req.body.dashboard) {
    admin.settings.dashboard = { ...admin.settings.dashboard, ...req.body.dashboard };
  }

  await admin.save();

  res.status(200).json({
    success: true,
    settings: admin.settings,
  });
});

module.exports = {
  loginAdmin,
  getCurrentAdmin,
  logoutAdmin,
  updatePassword,
  updateProfile,
  getAdminActivityLog,
  updateAdminSettings,
};