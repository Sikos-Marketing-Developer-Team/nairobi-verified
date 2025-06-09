const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');

// Import controllers (these will need to be implemented)
const wishlistController = require('../controllers/wishlistController');

// Get all wishlist items
router.get('/', isAuthenticated, wishlistController.getItems);

// Add item to wishlist
router.post('/items', isAuthenticated, wishlistController.addItem);

// Remove item from wishlist
router.delete('/items/:itemId', isAuthenticated, wishlistController.removeItem);

// Clear wishlist
router.delete('/', isAuthenticated, wishlistController.clear);

module.exports = router;