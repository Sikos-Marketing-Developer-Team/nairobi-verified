const express = require('express');
const router = express.Router();
const subscriptionPackageController = require('../controllers/subscriptionPackageController');
const vendorSubscriptionController = require('../controllers/vendorSubscriptionController');
const subscriptionRenewalController = require('../controllers/subscriptionRenewalController');
const { isAuthenticated, isAdmin, isMerchant } = require('../middleware/authMiddleware');

// Subscription Package Routes
// Public routes
router.get('/packages', subscriptionPackageController.getAllPackages);
router.get('/packages/:id', subscriptionPackageController.getPackageById);

// Admin-only routes
router.post('/packages', isAuthenticated, isAdmin, subscriptionPackageController.createPackage);
router.put('/packages/:id', isAuthenticated, isAdmin, subscriptionPackageController.updatePackage);
router.delete('/packages/:id', isAuthenticated, isAdmin, subscriptionPackageController.deletePackage);

// Vendor Subscription Routes
// Merchant routes
router.post('/subscribe', isAuthenticated, isMerchant, vendorSubscriptionController.subscribeToPackage);
router.get('/current', isAuthenticated, isMerchant, vendorSubscriptionController.getCurrentSubscription);
router.get('/history', isAuthenticated, isMerchant, vendorSubscriptionController.getSubscriptionHistory);
router.put('/cancel/:subscriptionId', isAuthenticated, isMerchant, vendorSubscriptionController.cancelSubscription);
router.post('/renew/:subscriptionId', isAuthenticated, isMerchant, subscriptionRenewalController.renewSubscription);

// Admin routes
router.get('/all', isAuthenticated, isAdmin, vendorSubscriptionController.getAllSubscriptions);
router.put('/:subscriptionId', isAuthenticated, isAdmin, vendorSubscriptionController.updateSubscriptionStatus);
router.post('/check-expiring', isAuthenticated, isAdmin, subscriptionRenewalController.checkExpiringSubscriptions);

// Payment callback routes
router.post('/mpesa/callback', vendorSubscriptionController.verifyMpesaCallback);

module.exports = router;