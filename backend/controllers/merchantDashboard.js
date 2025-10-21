const Merchant = require('../models/Merchant');const Merchant = require('../models/Merchant');

const Review = require('../models/Review');const Review = require('../models/Review');

const Product = require('../models/Product');const Product = require('../models/Product');

const Order = require('../models/Order');const Order = require('../models/Order');

const { HTTP_STATUS } = require('../config/constants');const { HTTP_STATUS } = require('../config/constants');

const cloudinary = require('cloudinary').v2;

/**

// ==================== DASHBOARD OVERVIEW ==================== * @desc    Get merchant dashboard overview

 * @route   GET /api/merchants/dashboard/overview

/** * @access  Private/Merchant

 * @desc    Get merchant dashboard overview */

 * @route   GET /api/merchants/dashboard/overviewexports.getDashboardOverview = async (req, res) => {

 * @access  Private/Merchant  try {

 */    // Use the merchant ID from the authenticated user

exports.getDashboardOverview = async (req, res) => {    // Since you're using session auth, req.user IS the merchant when they log in

  try {    const merchantId = req.user._id;

    const merchantId = req.user._id;

    console.log('🔍 Fetching dashboard for merchant ID:', merchantId);

    const merchant = await Merchant.findById(merchantId)

      .select('businessName email phone verified featured rating reviews profileCompleteness documentsCompleteness createdAt verifiedDate logo banner')    // Fetch merchant data directly using the logged-in merchant's ID

      .lean();    const merchant = await Merchant.findById(merchantId)

      .select('businessName email phone verified featured rating reviews profileCompleteness documentsCompleteness createdAt verifiedDate')

    if (!merchant) {      .lean();

      return res.status(HTTP_STATUS.NOT_FOUND).json({

        success: false,    if (!merchant) {

        error: 'Merchant not found'      return res.status(HTTP_STATUS.NOT_FOUND).json({

      });        success: false,

    }        error: 'Merchant not found'

      });

    // Get verification status    }

    const verificationStatus = {

      isVerified: merchant.verified,    // Get verification status

      isFeatured: merchant.featured || false,    const verificationStatus = {

      verificationLevel: merchant.verified ? (merchant.featured ? 'Premium' : 'Standard') : 'Basic',      isVerified: merchant.verified,

      verificationBadge: merchant.verified ? 'Verified Business' : 'Pending Verification',      isFeatured: merchant.featured || false,

      statusMessage: merchant.verified       verificationBadge: merchant.verified ? 'Verified Business' : 'Pending Verification',

        ? 'Your business is verified and visible to customers'       statusMessage: merchant.verified 

        : 'Complete your profile and upload documents to get verified',        ? 'Your business is verified and visible to customers' 

      verifiedDate: merchant.verifiedDate || null        : 'Complete your profile and upload documents to get verified',

    };      verifiedDate: merchant.verifiedDate || null

    };

    // Get profile completion

    const profileCompletion = {    // Get profile completion with real calculation

      percentage: merchant.profileCompleteness || 0,    const documentStatus = merchant.getDocumentStatus ? merchant.getDocumentStatus() : {

      documentsPercentage: merchant.documentsCompleteness || 0,      isComplete: false,

      nextSteps: []      completionPercentage: 0

    };    };



    if (merchant.profileCompleteness < 100) {    const profileCompletion = {

      profileCompletion.nextSteps.push('Complete your business profile');      percentage: merchant.profileCompleteness || 0,

    }      documentsPercentage: merchant.documentsCompleteness || 0,

    if (merchant.documentsCompleteness < 100) {      nextSteps: []

      profileCompletion.nextSteps.push('Upload verification documents');    };

    }

    if (!merchant.verified && merchant.documentsCompleteness === 100) {    if (merchant.profileCompleteness < 100) {

      profileCompletion.nextSteps.push('Documents under review');      profileCompletion.nextSteps.push('Complete your business profile');

    }    }

    if (merchant.documentsCompleteness < 100) {

    // Get quick stats      profileCompletion.nextSteps.push('Upload verification documents');

    const [reviewCount, productCount] = await Promise.all([    }

      Review.countDocuments({ merchant: merchantId }),    if (!merchant.verified && merchant.documentsCompleteness === 100) {

      Product.countDocuments({ merchant: merchantId })      profileCompletion.nextSteps.push('Documents under review');

    ]);    }



    res.status(HTTP_STATUS.OK).json({    res.status(HTTP_STATUS.OK).json({

      success: true,      success: true,

      data: {      data: {

        merchant: {        merchant: {

          id: merchant._id,          id: merchant._id,

          businessName: merchant.businessName,          businessName: merchant.businessName,

          email: merchant.email,          email: merchant.email,

          phone: merchant.phone,          phone: merchant.phone,

          rating: merchant.rating || 0,          rating: merchant.rating || 0,

          totalReviews: reviewCount,          totalReviews: merchant.reviews || 0,

          totalProducts: productCount,          memberSince: merchant.createdAt

          memberSince: merchant.createdAt,        },

          logo: merchant.logo,        verificationStatus,

          banner: merchant.banner        profileCompletion

        },      }

        verificationStatus,    });

        profileCompletion

      }  } catch (error) {

    });    console.error('getDashboardOverview error:', error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({

  } catch (error) {      success: false,

    console.error('getDashboardOverview error:', error);      error: 'Failed to fetch dashboard overview'

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({    });

      success: false,  }

      error: 'Failed to fetch dashboard overview'};

    });

  }/**

}; * @desc    Get merchant performance analytics (REAL DATA ONLY)

 * @route   GET /api/merchants/dashboard/analytics

/** * @access  Private/Merchant

 * @desc    Get merchant performance analytics */

 * @route   GET /api/merchants/dashboard/analyticsexports.getPerformanceAnalytics = async (req, res) => {

 * @access  Private/Merchant  try {

 */    const merchantId = req.user._id;

exports.getPerformanceAnalytics = async (req, res) => {    const { period = '30' } = req.query; // days

  try {

    const merchantId = req.user._id;    const daysAgo = new Date();

    const { period = '30' } = req.query;    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const days = parseInt(period);

    const startDate = new Date();    // Calculate previous period for growth comparison

    startDate.setDate(startDate.getDate() - days);    const previousPeriodStart = new Date(daysAgo);

    previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(period));

    // Get reviews analytics

    const [totalReviews, recentReviews, averageRating] = await Promise.all([    // Get reviews data

      Review.countDocuments({ merchant: merchantId }),    const [totalReviews, recentReviews, previousPeriodReviews] = await Promise.all([

      Review.countDocuments({       Review.countDocuments({ merchant: merchantId }),

        merchant: merchantId,       Review.countDocuments({

        createdAt: { $gte: startDate }         merchant: merchantId,

      }),        createdAt: { $gte: daysAgo }

      Review.aggregate([      }),

        { $match: { merchant: merchantId } },      Review.countDocuments({

        { $group: { _id: null, avgRating: { $avg: '$rating' } } }        merchant: merchantId,

      ])        createdAt: { $gte: previousPeriodStart, $lt: daysAgo }

    ]);      })

    ]);

    // Get products analytics

    const [totalProducts, activeProducts] = await Promise.all([    // Calculate reviews growth

      Product.countDocuments({ merchant: merchantId }),    const reviewsGrowth = previousPeriodReviews > 0 

      Product.countDocuments({ merchant: merchantId, available: true })      ? ((recentReviews - previousPeriodReviews) / previousPeriodReviews * 100).toFixed(1)

    ]);      : recentReviews > 0 ? '100' : '0';



    res.status(HTTP_STATUS.OK).json({    // Get products data

      success: true,    let productsData = null;

      data: {    try {

        period: `${days} days`,      const [totalProducts, activeProducts, recentProducts, previousProducts] = await Promise.all([

        reviews: {        Product.countDocuments({ merchant: merchantId }),

          total: totalReviews,        Product.countDocuments({ merchant: merchantId, isActive: true }),

          recent: recentReviews,        Product.countDocuments({

          averageRating: averageRating[0]?.avgRating || 0          merchant: merchantId,

        },          createdAt: { $gte: daysAgo }

        products: {        }),

          total: totalProducts,        Product.countDocuments({

          active: activeProducts,          merchant: merchantId,

          inactive: totalProducts - activeProducts          createdAt: { $gte: previousPeriodStart, $lt: daysAgo }

        }        })

      }      ]);

    });

      const productsGrowth = previousProducts > 0

  } catch (error) {        ? ((recentProducts - previousProducts) / previousProducts * 100).toFixed(1)

    console.error('getPerformanceAnalytics error:', error);        : recentProducts > 0 ? '100' : '0';

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({

      success: false,      productsData = {

      error: 'Failed to fetch performance analytics'        total: totalProducts,

    });        active: activeProducts,

  }        inactive: totalProducts - activeProducts,

};        recent: recentProducts,

        growth: `${productsGrowth >= 0 ? '+' : ''}${productsGrowth}%`

/**      };

 * @desc    Get recent activity    } catch (error) {

 * @route   GET /api/merchants/dashboard/activity      console.log('Product model not available:', error.message);

 * @access  Private/Merchant    }

 */

exports.getRecentActivity = async (req, res) => {    // Get orders data

  try {    let ordersData = null;

    const merchantId = req.user._id;    try {

    const limit = parseInt(req.query.limit) || 10;      const [totalOrders, recentOrders, previousOrders] = await Promise.all([

        Order.countDocuments({ 'items.merchant': merchantId }),

    const [recentReviews, recentProducts] = await Promise.all([        Order.countDocuments({

      Review.find({ merchant: merchantId })          'items.merchant': merchantId,

        .sort('-createdAt')          createdAt: { $gte: daysAgo }

        .limit(5)        }),

        .select('rating comment userName createdAt')        Order.countDocuments({

        .lean(),          'items.merchant': merchantId,

      Product.find({ merchant: merchantId })          createdAt: { $gte: previousPeriodStart, $lt: daysAgo }

        .sort('-createdAt')        })

        .limit(5)      ]);

        .select('name createdAt')

        .lean()      const ordersGrowth = previousOrders > 0

    ]);        ? ((recentOrders - previousOrders) / previousOrders * 100).toFixed(1)

        : recentOrders > 0 ? '100' : '0';

    const activities = [

      ...recentReviews.map(r => ({      // Calculate revenue

        type: 'review',      const revenueData = await Order.aggregate([

        description: `New ${r.rating}-star review from ${r.userName}`,        {

        timestamp: r.createdAt,          $match: {

        data: r            'items.merchant': merchantId,

      })),            paymentStatus: 'paid',

      ...recentProducts.map(p => ({            createdAt: { $gte: daysAgo }

        type: 'product',          }

        description: `Added new product: ${p.name}`,        },

        timestamp: p.createdAt,        { $unwind: '$items' },

        data: p        { $match: { 'items.merchant': merchantId } },

      }))        {

    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);          $group: {

            _id: null,

    res.status(HTTP_STATUS.OK).json({            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }

      success: true,          }

      data: activities        }

    });      ]);



  } catch (error) {      const previousRevenue = await Order.aggregate([

    console.error('getRecentActivity error:', error);        {

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({          $match: {

      success: false,            'items.merchant': merchantId,

      error: 'Failed to fetch recent activity'            paymentStatus: 'paid',

    });            createdAt: { $gte: previousPeriodStart, $lt: daysAgo }

  }          }

};        },

        { $unwind: '$items' },

/**        { $match: { 'items.merchant': merchantId } },

 * @desc    Get notifications        {

 * @route   GET /api/merchants/dashboard/notifications          $group: {

 * @access  Private/Merchant            _id: null,

 */            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }

exports.getNotifications = async (req, res) => {          }

  try {        }

    const merchantId = req.user._id;      ]);

    

    // Get unread reviews      const currentRevenue = revenueData[0]?.totalRevenue || 0;

    const unreadReviews = await Review.countDocuments({      const prevRevenue = previousRevenue[0]?.totalRevenue || 0;

      merchant: merchantId,      

      merchantResponse: { $exists: false }      const revenueGrowth = prevRevenue > 0

    });        ? ((currentRevenue - prevRevenue) / prevRevenue * 100).toFixed(1)

        : currentRevenue > 0 ? '100' : '0';

    const notifications = [];

          ordersData = {

    if (unreadReviews > 0) {        total: totalOrders,

      notifications.push({        recent: recentOrders,

        id: 'new-reviews',        growth: `${ordersGrowth >= 0 ? '+' : ''}${ordersGrowth}%`,

        type: 'review',        revenue: {

        title: `You have ${unreadReviews} new review${unreadReviews > 1 ? 's' : ''} to respond to`,          current: currentRevenue,

        timestamp: new Date(),          previous: prevRevenue,

        read: false          growth: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}%`,

      });          currency: 'KES'

    }        }

      };

    res.status(HTTP_STATUS.OK).json({    } catch (error) {

      success: true,      console.log('Order model not available:', error.message);

      data: notifications    }

    });

    res.status(HTTP_STATUS.OK).json({

  } catch (error) {      success: true,

    console.error('getNotifications error:', error);      data: {

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({        period: `Last ${period} days`,

      success: false,        analytics: {

      error: 'Failed to fetch notifications'          reviews: {

    });            total: totalReviews,

  }            recent: recentReviews,

};            growth: `${reviewsGrowth >= 0 ? '+' : ''}${reviewsGrowth}%`

          }

/**        },

 * @desc    Get quick actions        products: productsData,

 * @route   GET /api/merchants/dashboard/quick-actions        orders: ordersData

 * @access  Private/Merchant      }

 */    });

exports.getQuickActions = async (req, res) => {

  try {  } catch (error) {

    const merchantId = req.user._id;    console.error('getPerformanceAnalytics error:', error);

    const merchant = await Merchant.findById(merchantId).select('verified');    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({

      success: false,

    const quickActions = [      error: 'Failed to fetch performance analytics'

      {    });

        id: 'edit-profile',  }

        label: 'Edit Profile',};

        icon: 'edit',

        link: '/merchant/profile',/**

        enabled: true * @desc    Get merchant recent activity

      }, * @route   GET /api/merchants/dashboard/activity

      { * @access  Private/Merchant

        id: 'add-product', */

        label: 'Add Product',exports.getRecentActivity = async (req, res) => {

        icon: 'plus',  try {

        link: '/merchant/products/new',    const merchantId = req.user._id;

        enabled: true    const { limit = 10 } = req.query;

      },

      {    const activities = [];

        id: 'view-public-profile',

        label: 'View Public Profile',    // Get recent reviews

        icon: 'eye',    const recentReviews = await Review.find({ merchant: merchantId })

        link: `/merchant/${merchantId}`,      .sort({ createdAt: -1 })

        enabled: merchant.verified      .limit(parseInt(limit))

      },      .populate('user', 'firstName lastName')

      {      .select('rating content createdAt user')

        id: 'manage-reviews',      .lean();

        label: 'Manage Reviews',

        icon: 'message',    recentReviews.forEach(review => {

        link: '/merchant/reviews',      const timeAgo = getTimeAgo(review.createdAt);

        enabled: true      const userName = review.user ? 

      }        `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() : 

    ];        'Customer';

      

    res.status(HTTP_STATUS.OK).json({      activities.push({

      success: true,        type: 'review',

      data: quickActions        description: `New ${review.rating}-star review from ${userName}`,

    });        timestamp: timeAgo,

        date: review.createdAt,

  } catch (error) {        data: {

    console.error('getQuickActions error:', error);          rating: review.rating,

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({          content: review.content.substring(0, 100) + (review.content.length > 100 ? '...' : '')

      success: false,        }

      error: 'Failed to fetch quick actions'      });

    });    });

  }

};    // Get recent products

    try {

// ==================== BUSINESS PROFILE MANAGEMENT ====================      const recentProducts = await Product.find({ merchant: merchantId })

        .sort({ createdAt: -1 })

/**        .limit(parseInt(limit))

 * @desc    Get business profile        .select('name createdAt isActive')

 * @route   GET /api/merchants/dashboard/profile        .lean();

 * @access  Private/Merchant

 */      recentProducts.forEach(product => {

exports.getBusinessProfile = async (req, res) => {        activities.push({

  try {          type: 'product',

    const merchantId = req.user._id;          description: `Product "${product.name}" ${product.isActive ? 'published' : 'created'}`,

              timestamp: getTimeAgo(product.createdAt),

    const merchant = await Merchant.findById(merchantId)          date: product.createdAt,

      .select('-password')          data: {

      .lean();            productName: product.name,

            status: product.isActive ? 'active' : 'inactive'

    if (!merchant) {          }

      return res.status(HTTP_STATUS.NOT_FOUND).json({        });

        success: false,      });

        error: 'Merchant not found'    } catch (error) {

      });      console.log('No products found or Product model unavailable');

    }    }



    res.status(HTTP_STATUS.OK).json({    // Get recent orders

      success: true,    try {

      data: merchant      const recentOrders = await Order.find({ 'items.merchant': merchantId })

    });        .sort({ createdAt: -1 })

        .limit(parseInt(limit))

  } catch (error) {        .select('orderNumber status createdAt totalAmount')

    console.error('getBusinessProfile error:', error);        .lean();

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({

      success: false,      recentOrders.forEach(order => {

      error: 'Failed to fetch business profile'        activities.push({

    });          type: 'order',

  }          description: `New order #${order.orderNumber}`,

};          timestamp: getTimeAgo(order.createdAt),

          date: order.createdAt,

/**          data: {

 * @desc    Update business profile            orderNumber: order.orderNumber,

 * @route   PUT /api/merchants/dashboard/profile            status: order.status,

 * @access  Private/Merchant            amount: order.totalAmount

 */          }

exports.updateBusinessProfile = async (req, res) => {        });

  try {      });

    const merchantId = req.user._id;    } catch (error) {

    const {      console.log('No orders found or Order model unavailable');

      businessName,    }

      description,

      businessType,    // Sort all activities by date and limit

      category,    const sortedActivities = activities

      subCategory,      .sort((a, b) => new Date(b.date) - new Date(a.date))

      phone,      .slice(0, parseInt(limit));

      whatsappNumber,

      email,    res.status(HTTP_STATUS.OK).json({

      website,      success: true,

      address,      count: sortedActivities.length,

      county,      data: sortedActivities

      area,    });

      latitude,

      longitude  } catch (error) {

    } = req.body;    console.error('getRecentActivity error:', error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({

    const merchant = await Merchant.findById(merchantId);      success: false,

      error: 'Failed to fetch recent activity'

    if (!merchant) {    });

      return res.status(HTTP_STATUS.NOT_FOUND).json({  }

        success: false,};

        error: 'Merchant not found'

      });/**

    } * @desc    Get merchant notifications

 * @route   GET /api/merchants/dashboard/notifications

    // Update fields * @access  Private/Merchant

    if (businessName) merchant.businessName = businessName; */

    if (description) merchant.description = description;exports.getNotifications = async (req, res) => {

    if (businessType) merchant.businessType = businessType;  try {

    if (category) merchant.category = category;    const merchantId = req.user._id;

    if (subCategory) merchant.subCategory = subCategory;

    if (phone) merchant.phone = phone;    const merchant = await Merchant.findById(merchantId)

    if (whatsappNumber) merchant.whatsappNumber = whatsappNumber;      .select('verified profileCompleteness documentsCompleteness verifiedDate createdAt documents onboardingStatus')

    if (email) merchant.email = email;      .lean();

    if (website) merchant.website = website;

    if (address) merchant.address = address;    const notifications = [];

    if (county) merchant.county = county;

    if (area) merchant.area = area;    // Verification status notification

    if (latitude !== undefined) merchant.latitude = latitude;    if (merchant.verified && merchant.verifiedDate) {

    if (longitude !== undefined) merchant.longitude = longitude;      const daysSinceVerification = Math.floor(

        (Date.now() - new Date(merchant.verifiedDate).getTime()) / (1000 * 60 * 60 * 24)

    await merchant.save();      );

      

    res.status(HTTP_STATUS.OK).json({      if (daysSinceVerification < 7) {

      success: true,        notifications.push({

      message: 'Business profile updated successfully',          id: `notif_verified_${merchant._id}`,

      data: merchant          type: 'success',

    });          icon: 'check-circle',

          title: 'Verification completed successfully!',

  } catch (error) {          timestamp: getTimeAgo(merchant.verifiedDate),

    console.error('updateBusinessProfile error:', error);          date: merchant.verifiedDate,

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({          read: daysSinceVerification > 1

      success: false,        });

      error: 'Failed to update business profile'      }

    });    } else if (!merchant.verified) {

  }      const hasAllDocuments = 

};        merchant.documents?.businessRegistration?.path &&

        merchant.documents?.idDocument?.path &&

/**        merchant.documents?.utilityBill?.path;

 * @desc    Update business hours

 * @route   PUT /api/merchants/dashboard/profile/hours      if (hasAllDocuments) {

 * @access  Private/Merchant        notifications.push({

 */          id: `notif_pending_verification_${merchant._id}`,

exports.updateBusinessHours = async (req, res) => {          type: 'warning',

  try {          icon: 'clock',

    const merchantId = req.user._id;          title: 'Documents submitted - Awaiting admin verification',

    const { businessHours } = req.body;          timestamp: merchant.documents.documentsSubmittedAt ? 

            getTimeAgo(merchant.documents.documentsSubmittedAt) : 'Recently',

    const merchant = await Merchant.findByIdAndUpdate(          date: merchant.documents.documentsSubmittedAt || merchant.createdAt,

      merchantId,          read: false

      { businessHours },        });

      { new: true, runValidators: true }      } else {

    );        notifications.push({

          id: `notif_incomplete_docs_${merchant._id}`,

    if (!merchant) {          type: 'warning',

      return res.status(HTTP_STATUS.NOT_FOUND).json({          icon: 'alert-circle',

        success: false,          title: 'Complete document upload to get verified',

        error: 'Merchant not found'          timestamp: getTimeAgo(merchant.createdAt),

      });          date: merchant.createdAt,

    }          read: false

        });

    res.status(HTTP_STATUS.OK).json({      }

      success: true,    }

      message: 'Business hours updated successfully',

      data: merchant.businessHours    // Profile completion notification

    });    if (merchant.profileCompleteness < 100) {

      notifications.push({

  } catch (error) {        id: `notif_profile_incomplete_${merchant._id}`,

    console.error('updateBusinessHours error:', error);        type: 'info',

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({        icon: 'info',

      success: false,        title: `Profile ${merchant.profileCompleteness}% complete - Add more details`,

      error: 'Failed to update business hours'        timestamp: getTimeAgo(merchant.createdAt),

    });        date: merchant.createdAt,

  }        read: merchant.profileCompleteness > 70

};      });

    }

/**

 * @desc    Update social media links    // Recent review notifications

 * @route   PUT /api/merchants/dashboard/profile/social    const sevenDaysAgo = new Date();

 * @access  Private/Merchant    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

 */

exports.updateSocialLinks = async (req, res) => {    const recentReviews = await Review.find({

  try {      merchant: merchantId,

    const merchantId = req.user._id;      createdAt: { $gte: sevenDaysAgo }

    const { socialMedia } = req.body;    })

    .sort({ createdAt: -1 })

    const merchant = await Merchant.findByIdAndUpdate(    .limit(5)

      merchantId,    .populate('user', 'firstName lastName')

      { socialMedia },    .select('rating createdAt user')

      { new: true, runValidators: true }    .lean();

    );

    recentReviews.forEach(review => {

    if (!merchant) {      const userName = review.user ?

      return res.status(HTTP_STATUS.NOT_FOUND).json({        `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() :

        success: false,        'A customer';

        error: 'Merchant not found'

      });      notifications.push({

    }        id: `notif_review_${review._id}`,

        type: 'info',

    res.status(HTTP_STATUS.OK).json({        icon: 'star',

      success: true,        title: `${userName} left a ${review.rating}-star review`,

      message: 'Social media links updated successfully',        timestamp: getTimeAgo(review.createdAt),

      data: merchant.socialMedia        date: review.createdAt,

    });        read: false

      });

  } catch (error) {    });

    console.error('updateSocialLinks error:', error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({    // Sort by date and calculate unread

      success: false,    const sortedNotifications = notifications

      error: 'Failed to update social media links'      .sort((a, b) => new Date(b.date) - new Date(a.date))

    });      .slice(0, 20); // Limit to 20 most recent

  }

};    res.status(HTTP_STATUS.OK).json({

      success: true,

/**      count: sortedNotifications.length,

 * @desc    Upload business logo      unreadCount: sortedNotifications.filter(n => !n.read).length,

 * @route   POST /api/merchants/dashboard/profile/logo      data: sortedNotifications

 * @access  Private/Merchant    });

 */

exports.uploadBusinessLogo = async (req, res) => {  } catch (error) {

  try {    console.error('getNotifications error:', error);

    const merchantId = req.user._id;    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({

      success: false,

    if (!req.file) {      error: 'Failed to fetch notifications'

      return res.status(HTTP_STATUS.BAD_REQUEST).json({    });

        success: false,  }

        error: 'No logo file provided'};

      });

    }/**

 * @desc    Get merchant reviews with stats

    const merchant = await Merchant.findById(merchantId); * @route   GET /api/merchants/dashboard/reviews

 * @access  Private/Merchant

    if (!merchant) { */

      return res.status(HTTP_STATUS.NOT_FOUND).json({exports.getMerchantReviews = async (req, res) => {

        success: false,  try {

        error: 'Merchant not found'    const merchantId = req.user._id;

      });    const { 

    }      page = 1, 

      limit = 10, 

    // Delete old logo from Cloudinary if exists      sortBy = 'createdAt', 

    if (merchant.logoPublicId) {      order = 'desc',

      try {      rating = null 

        await cloudinary.uploader.destroy(merchant.logoPublicId);    } = req.query;

      } catch (err) {

        console.warn('Failed to delete old logo:', err);    const query = { merchant: merchantId };

      }    

    }    if (rating && rating !== 'all') {

      query.rating = parseInt(rating);

    // Update merchant with new logo    }

    merchant.logo = req.file.path;

    merchant.logoPublicId = req.file.filename;    const sort = {};

    await merchant.save();    sort[sortBy] = order === 'desc' ? -1 : 1;



    res.status(HTTP_STATUS.OK).json({    const reviews = await Review.find(query)

      success: true,      .populate('user', 'firstName lastName profilePicture')

      message: 'Logo uploaded successfully',      .sort(sort)

      data: {      .limit(parseInt(limit))

        logo: merchant.logo,      .skip((parseInt(page) - 1) * parseInt(limit))

        logoPublicId: merchant.logoPublicId      .lean();

      }

    });    const totalReviews = await Review.countDocuments(query);



  } catch (error) {    const ratingDistribution = await Review.aggregate([

    console.error('uploadBusinessLogo error:', error);      { $match: { merchant: merchantId } },

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({      { $group: { _id: '$rating', count: { $sum: 1 } } },

      success: false,      { $sort: { _id: -1 } }

      error: 'Failed to upload logo'    ]);

    });

  }    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

};    ratingDistribution.forEach(item => {

      distribution[item._id] = item.count;

/**    });

 * @desc    Upload business banner

 * @route   POST /api/merchants/dashboard/profile/banner    const avgResult = await Review.aggregate([

 * @access  Private/Merchant      { $match: { merchant: merchantId } },

 */      { $group: { _id: null, avgRating: { $avg: '$rating' } } }

exports.uploadBusinessBanner = async (req, res) => {    ]);

  try {    const averageRating = avgResult[0]?.avgRating || 0;

    const merchantId = req.user._id;

    const formattedReviews = reviews.map(review => ({

    if (!req.file) {      id: review._id,

      return res.status(HTTP_STATUS.BAD_REQUEST).json({      rating: review.rating,

        success: false,      content: review.content,

        error: 'No banner file provided'      customerName: review.user ? 

      });        `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() : 

    }        'Anonymous',

      customerImage: review.user?.profilePicture || null,

    const merchant = await Merchant.findById(merchantId);      date: review.createdAt,

      timeAgo: getTimeAgo(review.createdAt),

    if (!merchant) {      helpful: review.helpful || 0,

      return res.status(HTTP_STATUS.NOT_FOUND).json({      reply: review.reply || null

        success: false,    }));

        error: 'Merchant not found'

      });    res.status(HTTP_STATUS.OK).json({

    }      success: true,

      data: {

    // Delete old banner from Cloudinary if exists        reviews: formattedReviews,

    if (merchant.bannerPublicId) {        stats: {

      try {          totalReviews: await Review.countDocuments({ merchant: merchantId }),

        await cloudinary.uploader.destroy(merchant.bannerPublicId);          averageRating: Math.round(averageRating * 10) / 10,

      } catch (err) {          distribution

        console.warn('Failed to delete old banner:', err);        },

      }        pagination: {

    }          page: parseInt(page),

          limit: parseInt(limit),

    // Update merchant with new banner          total: totalReviews,

    merchant.banner = req.file.path;          pages: Math.ceil(totalReviews / parseInt(limit))

    merchant.bannerPublicId = req.file.filename;        }

    await merchant.save();      }

    });

    res.status(HTTP_STATUS.OK).json({

      success: true,  } catch (error) {

      message: 'Banner uploaded successfully',    console.error('getMerchantReviews error:', error);

      data: {    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({

        banner: merchant.banner,      success: false,

        bannerPublicId: merchant.bannerPublicId      error: 'Failed to fetch reviews'

      }    });

    });  }

};

  } catch (error) {

    console.error('uploadBusinessBanner error:', error);/**

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ * @desc    Get quick actions status

      success: false, * @route   GET /api/merchants/dashboard/quick-actions

      error: 'Failed to upload banner' * @access  Private/Merchant

    }); */

  }exports.getQuickActions = async (req, res) => {

};  try {

    const merchantId = req.user._id;

// ==================== PHOTO GALLERY MANAGEMENT ====================

    const merchant = await Merchant.findById(merchantId)

/**      .select('verified profileCompleteness documentsCompleteness businessName')

 * @desc    Get photo gallery      .lean();

 * @route   GET /api/merchants/dashboard/gallery

 * @access  Private/Merchant    const actions = [

 */      {

exports.getPhotoGallery = async (req, res) => {        id: 'edit_profile',

  try {        label: 'Edit Profile',

    const merchantId = req.user._id;        icon: 'edit',

            link: `/merchant/profile/edit`,

    const merchant = await Merchant.findById(merchantId)        enabled: true

      .select('gallery')      },

      .lean();      {

        id: 'view_profile',

    if (!merchant) {        label: 'View Public Profile',

      return res.status(HTTP_STATUS.NOT_FOUND).json({        icon: 'eye',

        success: false,        link: `/merchants/${merchantId}`,

        error: 'Merchant not found'        enabled: true

      });      },

    }      {

        id: 'verification',

    res.status(HTTP_STATUS.OK).json({        label: 'Verification Status',

      success: true,        icon: merchant.verified ? 'check-circle' : 'clock',

      data: merchant.gallery || []        link: '/merchant/verification',

    });        enabled: true,

        badge: merchant.verified ? 'Verified' : 'Pending',

  } catch (error) {        badgeColor: merchant.verified ? 'green' : 'orange'

    console.error('getPhotoGallery error:', error);      },

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({      {

      success: false,        id: 'manage_documents',

      error: 'Failed to fetch photo gallery'        label: 'Manage Documents',

    });        icon: 'file-text',

  }        link: '/merchant/documents',

};        enabled: true,

        badge: merchant.documentsCompleteness === 100 ? 'Complete' : 'Incomplete',

/**        badgeColor: merchant.documentsCompleteness === 100 ? 'green' : 'red'

 * @desc    Upload photos to gallery      },

 * @route   POST /api/merchants/dashboard/gallery      {

 * @access  Private/Merchant        id: 'support',

 */        label: 'Contact Support',

exports.uploadPhotos = async (req, res) => {        icon: 'help-circle',

  try {        link: '/merchant/support',

    const merchantId = req.user._id;        enabled: true

      }

    if (!req.files || req.files.length === 0) {    ];

      return res.status(HTTP_STATUS.BAD_REQUEST).json({

        success: false,    res.status(HTTP_STATUS.OK).json({

        error: 'No photos provided'      success: true,

      });      data: actions

    }    });



    const merchant = await Merchant.findById(merchantId);  } catch (error) {

    console.error('getQuickActions error:', error);

    if (!merchant) {    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({

      return res.status(HTTP_STATUS.NOT_FOUND).json({      success: false,

        success: false,      error: 'Failed to fetch quick actions'

        error: 'Merchant not found'    });

      });  }

    }};



    // Initialize gallery if doesn't exist// Helper: time ago

    if (!merchant.gallery) {function getTimeAgo(date) {

      merchant.gallery = [];  const now = new Date();

    }  const diffMs = now - new Date(date);

  const diffMins = Math.floor(diffMs / (1000 * 60));

    // Add new photos  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    const newPhotos = req.files.map(file => ({  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      url: file.path,

      publicId: file.filename,  if (diffMins < 1) return 'Just now';

      caption: req.body.caption || '',  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

      uploadedAt: new Date(),  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

      isFeatured: false  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    }));  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;

  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;

    merchant.gallery.push(...newPhotos);  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;

    await merchant.save();}


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

/**
 * @desc    Delete photo from gallery
 * @route   DELETE /api/merchants/dashboard/gallery/:photoId
 * @access  Private/Merchant
 */
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

    const photo = merchant.gallery.id(photoId);

    if (!photo) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Photo not found'
      });
    }

    // Delete from Cloudinary
    if (photo.publicId) {
      try {
        await cloudinary.uploader.destroy(photo.publicId);
      } catch (err) {
        console.warn('Failed to delete photo from Cloudinary:', err);
      }
    }

    // Remove from gallery
    photo.remove();
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

/**
 * @desc    Reorder photos in gallery
 * @route   PUT /api/merchants/dashboard/gallery/reorder
 * @access  Private/Merchant
 */
exports.reorderPhotos = async (req, res) => {
  try {
    const merchantId = req.user._id;
    const { photoIds } = req.body;

    if (!Array.isArray(photoIds)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'photoIds must be an array'
      });
    }

    const merchant = await Merchant.findById(merchantId);

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Reorder gallery based on photoIds array
    const reorderedGallery = [];
    photoIds.forEach(id => {
      const photo = merchant.gallery.id(id);
      if (photo) {
        reorderedGallery.push(photo);
      }
    });

    merchant.gallery = reorderedGallery;
    await merchant.save();

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

/**
 * @desc    Set featured photo
 * @route   PUT /api/merchants/dashboard/gallery/:photoId/featured
 * @access  Private/Merchant
 */
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

    // Unset all featured photos
    merchant.gallery.forEach(photo => {
      photo.isFeatured = false;
    });

    // Set new featured photo
    const photo = merchant.gallery.id(photoId);
    if (!photo) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Photo not found'
      });
    }

    photo.isFeatured = true;
    await merchant.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Featured photo updated successfully',
      data: photo
    });

  } catch (error) {
    console.error('setFeaturedPhoto error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to set featured photo'
    });
  }
};

// Continue in next message due to length...
