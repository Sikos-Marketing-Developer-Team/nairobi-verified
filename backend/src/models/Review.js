const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  images: [{
    url: String,
    publicId: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  reportCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Ensure a user can only review a product once
reviewSchema.index({ user: 1, product: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, merchant: 1 }, { unique: true, sparse: true });

// Validate that either product or merchant is provided, but not both
reviewSchema.pre('validate', function(next) {
  if ((this.product && this.merchant) || (!this.product && !this.merchant)) {
    next(new Error('Review must be for either a product or a merchant, not both or neither'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Review', reviewSchema);