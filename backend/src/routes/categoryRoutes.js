const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', categoryController.getCategories);
router.get('/featured', categoryController.getFeaturedCategories);
router.get('/:identifier', categoryController.getCategory);

// Admin only routes
router.post(
  '/',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  categoryController.upload.single('image'),
  categoryController.createCategory
);

router.put(
  '/:id',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  categoryController.upload.single('image'),
  categoryController.updateCategory
);

router.delete(
  '/:id',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  categoryController.deleteCategory
);

module.exports = router;