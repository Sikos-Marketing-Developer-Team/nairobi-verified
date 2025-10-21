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

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: merchant.gallery || []
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

    if (!req.files || req.files.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'No photos provided'
      });
    }

    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    if (!merchant.gallery) {
      merchant.gallery = [];
    }

    const newPhotos = req.files.map(file => file.path);
    merchant.gallery.push(...newPhotos);
    await merchant.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `${newPhotos.length} photo(s) uploaded successfully`,
      data: newPhotos
    });
  } catch (error) {
    console.error('uploadPhotos error:', error);
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
    if (available !== undefined) query.available = available === 'true';

    const products = await Product.find(query).sort(sort).lean();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: products.length,
      data: products
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
    const merchantId = req.user._id;
    const product = await Product.create({
      ...req.body,
      merchant: merchantId
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('createProduct error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to create product'
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { productId } = req.params;

    const product = await Product.findOneAndUpdate(
      { _id: productId, merchant: merchantId },
      req.body,
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
      { available },
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
      data: product
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
