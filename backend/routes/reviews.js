const express = require('express');
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
  addReply,
  markHelpful
} = require('../controllers/reviews');
const { protect, isMerchant } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getReviews)
  .post(protect, addReview);

router.route('/:id')
  .get(getReview)
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router.post('/:id/reply', protect, isMerchant, addReply);
router.put('/:id/helpful', protect, markHelpful);

module.exports = router;