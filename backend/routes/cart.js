const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
  moveToWishlist,
  validateCart
} = require('../controllers/cart');

// Apply protection middleware to all cart routes
router.use(protect);

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
router.get('/', getCart);

// @desc    Get cart summary (item count and total)
// @route   GET /api/cart/summary
// @access  Private
router.get('/summary', getCartSummary);

// @desc    Validate cart before checkout
// @route   POST /api/cart/validate
// @access  Private
router.post('/validate', validateCart);

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
router.post('/items', addToCart);

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private
router.put('/items/:itemId', updateCartItem);

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
router.delete('/items/:itemId', removeFromCart);

// @desc    Move item from cart to wishlist
// @route   POST /api/cart/items/:itemId/move-to-wishlist
// @access  Private
router.post('/items/:itemId/move-to-wishlist', moveToWishlist);

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
router.delete('/', clearCart);

module.exports = router;