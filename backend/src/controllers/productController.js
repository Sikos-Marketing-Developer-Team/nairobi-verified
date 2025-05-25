const Product = require('../models/Product');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadImage, uploadMultipleImages, deleteImage } = require('../config/cloudinary');

// Configure multer for temporary storage before Cloudinary upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/temp';
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

    // Process uploaded images with Cloudinary
    let cloudinaryImages = [];
    
    if (req.files && req.files.length > 0) {
      // Upload images to Cloudinary
      const uploadPromises = req.files.map(file => uploadImage(file.path, 'nairobi-verified/products'));
      const cloudinaryResults = await Promise.all(uploadPromises);
      
      // Format image data
      cloudinaryImages = cloudinaryResults.map((result, index) => ({
        url: result.secure_url,
        publicId: result.public_id,
        isMain: index === 0 // First image is the main image
      }));
      
      // Clean up temp files
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    // Create product
    const product = new Product({
      name,
      description,
      price,
      discountPrice: discountPrice || price,
      category,
      subcategory,
      images: cloudinaryImages,
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
      subcategory,
      merchant,
      minPrice,
      maxPrice,
      featured,
      search,
      tags,
      inStock,
      rating,
      status = 'active'
    } = req.query;

    // Build query
    const query = { status };
    
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (merchant) query.merchant = merchant;
    if (featured) query.featured = featured === 'true';
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Stock filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }
    
    // Rating filter
    if (rating) {
      query['ratings.average'] = { $gte: Number(rating) };
    }
    
    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }
    
    // Text search with score
    let searchOptions = {};
    if (search) {
      // Use text search for exact matches
      query.$text = { $search: search };
      searchOptions.score = { $meta: 'textScore' };
      
      // Execute query with pagination and text score sorting
      const products = await Product.find(query, searchOptions)
        .sort(search ? { score: { $meta: 'textScore' }, ...sort } : sort)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .populate('merchant', 'fullName companyName location isVerified');

      // Get total count for pagination
      const total = await Product.countDocuments(query);

      return res.status(200).json({
        success: true,
        count: products.length,
        total,
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        products
      });
    }

    // Regular query without text search
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
      // Upload new images to Cloudinary
      const uploadPromises = req.files.map(file => uploadImage(file.path, 'nairobi-verified/products'));
      const cloudinaryResults = await Promise.all(uploadPromises);
      
      // Format new image data
      const newImages = cloudinaryResults.map(result => ({
        url: result.secure_url,
        publicId: result.public_id,
        isMain: false
      }));
      
      // Add new images to existing ones
      product.images = [...product.images, ...newImages];
      
      // Clean up temp files
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
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
    
    // Handle image deletions if specified
    if (req.body.deleteImageIds) {
      const deleteImageIds = JSON.parse(req.body.deleteImageIds);
      
      // Delete images from Cloudinary
      for (const imageId of deleteImageIds) {
        const imageToDelete = product.images.find(img => img._id.toString() === imageId);
        if (imageToDelete && imageToDelete.publicId) {
          await deleteImage(imageToDelete.publicId);
        }
      }
      
      // Remove deleted images from product
      product.images = product.images.filter(img => !deleteImageIds.includes(img._id.toString()));
      
      // If main image was deleted, set first available image as main
      if (product.images.length > 0 && !product.images.some(img => img.isMain)) {
        product.images[0].isMain = true;
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
    
    // Delete images from Cloudinary
    for (const image of product.images) {
      if (image.publicId) {
        await deleteImage(image.publicId);
      }
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

// Advanced search functionality
const searchProducts = async (req, res) => {
  try {
    const { 
      query, 
      page = 1, 
      limit = 10,
      category,
      subcategory,
      minPrice,
      maxPrice,
      sortBy = 'relevance', // relevance, price_asc, price_desc, newest, rating
      inStock = 'true'
    } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Build search query
    const searchQuery = { status: 'active' };
    
    // Text search
    searchQuery.$text = { $search: query };
    
    // Additional filters
    if (category) searchQuery.category = category;
    if (subcategory) searchQuery.subcategory = subcategory;
    
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = Number(minPrice);
      if (maxPrice) searchQuery.price.$lte = Number(maxPrice);
    }
    
    if (inStock === 'true') {
      searchQuery.stock = { $gt: 0 };
    }
    
    // Determine sort order
    let sortOptions = {};
    
    switch (sortBy) {
      case 'relevance':
        sortOptions = { score: { $meta: 'textScore' } };
        break;
      case 'price_asc':
        sortOptions = { price: 1 };
        break;
      case 'price_desc':
        sortOptions = { price: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'rating':
        sortOptions = { 'ratings.average': -1 };
        break;
      default:
        sortOptions = { score: { $meta: 'textScore' } };
    }
    
    // Execute search with projection for text score
    const products = await Product.find(
      searchQuery,
      { score: { $meta: 'textScore' } }
    )
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('merchant', 'fullName companyName location isVerified');
    
    // Get total count for pagination
    const total = await Product.countDocuments(searchQuery);
    
    // Get related categories based on search results
    const categories = await Product.aggregate([
      { $match: searchQuery },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Get price range for the search results
    const priceRange = await Product.aggregate([
      { $match: searchQuery },
      { 
        $group: { 
          _id: null, 
          minPrice: { $min: '$price' }, 
          maxPrice: { $max: '$price' } 
        } 
      }
    ]);
    
    // Get related tags based on search results
    const relatedTags = await Product.aggregate([
      { $match: searchQuery },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      products,
      filters: {
        categories: categories.map(c => ({ name: c._id, count: c.count })),
        priceRange: priceRange.length > 0 ? priceRange[0] : { minPrice: 0, maxPrice: 0 },
        relatedTags: relatedTags.map(t => ({ name: t._id, count: t.count }))
      }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error searching products',
      error: error.message 
    });
  }
};

// Get product recommendations
const getProductRecommendations = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find the current product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Find similar products based on category, tags, and price range
    const similarProducts = await Product.find({
      _id: { $ne: productId }, // Exclude current product
      status: 'active',
      $or: [
        { category: product.category },
        { tags: { $in: product.tags } }
      ],
      price: { 
        $gte: product.price * 0.7, 
        $lte: product.price * 1.3 
      }
    })
    .limit(8)
    .populate('merchant', 'fullName companyName location isVerified');
    
    // If not enough similar products, add some featured products
    if (similarProducts.length < 8) {
      const featuredProducts = await Product.find({
        _id: { $ne: productId },
        status: 'active',
        featured: true,
        _id: { $nin: similarProducts.map(p => p._id) } // Exclude already found products
      })
      .limit(8 - similarProducts.length)
      .populate('merchant', 'fullName companyName location isVerified');
      
      similarProducts.push(...featuredProducts);
    }
    
    res.status(200).json({
      success: true,
      count: similarProducts.length,
      products: similarProducts
    });
  } catch (error) {
    console.error('Get product recommendations error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching product recommendations',
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
  getProductsByMerchant,
  searchProducts,
  getProductRecommendations
};