const Merchant = require('../models/Merchant');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { HTTP_STATUS } = require('../config/constants');
const cloudinary = require('cloudinary').v2;

// ==================== DASHBOARD OVERVIEW ====================

/**
 * @desc    Get merchant dashboard overview
 * @route   GET /api/merchants/dashboard/overview
 * @access  Private/Merchant
 */
exports.getDashboardOverview = async (req, res) => {
  try {
    const merchantId = req.user._id;

    const merchant = await Merchant.findById(merchantId)
      .select('businessName email phone verified featured rating reviews profileCompleteness documentsCompleteness createdAt verifiedDate logo banner')
      .lean();

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Get verification status
    const verificationStatus = {
      isVerified: merchant.verified,
      isFeatured: merchant.featured || false,
      verificationLevel: merchant.verified ? (merchant.featured ? 'Premium' : 'Standard') : 'Basic',
      verificationBadge: merchant.verified ? 'Verified Business' : 'Pending Verification',
      statusMessage: merchant.verified 
        ? 'Your business is verified and visible to customers' 
        : 'Complete your profile and upload documents to get verified',
      verifiedDate: merchant.verifiedDate || null
    };

    // Get profile completion
    const profileCompletion = {
      percentage: merchant.profileCompleteness || 0,
      documentsPercentage: merchant.documentsCompleteness || 0,
      nextSteps: []
    };

    if (merchant.profileCompleteness < 100) {
      profileCompletion.nextSteps.push('Complete your business profile');
    }
    if (merchant.documentsCompleteness < 100) {
      profileCompletion.nextSteps.push('Upload verification documents');
    }
    if (!merchant.verified && merchant.documentsCompleteness === 100) {
      profileCompletion.nextSteps.push('Documents under review');
    }

    // Get quick stats
    const [reviewCount, productCount] = await Promise.all([
      Review.countDocuments({ merchant: merchantId }),
      Product.countDocuments({ merchant: merchantId })
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        merchant: {
          id: merchant._id,
          businessName: merchant.businessName,
          email: merchant.email,
          phone: merchant.phone,
          rating: merchant.rating || 0,
          totalReviews: reviewCount,
          totalProducts: productCount,
          memberSince: merchant.createdAt,
          logo: merchant.logo,
          banner: merchant.banner
        },
        verificationStatus,
        profileCompletion
      }
    });

  } catch (error) {
    console.error('getDashboardOverview error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch dashboard overview'
    });
  }
};

/**
 * @desc    Get merchant performance analytics
 * @route   GET /api/merchants/dashboard/analytics
 * @access  Private/Merchant
 */
exports.getPerformanceAnalytics = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalReviews, recentReviews, averageRating] = await Promise.all([
      Review.countDocuments({ merchant: merchantId }),
      Review.countDocuments({ merchant: merchantId, createdAt: { $gte: startDate } }),
      Review.aggregate([
        { $match: { merchant: merchantId } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ])
    ]);

    const [totalProducts, activeProducts] = await Promise.all([
      Product.countDocuments({ merchant: merchantId }),
      Product.countDocuments({ merchant: merchantId, available: true })
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        period: `${days} days`,
        reviews: {
          total: totalReviews,
          recent: recentReviews,
          averageRating: averageRating[0]?.avgRating || 0
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          inactive: totalProducts - activeProducts
        }
      }
    });
  } catch (error) {
    console.error('getPerformanceAnalytics error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch performance analytics'
    });
  }
};

/**
 * @desc    Get recent activity
 * @route   GET /api/merchants/dashboard/activity
 * @access  Private/Merchant
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    const [recentReviews, recentProducts] = await Promise.all([
      Review.find({ merchant: merchantId })
        .sort('-createdAt')
        .limit(5)
        .select('rating comment userName createdAt')
        .lean(),
      Product.find({ merchant: merchantId })
        .sort('-createdAt')
        .limit(5)
        .select('name createdAt')
        .lean()
    ]);

    const activities = [
      ...recentReviews.map(r => ({
        type: 'review',
        description: `New ${r.rating}-star review from ${r.userName}`,
        timestamp: r.createdAt,
        data: r
      })),
      ...recentProducts.map(p => ({
        type: 'product',
        description: `Added new product: ${p.name}`,
        timestamp: p.createdAt,
        data: p
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('getRecentActivity error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch recent activity'
    });
  }
};

/**
 * @desc    Get notifications
 * @route   GET /api/merchants/dashboard/notifications
 * @access  Private/Merchant
 */
exports.getNotifications = async (req, res) => {
  try {
    const merchantId = req.user._id;
    
    const unreadReviews = await Review.countDocuments({
      merchant: merchantId,
      merchantResponse: { $exists: false }
    });

    const notifications = [];
    
    if (unreadReviews > 0) {
      notifications.push({
        id: 'new-reviews',
        type: 'review',
        title: `You have ${unreadReviews} new review${unreadReviews > 1 ? 's' : ''} to respond to`,
        timestamp: new Date(),
        read: false
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('getNotifications error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
};

/**
 * @desc    Get quick actions
 * @route   GET /api/merchants/dashboard/quick-actions
 * @access  Private/Merchant
 */
exports.getQuickActions = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const merchant = await Merchant.findById(merchantId).select('verified');

    const quickActions = [
      {
        id: 'edit-profile',
        label: 'Edit Profile',
        icon: 'edit',
        link: '/merchant/profile',
        enabled: true
      },
      {
        id: 'add-product',
        label: 'Add Product',
        icon: 'plus',
        link: '/merchant/products/new',
        enabled: true
      },
      {
        id: 'view-public-profile',
        label: 'View Public Profile',
        icon: 'eye',
        link: `/merchant/${merchantId}`,
        enabled: merchant.verified
      },
      {
        id: 'manage-reviews',
        label: 'Manage Reviews',
        icon: 'message',
        link: '/merchant/reviews',
        enabled: true
      }
    ];

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: quickActions
    });
  } catch (error) {
    console.error('getQuickActions error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch quick actions'
    });
  }
};

// ==================== BUSINESS PROFILE MANAGEMENT ====================

exports.getBusinessProfile = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const merchant = await Merchant.findById(merchantId).select('-password').lean();
    
    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({ success: true, data: merchant });
  } catch (error) {
    console.error('getBusinessProfile error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch business profile'
    });
  }
};

exports.updateBusinessProfile = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const allowedUpdates = [
      'businessName', 'description', 'businessType', 'phone', 'whatsappNumber',
      'email', 'website', 'address', 'location', 'landmark', 'yearEstablished'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const merchant = await Merchant.findByIdAndUpdate(
      merchantId,
      updates,
      { new: true, runValidators: true }
    );

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Profile updated successfully',
      data: merchant
    });
  } catch (error) {
    console.error('updateBusinessProfile error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};

exports.updateBusinessHours = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { businessHours } = req.body;

    const merchant = await Merchant.findByIdAndUpdate(
      merchantId,
      { businessHours },
      { new: true, runValidators: true }
    );

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Business hours updated successfully',
      data: merchant.businessHours
    });
  } catch (error) {
    console.error('updateBusinessHours error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to update business hours'
    });
  }
};

exports.updateSocialLinks = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { socialLinks } = req.body;

    const merchant = await Merchant.findByIdAndUpdate(
      merchantId,
      { socialLinks },
      { new: true, runValidators: true }
    );

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Social links updated successfully',
      data: merchant.socialLinks
    });
  } catch (error) {
    console.error('updateSocialLinks error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to update social links'
    });
  }
};

exports.uploadBusinessLogo = async (req, res) => {
  try {
    const merchantId = req.user._id;

    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'No logo file provided'
      });
    }

    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Delete old logo if exists
    if (merchant.logo && merchant.logo.includes('cloudinary')) {
      const publicId = merchant.logo.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(`nairobi-verified/merchants/${publicId}`);
      } catch (err) {
        console.warn('Failed to delete old logo:', err);
      }
    }

    merchant.logo = req.file.path;
    await merchant.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Logo uploaded successfully',
      data: { logo: merchant.logo }
    });
  } catch (error) {
    console.error('uploadBusinessLogo error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to upload logo'
    });
  }
};

exports.uploadBusinessBanner = async (req, res) => {
  try {
    const merchantId = req.user._id;

    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'No banner file provided'
      });
    }

    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Delete old banner if exists
    if (merchant.bannerImage && merchant.bannerImage.includes('cloudinary')) {
      const publicId = merchant.bannerImage.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(`nairobi-verified/merchants/${publicId}`);
      } catch (err) {
        console.warn('Failed to delete old banner:', err);
      }
    }

    merchant.bannerImage = req.file.path;
    await merchant.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Banner uploaded successfully',
      data: { banner: merchant.bannerImage }
    });
  } catch (error) {
    console.error('uploadBusinessBanner error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to upload banner'
    });
  }
};

// ==================== PHOTO GALLERY MANAGEMENT ====================

exports.getPhotoGallery = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const merchant = await Merchant.findById(merchantId).select('gallery').lean();
    
    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Transform gallery array to objects that match frontend expectations
    const galleryPhotos = (merchant.gallery || []).map((url, index) => ({
      _id: `photo-${index}-${Date.now()}`,
      url: url,
      caption: '',
      featured: index === 0, // First photo is featured by default
      order: index,
      uploadedAt: new Date().toISOString()
    }));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: galleryPhotos
    });
  } catch (error) {
    console.error('getPhotoGallery error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch photo gallery'
    });
  }
};

exports.uploadPhotos = async (req, res) => {
  try {
    const merchantId = req.user._id;
    
    console.log('📸 Photo upload request received');
    console.log('Merchant ID:', merchantId);
    console.log('Files received:', req.files?.length || 0);

    if (!req.files || req.files.length === 0) {
      console.log('❌ No files in request');
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'No photos provided'
      });
    }

    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      console.log('❌ Merchant not found:', merchantId);
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    if (!merchant.gallery) {
      merchant.gallery = [];
    }

    // Log Cloudinary upload details
    console.log('📤 Files uploaded to Cloudinary:');
    req.files.forEach((file, index) => {
      console.log(`  [${index + 1}] ${file.originalname}`);
      console.log(`      URL: ${file.path}`);
      console.log(`      Public ID: ${file.filename}`);
      console.log(`      Size: ${(file.size / 1024).toFixed(2)} KB`);
    });

    const newPhotos = req.files.map(file => file.path);
    merchant.gallery.push(...newPhotos);
    await merchant.save();

    console.log('✅ Gallery updated. Total photos:', merchant.gallery.length);

    // Transform to match frontend expectations
    const uploadedPhotos = newPhotos.map((url, index) => ({
      _id: `photo-${merchant.gallery.length - newPhotos.length + index}-${Date.now()}`,
      url: url,
      caption: '',
      featured: false,
      order: merchant.gallery.length - newPhotos.length + index,
      uploadedAt: new Date().toISOString()
    }));

    console.log('✅ Responding with', uploadedPhotos.length, 'photos');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `${newPhotos.length} photo(s) uploaded successfully`,
      data: uploadedPhotos
    });
  } catch (error) {
    console.error('❌ uploadPhotos error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to upload photos'
    });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { photoId } = req.params;

    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    const photoIndex = parseInt(photoId);
    if (photoIndex < 0 || photoIndex >= merchant.gallery.length) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Photo not found'
      });
    }

    const photoUrl = merchant.gallery[photoIndex];
    
    // Delete from Cloudinary
    if (photoUrl && photoUrl.includes('cloudinary')) {
      const publicId = photoUrl.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(`nairobi-verified/merchants/${publicId}`);
      } catch (err) {
        console.warn('Failed to delete photo from Cloudinary:', err);
      }
    }

    merchant.gallery.splice(photoIndex, 1);
    await merchant.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('deletePhoto error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to delete photo'
    });
  }
};

exports.reorderPhotos = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { photoUrls } = req.body;

    if (!Array.isArray(photoUrls)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'photoUrls must be an array'
      });
    }

    const merchant = await Merchant.findByIdAndUpdate(
      merchantId,
      { gallery: photoUrls },
      { new: true }
    );

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Photos reordered successfully',
      data: merchant.gallery
    });
  } catch (error) {
    console.error('reorderPhotos error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to reorder photos'
    });
  }
};

exports.setFeaturedPhoto = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { photoId } = req.params;

    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    const photoIndex = parseInt(photoId);
    if (photoIndex < 0 || photoIndex >= merchant.gallery.length) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Photo not found'
      });
    }

    // Move photo to first position
    const [photo] = merchant.gallery.splice(photoIndex, 1);
    merchant.gallery.unshift(photo);
    await merchant.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Featured photo updated successfully',
      data: merchant.gallery
    });
  } catch (error) {
    console.error('setFeaturedPhoto error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to set featured photo'
    });
  }
};

// ==================== PRODUCT/SERVICE MANAGEMENT ====================

exports.getProducts = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { category, available, sort = '-createdAt' } = req.query;

    const query = { merchant: merchantId };
    if (category) query.category = category;
    if (available !== undefined) query.isActive = available === 'true';

    const products = await Product.find(query).sort(sort).lean();

    // Map isActive to available for frontend compatibility
    const mappedProducts = products.map(product => ({
      ...product,
      available: product.isActive
    }));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: mappedProducts.length,
      data: mappedProducts
    });
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { productId } = req.params;

    const product = await Product.findOne({ _id: productId, merchant: merchantId }).lean();

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('getProductById error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    console.log('📦 Creating product for merchant:', req.user._id);
    console.log('📥 Request body:', req.body);

    const merchantId = req.user._id;

    // Validate required fields
    if (!req.body.name || !req.body.category || !req.body.description) {
      console.log('❌ Missing required fields');
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Missing required fields: name, category, and description are required'
      });
    }

    // Get merchant details
    const merchant = await Merchant.findById(merchantId).select('businessName');
    
    if (!merchant) {
      console.log('❌ Merchant not found');
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant profile not found'
      });
    }

    // Prepare product data
    const productData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price || 0,
      originalPrice: req.body.originalPrice || req.body.price || 0,
      subcategory: req.body.subcategory || 'General',
      merchant: merchantId,
      merchantName: merchant.businessName,
      images: Array.isArray(req.body.images) ? req.body.images : [],
      primaryImage: req.body.primaryImage || (req.body.images && req.body.images[0]) || '/placeholder-product.jpg',
      stockQuantity: req.body.stockQuantity || 0,
      featured: req.body.featured || false,
      isActive: req.body.available !== undefined ? req.body.available : true,
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      brand: req.body.brand || merchant.businessName
    };

    console.log('💾 Creating product with data:', productData);
    
    const product = await Product.create(productData);
    console.log('✅ Product created:', product._id);

    // Populate and return
    const populatedProduct = await Product.findById(product._id)
      .populate('merchant', 'businessName address')
      .lean();

    // CRITICAL: Explicitly set content-type and disable transform
    res.set('Content-Type', 'application/json');
    res.set('X-No-Transform', '1');
    
    // Create response object
    const responseData = {
      success: true,
      message: 'Product created successfully',
      data: {
        ...populatedProduct,
        available: populatedProduct.isActive
      }
    };

    console.log('📤 Sending response:', JSON.stringify(responseData).substring(0, 200));
    
    // Return response explicitly
    return res.status(HTTP_STATUS.CREATED).json(responseData);

  } catch (error) {
    console.error('❌ createProduct error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: messages[0] || 'Validation failed'
      });
    }
    
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || 'Failed to create product'
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { productId } = req.params;

    // Map frontend 'available' to backend 'isActive'
    const updateData = { ...req.body };
    if (updateData.available !== undefined) {
      updateData.isActive = updateData.available;
      delete updateData.available;
    }

    const product = await Product.findOneAndUpdate(
      { _id: productId, merchant: merchantId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('updateProduct error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to update product'
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { productId } = req.params;

    const product = await Product.findOneAndDelete({
      _id: productId,
      merchant: merchantId
    });

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('deleteProduct error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
};

exports.toggleProductAvailability = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { productId } = req.params;
    const { available } = req.body;

    const product = await Product.findOneAndUpdate(
      { _id: productId, merchant: merchantId },
      { isActive: available },
      { new: true }
    );

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Product ${available ? 'activated' : 'deactivated'} successfully`,
      data: {
        ...product.toObject(),
        available: product.isActive
      }
    });
  } catch (error) {
    console.error('toggleProductAvailability error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to toggle product availability'
    });
  }
};

exports.uploadProductImages = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { productId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'No images provided'
      });
    }

    const product = await Product.findOne({ _id: productId, merchant: merchantId });

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (!product.images) {
      product.images = [];
    }

    const newImages = req.files.map(file => file.path);
    product.images.push(...newImages);
    await product.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `${newImages.length} image(s) uploaded successfully`,
      data: newImages
    });
  } catch (error) {
    console.error('uploadProductImages error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to upload product images'
    });
  }
};

exports.deleteProductImage = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { productId, imageId } = req.params;

    const product = await Product.findOne({ _id: productId, merchant: merchantId });

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Product not found'
      });
    }

    const imageIndex = parseInt(imageId);
    if (imageIndex < 0 || imageIndex >= product.images.length) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Image not found'
      });
    }

    const imageUrl = product.images[imageIndex];
    
    // Delete from Cloudinary
    if (imageUrl && imageUrl.includes('cloudinary')) {
      const publicId = imageUrl.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(`nairobi-verified/products/${publicId}`);
      } catch (err) {
        console.warn('Failed to delete image from Cloudinary:', err);
      }
    }

    product.images.splice(imageIndex, 1);
    await product.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('deleteProductImage error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to delete product image'
    });
  }
};

// ==================== REVIEW MANAGEMENT ====================

exports.getMerchantReviews = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { page = 1, limit = 10, responded } = req.query;

    const query = { merchant: merchantId };
    if (responded !== undefined) {
      query.merchantResponse = responded === 'true' ? { $exists: true } : { $exists: false };
    }

    const reviews = await Review.find(query)
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name')
      .lean();

    const total = await Review.countDocuments(query);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: reviews
    });
  } catch (error) {
    console.error('getMerchantReviews error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch reviews'
    });
  }
};

exports.respondToReview = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { reviewId } = req.params;
    const { response } = req.body;

    if (!response || response.trim().length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Response text is required'
      });
    }

    const review = await Review.findOne({ _id: reviewId, merchant: merchantId });

    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Review not found'
      });
    }

    review.merchantResponse = {
      text: response,
      respondedAt: new Date()
    };

    await review.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Response added successfully',
      data: review
    });
  } catch (error) {
    console.error('respondToReview error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to respond to review'
    });
  }
};

exports.flagReview = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { reviewId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Flag reason is required'
      });
    }

    const review = await Review.findOne({ _id: reviewId, merchant: merchantId });

    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Review not found'
      });
    }

    review.flagged = true;
    review.flagReason = reason;
    review.flaggedAt = new Date();

    await review.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Review flagged successfully. Our team will review it.',
      data: review
    });
  } catch (error) {
    console.error('flagReview error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to flag review'
    });
  }
};

exports.getReviewStats = async (req, res) => {
  try {
    const merchantId = req.user._id;

    const stats = await Review.aggregate([
      { $match: { merchant: merchantId } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          fiveStars: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStars: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStars: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ]);

    const responded = await Review.countDocuments({
      merchant: merchantId,
      merchantResponse: { $exists: true }
    });

    const result = stats[0] || {
      totalReviews: 0,
      averageRating: 0,
      fiveStars: 0,
      fourStars: 0,
      threeStars: 0,
      twoStars: 0,
      oneStar: 0
    };

    result.respondedCount = responded;
    result.responseRate = result.totalReviews > 0 
      ? ((responded / result.totalReviews) * 100).toFixed(1) 
      : 0;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('getReviewStats error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch review statistics'
    });
  }
};

// ==================== VERIFICATION STATUS ====================

exports.getVerificationStatus = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const merchant = await Merchant.findById(merchantId)
      .select('verified featured verifiedDate documents profileCompleteness documentsCompleteness')
      .lean();

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    const status = {
      isVerified: merchant.verified,
      isFeatured: merchant.featured || false,
      verificationLevel: merchant.verified ? (merchant.featured ? 'Premium' : 'Standard') : 'Basic',
      verifiedDate: merchant.verifiedDate || null,
      profileCompleteness: merchant.profileCompleteness || 0,
      documentsCompleteness: merchant.documentsCompleteness || 0,
      documents: merchant.documents || {},
      documentReviewStatus: merchant.documents?.documentReviewStatus || 'pending',
      verificationNotes: merchant.documents?.verificationNotes || null
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('getVerificationStatus error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch verification status'
    });
  }
};

exports.requestVerification = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const merchant = await Merchant.findById(merchantId);

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    if (!merchant.documents || merchant.documentsCompleteness < 100) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Please upload all required documents before requesting verification'
      });
    }

    if (!merchant.documents.documentReviewStatus || merchant.documents.documentReviewStatus === 'pending') {
      merchant.documents.documentReviewStatus = 'under_review';
      merchant.documents.documentsSubmittedAt = new Date();
      await merchant.save();
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Verification request submitted. Our team will review your documents within 2-3 business days.',
      data: {
        status: merchant.documents.documentReviewStatus,
        submittedAt: merchant.documents.documentsSubmittedAt
      }
    });
  } catch (error) {
    console.error('requestVerification error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to request verification'
    });
  }
};

exports.uploadVerificationDocuments = async (req, res) => {
  try {
    const merchantId = req.user._id;

    console.log('📎 Document upload request received');
    console.log('Merchant ID:', merchantId);
    console.log('Files received:', req.files);
    console.log('Body:', req.body);

    if (!req.files || req.files.length === 0) {
      console.log('❌ No files found in request');
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'No documents provided'
      });
    }

    const merchant = await Merchant.findById(merchantId);

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    if (!merchant.documents) {
      merchant.documents = {};
    }

    const uploadedDocs = {};

    // Process each uploaded file
    for (const file of req.files) {
      const docType = file.fieldname; // businessRegistration, idDocument, or utilityBill
      
      console.log(`📄 Processing ${docType}:`, {
        originalName: file.originalname,
        path: file.path,
        filename: file.filename
      });

      const docData = {
        cloudinaryUrl: file.path,
        publicId: file.filename,
        originalName: file.originalname,
        uploadedAt: new Date(),
        fileSize: file.size,
        mimeType: file.mimetype
      };

      if (docType === 'businessRegistration') {
        merchant.documents.businessRegistration = docData;
        uploadedDocs.businessRegistration = true;
      } else if (docType === 'idDocument') {
        merchant.documents.idDocument = docData;
        uploadedDocs.idDocument = true;
      } else if (docType === 'utilityBill') {
        merchant.documents.utilityBill = docData;
        uploadedDocs.utilityBill = true;
      } else if (docType === 'additionalDocs') {
        if (!merchant.documents.additionalDocs) {
          merchant.documents.additionalDocs = [];
        }
        merchant.documents.additionalDocs.push(docData);
        uploadedDocs.additionalDocs = (uploadedDocs.additionalDocs || 0) + 1;
      }
    }

    // Calculate documents completeness
    const requiredDocs = ['businessRegistration', 'idDocument', 'utilityBill'];
    const completedDocs = requiredDocs.filter(doc => 
      merchant.documents[doc] && 
      (merchant.documents[doc].cloudinaryUrl || merchant.documents[doc].path)
    ).length;
    
    merchant.documentsCompleteness = Math.round((completedDocs / requiredDocs.length) * 100);

    // If all documents are uploaded, set status to pending review
    if (merchant.documentsCompleteness === 100 && 
        (!merchant.documents.documentReviewStatus || merchant.documents.documentReviewStatus === 'pending')) {
      merchant.documents.documentReviewStatus = 'pending';
      merchant.documents.documentsSubmittedAt = new Date();
    }

    await merchant.save();

    console.log('✅ Documents saved successfully');
    console.log('Documents completeness:', merchant.documentsCompleteness + '%');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Documents uploaded successfully',
      data: {
        uploadedDocs,
        documentsCompleteness: merchant.documentsCompleteness,
        canRequestVerification: merchant.documentsCompleteness === 100
      }
    });
  } catch (error) {
    console.error('❌ uploadVerificationDocuments error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || 'Failed to upload documents'
    });
  }
};

exports.getVerificationHistory = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const merchant = await Merchant.findById(merchantId)
      .select('verified verifiedDate documents.documentsSubmittedAt documents.documentsReviewedAt documents.documentReviewStatus documents.verificationNotes createdAt')
      .lean();

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    const history = [
      {
        event: 'Account Created',
        date: merchant.createdAt || null,
        status: 'completed'
      }
    ];

    if (merchant.documents?.documentsSubmittedAt) {
      history.push({
        event: 'Documents Submitted',
        date: merchant.documents.documentsSubmittedAt,
        status: 'completed'
      });
    }

    if (merchant.documents?.documentsReviewedAt) {
      history.push({
        event: 'Documents Reviewed',
        date: merchant.documents.documentsReviewedAt,
        status: merchant.verified ? 'approved' : 'rejected',
        notes: merchant.documents.verificationNotes
      });
    }

    if (merchant.verified && merchant.verifiedDate) {
      history.push({
        event: 'Verification Approved',
        date: merchant.verifiedDate,
        status: 'completed'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('getVerificationHistory error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch verification history'
    });
  }
};

// ==================== CUSTOMER ENGAGEMENT ====================

exports.getEngagementStats = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const merchant = await Merchant.findById(merchantId).select('analytics').lean();

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    const analytics = merchant.analytics || {
      profileViews: 0,
      whatsappClicks: 0,
      callClicks: 0,
      websiteClicks: 0,
      directionsClicks: 0
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('getEngagementStats error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch engagement statistics'
    });
  }
};

exports.getWhatsAppClicks = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const merchant = await Merchant.findById(merchantId).select('analytics.whatsappClicks').lean();

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        whatsappClicks: merchant.analytics?.whatsappClicks || 0
      }
    });
  } catch (error) {
    console.error('getWhatsAppClicks error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch WhatsApp clicks'
    });
  }
};

exports.getCallClicks = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const merchant = await Merchant.findById(merchantId).select('analytics.callClicks').lean();

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        callClicks: merchant.analytics?.callClicks || 0
      }
    });
  } catch (error) {
    console.error('getCallClicks error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch call clicks'
    });
  }
};

exports.getProfileViews = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const merchant = await Merchant.findById(merchantId).select('analytics.profileViews').lean();

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        profileViews: merchant.analytics?.profileViews || 0
      }
    });
  } catch (error) {
    console.error('getProfileViews error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch profile views'
    });
  }
};

// ==================== SERVICES MANAGEMENT ====================

exports.getServices = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const merchant = await Merchant.findById(merchantId).select('services').lean();

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Sort services by order
    const services = (merchant.services || []).sort((a, b) => a.order - b.order);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('getServices error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch services'
    });
  }
};

exports.createService = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { name, description, price, duration, active } = req.body;

    if (!name) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Service name is required'
      });
    }

    const merchant = await Merchant.findById(merchantId);

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    if (!merchant.services) {
      merchant.services = [];
    }

    const newService = {
      name: name.trim(),
      description: description?.trim() || '',
      price: price?.trim() || '',
      duration: duration?.trim() || '',
      active: active !== undefined ? active : true,
      order: merchant.services.length
    };

    merchant.services.push(newService);
    await merchant.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Service created successfully',
      data: merchant.services[merchant.services.length - 1]
    });
  } catch (error) {
    console.error('createService error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to create service'
    });
  }
};

exports.updateService = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { serviceId } = req.params;
    const { name, description, price, duration, active } = req.body;

    const merchant = await Merchant.findById(merchantId);

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    const service = merchant.services.id(serviceId);

    if (!service) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Service not found'
      });
    }

    if (name) service.name = name.trim();
    if (description !== undefined) service.description = description.trim();
    if (price !== undefined) service.price = price.trim();
    if (duration !== undefined) service.duration = duration.trim();
    if (active !== undefined) service.active = active;

    await merchant.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    console.error('updateService error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to update service'
    });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { serviceId } = req.params;

    const merchant = await Merchant.findById(merchantId);

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    const service = merchant.services.id(serviceId);

    if (!service) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Service not found'
      });
    }

    service.remove();
    await merchant.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('deleteService error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to delete service'
    });
  }
};

exports.toggleServiceActive = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { serviceId } = req.params;
    const { active } = req.body;

    const merchant = await Merchant.findById(merchantId);

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    const service = merchant.services.id(serviceId);

    if (!service) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Service not found'
      });
    }

    service.active = active;
    await merchant.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Service ${active ? 'activated' : 'deactivated'} successfully`,
      data: service
    });
  } catch (error) {
    console.error('toggleServiceActive error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to toggle service status'
    });
  }
};

exports.reorderServices = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { serviceIds } = req.body;

    if (!Array.isArray(serviceIds)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'serviceIds must be an array'
      });
    }

    const merchant = await Merchant.findById(merchantId);

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Update order for each service
    serviceIds.forEach((id, index) => {
      const service = merchant.services.id(id);
      if (service) {
        service.order = index;
      }
    });

    await merchant.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Services reordered successfully'
    });
  } catch (error) {
    console.error('reorderServices error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to reorder services'
    });
  }
};
