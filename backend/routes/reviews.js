const express = require('express');
const {
  getReviews,
  getAllReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
  addReply,
  markHelpful
} = require('../controllers/reviews');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// General reviews routes
router.route('/')
  .get(getAllReviews)
  .post(protect, addReview);

// Merchant-specific reviews route
router.get('/merchant/:merchantId', getReviews);
router.post('/merchant/:merchantId', protect, addReview);

// Individual review routes
router.route('/:id')
  .get(getReview)
  .put(protect, updateReview)
  .delete(protect, deleteReview);

// Review interaction routes
router.post('/:id/reply', protect, addReply);
router.put('/:id/helpful', protect, markHelpful);

module.exports = router;