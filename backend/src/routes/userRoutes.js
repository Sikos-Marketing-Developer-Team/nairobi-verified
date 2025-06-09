const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');

// Import controllers (these will need to be implemented)
const userController = require('../controllers/userController');

// Profile routes
router.get('/profile', isAuthenticated, userController.getProfile);
router.put('/profile', isAuthenticated, userController.updateProfile);
router.post('/change-password', isAuthenticated, userController.changePassword);

// Address routes
router.get('/addresses', isAuthenticated, userController.getAddresses);
router.post('/addresses', isAuthenticated, userController.addAddress);
router.put('/addresses/:addressId', isAuthenticated, userController.updateAddress);
router.delete('/addresses/:addressId', isAuthenticated, userController.deleteAddress);
router.put('/addresses/:addressId/set-default', isAuthenticated, userController.setDefaultAddress);

// Notification routes
router.get('/notifications', isAuthenticated, userController.getNotifications);
router.put('/notifications/:notificationId/read', isAuthenticated, userController.markNotificationRead);
router.delete('/notifications/:notificationId', isAuthenticated, userController.deleteNotification);

// Order routes
router.get('/orders', isAuthenticated, userController.getOrders);
router.get('/orders/:orderId', isAuthenticated, userController.getOrderById);

module.exports = router;