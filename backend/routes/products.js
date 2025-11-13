const express = require('express');
const router = express.Router();
const {
  getProducts,
  searchProducts,
  getFeaturedProducts,
  getProductById,
  getProductsByMerchant,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getSearchSuggestions,
} = require('../controllers/products');
const { protect } = require('../middleware/auth');

// IMPORT CACHE MIDDLEWARE
const { cacheMiddleware, CACHE_DURATIONS, keyGenerators, invalidateCache } = require('../middleware/cache');

// ==========================================
// CACHED PUBLIC ROUTES
// These handle 90% of your traffic
// ==========================================

// Get all products with filters (most common endpoint)
// Cache varies by: page, limit, category, merchant, featured, price, search
router.get('/', 
  cacheMiddleware(
    CACHE_DURATIONS.PRODUCT_LIST,
    keyGenerators.productList
  ), 
  getProducts
);

// Search products (dedicated search endpoint)
// Cache varies by search query
router.get('/search',
  cacheMiddleware(
    CACHE_DURATIONS.SEARCH,
    (req) => `products:search:${req.query.q || 'empty'}:p${req.query.page || 1}:l${req.query.limit || 12}`
  ),
  searchProducts
);

// Get featured products (changes rarely)
// Simple cache key - no query variations
router.get('/featured', 
  cacheMiddleware(
    CACHE_DURATIONS.PRODUCT_LIST,
    (req) => `products:featured:l${req.query.limit || 8}`
  ), 
  getFeaturedProducts
);

// Get categories (almost never changes)
// Longest cache duration
router.get('/categories', 
  cacheMiddleware(
    CACHE_DURATIONS.CATEGORIES,
    () => 'products:categories'
  ), 
  getCategories
);

// Get search suggestions (for autocomplete)
// Short cache - needs to feel responsive
router.get('/suggestions',
  cacheMiddleware(
    CACHE_DURATIONS.SEARCH,
    (req) => `products:suggestions:${req.query.q || 'empty'}`
  ),
  getSearchSuggestions
);

// Get products by merchant
// Cache per merchant
router.get('/merchant/:merchantId',
  cacheMiddleware(
    CACHE_DURATIONS.PRODUCT_LIST,
    (req) => `products:merchant:${req.params.merchantId}:p${req.query.page || 1}:l${req.query.limit || 12}`
  ),
  getProductsByMerchant
);

// Get single product (cache longer - product details stable)
// MUST be after /search, /featured, /categories to avoid conflicts
router.get('/:id', 
  cacheMiddleware(
    CACHE_DURATIONS.PRODUCT_DETAIL,
    (req) => `product:${req.params.id}`
  ),
  getProductById
);

// ==========================================
// PROTECTED ROUTES (Create/Update/Delete)
// ==========================================

// Create product
router.post('/', protect, async (req, res, next) => {
  // Invalidate product list caches
  await invalidateCache('products:list:*');
  await invalidateCache('products:featured:*');
  await invalidateCache('products:search:*');
  
  // Also invalidate merchant's product cache if merchant field exists
  if (req.body.merchant) {
    await invalidateCache(`products:merchant:${req.body.merchant}*`);
  }
  
  next();
}, createProduct);

// Update product
router.put('/:id', protect, async (req, res, next) => {
  // Invalidate specific product and all list caches
  await invalidateCache(`product:${req.params.id}*`);
  await invalidateCache('products:list:*');
  await invalidateCache('products:featured:*');
  await invalidateCache('products:search:*');
  
  // If merchant is being updated, invalidate old merchant's cache too
  if (req.body.merchant) {
    await invalidateCache(`products:merchant:${req.body.merchant}*`);
  }
  
  next();
}, updateProduct);

// Delete product
router.delete('/:id', protect, async (req, res, next) => {
  // Invalidate specific product and all list caches
  await invalidateCache(`product:${req.params.id}*`);
  await invalidateCache('products:list:*');
  await invalidateCache('products:featured:*');
  await invalidateCache('products:search:*');
  
  next();
}, deleteProduct);

module.exports = router;