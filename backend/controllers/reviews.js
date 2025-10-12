// controllers/reviews.js
const { ProductPG, MerchantPG, UserPG, ReviewPG } = require('../models/indexPG');
const { HTTP_STATUS } = require('../config/constants');
const { Op } = require('sequelize');

// Error handling utility
const handleError = (res, error, message, statusCode = 500) => {
  console.error(`${message}:`, error);
  res.status(statusCode).json({
    success: false,
    error: message
  });
};

// @desc    Get reviews for a merchant
// @route   GET /api/merchants/:merchantId/reviews
// @route   GET /api/reviews/merchant/:merchantId
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const { merchantId } = req.params;
    console.log('Fetching reviews for merchant:', merchantId);

    // Validate merchantId
    if (!merchantId || merchantId === 'undefined') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid merchant ID'
      });
    }

    // Check if merchant exists
    const merchant = await MerchantPG.findByPk(merchantId);
    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    const reviews = await ReviewPG.findAll({
      where: { 
        merchantId: merchantId,
        isApproved: true
      },
      include: [
        {
          model: UserPG,
          as: 'user',
          attributes: ['firstName', 'lastName', 'avatar']
        },
        {
          model: MerchantPG,
          as: 'merchant',
          attributes: ['businessName']
        },
        {
          model: ProductPG,
          as: 'product',
          attributes: ['name', 'primaryImage']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log('Reviews found:', reviews.length);

    // Always return success, even if no reviews
    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: reviews.length,
      data: reviews,
      message: reviews.length === 0 ? 'No reviews found for this merchant' : undefined
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid merchant ID'
      });
    }
    handleError(res, error, 'Failed to fetch reviews', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Get all reviews (for admin/general use)
// @route   GET /api/reviews
// @access  Public
exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, merchant, rating, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const where = { isApproved: true };
    if (merchant) where.merchantId = merchant;
    if (rating) where.rating = Number(rating);
    
    const orderDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const offset = (page - 1) * limit;

    const reviews = await ReviewPG.findAndCountAll({
      where,
      include: [
        {
          model: UserPG,
          as: 'user',
          attributes: ['firstName', 'lastName', 'avatar']
        },
        {
          model: MerchantPG,
          as: 'merchant',
          attributes: ['businessName']
        },
        {
          model: ProductPG,
          as: 'product',
          attributes: ['name', 'primaryImage']
        }
      ],
      order: [[sortBy, orderDirection]],
      limit: Number(limit),
      offset: offset
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: reviews.rows.length,
      data: reviews.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: reviews.count,
        pages: Math.ceil(reviews.count / limit)
      }
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
    const review = await ReviewPG.findByPk(req.params.id, {
      include: [
        {
          model: UserPG,
          as: 'user',
          attributes: ['firstName', 'lastName', 'avatar']
        },
        {
          model: MerchantPG,
          as: 'merchant',
          attributes: ['businessName']
        },
        {
          model: ProductPG,
          as: 'product',
          attributes: ['name', 'primaryImage']
        }
      ]
    });

    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Review not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: review
    });
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
    const merchantId = req.params.merchantId || req.body.merchant;
    
    if (!merchantId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Merchant ID is required'
      });
    }

    req.body.merchant = merchantId;
    req.body.user = req.user.id;

    const merchant = await MerchantPG.findByPk(merchantId);

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Check if user already reviewed this merchant
    const existingReview = await ReviewPG.findOne({
      where: {
        userId: req.user.id,
        merchantId: merchantId
      }
    });

    if (existingReview) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'You have already reviewed this merchant'
      });
    }

    const reviewData = {
      userId: req.user.id,
      merchantId: merchantId,
      productId: req.body.productId,
      rating: req.body.rating,
      title: req.body.title,
      comment: req.body.comment,
      images: req.body.images || [],
      orderId: req.body.orderId || null
    };

    const review = await ReviewPG.create(reviewData);

    // Populate the created review
    const populatedReview = await ReviewPG.findByPk(review.id, {
      include: [
        {
          model: UserPG,
          as: 'user',
          attributes: ['firstName', 'lastName', 'avatar']
        },
        {
          model: MerchantPG,
          as: 'merchant',
          attributes: ['businessName']
        },
        {
          model: ProductPG,
          as: 'product',
          attributes: ['name', 'primaryImage']
        }
      ]
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: populatedReview
    });
  } catch (error) {
    if (error.code === 11000) {
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
    let review = await ReviewPG.findByPk(req.params.id);

    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Make sure review belongs to user
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Not authorized to update this review'
      });
    }

    await review.update(req.body);

    // Fetch updated review with associations
    const updatedReview = await ReviewPG.findByPk(review.id, {
      include: [
        {
          model: UserPG,
          as: 'user',
          attributes: ['firstName', 'lastName', 'avatar']
        },
        {
          model: MerchantPG,
          as: 'merchant',
          attributes: ['businessName']
        },
        {
          model: ProductPG,
          as: 'product',
          attributes: ['name', 'primaryImage']
        }
      ]
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: updatedReview
    });
  } catch (error) {
    handleError(res, error, 'Failed to update review', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await ReviewPG.findByPk(req.params.id);

    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Make sure review belongs to user or user is admin
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Not authorized to delete this review'
      });
    }

    await review.destroy();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {},
      message: 'Review deleted successfully'
    });
  } catch (error) {
    handleError(res, error, 'Failed to delete review', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Add reply to review
// @route   POST /api/reviews/:id/reply
// @access  Private/Merchant
exports.addReply = async (req, res) => {
  try {
    const review = await ReviewPG.findByPk(req.params.id);

    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Check if user is admin or merchant owner
    if (req.user.role !== 'admin') {
      const merchant = await MerchantPG.findOne({ 
        where: { 
          id: review.merchantId, 
          ownerId: req.user.id 
        }
      });
      if (!merchant) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Not authorized to reply to this review'
        });
      }
    }

    // Update review with merchant response
    await review.update({
      merchantResponse: req.body.content,
      merchantResponseDate: new Date()
    });

    const updatedReview = await ReviewPG.findByPk(review.id, {
      include: [
        {
          model: UserPG,
          as: 'user',
          attributes: ['firstName', 'lastName', 'avatar']
        },
        {
          model: MerchantPG,
          as: 'merchant',
          attributes: ['businessName']
        },
        {
          model: ProductPG,
          as: 'product',
          attributes: ['name', 'primaryImage']
        }
      ]
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: updatedReview
    });
  } catch (error) {
    handleError(res, error, 'Failed to add reply', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const review = await ReviewPG.findByPk(req.params.id);

    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Review not found'
      });
    }

    // For PostgreSQL, we'll increment/decrement the helpful count
    // In a production system, you might want a separate table to track who marked what as helpful
    const action = req.body.action || 'helpful'; // 'helpful' or 'unhelpful'
    
    if (action === 'helpful') {
      await review.update({
        isHelpful: review.isHelpful + 1
      });
    } else if (action === 'unhelpful') {
      await review.update({
        isHelpful: Math.max(0, review.isHelpful - 1)
      });
    }

    const updatedReview = await ReviewPG.findByPk(review.id, {
      include: [
        {
          model: UserPG,
          as: 'user',
          attributes: ['firstName', 'lastName', 'avatar']
        },
        {
          model: MerchantPG,
          as: 'merchant',
          attributes: ['businessName']
        },
        {
          model: ProductPG,
          as: 'product',
          attributes: ['name', 'primaryImage']
        }
      ]
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: updatedReview,
      message: action === 'helpful' ? 'Marked as helpful' : 'Removed helpful mark'
    });
  } catch (error) {
    handleError(res, error, 'Failed to update helpful status', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};