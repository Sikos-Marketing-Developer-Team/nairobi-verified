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
const { protectAdmin, checkPermission } = require('../middleware/adminAuth');

const router = express.Router();

// Protect all admin routes
router.use(protectAdmin);

// Dashboard routes
router.get('/stats', getDashboardStats);
router.get('/analytics', checkPermission('analytics.read'), getAnalytics);
router.get('/system-status', getSystemStatus);
router.get('/settings', checkPermission('settings.read'), getSettings);
router.put('/settings', checkPermission('settings.write'), updateSettings);
router.get('/export/:type', exportData);

// Merchant management routes
router.get('/merchants', checkPermission('merchants.read'), getMerchants);
router.post('/merchants', checkPermission('merchants.write'), createMerchant);
router.put('/merchants/:id/status', checkPermission('merchants.approve'), updateMerchantStatus);

// Document management routes
router.get('/merchants/:id/documents', checkPermission('merchants.read'), getMerchantDocuments);
router.post('/merchants/bulk-verify', checkPermission('merchants.approve'), bulkVerifyMerchants);

// User management routes
router.get('/users', checkPermission('users.read'), getUsers);
router.post('/users', checkPermission('users.write'), createUser);
router.put('/users/:id', checkPermission('users.write'), updateUser);
router.delete('/users/:id', checkPermission('users.delete'), deleteUser);

// Product management routes
router.get('/products', checkPermission('products.read'), getProducts);

// Review management routes
router.get('/reviews', checkPermission('reviews.read'), getReviews);
router.delete('/reviews/:id', checkPermission('reviews.delete'), deleteReview);

// Flash sales management routes (proxy to flash sales controller)
router.get('/flash-sales', checkPermission('flashsales.read'), async (req, res) => {
  try {
    const flashSalesController = require('../controllers/flashSales');
    await flashSalesController.getAllFlashSales(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load flash sales' });
  }
});

router.get('/flash-sales/analytics', checkPermission('flashsales.read'), async (req, res) => {
  try {
    const flashSalesController = require('../controllers/flashSales');
    await flashSalesController.getFlashSalesAnalytics(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load flash sales analytics' });
  }
});

// Simple test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Admin dashboard route working', admin: req.admin?.id || 'No admin' });
});

module.exports = router;
