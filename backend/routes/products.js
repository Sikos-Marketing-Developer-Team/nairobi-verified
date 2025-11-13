const express = require('express');
const router = express.Router();
const {
  getProducts,
  getFeaturedProducts,
  getProductById,
  getProductsByMerchant,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getValidCategories,
  getSearchSuggestions, // Add this
} = require('../controllers/products');

const { protect } = require('../middleware/auth');
const { productSearchRateLimit } = require('../middleware/rateLimiters'); // Add rate limiting

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/categories/valid', getValidCategories);
router.get('/suggestions', productSearchRateLimit, getSearchSuggestions); // Add suggestions endpoint with rate limiting
router.get('/search', getProducts); // Explicit search route
router.get('/:id', getProductById);
router.get('/merchant/:merchantId', getProductsByMerchant);

// Protected routes (Merchant/Admin)
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;