const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Beauty', 'Automotive', 'Food & Beverages'],
  },
  subcategory: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
    required: true,
  }],
  primaryImage: {
    type: String,
    required: true,
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
  },
  merchantName: {
    type: String,
    required: true,
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  soldQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  specifications: {
    type: Map,
    of: String,
  },
  weight: {
    type: Number,
    min: 0,
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  warranty: {
    type: String,
  },
  brand: {
    type: String,
    trim: true,
  },
  model: {
    type: String,
    trim: true,
  },
  condition: {
    type: String,
    enum: ['new', 'used', 'refurbished'],
    default: 'new',
  },
  views: {
    type: Number,
    default: 0,
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

// Indexes for efficient queries
// Optimizes queries for active products by category
productSchema.index({ category: 1, isActive: 1 });
// Optimizes queries for merchant-specific active products
productSchema.index({ merchant: 1, isActive: 1 });
// Optimizes queries for featured active products
productSchema.index({ featured: 1, isActive: 1 });
// Enables text search on name, description, and tags
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
// Optimizes price-based queries
productSchema.index({ price: 1 });
// Optimizes sorting by rating
productSchema.index({ rating: -1 });
// Optimizes sorting by creation date
productSchema.index({ createdAt: -1 });

// Virtual: Indicates if stock is available
productSchema.virtual('isInStock').get(function () {
  return this.stockQuantity > this.soldQuantity;
});

// Virtual: Calculates available stock quantity
productSchema.virtual('availableQuantity').get(function () {
  return Math.max(0, this.stockQuantity - this.soldQuantity);
});

// Virtual: Calculates discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

// Pre-save middleware to update the updatedAt field
productSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Ensure virtuals are included in JSON output
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Enable query debugging for profiling (uncomment to use)
// mongoose.set('debug', true);

module.exports = mongoose.model('Product', productSchema);