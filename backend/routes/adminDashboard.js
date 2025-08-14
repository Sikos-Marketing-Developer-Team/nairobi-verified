const express = require('express');
const {
  getDashboardStats,
  getMerchants,
  getMerchantDocuments,
  bulkVerifyMerchants,
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
const { protect, authorize } = require('../middleware/auth');
const { checkPermission } = require('../middleware/adminAuth');

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(authorize('admin'));

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/analytics', checkPermission('analytics.read'), getAnalytics);
router.get('/dashboard/system-status', getSystemStatus);
router.get('/dashboard/settings', checkPermission('settings.read'), getSettings);
router.put('/dashboard/settings', checkPermission('settings.write'), updateSettings);
router.get('/dashboard/export/:type', exportData);

// Merchant management routes
router.get('/dashboard/merchants', checkPermission('merchants.read'), getMerchants);
router.post('/dashboard/merchants', checkPermission('merchants.write'), createMerchant);
router.put('/dashboard/merchants/:id/status', checkPermission('merchants.approve'), updateMerchantStatus);

// Document management routes
router.get('/dashboard/merchants/:id/documents', checkPermission('merchants.read'), getMerchantDocuments);
router.post('/dashboard/merchants/bulk-verify', checkPermission('merchants.approve'), bulkVerifyMerchants);

// User management routes
router.get('/dashboard/users', checkPermission('users.read'), getUsers);
router.post('/dashboard/users', checkPermission('users.write'), createUser);
router.put('/dashboard/users/:id', checkPermission('users.write'), updateUser);
router.delete('/dashboard/users/:id', checkPermission('users.delete'), deleteUser);

// Product management routes
router.get('/dashboard/products', checkPermission('products.read'), getProducts);

// Review management routes
router.get('/dashboard/reviews', checkPermission('reviews.read'), getReviews);
router.delete('/dashboard/reviews/:id', checkPermission('reviews.delete'), deleteReview);

// Simple test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Admin dashboard route working', admin: req.admin?.id || 'No admin' });
});

module.exports = router;