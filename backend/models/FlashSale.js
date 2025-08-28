const mongoose = require('mongoose');
const { TIME, DEFAULT_MAX_QUANTITY_PER_USER } = require('../config/constants');

const flashSaleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  products: [{
    productId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    salePrice: {
      type: Number,
      required: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    merchant: {
      type: String,
      required: true,
    },
    merchantId: {
      type: String,
      required: true,
    },
    stockQuantity: {
      type: Number,
      default: 0,
    },
    soldQuantity: {
      type: Number,
      default: 0,
    },
    maxQuantityPerUser: {
      type: Number,
      default: DEFAULT_MAX_QUANTITY_PER_USER,
    },
  }],
  totalViews: {
    type: Number,
    default: 0,
  },
  totalSales: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
// Optimizes queries for active sales by date range
flashSaleSchema.index({ startDate: 1, endDate: 1, isActive: 1 });
// Optimizes sorting by creation date
flashSaleSchema.index({ createdAt: -1 });

// Virtual: Indicates if sale is currently active
flashSaleSchema.virtual('isCurrentlyActive').get(function () {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
});

// Method: Calculates time remaining until sale ends
flashSaleSchema.methods.getTimeRemaining = function () {
  const now = new Date();
  const endTime = new Date(this.endDate);
  const timeRemaining = endTime - now;

  if (timeRemaining <= 0) {
    return { expired: true };
  }

  return {
    days: Math.floor(timeRemaining / TIME.DAY),
    hours: Math.floor((timeRemaining % TIME.DAY) / TIME.HOUR),
    minutes: Math.floor((timeRemaining % TIME.HOUR) / TIME.MINUTE),
    seconds: Math.floor((timeRemaining % TIME.MINUTE) / TIME.SECOND),
    expired: false,
  };
};

// Pre-save middleware to update the updatedAt field
flashSaleSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('FlashSale', flashSaleSchema);