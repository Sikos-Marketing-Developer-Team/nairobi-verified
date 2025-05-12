const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(isAuthenticated, isAdmin);

// Dashboard statistics
router.get('/dashboard', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getUsers);
router.put('/users/:userId', adminController.updateUser);

// Merchant verification
router.get('/verifications', adminController.getPendingVerifications);
router.put('/verifications/:merchantId', adminController.processMerchantVerification);

// Transaction management
router.get('/transactions', adminController.getTransactions);

module.exports = router;const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(isAuthenticated, isAdmin);

// Dashboard statistics
router.get('/dashboard', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getUsers);
router.put('/users/:userId', adminController.updateUser);

// Merchant verification
router.get('/verifications', adminController.getPendingVerifications);
router.put('/verifications/:merchantId', adminController.processMerchantVerification);

// Transaction management
router.get('/transactions', adminController.getTransactions);

module.exports = router;