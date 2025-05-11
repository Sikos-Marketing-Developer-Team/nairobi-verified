const Product = require('../models/Product');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for product image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/products';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'));
    }
  }
});

// Create a new product
const createProduct = async (req, res) => {
  try {
    const { 
      name, description, price, discountPrice, 
      category, subcategory, stock, featured, 
      tags, specifications, status 
    } = req.body;

    // Validate merchant
    const merchantId = req.user._id;
    const merchant = await User.findById(merchantId);
    
    if (!merchant || merchant.role !== 'merchant') {
      return res.status(403).json({ message: 'Only verified merchants can create products' });
    }

    // Process uploaded images
    const images = req.files.map((file, index) => ({
      url: file.path,
      isMain: index === 0 // First image is the main image
    }));

    // Create product
    const product = new Product({
      name,
      description,
      price,
      discountPrice: discountPrice || price,
      category,
      subcategory,
      images,
      stock,
      merchant: merchantId,
      featured: featured || false,
      tags: tags ? JSON.parse(tags) : [],
      specifications: specifications ? JSON.parse(specifications) : [],
      status: status || 'active'
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating product',
      error: error.message 
    });
  }
};

// Get all products with filtering, sorting and pagination
const getProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-createdAt', 
      category, 
      merchant,
      minPrice,
      maxPrice,
      featured,
      search,
      status = 'active'
    } = req.query;

    // Build query
    const query = { status };
    
    if (category) query.category = category;
    if (merchant) query.merchant = merchant;
    if (featured) query.featured = featured === 'true';
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const products = await Product.find(query)
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('merchant', 'fullName companyName location isVerified');

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching products',
      error: error.message 
    });
  }
};

// Get a single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('merchant', 'fullName companyName location isVerified');
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching product',
      error: error.message 
    });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const merchantId = req.user._id;
    
    // Find product and check ownership
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    // Check if user is the merchant who created the product or an admin
    if (product.merchant.toString() !== merchantId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'You are not authorized to update this product' 
      });
    }
    
    // Update product fields
    const { 
      name, description, price, discountPrice, 
      category, subcategory, stock, featured, 
      tags, specifications, status 
    } = req.body;
    
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (discountPrice) product.discountPrice = discountPrice;
    if (category) product.category = category;
    if (subcategory) product.subcategory = subcategory;
    if (stock !== undefined) product.stock = stock;
    if (featured !== undefined) product.featured = featured;
    if (tags) product.tags = JSON.parse(tags);
    if (specifications) product.specifications = JSON.parse(specifications);
    if (status) product.status = status;
    
    // Process new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: file.path,
        isMain: false
      }));
      
      // Add new images to existing ones
      product.images = [...product.images, ...newImages];
    }
    
    // Update main image if specified
    if (req.body.mainImageIndex !== undefined) {
      const index = Number(req.body.mainImageIndex);
      
      if (index >= 0 && index < product.images.length) {
        // Reset all images to non-main
        product.images.forEach(img => img.isMain = false);
        
        // Set the specified image as main
        product.images[index].isMain = true;
      }
    }
    
    await product.save();
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating product',
      error: error.message 
    });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const merchantId = req.user._id;
    
    // Find product and check ownership
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    // Check if user is the merchant who created the product or an admin
    if (product.merchant.toString() !== merchantId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'You are not authorized to delete this product' 
      });
    }
    
    // Delete product
    await Product.findByIdAndDelete(productId);
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting product',
      error: error.message 
    });
  }
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const featuredProducts = await Product.find({ 
      featured: true,
      status: 'active'
    })
    .sort('-createdAt')
    .limit(Number(limit))
    .populate('merchant', 'fullName companyName location isVerified');
    
    res.status(200).json({
      success: true,
      count: featuredProducts.length,
      products: featuredProducts
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching featured products',
      error: error.message 
    });
  }
};

// Get products by merchant
const getProductsByMerchant = async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    
    // Verify merchant exists
    const merchant = await User.findById(merchantId);
    if (!merchant || merchant.role !== 'merchant') {
      return res.status(404).json({ 
        success: false,
        message: 'Merchant not found' 
      });
    }
    
    // Get products
    const products = await Product.find({ 
      merchant: merchantId,
      status: 'active'
    })
    .sort(sort)
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));
    
    // Get total count
    const total = await Product.countDocuments({ 
      merchant: merchantId,
      status: 'active'
    });
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      merchantName: merchant.companyName || merchant.fullName,
      products
    });
  } catch (error) {
    console.error('Get merchant products error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching merchant products',
      error: error.message 
    });
  }
};

module.exports = {
  upload,
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByMerchant
};