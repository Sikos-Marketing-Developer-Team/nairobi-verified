const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes
router.post(
  '/',
  authMiddleware.protect,
  orderController.createOrder
);

// Customer routes
router.get(
  '/my-orders',
  authMiddleware.protect,
  orderController.getCustomerOrders
);

// Merchant routes
router.get(
  '/merchant-orders',
  authMiddleware.protect,
  authMiddleware.restrictTo('merchant'),
  orderController.getMerchantOrders
);

// Admin routes
router.get(
  '/all',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  orderController.getAllOrders
);

router.put(
  '/:id/payment',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  orderController.updatePaymentStatus
);

// Shared routes
router.get(
  '/:id',
  authMiddleware.protect,
  orderController.getOrderById
);

router.put(
  '/:id/status',
  authMiddleware.protect,
  authMiddleware.restrictTo('merchant', 'admin'),
  orderController.updateOrderStatus
);

router.put(
  '/:id/cancel',
  authMiddleware.protect,
  orderController.cancelOrder
);

module.exports = router;