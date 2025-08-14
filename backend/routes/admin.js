const express = require('express');
const {
  getDashboardStats,
  getMerchants,
  getMerchantDocuments,      // NEW
  bulkVerifyMerchants,       // NEW
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

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(authorize('admin'));

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/analytics', getAnalytics);
router.get('/dashboard/system-status', getSystemStatus);
router.get('/dashboard/settings', getSettings);
router.put('/dashboard/settings', updateSettings);
router.get('/dashboard/export/:type', exportData);

// Merchant management routes
router.get('/dashboard/merchants', getMerchants);
router.post('/dashboard/merchants', createMerchant);
router.put('/dashboard/merchants/:id/status', updateMerchantStatus);

// NEW: Document management routes
router.get('/dashboard/merchants/:id/documents', getMerchantDocuments);
router.post('/dashboard/merchants/bulk-verify', bulkVerifyMerchants);

// User management routes  
router.get('/dashboard/users', getUsers);
router.post('/dashboard/users', createUser);
router.put('/dashboard/users/:id', updateUser);
router.delete('/dashboard/users/:id', deleteUser);

// Product management routes
router.get('/dashboard/products', getProducts);

// Review management routes
router.get('/dashboard/reviews', getReviews);
router.delete('/dashboard/reviews/:id', deleteReview);

module.exports = router;