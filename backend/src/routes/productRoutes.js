const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/search', productController.searchProducts);
router.get('/recommendations/:productId', productController.getProductRecommendations);
router.get('/merchant/:merchantId', productController.getProductsByMerchant);
router.get('/:id', productController.getProductById);

// Protected routes
router.post(
  '/',
  authMiddleware.protect,
  authMiddleware.restrictTo('merchant', 'admin'),
  productController.upload.array('images', 5),
  productController.createProduct
);

router.put(
  '/:id',
  authMiddleware.protect,
  authMiddleware.restrictTo('merchant', 'admin'),
  productController.upload.array('images', 5),
  productController.updateProduct
);

router.delete(
  '/:id',
  authMiddleware.protect,
  authMiddleware.restrictTo('merchant', 'admin'),
  productController.deleteProduct
);

module.exports = router;