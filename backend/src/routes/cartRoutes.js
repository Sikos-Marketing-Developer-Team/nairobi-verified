const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

// All cart routes are protected
router.use(authMiddleware.protect);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateCartItem);
router.delete('/item/:productId', cartController.removeCartItem);
router.delete('/clear', cartController.clearCart);

module.exports = router;