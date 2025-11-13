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
} = require('../controllers/products');

// Import the correct auth middleware
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/categories/valid', getValidCategories); // New endpoint for valid enum values
router.get('/search', getProducts); // Explicit search route (optional)
router.get('/:id', getProductById);
router.get('/merchant/:merchantId', getProductsByMerchant);

// Protected routes (Merchant/Admin)
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;