// controllers/reviews.js
const Review = require('../models/Review');
const Merchant = require('../models/Merchant');
const mongoose = require('mongoose');
const { HTTP_STATUS } = require('../config/constants');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

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

    // Check if merchantId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(merchantId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid merchant ID format'
      });
    }

    // Check if merchant exists
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    const reviews = await Review.find({ merchant: merchantId })
      .populate({
        path: 'user',
        select: 'firstName lastName avatar'
      })
      .populate({
        path: 'merchant',
        select: 'businessName'
      })
      .sort({ createdAt: -1 });

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
    
    const filter = {};
    if (merchant) filter.merchant = merchant;
    if (rating) filter.rating = Number(rating);
    
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (page - 1) * limit;

    const reviews = await Review.find(filter)
      .populate({
        path: 'user',
        select: 'firstName lastName avatar'
      })
      .populate({
        path: 'merchant',
        select: 'businessName'
      })
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments(filter);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: reviews.length,
      data: reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
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
    const review = await Review.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'firstName lastName avatar'
      })
      .populate({
        path: 'merchant',
        select: 'businessName'
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

    const merchant = await Merchant.findById(merchantId);

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Check if user already reviewed this merchant
    const existingReview = await Review.findOne({
      user: req.user.id,
      merchant: merchantId
    });

    if (existingReview) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'You have already reviewed this merchant'
      });
    }

    // Handle image uploads if present
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await uploadToCloudinary(file.path, {
            folder: 'nairobi-verified/reviews',
            resource_type: 'image'
          });
          images.push({
            url: result.secure_url,
            publicId: result.public_id
          });
        } catch (uploadError) {
          console.error('Error uploading review image:', uploadError);
          // Continue without the image rather than failing the whole review
        }
      }
    }

    // Add images to review data
    if (images.length > 0) {
      req.body.images = images;
    }

    const review = await Review.create(req.body);

    // Populate the created review
    const populatedReview = await Review.findById(review._id)
      .populate({
        path: 'user',
        select: 'firstName lastName avatar'
      })
      .populate({
        path: 'merchant',
        select: 'businessName'
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
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Make sure review belongs to user
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Not authorized to update this review'
      });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate({
      path: 'user',
      select: 'firstName lastName avatar'
    }).populate({
      path: 'merchant',
      select: 'businessName'
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: review
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
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Not authorized to delete this review'
      });
    }

    // Use deleteOne instead of deprecated remove()
    await Review.findByIdAndDelete(req.params.id);

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
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Check if user is admin or merchant owner
    if (req.user.role !== 'admin') {
      const merchant = await Merchant.findOne({ _id: review.merchant, owner: req.user.id });
      if (!merchant) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Not authorized to reply to this review'
        });
      }
    }

    // Add reply
    review.reply = {
      author: 'Business Owner',
      content: req.body.content,
      date: new Date()
    };

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate({
        path: 'user',
        select: 'firstName lastName avatar'
      })
      .populate({
        path: 'merchant',
        select: 'businessName'
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
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Check if user already marked this review as helpful
    const alreadyMarked = review.helpfulBy.includes(req.user.id);

    if (alreadyMarked) {
      // Remove user from helpfulBy array
      review.helpfulBy = review.helpfulBy.filter(
        id => id.toString() !== req.user.id
      );
      review.helpful = Math.max(0, review.helpful - 1);
    } else {
      // Add user to helpfulBy array
      review.helpfulBy.push(req.user.id);
      review.helpful += 1;
    }

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate({
        path: 'user',
        select: 'firstName lastName avatar'
      })
      .populate({
        path: 'merchant',
        select: 'businessName'
      });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: updatedReview,
      message: alreadyMarked ? 'Removed helpful mark' : 'Marked as helpful'
    });
  } catch (error) {
    handleError(res, error, 'Failed to update helpful status', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};