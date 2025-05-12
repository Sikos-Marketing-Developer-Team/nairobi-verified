const mongoose = require('mongoose');

const subscriptionPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Package name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Package description is required']
  },
  price: {
    type: Number,
    required: [true, 'Package price is required'],
    min: [0, 'Price cannot be negative']
  },
  duration: {
    type: Number,
    required: [true, 'Package duration is required'],
    min: [1, 'Duration must be at least 1 day']
  },
  durationUnit: {
    type: String,
    enum: ['day', 'week', 'month', 'year'],
    default: 'month'
  },
  features: [{
    type: String,
    required: true
  }],
  productLimit: {
    type: Number,
    required: true,
    min: [1, 'Product limit must be at least 1']
  },
  featuredProductsLimit: {
    type: Number,
    required: true,
    default: 0
  },
  priority: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Add index for active packages
subscriptionPackageSchema.index({ isActive: 1 });

module.exports = mongoose.model('SubscriptionPackage', subscriptionPackageSchema);