const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUserOrders,
  getSingleOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orders');

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, getUserOrders);

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, getSingleOrder);

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, createOrder);

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
router.put('/:id/status', protect, updateOrderStatus);

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private
router.delete('/:id', protect, cancelOrder);

module.exports = router;