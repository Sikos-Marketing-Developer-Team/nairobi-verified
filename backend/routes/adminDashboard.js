const express = require('express');
const {
  getDashboardStats,
  getRecentActivity,
  getMerchants,
  getMerchantDocuments,
  viewMerchantDocument,
  bulkVerifyMerchants,
  createMerchant,
  updateMerchantStatus,
  deleteMerchant,
  getUsers,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  getProducts,
  createProduct,
  getReviews,
  deleteReview,
  getAnalytics,
  getSystemStatus,
  exportData,
  getSettings,
  updateSettings,
  bulkUpdateMerchantStatus,
  bulkDeleteMerchants,
  
} = require('../controllers/adminDashboard');
const { protectAdmin, checkPermission } = require('../middleware/adminAuth');

const router = express.Router();

// Protect all admin routes
router.use(protectAdmin);

// Dashboard routes
router.get('/stats', getDashboardStats);
router.get('/recent-activity', getRecentActivity);
router.get('/analytics', checkPermission('analytics.read'), getAnalytics);
router.get('/system-status', getSystemStatus);
router.get('/settings', checkPermission('settings.read'), getSettings);
router.put('/settings', checkPermission('settings.write'), updateSettings);
router.get('/export/:type', exportData);

// Merchant management routes
router.get('/merchants', checkPermission('merchants.read'), getMerchants);
router.post('/merchants', checkPermission('merchants.write'), createMerchant);
router.put('/merchants/:id/status', checkPermission('merchants.approve'), updateMerchantStatus);
router.put('/merchants/bulk-status', checkPermission('merchants.approve'), bulkUpdateMerchantStatus);
router.delete('/merchants/:merchantId', protectAdmin, checkPermission('merchants.delete'), deleteMerchant);
router.delete('/merchants/bulk-delete', protectAdmin, checkPermission('merchants.delete'), bulkDeleteMerchants);

// Document management routes
router.get('/merchants/:id/documents', checkPermission('merchants.read'), getMerchantDocuments);
router.get('/merchants/:id/documents/:docType/view', checkPermission('merchants.read'), viewMerchantDocument);
router.post('/merchants/bulk-verify', checkPermission('merchants.approve'), bulkVerifyMerchants);

// User management routes
router.get('/users', checkPermission('users.read'), getUsers);
router.post('/users', checkPermission('users.write'), createUser);
router.put('/users/:id', checkPermission('users.write'), updateUser);
router.put('/users/:id/status', checkPermission('users.write'), updateUserStatus);
router.delete('/users/:id', checkPermission('users.delete'), deleteUser);

// Product management routes
router.get('/products', checkPermission('products.read'), getProducts);
router.post('/products', checkPermission('products.write'), createProduct);

// Review management routes
router.get('/reviews', checkPermission('reviews.read'), getReviews);
router.delete('/reviews/:id', checkPermission('reviews.delete'), deleteReview);

// Analytics routes
router.get('/analytics', checkPermission('analytics.read'), getAnalytics);

// Export routes
router.get('/export/users', checkPermission('users.read'), (req, res) => exportData(req, res, 'users'));
router.get('/export/merchants', checkPermission('merchants.read'), (req, res) => exportData(req, res, 'merchants'));
router.get('/export/:type', checkPermission('analytics.read'), exportData);

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

router.post('/flash-sales', checkPermission('flashsales.write'), async (req, res) => {
  try {
    const flashSalesController = require('../controllers/flashSales');
    await flashSalesController.createFlashSale(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create flash sale' });
  }
});

router.put('/flash-sales/:id', checkPermission('flashsales.write'), async (req, res) => {
  try {
    const flashSalesController = require('../controllers/flashSales');
    await flashSalesController.updateFlashSale(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update flash sale' });
  }
});

router.delete('/flash-sales/:id', checkPermission('flashsales.delete'), async (req, res) => {
  try {
    const flashSalesController = require('../controllers/flashSales');
    await flashSalesController.deleteFlashSale(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete flash sale' });
  }
});

router.patch('/flash-sales/:id/toggle', checkPermission('flashsales.write'), async (req, res) => {
  try {
    const flashSalesController = require('../controllers/flashSales');
    await flashSalesController.toggleFlashSaleStatus(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle flash sale status' });
  }
});

// Simple test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Admin dashboard route working', admin: req.admin?.id || 'No admin' });
});

module.exports = router;
