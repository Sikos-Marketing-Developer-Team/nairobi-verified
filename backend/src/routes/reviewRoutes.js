const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/merchant/:merchantId', reviewController.getMerchantReviews);

// Protected routes
router.post(
  '/product',
  authMiddleware.protect,
  reviewController.upload.array('images', 3),
  reviewController.createProductReview
);

router.post(
  '/merchant',
  authMiddleware.protect,
  reviewController.upload.array('images', 3),
  reviewController.createMerchantReview
);

// Admin routes
router.get(
  '/pending',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  reviewController.getPendingReviews
);

router.put(
  '/:reviewId/moderate',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  reviewController.moderateReview
);

module.exports = router;