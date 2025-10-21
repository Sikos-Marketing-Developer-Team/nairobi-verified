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
