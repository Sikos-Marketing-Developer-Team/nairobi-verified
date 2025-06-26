const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Merchant = require('../models/Merchant');
const { protect } = require('../middleware/auth');

// Get all products with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      merchant,
      featured,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (merchant) filter.merchant = merchant;
    if (featured !== undefined) filter.featured = featured === 'true';
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const products = await Product.find(filter)
      .populate('merchant', 'businessName address rating reviewCount verified')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ 
      featured: true, 
      isActive: true 
    })
      .populate('merchant', 'businessName address rating reviewCount verified')
      .sort({ rating: -1, reviewCount: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured products'
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('merchant', 'businessName address phone email website socialMedia businessHours rating reviewCount verified');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Increment view count
    await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

// Get products by merchant
router.get('/merchant/:merchantId', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const products = await Product.find({ 
      merchant: req.params.merchantId,
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments({ 
      merchant: req.params.merchantId,
      isActive: true 
    });

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching merchant products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch merchant products'
    });
  }
});

// Create new product (merchant only)
router.post('/', protect, async (req, res) => {
  try {
    // Check if user is a merchant
    if (req.user.role !== 'merchant' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only merchants can create products'
      });
    }

    // Get merchant info
    let merchantId;
    if (req.user.role === 'merchant') {
      const merchant = await Merchant.findOne({ owner: req.user.id });
      if (!merchant) {
        return res.status(404).json({
          success: false,
          error: 'Merchant profile not found'
        });
      }
      merchantId = merchant._id;
    } else {
      // Admin can specify merchant
      merchantId = req.body.merchant;
    }

    const productData = {
      ...req.body,
      merchant: merchantId
    };

    const product = new Product(productData);
    await product.save();

    const populatedProduct = await Product.findById(product._id)
      .populate('merchant', 'businessName address rating reviewCount verified');

    res.status(201).json({
      success: true,
      data: populatedProduct
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
});

// Update product
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check permissions
    if (req.user.role === 'merchant') {
      const merchant = await Merchant.findOne({ owner: req.user.id });
      if (!merchant || !product.merchant.equals(merchant._id)) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this product'
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update products'
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('merchant', 'businessName address rating reviewCount verified');

    res.json({
      success: true,
      data: updatedProduct
    });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
});

// Delete product
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check permissions
    if (req.user.role === 'merchant') {
      const merchant = await Merchant.findOne({ owner: req.user.id });
      if (!merchant || !product.merchant.equals(merchant._id)) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this product'
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete products'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
});

// Get product categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    
    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

module.exports = router;