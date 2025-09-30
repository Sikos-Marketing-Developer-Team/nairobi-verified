const express = require('express');
const {
  getDashboardOverview,
  getPerformanceAnalytics,
  getRecentActivity,
  getNotifications,
  getMerchantReviews,
  getQuickActions
} = require('../controllers/merchantDashboard');
const { protect, isMerchant } = require('../middleware/auth');

const router = express.Router();

// All routes require merchant authentication
router.use(protect);
router.use(isMerchant);

// Dashboard routes
router.get('/overview', getDashboardOverview);
router.get('/analytics', getPerformanceAnalytics);
router.get('/activity', getRecentActivity);
router.get('/notifications', getNotifications);
router.get('/reviews', getMerchantReviews);
router.get('/quick-actions', getQuickActions);

module.exports = router;