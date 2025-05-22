const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['Electronics', 'Fashion', 'Home & Living', 'Health & Beauty', 'Sports & Outdoors', 'Books & Media', 'Toys & Games', 'Automotive', 'Other']
  },
  subcategory: {
    type: String,
    trim: true
  },
  images: [
    {
      url: {
        type: String,
        required: true
      },
      isMain: {
        type: Boolean,
        default: false
      }
    }
  ],
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Merchant is required']
  },
  featured: {
    type: Boolean,
    default: false
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  tags: [String],
  specifications: [{
    name: String,
    value: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  }
}, { timestamps: true });

// Add index for search functionality
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);