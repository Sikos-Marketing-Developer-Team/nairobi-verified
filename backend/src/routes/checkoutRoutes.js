const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');

// Import controllers (these will need to be implemented)
const checkoutController = require('../controllers/checkoutController');

// Payment method routes
router.get('/payment-methods', isAuthenticated, checkoutController.getPaymentMethods);
router.post('/payment-methods', isAuthenticated, checkoutController.addPaymentMethod);
router.delete('/payment-methods/:id', isAuthenticated, checkoutController.deletePaymentMethod);

// Checkout session routes
router.post('/create-session', isAuthenticated, checkoutController.createCheckoutSession);
router.get('/order-summary/:cartId', isAuthenticated, checkoutController.getOrderSummary);

// Payment processing routes
router.post('/process-payment', isAuthenticated, checkoutController.processPayment);
router.get('/verify-payment/:paymentId', isAuthenticated, checkoutController.verifyPayment);

module.exports = router;