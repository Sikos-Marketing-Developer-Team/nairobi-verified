const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// Admin routes
router.post('/subscriptions/check-expiring', isAuthenticated, isAdmin, notificationController.checkExpiringSubscriptions);

module.exports = router;