const express = require('express');
const {
  getDashboardStats,
  getMerchants,
  createMerchant,
  updateMerchantStatus,
  getUsers,
  getProducts,
  getReviews,
  deleteReview,
  getAnalytics
} = require('../controllers/adminDashboard');
const { protectAdmin, checkPermission } = require('../middleware/adminAuth');

const router = express.Router();

// All routes require admin authentication
router.use(protectAdmin);

// Dashboard statistics
router.get('/stats', getDashboardStats);

// Merchant management
router.get('/merchants', checkPermission('merchants.read'), getMerchants);
router.post('/merchants', checkPermission('merchants.write'), createMerchant);
router.put('/merchants/:id/status', checkPermission('merchants.approve'), updateMerchantStatus);

// User management
router.get('/users', checkPermission('users.read'), getUsers);

// Product management
router.get('/products', checkPermission('products.read'), getProducts);

// Review management
router.get('/reviews', checkPermission('reviews.read'), getReviews);
router.delete('/reviews/:id', checkPermission('reviews.delete'), deleteReview);

// Analytics
router.get('/analytics', checkPermission('analytics.read'), getAnalytics);

module.exports = router;
