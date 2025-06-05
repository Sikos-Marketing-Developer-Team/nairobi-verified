const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const settingsController = require('../controllers/settingsController');
const adminNotificationController = require('../controllers/adminNotificationController');
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

// Analytics
router.get('/analytics', adminController.getAnalytics);
router.get('/analytics/export', adminController.exportAnalytics);

// Product management
router.get('/products', adminController.getProducts);
router.put('/products/:productId/status', adminController.updateProductStatus);
router.put('/products/:productId/featured', adminController.updateProductFeatured);
router.delete('/products/:productId', adminController.deleteProduct);
router.post('/products/bulk', adminController.bulkUpdateProducts);

// Feature toggles
router.get('/features', adminController.getFeatureToggles);
router.post('/features', adminController.createFeatureToggle);
router.put('/features/:featureId', adminController.updateFeatureToggle);
router.delete('/features/:featureId', adminController.deleteFeatureToggle);

// Content management
router.get('/content/banners', adminController.getContentBanners);
router.get('/content/homepage-sections', adminController.getHomepageSections);
router.post('/content/save-layout', adminController.saveLayoutChanges);

// Settings management
router.get('/settings', settingsController.getSettings);
router.put('/settings/:section', settingsController.updateSettings);
router.post('/upload', settingsController.uploadFile);

// Notification management
router.get('/notifications', adminNotificationController.getNotifications);
router.post('/notifications', adminNotificationController.createNotification);
router.put('/notifications/:notificationId', adminNotificationController.updateNotification);
router.delete('/notifications/:notificationId', adminNotificationController.deleteNotification);
router.post('/notifications/:notificationId/send', adminNotificationController.sendNotification);

// Email template management
router.get('/email-templates', adminNotificationController.getEmailTemplates);
router.post('/email-templates', adminNotificationController.createEmailTemplate);
router.put('/email-templates/:templateId', adminNotificationController.updateEmailTemplate);
router.delete('/email-templates/:templateId', adminNotificationController.deleteEmailTemplate);

// Bulk import businesses
router.post('/businesses/bulk-import', isAdmin, adminController.bulkImportBusinesses);

module.exports = router;