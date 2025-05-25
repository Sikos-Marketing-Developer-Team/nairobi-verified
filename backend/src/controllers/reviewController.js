const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
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
    cb(null, 'review-' + uniqueSuffix + path.extname(file.originalname));
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

// Check if user has purchased product
const hasUserPurchasedProduct = async (userId, productId) => {
  const orders = await Order.find({
    customer: userId,
    'items.product': productId,
    status: { $in: ['delivered', 'completed'] }
  });
  
  return orders.length > 0;
};

// Create a product review
const createProductReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, rating, title, comment } = req.body;
    
    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      user: userId,
      product: productId
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }
    
    // Check if user has purchased the product
    const isVerifiedPurchase = await hasUserPurchasedProduct(userId, productId);
    
    // Process uploaded images with Cloudinary
    let cloudinaryImages = [];
    
    if (req.files && req.files.length > 0) {
      try {
        // Upload images to Cloudinary
        const uploadPromises = req.files.map(file => uploadImage(file.path, 'nairobi-verified/reviews'));
        const cloudinaryResults = await Promise.all(uploadPromises);
        
        // Format image data
        cloudinaryImages = cloudinaryResults.map(result => ({
          url: result.secure_url,
          publicId: result.public_id
        }));
        
        // Clean up temp files
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      } catch (uploadError) {
        console.error('Error uploading review images to Cloudinary:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Error uploading review images',
          error: uploadError.message
        });
      }
    }
    
    // Create review
    const review = new Review({
      user: userId,
      product: productId,
      rating: Number(rating),
      title,
      comment,
      images: cloudinaryImages,
      isVerifiedPurchase,
      status: 'pending' // Reviews need approval
    });
    
    await review.save();
    
    // Update product ratings
    const allProductReviews = await Review.find({ 
      product: productId,
      status: 'approved'
    });
    
    const totalRatings = allProductReviews.length;
    const ratingSum = allProductReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRatings > 0 ? ratingSum / totalRatings : 0;
    
    product.ratings = {
      average: averageRating,
      count: totalRatings
    };
    
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully and pending approval',
      review
    });
  } catch (error) {
    console.error('Create product review error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating review',
      error: error.message 
    });
  }
};

// Create a merchant review
const createMerchantReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { merchantId, rating, title, comment } = req.body;
    
    // Validate merchant
    const merchant = await User.findById(merchantId);
    if (!merchant || merchant.role !== 'merchant') {
      return res.status(404).json({ 
        success: false,
        message: 'Merchant not found' 
      });
    }
    
    // Check if user has already reviewed this merchant
    const existingReview = await Review.findOne({
      user: userId,
      merchant: merchantId
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this merchant'
      });
    }
    
    // Check if user has purchased from this merchant
    const hasPurchased = await Order.exists({
      customer: userId,
      'items.merchant': merchantId,
      status: { $in: ['delivered', 'completed'] }
    });
    
    // Process uploaded images with Cloudinary
    let cloudinaryImages = [];
    
    if (req.files && req.files.length > 0) {
      try {
        // Upload images to Cloudinary
        const uploadPromises = req.files.map(file => uploadImage(file.path, 'nairobi-verified/reviews'));
        const cloudinaryResults = await Promise.all(uploadPromises);
        
        // Format image data
        cloudinaryImages = cloudinaryResults.map(result => ({
          url: result.secure_url,
          publicId: result.public_id
        }));
        
        // Clean up temp files
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      } catch (uploadError) {
        console.error('Error uploading review images to Cloudinary:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Error uploading review images',
          error: uploadError.message
        });
      }
    }
    
    // Create review
    const review = new Review({
      user: userId,
      merchant: merchantId,
      rating: Number(rating),
      title,
      comment,
      images: cloudinaryImages,
      isVerifiedPurchase: hasPurchased,
      status: 'pending' // Reviews need approval
    });
    
    await review.save();
    
    res.status(201).json({
      success: true,
      message: 'Merchant review submitted successfully and pending approval',
      review
    });
  } catch (error) {
    console.error('Create merchant review error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating merchant review',
      error: error.message 
    });
  }
};

// Get product reviews
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    
    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    // Get approved reviews with pagination
    const reviews = await Review.find({ 
      product: productId,
      status: 'approved'
    })
    .sort(sort)
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .populate('user', 'fullName');
    
    // Get total count
    const total = await Review.countDocuments({ 
      product: productId,
      status: 'approved'
    });
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      reviews
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching product reviews',
      error: error.message 
    });
  }
};

// Get merchant reviews
const getMerchantReviews = async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    
    // Validate merchant
    const merchant = await User.findById(merchantId);
    if (!merchant || merchant.role !== 'merchant') {
      return res.status(404).json({ 
        success: false,
        message: 'Merchant not found' 
      });
    }
    
    // Get approved reviews with pagination
    const reviews = await Review.find({ 
      merchant: merchantId,
      status: 'approved'
    })
    .sort(sort)
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .populate('user', 'fullName');
    
    // Get total count
    const total = await Review.countDocuments({ 
      merchant: merchantId,
      status: 'approved'
    });
    
    // Calculate average rating
    const allReviews = await Review.find({ 
      merchant: merchantId,
      status: 'approved'
    });
    
    const totalRatings = allReviews.length;
    const ratingSum = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRatings > 0 ? ratingSum / totalRatings : 0;
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      averageRating,
      totalRatings,
      reviews
    });
  } catch (error) {
    console.error('Get merchant reviews error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching merchant reviews',
      error: error.message 
    });
  }
};

// Get pending reviews (admin only)
const getPendingReviews = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only administrators can access pending reviews' 
      });
    }
    
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    
    // Get pending reviews with pagination
    const reviews = await Review.find({ status: 'pending' })
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('user', 'fullName')
      .populate('product', 'name')
      .populate('merchant', 'companyName');
    
    // Get total count
    const total = await Review.countDocuments({ status: 'pending' });
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      reviews
    });
  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching pending reviews',
      error: error.message 
    });
  }
};

// Approve or reject review (admin only)
const moderateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only administrators can moderate reviews' 
      });
    }
    
    // Validate status
    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected"'
      });
    }
    
    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ 
        success: false,
        message: 'Review not found' 
      });
    }
    
    // Update status
    review.status = status;
    await review.save();
    
    // If approved and it's a product review, update product ratings
    if (status === 'approved' && review.product) {
      const allProductReviews = await Review.find({ 
        product: review.product,
        status: 'approved'
      });
      
      const totalRatings = allProductReviews.length;
      const ratingSum = allProductReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRatings > 0 ? ratingSum / totalRatings : 0;
      
      await Product.findByIdAndUpdate(review.product, {
        'ratings.average': averageRating,
        'ratings.count': totalRatings
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Review ${status}`,
      review
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error moderating review',
      error: error.message 
    });
  }
};

module.exports = {
  upload,
  createProductReview,
  createMerchantReview,
  getProductReviews,
  getMerchantReviews,
  getPendingReviews,
  moderateReview
};