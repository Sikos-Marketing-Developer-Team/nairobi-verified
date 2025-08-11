const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Import flash sale controllers
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

// Validation middleware for flash sale creation and updates
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

// IMPORTANT: Specific routes must come BEFORE parameterized routes

// @desc    Get flash sale analytics
// @route   GET /api/flash-sales/admin/analytics
// @access  Private/Admin
router.get('/admin/analytics', protect, authorize('admin'), getFlashSalesAnalytics);

// @desc    Get all flash sales (for admin)
// @route   GET /api/flash-sales/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, authorize('admin'), getAllFlashSales);

// @desc    Get all active flash sales
// @route   GET /api/flash-sales
// @access  Public
router.get('/', getActiveFlashSales);

// @desc    Create new flash sale
// @route   POST /api/flash-sales
// @access  Private/Admin
router.post('/', protect, authorize('admin'), flashSaleValidation, createFlashSale);

// @desc    Get single flash sale
// @route   GET /api/flash-sales/:id
// @access  Public
router.get('/:id', getFlashSale);

// @desc    Update flash sale
// @route   PUT /api/flash-sales/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), updateFlashSaleValidation, updateFlashSale);

// @desc    Toggle flash sale status
// @route   PATCH /api/flash-sales/:id/toggle
// @access  Private/Admin
router.patch('/:id/toggle', protect, authorize('admin'), toggleFlashSaleStatus);

// @desc    Delete flash sale
// @route   DELETE /api/flash-sales/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), deleteFlashSale);

module.exports = router;