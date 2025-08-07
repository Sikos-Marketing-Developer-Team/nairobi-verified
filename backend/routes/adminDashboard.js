const express = require('express');
const {
  getDashboardStats,
  getMerchants,
  createMerchant,
  updateMerchantStatus,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getProducts,
  getReviews,
  deleteReview,
  getAnalytics,
  getSystemStatus,
  exportData,
  getSettings,
  updateSettings
} = require('../controllers/adminDashboard');
const { protectAdmin, checkPermission } = require('../middleware/adminAuth');

const router = express.Router();

// All routes require admin authentication
router.use(protectAdmin);

// Dashboard statistics
router.get('/stats', getDashboardStats);

// Simple test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Admin dashboard route working', admin: req.admin?.id || 'No admin' });
});

// Merchant management
router.get('/merchants', checkPermission('merchants.read'), getMerchants);
router.post('/merchants', checkPermission('merchants.write'), createMerchant);
router.put('/merchants/:id/status', checkPermission('merchants.approve'), updateMerchantStatus);

// User management
router.get('/users', checkPermission('users.read'), getUsers);
router.post('/users', checkPermission('users.write'), createUser);
router.put('/users/:id', checkPermission('users.write'), updateUser);
router.delete('/users/:id', checkPermission('users.delete'), deleteUser);

// Product management
router.get('/products', checkPermission('products.read'), getProducts);

// Review management
router.get('/reviews', checkPermission('reviews.read'), getReviews);
router.delete('/reviews/:id', checkPermission('reviews.delete'), deleteReview);

// Analytics
router.get('/analytics', checkPermission('analytics.read'), getAnalytics);

// System management
router.get('/system-status', getSystemStatus);
router.get('/export/:type', exportData);

// Settings
router.get('/settings', checkPermission('settings.read'), getSettings);
router.put('/settings', checkPermission('settings.write'), updateSettings);

module.exports = router;
