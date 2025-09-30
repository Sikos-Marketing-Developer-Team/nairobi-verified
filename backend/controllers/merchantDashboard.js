const Merchant = require('../models/Merchant');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { HTTP_STATUS } = require('../config/constants');

/**
 * @desc    Get merchant dashboard overview
 * @route   GET /api/merchants/dashboard/overview
 * @access  Private/Merchant
 */
exports.getDashboardOverview = async (req, res) => {
  try {
    const merchantId = req.user._id;

    // Fetch merchant data
    const merchant = await Merchant.findById(merchantId)
      .select('businessName email phone verified featured rating reviews profileCompleteness documentsCompleteness createdAt verifiedDate')
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
      verificationBadge: merchant.verified ? 'Verified Business' : 'Pending Verification',
      statusMessage: merchant.verified 
        ? 'Your business is verified and visible to customers' 
        : 'Complete your profile and upload documents to get verified',
      verifiedDate: merchant.verifiedDate || null
    };

    // Get profile completion with real calculation
    const documentStatus = merchant.getDocumentStatus ? merchant.getDocumentStatus() : {
      isComplete: false,
      completionPercentage: 0
    };

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

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        merchant: {
          id: merchant._id,
          businessName: merchant.businessName,
          email: merchant.email,
          phone: merchant.phone,
          rating: merchant.rating || 0,
          totalReviews: merchant.reviews || 0,
          memberSince: merchant.createdAt
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
 * @desc    Get merchant performance analytics (REAL DATA ONLY)
 * @route   GET /api/merchants/dashboard/analytics
 * @access  Private/Merchant
 */
exports.getPerformanceAnalytics = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { period = '30' } = req.query; // days

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Calculate previous period for growth comparison
    const previousPeriodStart = new Date(daysAgo);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(period));

    // Get reviews data
    const [totalReviews, recentReviews, previousPeriodReviews] = await Promise.all([
      Review.countDocuments({ merchant: merchantId }),
      Review.countDocuments({
        merchant: merchantId,
        createdAt: { $gte: daysAgo }
      }),
      Review.countDocuments({
        merchant: merchantId,
        createdAt: { $gte: previousPeriodStart, $lt: daysAgo }
      })
    ]);

    // Calculate reviews growth
    const reviewsGrowth = previousPeriodReviews > 0 
      ? ((recentReviews - previousPeriodReviews) / previousPeriodReviews * 100).toFixed(1)
      : recentReviews > 0 ? '100' : '0';

    // Get products data (only if Product model exists)
    let productsData = null;
    try {
      const [totalProducts, activeProducts, recentProducts, previousProducts] = await Promise.all([
        Product.countDocuments({ merchant: merchantId }),
        Product.countDocuments({ merchant: merchantId, isActive: true }),
        Product.countDocuments({
          merchant: merchantId,
          createdAt: { $gte: daysAgo }
        }),
        Product.countDocuments({
          merchant: merchantId,
          createdAt: { $gte: previousPeriodStart, $lt: daysAgo }
        })
      ]);

      const productsGrowth = previousProducts > 0
        ? ((recentProducts - previousProducts) / previousProducts * 100).toFixed(1)
        : recentProducts > 0 ? '100' : '0';

      productsData = {
        total: totalProducts,
        active: activeProducts,
        inactive: totalProducts - activeProducts,
        recent: recentProducts,
        growth: `${productsGrowth >= 0 ? '+' : ''}${productsGrowth}%`
      };
    } catch (error) {
      console.log('Product model not available:', error.message);
    }

    // Get orders data (only if Order model exists)
    let ordersData = null;
    try {
      const merchantProducts = await Product.find({ merchant: merchantId }).select('_id');
      const productIds = merchantProducts.map(p => p._id);

      const [totalOrders, recentOrders, previousOrders] = await Promise.all([
        Order.countDocuments({ 'items.merchant': merchantId }),
        Order.countDocuments({
          'items.merchant': merchantId,
          createdAt: { $gte: daysAgo }
        }),
        Order.countDocuments({
          'items.merchant': merchantId,
          createdAt: { $gte: previousPeriodStart, $lt: daysAgo }
        })
      ]);

      const ordersGrowth = previousOrders > 0
        ? ((recentOrders - previousOrders) / previousOrders * 100).toFixed(1)
        : recentOrders > 0 ? '100' : '0';

      // Calculate revenue
      const revenueData = await Order.aggregate([
        {
          $match: {
            'items.merchant': merchantId,
            paymentStatus: 'paid',
            createdAt: { $gte: daysAgo }
          }
        },
        { $unwind: '$items' },
        { $match: { 'items.merchant': merchantId } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        }
      ]);

      const previousRevenue = await Order.aggregate([
        {
          $match: {
            'items.merchant': merchantId,
            paymentStatus: 'paid',
            createdAt: { $gte: previousPeriodStart, $lt: daysAgo }
          }
        },
        { $unwind: '$items' },
        { $match: { 'items.merchant': merchantId } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        }
      ]);

      const currentRevenue = revenueData[0]?.totalRevenue || 0;
      const prevRevenue = previousRevenue[0]?.totalRevenue || 0;
      
      const revenueGrowth = prevRevenue > 0
        ? ((currentRevenue - prevRevenue) / prevRevenue * 100).toFixed(1)
        : currentRevenue > 0 ? '100' : '0';

      ordersData = {
        total: totalOrders,
        recent: recentOrders,
        growth: `${ordersGrowth >= 0 ? '+' : ''}${ordersGrowth}%`,
        revenue: {
          current: currentRevenue,
          previous: prevRevenue,
          growth: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}%`,
          currency: 'KES'
        }
      };
    } catch (error) {
      console.log('Order model not available:', error.message);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        period: `Last ${period} days`,
        analytics: {
          reviews: {
            total: totalReviews,
            recent: recentReviews,
            growth: `${reviewsGrowth >= 0 ? '+' : ''}${reviewsGrowth}%`
          }
        },
        products: productsData,
        orders: ordersData
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
 * @desc    Get merchant recent activity (REAL DATA ONLY)
 * @route   GET /api/merchants/dashboard/activity
 * @access  Private/Merchant
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { limit = 10 } = req.query;

    const activities = [];

    // Get recent reviews
    const recentReviews = await Review.find({ merchant: merchantId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('user', 'firstName lastName')
      .select('rating content createdAt user')
      .lean();

    recentReviews.forEach(review => {
      const timeAgo = getTimeAgo(review.createdAt);
      const userName = review.user ? 
        `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() : 
        'Customer';
      
      activities.push({
        type: 'review',
        description: `New ${review.rating}-star review from ${userName}`,
        timestamp: timeAgo,
        date: review.createdAt,
        data: {
          rating: review.rating,
          content: review.content.substring(0, 100) + (review.content.length > 100 ? '...' : '')
        }
      });
    });

    // Get recent products (if available)
    try {
      const recentProducts = await Product.find({ merchant: merchantId })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('name createdAt isActive')
        .lean();

      recentProducts.forEach(product => {
        activities.push({
          type: 'product',
          description: `Product "${product.name}" ${product.isActive ? 'published' : 'created'}`,
          timestamp: getTimeAgo(product.createdAt),
          date: product.createdAt,
          data: {
            productName: product.name,
            status: product.isActive ? 'active' : 'inactive'
          }
        });
      });
    } catch (error) {
      console.log('No products found or Product model unavailable');
    }

    // Get recent orders (if available)
    try {
      const recentOrders = await Order.find({ 'items.merchant': merchantId })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('orderNumber status createdAt totalAmount')
        .lean();

      recentOrders.forEach(order => {
        activities.push({
          type: 'order',
          description: `New order #${order.orderNumber}`,
          timestamp: getTimeAgo(order.createdAt),
          date: order.createdAt,
          data: {
            orderNumber: order.orderNumber,
            status: order.status,
            amount: order.totalAmount
          }
        });
      });
    } catch (error) {
      console.log('No orders found or Order model unavailable');
    }

    // Sort all activities by date and limit
    const sortedActivities = activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, parseInt(limit));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: sortedActivities.length,
      data: sortedActivities
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
 * @desc    Get merchant notifications (REAL DATA ONLY)
 * @route   GET /api/merchants/dashboard/notifications
 * @access  Private/Merchant
 */
exports.getNotifications = async (req, res) => {
  try {
    const merchantId = req.user._id;

    const merchant = await Merchant.findById(merchantId)
      .select('verified profileCompleteness documentsCompleteness verifiedDate createdAt documents onboardingStatus')
      .lean();

    const notifications = [];

    // Verification status notification
    if (merchant.verified && merchant.verifiedDate) {
      const daysSinceVerification = Math.floor(
        (Date.now() - new Date(merchant.verifiedDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceVerification < 7) {
        notifications.push({
          id: `notif_verified_${merchant._id}`,
          type: 'success',
          icon: 'check-circle',
          title: 'Verification completed successfully!',
          timestamp: getTimeAgo(merchant.verifiedDate),
          date: merchant.verifiedDate,
          read: daysSinceVerification > 1
        });
      }
    } else if (!merchant.verified) {
      const hasAllDocuments = 
        merchant.documents?.businessRegistration?.path &&
        merchant.documents?.idDocument?.path &&
        merchant.documents?.utilityBill?.path;

      if (hasAllDocuments) {
        notifications.push({
          id: `notif_pending_verification_${merchant._id}`,
          type: 'warning',
          icon: 'clock',
          title: 'Documents submitted - Awaiting admin verification',
          timestamp: merchant.documents.documentsSubmittedAt ? 
            getTimeAgo(merchant.documents.documentsSubmittedAt) : 'Recently',
          date: merchant.documents.documentsSubmittedAt || merchant.createdAt,
          read: false
        });
      } else {
        notifications.push({
          id: `notif_incomplete_docs_${merchant._id}`,
          type: 'warning',
          icon: 'alert-circle',
          title: 'Complete document upload to get verified',
          timestamp: getTimeAgo(merchant.createdAt),
          date: merchant.createdAt,
          read: false
        });
      }
    }

    // Profile completion notification
    if (merchant.profileCompleteness < 100) {
      notifications.push({
        id: `notif_profile_incomplete_${merchant._id}`,
        type: 'info',
        icon: 'info',
        title: `Profile ${merchant.profileCompleteness}% complete - Add more details`,
        timestamp: getTimeAgo(merchant.createdAt),
        date: merchant.createdAt,
        read: merchant.profileCompleteness > 70
      });
    }

    // Recent review notifications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentReviews = await Review.find({
      merchant: merchantId,
      createdAt: { $gte: sevenDaysAgo }
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'firstName lastName')
    .select('rating createdAt user')
    .lean();

    recentReviews.forEach(review => {
      const userName = review.user ?
        `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() :
        'A customer';

      notifications.push({
        id: `notif_review_${review._id}`,
        type: 'info',
        icon: 'star',
        title: `${userName} left a ${review.rating}-star review`,
        timestamp: getTimeAgo(review.createdAt),
        date: review.createdAt,
        read: false
      });
    });

    // Sort by date and calculate unread
    const sortedNotifications = notifications
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 20); // Limit to 20 most recent

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: sortedNotifications.length,
      unreadCount: sortedNotifications.filter(n => !n.read).length,
      data: sortedNotifications
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
 * @desc    Get merchant reviews with stats
 * @route   GET /api/merchants/dashboard/reviews
 * @access  Private/Merchant
 */
exports.getMerchantReviews = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      order = 'desc',
      rating = null 
    } = req.query;

    const query = { merchant: merchantId };
    
    // Filter by rating if provided
    if (rating && rating !== 'all') {
      query.rating = parseInt(rating);
    }

    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    // Get reviews with pagination
    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName profilePicture')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const totalReviews = await Review.countDocuments(query);

    // Calculate rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { merchant: merchantId } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    // Format rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingDistribution.forEach(item => {
      distribution[item._id] = item.count;
    });

    // Calculate average rating
    const avgResult = await Review.aggregate([
      { $match: { merchant: merchantId } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const averageRating = avgResult[0]?.avgRating || 0;

    // Format reviews
    const formattedReviews = reviews.map(review => ({
      id: review._id,
      rating: review.rating,
      content: review.content,
      customerName: review.user ? 
        `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() : 
        'Anonymous',
      customerImage: review.user?.profilePicture || null,
      date: review.createdAt,
      timeAgo: getTimeAgo(review.createdAt),
      helpful: review.helpful || 0,
      reply: review.reply || null
    }));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        reviews: formattedReviews,
        stats: {
          totalReviews: await Review.countDocuments({ merchant: merchantId }),
          averageRating: Math.round(averageRating * 10) / 10,
          distribution
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalReviews,
          pages: Math.ceil(totalReviews / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('getMerchantReviews error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch reviews'
    });
  }
};

/**
 * @desc    Get quick actions status
 * @route   GET /api/merchants/dashboard/quick-actions
 * @access  Private/Merchant
 */
exports.getQuickActions = async (req, res) => {
  try {
    const merchantId = req.user._id;

    const merchant = await Merchant.findById(merchantId)
      .select('verified profileCompleteness documentsCompleteness businessName')
      .lean();

    const actions = [
      {
        id: 'edit_profile',
        label: 'Edit Profile',
        icon: 'edit',
        link: `/merchant/profile/edit`,
        enabled: true
      },
      {
        id: 'view_profile',
        label: 'View Public Profile',
        icon: 'eye',
        link: `/merchants/${merchantId}`,
        enabled: true
      },
      {
        id: 'verification',
        label: 'Verification Status',
        icon: merchant.verified ? 'check-circle' : 'clock',
        link: '/merchant/verification',
        enabled: true,
        badge: merchant.verified ? 'Verified' : 'Pending',
        badgeColor: merchant.verified ? 'green' : 'orange'
      },
      {
        id: 'manage_documents',
        label: 'Manage Documents',
        icon: 'file-text',
        link: '/merchant/documents',
        enabled: true,
        badge: merchant.documentsCompleteness === 100 ? 'Complete' : 'Incomplete',
        badgeColor: merchant.documentsCompleteness === 100 ? 'green' : 'red'
      },
      {
        id: 'support',
        label: 'Contact Support',
        icon: 'help-circle',
        link: '/merchant/support',
        enabled: true
      }
    ];

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: actions
    });

  } catch (error) {
    console.error('getQuickActions error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch quick actions'
    });
  }
};

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
}

module.exports = {
  getDashboardOverview,
  getPerformanceAnalytics,
  getRecentActivity,
  getNotifications,
  getMerchantReviews,
  getQuickActions
};