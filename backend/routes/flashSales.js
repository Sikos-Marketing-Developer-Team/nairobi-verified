const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
  getActiveFlashSales,
  getFlashSale,
  getAllFlashSales,
  getFlashSalesAnalytics,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale,
  toggleFlashSaleStatus,
} = require('../controllers/flashSales');

// Validation middleware
const flashSaleValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),

  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),

  body('products')
    .isArray({ min: 1, max: 50 })
    .withMessage('Products must be an array with 1-50 items'),

  body('products.*.name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Product name is required and must be less than 100 characters'),

  body('products.*.originalPrice')
    .isFloat({ min: 0.01 })
    .withMessage('Original price must be a positive number'),

  body('products.*.salePrice')
    .isFloat({ min: 0.01 })
    .withMessage('Sale price must be a positive number'),

  body('products.*.image')
    .isURL()
    .withMessage('Product image must be a valid URL'),

  body('products.*.merchant')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Merchant name is required'),

  body('products.*.merchantId')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Merchant ID is required'),
];

const updateFlashSaleValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),

  body('products')
    .optional()
    .isArray({ min: 1, max: 50 })
    .withMessage('Products must be an array with 1-50 items'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

// ==========================================
// SPECIFIC ROUTES MUST COME FIRST
// ==========================================

// Admin analytics
router.get('/admin/analytics', protect, authorize('admin'), getFlashSalesAnalytics);

// Admin - all flash sales
router.get('/admin/all', protect, authorize('admin'), getAllFlashSales);

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get all active flash sales
router.get('/', getActiveFlashSales);

// Get single flash sale
router.get('/:id', getFlashSale);

// ==========================================
// ADMIN MODIFICATION ROUTES
// ==========================================

// Create flash sale
router.post('/', protect, authorize('admin'), flashSaleValidation, createFlashSale);

// Update flash sale
router.put('/:id', protect, authorize('admin'), updateFlashSaleValidation, updateFlashSale);

// Toggle flash sale status
router.patch('/:id/toggle', protect, authorize('admin'), toggleFlashSaleStatus);

// Delete flash sale
router.delete('/:id', protect, authorize('admin'), deleteFlashSale);

module.exports = router;
