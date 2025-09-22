const Review = require('../models/Review');
const Merchant = require('../models/Merchant');
const User = require('../models/User');
const { HTTP_STATUS } = require('../config/constants');
const { Op } = require('sequelize');

// Error handling utility
const handleError = (res, error, message, statusCode = 500) => {
  console.error(`${message}:`, error);
  res.status(statusCode).json({ success: false, error: message });
};

const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
};

// @desc    Get reviews for a merchant
// @route   GET /api/merchants/:merchantId/reviews
// @route   GET /api/reviews/merchant/:merchantId
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const merchantIdParam = req.params.merchantId;
    if (!merchantIdParam) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'Merchant ID is required' });
    }

    const merchantId = toInt(merchantIdParam) ?? merchantIdParam;

    // Verify merchant exists by numeric ID only (new path)
    if (typeof merchantId === 'number') {
      const merchant = await Merchant.findByPk(merchantId);
      if (!merchant) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Merchant not found' });
      }
    }

    const reviews = await Review.findAll({
      where: typeof merchantId === 'number' ? { merchantId } : { merchantLegacyId: merchantId },
      order: [['createdAt', 'DESC']]
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: reviews.length,
      data: reviews.map(r => r.toJSON()),
      message: reviews.length === 0 ? 'No reviews found for this merchant' : undefined
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch reviews', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Get all reviews (for admin/general use)
// @route   GET /api/reviews
// @access  Public
exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, merchant, rating, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const where = {};
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    if (merchant) {
      const mId = toInt(merchant);
      if (mId !== null) where.merchantId = mId; else where.merchantLegacyId = merchant;
    }
    if (rating) where.rating = parseInt(rating, 10) || 0;

    const order = [[sortBy, String(sortOrder).toLowerCase() === 'desc' ? 'DESC' : 'ASC']];

    const { rows, count } = await Review.findAndCountAll({ where, order, limit: limitNum, offset });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: rows.length,
      data: rows.map(r => r.toJSON()),
      pagination: { page: pageNum, limit: limitNum, total: count, pages: Math.ceil(count / limitNum) }
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch reviews', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Get a single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Review not found' });
    }
    res.status(HTTP_STATUS.OK).json({ success: true, data: review.toJSON() });
  } catch (error) {
    handleError(res, error, 'Failed to fetch review', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Add review
// @route   POST /api/merchants/:merchantId/reviews
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const merchantIdParam = req.params.merchantId || req.body.merchantId || req.body.merchant;
    if (!merchantIdParam) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'Merchant ID is required' });
    }

    const merchantIdNum = toInt(merchantIdParam);

    let merchantId = null;
    if (merchantIdNum !== null) {
      const merchant = await Merchant.findByPk(merchantIdNum);
      if (!merchant) return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Merchant not found' });
      merchantId = merchant.id;
    }

    const userId = req.user?.id;

    // Enforce single review per merchant/user (numeric path only)
    if (merchantId && userId) {
      const existing = await Review.findOne({ where: { merchantId, userId } });
      if (existing) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'You have already reviewed this merchant' });
      }
    }

    const createBody = {
      rating: req.body.rating,
      content: req.body.content,
      helpful: 0,
      helpfulBy: [],
      reply: null,
      userId: userId || null,
      merchantId: merchantId || null,
    };

    // During cutover if ids are strings
    if (!merchantId && typeof merchantIdParam === 'string') createBody.merchantLegacyId = merchantIdParam;
    if (!userId && req.user?._id) createBody.userLegacyId = String(req.user._id);

    const review = await Review.create(createBody);

    res.status(HTTP_STATUS.CREATED).json({ success: true, data: review.toJSON() });
  } catch (error) {
    if (error?.name === 'SequelizeUniqueConstraintError') {
      handleError(res, error, 'You have already reviewed this merchant', HTTP_STATUS.BAD_REQUEST);
    } else {
      handleError(res, error, 'Failed to create review', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Review not found' });
    }

    // Only review owner or admin can edit
    if (req.user.role !== 'admin' && review.userId !== req.user.id && String(review.userLegacyId || '') !== String(req.user._id || '')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: 'Not authorized to update this review' });
    }

    review.set({ rating: req.body.rating ?? review.rating, content: req.body.content ?? review.content });
    await review.save();

    res.status(HTTP_STATUS.OK).json({ success: true, data: review.toJSON() });
  } catch (error) {
    handleError(res, error, 'Failed to update review', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Review not found' });
    }

    if (req.user.role !== 'admin' && review.userId !== req.user.id && String(review.userLegacyId || '') !== String(req.user._id || '')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: 'Not authorized to delete this review' });
    }

    await review.destroy();

    res.status(HTTP_STATUS.OK).json({ success: true, data: {}, message: 'Review deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Failed to delete review', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Add reply to review
// @route   POST /api/reviews/:id/reply
// @access  Private/Merchant
exports.addReply = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Review not found' });
    }

    // Admin or merchant owner of the reviewed merchant
    if (req.user.role !== 'admin') {
      if (!req.merchant || (review.merchantId && review.merchantId !== req.merchant.id)) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: 'Not authorized to reply to this review' });
      }
    }

    review.reply = {
      author: 'Business Owner',
      content: req.body.content,
      date: new Date()
    };
    await review.save();

    res.status(HTTP_STATUS.OK).json({ success: true, data: review.toJSON() });
  } catch (error) {
    handleError(res, error, 'Failed to add reply', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Review not found' });
    }

    const userId = req.user.id ?? String(req.user._id);
    const already = (review.helpfulBy || []).some(id => String(id) === String(userId));

    if (already) {
      review.helpfulBy = (review.helpfulBy || []).filter(id => String(id) !== String(userId));
      review.helpful = Math.max(0, (review.helpful || 0) - 1);
    } else {
      review.helpfulBy = [...(review.helpfulBy || []), userId];
      review.helpful = (review.helpful || 0) + 1;
    }

    await review.save();

    res.status(HTTP_STATUS.OK).json({ success: true, data: review.toJSON(), message: already ? 'Removed helpful mark' : 'Marked as helpful' });
  } catch (error) {
    handleError(res, error, 'Failed to update helpful status', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};