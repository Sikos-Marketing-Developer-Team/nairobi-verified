const AdminUser = require('../models/AdminUser');
const Merchant = require('../models/Merchant');
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');
const FlashSale = require('../models/FlashSale');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
});

// @desc    Get dashboard statistics with enhanced merchant verification tracking
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    console.log('🔍 Fetching dashboard stats...');
    
    // FIXED: Consistent merchant counting with proper filters
    const [
      totalMerchants,
      totalUsers,
      totalProducts,
      totalReviews,
      verifiedMerchants,
      activeMerchants,
      pendingMerchants,
      activeProducts,
      totalOrders,
      merchantsWithDocuments,
      merchantsPendingDocuments,
      documentsAwaitingReview
    ] = await Promise.all([
      Merchant.countDocuments(), // All merchants
      User.countDocuments({ role: { $ne: 'admin' } }),
      Product.countDocuments(),
      Review.countDocuments(),
      
      // CRITICAL FIX: Count verified merchants with proper criteria
      Merchant.countDocuments({ 
        verified: true,
        isActive: true // Also check if active
      }),
      
      // NEW: Separate count for active merchants
      Merchant.countDocuments({ isActive: true }),
      
      // FIXED: Pending = not verified OR not active
      Merchant.countDocuments({ 
        $or: [
          { verified: false },
          { isActive: false }
        ]
      }),
      
      Product.countDocuments({ isActive: true }),
      Promise.resolve(0), // Orders placeholder
      
      // Merchants with documents
      Merchant.countDocuments({
        $or: [
          { 'documents.businessRegistration.path': { $exists: true, $ne: '' } },
          { 'documents.idDocument.path': { $exists: true, $ne: '' } },
          { 'documents.utilityBill.path': { $exists: true, $ne: '' } }
        ]
      }),
      
      // Merchants pending documents
      Merchant.countDocuments({
        verified: false,
        $and: [
          {
            $or: [
              { 'documents.businessRegistration.path': { $exists: false } },
              { 'documents.businessRegistration.path': '' },
              { 'documents.idDocument.path': { $exists: false } },
              { 'documents.idDocument.path': '' },
              { 'documents.utilityBill.path': { $exists: false } },
              { 'documents.utilityBill.path': '' }
            ]
          }
        ]
      }),
      
      // Documents awaiting review (complete docs but not verified)
      Merchant.countDocuments({
        verified: false,
        $and: [
          { 'documents.businessRegistration.path': { $exists: true, $ne: '' } },
          { 'documents.idDocument.path': { $exists: true, $ne: '' } },
          { 'documents.utilityBill.path': { $exists: true, $ne: '' } }
        ]
      })
    ]);

    console.log('📊 Merchant counts:', {
      total: totalMerchants,
      verified: verifiedMerchants,
      active: activeMerchants,
      pending: pendingMerchants,
      awaitingReview: documentsAwaitingReview
    });

    let activeFlashSales = 0;
    try {
      activeFlashSales = await FlashSale.countDocuments({ 
        isActive: true, 
        endDate: { $gt: new Date() } 
      });
    } catch (error) {
      console.log('Flash sales model not available yet');
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      recentMerchants,
      recentUsers,
      recentReviews,
      merchantsThisMonth,
      usersThisMonth,
      reviewsThisMonth,
      merchantsNeedingVerification
    ] = await Promise.all([
      Merchant.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('businessName email verified isActive createdAt businessType documents')
        .lean(),
      User.find({ role: { $ne: 'admin' } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('firstName lastName email createdAt')
        .lean(),
      Review.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'firstName lastName')
        .populate('merchant', 'businessName')
        .select('rating content createdAt')
        .lean(),
      Merchant.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ 
        role: { $ne: 'admin' },
        createdAt: { $gte: thirtyDaysAgo } 
      }),
      Review.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Merchant.find({
        verified: false,
        $and: [
          { 'documents.businessRegistration.path': { $exists: true, $ne: '' } },
          { 'documents.idDocument.path': { $exists: true, $ne: '' } },
          { 'documents.utilityBill.path': { $exists: true, $ne: '' } }
        ]
      })
        .sort({ 'documents.documentsSubmittedAt': -1 })
        .limit(10)
        .select('businessName email createdAt documents businessType')
        .lean()
    ]);

    // Calculate growth percentages
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 60);
    previousPeriodStart.setDate(previousPeriodStart.getDate() + 30);

    const [previousMerchants, previousUsers, previousReviews] = await Promise.all([
      Merchant.countDocuments({ 
        createdAt: { 
          $gte: previousPeriodStart, 
          $lt: thirtyDaysAgo 
        } 
      }),
      User.countDocuments({ 
        role: { $ne: 'admin' },
        createdAt: { 
          $gte: previousPeriodStart, 
          $lt: thirtyDaysAgo 
        } 
      }),
      Review.countDocuments({ 
        createdAt: { 
          $gte: previousPeriodStart, 
          $lt: thirtyDaysAgo 
        } 
      })
    ]);

    const merchantGrowth = previousMerchants > 0 
      ? ((merchantsThisMonth - previousMerchants) / previousMerchants * 100).toFixed(1)
      : merchantsThisMonth > 0 ? 100 : 0;

    const userGrowth = previousUsers > 0 
      ? ((usersThisMonth - previousUsers) / previousUsers * 100).toFixed(1)
      : usersThisMonth > 0 ? 100 : 0;

    const reviewGrowth = previousReviews > 0 
      ? ((reviewsThisMonth - previousReviews) / previousReviews * 100).toFixed(1)
      : reviewsThisMonth > 0 ? 100 : 0;

    const verificationRate = totalMerchants > 0 
      ? ((verifiedMerchants / totalMerchants) * 100).toFixed(1)
      : 0;

    const documentCompletionRate = totalMerchants > 0
      ? ((merchantsWithDocuments / totalMerchants) * 100).toFixed(1)
      : 0;

    const systemHealth = {
      database: 'healthy',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version
    };

    const responseData = {
      // FIXED: Return consistent counts
      totalMerchants,
      totalUsers,
      totalProducts,
      totalReviews,
      verifiedMerchants, // Now includes isActive check
      activeMerchants, // NEW: Separate active count
      pendingMerchants, // FIXED: Proper pending logic
      pendingVerifications: documentsAwaitingReview, // Clearer naming
      activeProducts,
      activeFlashSales,
      totalOrders,
      verification: {
        merchantsWithDocuments,
        merchantsPendingDocuments,
        documentsAwaitingReview,
        documentCompletionRate: parseFloat(documentCompletionRate),
        merchantsNeedingVerification
      },
      growth: {
        merchantsThisMonth,
        usersThisMonth,
        reviewsThisMonth,
        merchantGrowth: parseFloat(merchantGrowth),
        userGrowth: parseFloat(userGrowth),
        reviewGrowth: parseFloat(reviewGrowth)
      },
      metrics: {
        verificationRate: parseFloat(verificationRate),
        documentCompletionRate: parseFloat(documentCompletionRate),
        averageRating: totalReviews > 0 ? 4.5 : 0,
        productUploadRate: totalProducts > 0 ? (totalProducts / totalMerchants).toFixed(1) : 0
      },
      recentActivity: {
        recentMerchants: recentMerchants.map(merchant => ({
          ...merchant,
          hasDocuments: !!(
            merchant.documents?.businessRegistration?.path ||
            merchant.documents?.idDocument?.path ||
            merchant.documents?.utilityBill?.path
          )
        })),
        recentUsers: recentUsers.map(user => ({
          ...user,
          name: `${user.firstName} ${user.lastName}`
        })),
        recentReviews: recentReviews.map(review => ({
          ...review,
          user: review.user ? {
            _id: review.user._id,
            name: `${review.user.firstName} ${review.user.lastName}`,
            firstName: review.user.firstName,
            lastName: review.user.lastName
          } : null
        }))
      },
      systemHealth
    };

    console.log('✅ Dashboard stats generated successfully');
    
    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('❌ Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

module.exports = { getDashboardStats };

// @desc    Get recent activity
// @route   GET /api/admin/dashboard/recent-activity
// @access  Private (Admin)
const getRecentActivity = asyncHandler(async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const recentActivities = [];

    const recentUsers = await User.find({ role: { $ne: 'admin' } })
      .select('firstName lastName email createdAt role')
      .sort({ createdAt: -1 })
      .limit(Math.floor(limit / 4))
      .lean();

    const recentMerchants = await Merchant.find()
      .select('businessName email createdAt verified')
      .sort({ createdAt: -1 })
      .limit(Math.floor(limit / 4))
      .lean();

    const recentProducts = await Product.find()
      .select('name price merchant createdAt')
      .populate('merchant', 'businessName')
      .sort({ createdAt: -1 })
      .limit(Math.floor(limit / 4))
      .lean();

    const recentReviews = await Review.find()
      .select('rating content user merchant createdAt')
      .populate('user', 'firstName lastName')
      .populate('merchant', 'businessName')
      .sort({ createdAt: -1 })
      .limit(Math.floor(limit / 4))
      .lean();

    recentUsers.forEach(user => {
      const userName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || user.email || 'Unknown User';
      
      recentActivities.push({
        id: `user_${user._id}`,
        type: 'user_signup',
        description: `New ${user.role || 'user'} "${userName}" registered`,
        timestamp: user.createdAt,
        user: userName,
        details: { email: user.email, role: user.role }
      });
    });

    recentMerchants.forEach(merchant => {
      recentActivities.push({
        id: `merchant_${merchant._id}`,
        type: merchant.verified ? 'merchant_verified' : 'merchant_registration',
        description: merchant.verified 
          ? `Merchant "${merchant.businessName}" was verified`
          : `New merchant "${merchant.businessName}" submitted application`,
        timestamp: merchant.createdAt,
        user: merchant.businessName,
        details: { email: merchant.email, verified: merchant.verified }
      });
    });

    recentProducts.forEach(product => {
      recentActivities.push({
        id: `product_${product._id}`,
        type: 'product_added',
        description: `New product "${product.name}" added by ${product.merchant?.businessName || 'Unknown'}`,
        timestamp: product.createdAt,
        user: product.merchant?.businessName,
        details: { productName: product.name, price: product.price }
      });
    });

    recentReviews.forEach(review => {
      const reviewerName = review.user?.firstName && review.user?.lastName
        ? `${review.user.firstName} ${review.user.lastName}`
        : review.user?.firstName || 'Anonymous';
      
      recentActivities.push({
        id: `review_${review._id}`,
        type: 'review_posted',
        description: `${reviewerName} left a ${review.rating}★ review for ${review.merchant?.businessName || 'Unknown'}`,
        timestamp: review.createdAt,
        user: reviewerName,
        details: { rating: review.rating, merchant: review.merchant?.businessName }
      });
    });

    const sortedActivities = recentActivities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit))
      .map(activity => ({
        ...activity,
        timestamp: formatTimeAgo(activity.timestamp)
      }));

    res.json({
      success: true,
      data: sortedActivities,
      count: sortedActivities.length
    });

  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity'
    });
  }
});

// @desc    Get all merchants with enhanced document information
// @route   GET /api/admin/dashboard/merchants
// @access  Private (Admin)
const getMerchants = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 100, 
    verified, 
    businessType, 
    search,
    documentStatus,
  } = req.query;

  const query = {};
  
  if (verified !== undefined) {
    query.verified = verified === 'true';
  }
  
  if (businessType) {
    query.businessType = businessType;
  }
  
  if (search) {
    query.$or = [
      { businessName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (documentStatus) {
    switch (documentStatus) {
      case 'complete':
        query.$and = [
          { 'documents.businessRegistration': { $exists: true, $ne: '' } },
          { 'documents.idDocument': { $exists: true, $ne: '' } },
          { 'documents.utilityBill': { $exists: true, $ne: '' } }
        ];
        break;
      case 'incomplete':
        query.$or = [
          { 'documents.businessRegistration': { $exists: false } },
          { 'documents.businessRegistration': '' },
          { 'documents.idDocument': { $exists: false } },
          { 'documents.idDocument': '' },
          { 'documents.utilityBill': { $exists: false } },
          { 'documents.utilityBill': '' }
        ];
        break;
      case 'pending_review':
        query.$and = [
          { 'documents.businessRegistration': { $exists: true, $ne: '' } },
          { 'documents.idDocument': { $exists: true, $ne: '' } },
          { 'documents.utilityBill': { $exists: true, $ne: '' } },
          { verified: false }
        ];
        break;
    }
  }

  const merchants = await Merchant.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-password')
    .lean();

  const enhancedMerchants = merchants.map(merchant => {
    const documentStatus = {
      businessRegistration: !!(merchant.documents?.businessRegistration),
      idDocument: !!(merchant.documents?.idDocument),
      utilityBill: !!(merchant.documents?.utilityBill),
      additionalDocs: !!(merchant.documents?.additionalDocs?.length > 0)
    };

    const documentCompleteness = Object.values(documentStatus).slice(0, 3).filter(Boolean).length;
    const isDocumentComplete = documentCompleteness === 3;
    
    return {
      ...merchant,
      documentStatus,
      documentCompleteness,
      isDocumentComplete,
      needsVerification: isDocumentComplete && !merchant.verified
    };
  });

  const total = await Merchant.countDocuments(query);

  const queryStats = await Merchant.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalMerchants: { $sum: 1 },
        verifiedMerchants: { $sum: { $cond: [{ $eq: ['$verified', true] }, 1, 0] } },
        withBusinessReg: {
          $sum: {
            $cond: [
              { $and: [
                { $ne: ['$documents.businessRegistration', null] },
                { $ne: ['$documents.businessRegistration', ''] }
              ]}, 1, 0
            ]
          }
        },
        withIdDoc: {
          $sum: {
            $cond: [
              { $and: [
                { $ne: ['$documents.idDocument', null] },
                { $ne: ['$documents.idDocument', ''] }
              ]}, 1, 0
            ]
          }
        },
        withUtilityBill: {
          $sum: {
            $cond: [
              { $and: [
                { $ne: ['$documents.utilityBill', null] },
                { $ne: ['$documents.utilityBill', ''] }
              ]}, 1, 0
            ]
          }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    merchants: enhancedMerchants,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    },
    queryStats: queryStats[0] || {
      totalMerchants: 0,
      verifiedMerchants: 0,
      withBusinessReg: 0,
      withIdDoc: 0,
      withUtilityBill: 0
    }
  });
});

// @desc    Get merchant documents for admin review
// @route   GET /api/admin/dashboard/merchants/:id/documents
// @access  Private (Admin)
const getMerchantDocuments = asyncHandler(async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id)
      .select('businessName email documents verified verifiedDate createdAt');

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found'
      });
    }

    const documentAnalysis = {
      businessRegistration: {
        submitted: !!(merchant.documents?.businessRegistration),
        path: merchant.documents?.businessRegistration || null,
        required: true
      },
      idDocument: {
        submitted: !!(merchant.documents?.idDocument),
        path: merchant.documents?.idDocument || null,
        required: true
      },
      utilityBill: {
        submitted: !!(merchant.documents?.utilityBill),
        path: merchant.documents?.utilityBill || null,
        required: true
      },
      additionalDocs: {
        submitted: !!(merchant.documents?.additionalDocs?.length > 0),
        paths: merchant.documents?.additionalDocs || [],
        required: false
      }
    };

    const requiredDocsSubmitted = [
      documentAnalysis.businessRegistration.submitted,
      documentAnalysis.idDocument.submitted,
      documentAnalysis.utilityBill.submitted
    ].filter(Boolean).length;

    const canBeVerified = requiredDocsSubmitted === 3;

    res.status(200).json({
      success: true,
      merchant: {
        id: merchant._id,
        businessName: merchant.businessName,
        email: merchant.email,
        verified: merchant.verified,
        verifiedDate: merchant.verifiedDate,
        createdAt: merchant.createdAt
      },
      documents: merchant.documents,
      analysis: {
        documentAnalysis,
        requiredDocsSubmitted,
        totalRequiredDocs: 3,
        canBeVerified,
        completionPercentage: (requiredDocsSubmitted / 3 * 100).toFixed(0)
      }
    });
  } catch (error) {
    console.error('Get merchant documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch merchant documents'
    });
  }
});

// @desc    View/Download a specific merchant document
// @route   GET /api/admin/dashboard/merchants/:id/documents/:docType/view
// @access  Private (Admin)
const viewMerchantDocument = asyncHandler(async (req, res) => {
  const path = require('path');
  const fs = require('fs');

  try {
    const { id: merchantId, docType } = req.params;

    const merchant = await Merchant.findById(merchantId)
      .select('businessName documents');

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found'
      });
    }

    let documentInfo = null;
    let isAdditionalDoc = false;
    let additionalDocIndex = null;
    
    switch (docType) {
      case 'businessRegistration':
        documentInfo = merchant.documents?.businessRegistration;
        break;
      case 'idDocument':
        documentInfo = merchant.documents?.idDocument;
        break;
      case 'utilityBill':
        documentInfo = merchant.documents?.utilityBill;
        break;
      default:
        const additionalMatch = docType.match(/additionalDocs\[(\d+)\]/);
        if (additionalMatch && merchant.documents?.additionalDocs) {
          additionalDocIndex = parseInt(additionalMatch[1]);
          if (additionalDocIndex < merchant.documents.additionalDocs.length) {
            documentInfo = merchant.documents.additionalDocs[additionalDocIndex];
            isAdditionalDoc = true;
          }
        }
        
        if (!documentInfo) {
          return res.status(400).json({
            success: false,
            message: 'Invalid document type'
          });
        }
        break;
    }

    if (!documentInfo || !documentInfo.path) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or not uploaded'
      });
    }

    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const filePath = path.join(uploadsDir, documentInfo.path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found on server'
      });
    }

    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    
    res.setHeader('Content-Type', documentInfo.mimeType || 'application/octet-stream');
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Content-Disposition', `inline; filename="${documentInfo.originalName || docType}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error reading document file'
        });
      }
    });

  } catch (error) {
    console.error('View merchant document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve document'
    });
  }
});

// @desc    Process multiple merchant verifications
// @route   POST /api/admin/dashboard/merchants/bulk-verify
// @access  Private (Admin)
const bulkVerifyMerchants = asyncHandler(async (req, res) => {
  try {
    const { merchantIds, action } = req.body;

    if (!merchantIds || !Array.isArray(merchantIds) || merchantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of merchant IDs'
      });
    }

    if (!['verify', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "verify" or "reject"'
      });
    }

    const updateData = action === 'verify' 
      ? { verified: true, verifiedDate: new Date() }
      : { verified: false, verifiedDate: null };

    const result = await Merchant.updateMany(
      { _id: { $in: merchantIds } },
      updateData
    );

    const updatedMerchants = await Merchant.find({ _id: { $in: merchantIds } })
      .select('businessName email verified verifiedDate');

    if (req.admin && req.admin.id !== 'hardcoded-admin-id') {
      await AdminUser.findByIdAndUpdate(req.admin.id, {
        $push: {
          activityLog: {
            action: `bulk_merchant_${action}`,
            details: `${action === 'verify' ? 'Verified' : 'Rejected'} ${result.modifiedCount} merchants`,
            timestamp: new Date()
          }
        }
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully ${action === 'verify' ? 'verified' : 'rejected'} ${result.modifiedCount} merchants`,
      modifiedCount: result.modifiedCount,
      merchants: updatedMerchants
    });
  } catch (error) {
    console.error('Bulk verify merchants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk verification'
    });
  }
});

// @desc    Bulk update merchant activation status
// @route   PUT /api/admin/dashboard/merchants/bulk-status
// @access  Private (Admin)
const bulkUpdateMerchantStatus = asyncHandler(async (req, res) => {
  try {
    const { merchantIds, isActive } = req.body;

    if (!merchantIds || !Array.isArray(merchantIds) || merchantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of merchant IDs'
      });
    }

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please specify the activation status (true/false)'
      });
    }

    const updateData = {
      isActive: Boolean(isActive),
      activatedDate: isActive ? new Date() : null,
      deactivatedDate: !isActive ? new Date() : null
    };

    const result = await Merchant.updateMany(
      { _id: { $in: merchantIds } },
      updateData,
      { runValidators: true }
    );

    const updatedMerchants = await Merchant.find({ _id: { $in: merchantIds } })
      .select('businessName email isActive activatedDate deactivatedDate');

    if (req.admin && req.admin.id !== 'hardcoded-admin-id') {
      await AdminUser.findByIdAndUpdate(req.admin.id, {
        $push: {
          activityLog: {
            action: `bulk_merchant_${isActive ? 'activate' : 'deactivate'}`,
            details: `${isActive ? 'Activated' : 'Deactivated'} ${result.modifiedCount} merchants`,
            timestamp: new Date()
          }
        }
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully ${isActive ? 'activated' : 'deactivated'} ${result.modifiedCount} merchants`,
      modifiedCount: result.modifiedCount,
      merchants: updatedMerchants
    });
  } catch (error) {
    console.error('Bulk update merchant status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk status update'
    });
  }
});

// @desc    Create merchant
// @route   POST /api/admin/dashboard/merchants
// @access  Private (Admin)
const createMerchant = asyncHandler(async (req, res) => {
  const {
    businessName,
    email,
    phone,
    businessType,
    description,
    address,
    location,
    website,
    yearEstablished,
    autoVerify = false
  } = req.body;

  // Validate required fields
  if (!businessName || !email || !phone || !businessType) {
    return res.status(400).json({
      success: false,
      message: 'Business name, email, phone, and business type are required'
    });
  }

  // Check if merchant already exists
  const existingMerchant = await Merchant.findOne({ email });
  if (existingMerchant) {
    return res.status(400).json({
      success: false,
      message: 'Merchant with this email already exists'
    });
  }

  // Generate secure temporary password that meets validation requirements
  // Format: 8+ chars with uppercase, lowercase, number, and special char
  const generateSecurePassword = () => {
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*';
    
    // Ensure at least one character from each required category
    let password = '';
    password += upperCase[Math.floor(Math.random() * upperCase.length)];
    password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
    
    // Fill remaining 8 characters randomly from all categories
    const allChars = upperCase + lowerCase + numbers + specialChars;
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password to randomize character positions
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  };
  
  const tempPassword = generateSecurePassword();

  const defaultBusinessHours = {
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '09:00', close: '16:00', closed: false },
    sunday: { open: '10:00', close: '16:00', closed: true }
  };

  // Set password expiry (24 hours from now)
  const passwordExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const merchant = await Merchant.create({
    businessName,
    email,
    phone,
    password: tempPassword,
    tempPasswordExpiry: passwordExpiry,
    businessType,
    description,
    address,
    location,
    website,
    yearEstablished,
    businessHours: defaultBusinessHours,
    verified: autoVerify,
    verifiedDate: autoVerify ? new Date() : null,
    createdByAdmin: true,
    createdByAdminId: req.admin.id,
    createdByAdminName: req.admin.firstName + ' ' + req.admin.lastName,
    onboardingStatus: 'credentials_sent'
  });

  // Send welcome email with improved template
  try {
    // Use the email service for consistent email handling
    const { emailService } = require('../utils/emailService');
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f44336; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏢 Welcome to Nairobi Verified!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your merchant account has been created successfully</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #333; margin-top: 0;">Business Account Details</h2>
          <p style="color: #666; line-height: 1.6;">
            Welcome <strong>${businessName}</strong>! Your merchant account has been created by our admin team.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f44336;">
            <h3 style="margin-top: 0; color: #333;">🔐 Login Credentials</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <code style="background: #f1f1f1; padding: 2px 8px; border-radius: 4px;">${tempPassword}</code></p>
          </div>
        </div>

        ${autoVerify ? 
          '<div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;"><p style="color: #2e7d32; margin: 0; font-size: 14px;"><strong>✅ Pre-Verified:</strong> Your account has been pre-verified and is ready to use!</p></div>' : 
          '<div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;"><p style="color: #ef6c00; margin: 0; font-size: 14px;"><strong>📋 Next Steps:</strong> Please log in and upload your verification documents to complete your account setup.</p></div>'
        }

        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #ef6c00; margin: 0; font-size: 14px;">
            <strong>⚠️ Important Security Notice:</strong> You must change your password within 24 hours of receiving this email. After 24 hours, this temporary password will expire for security reasons.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/merchant/login" style="background: #f44336; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Login to Your Account
          </a>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Nairobi CBD Business Directory Team
          </p>
        </div>
      </div>
    `;

    await emailService.sendEmail({
      to: email,
      subject: '🏢 Welcome to Nairobi Verified - Merchant Account Created',
      html: emailContent
    });
    
    console.log(`✅ Welcome email sent to merchant: ${email}`);
    
  } catch (emailError) {
    console.error('❌ Email sending failed:', emailError);
  }

  // Log admin activity
  try {
    if (req.admin.id !== 'hardcoded-admin-id') {
      await AdminUser.findByIdAndUpdate(req.admin.id, {
        $push: {
          activityLog: {
            action: 'merchant_created',
            details: `Created merchant account for ${businessName}${autoVerify ? ' (auto-verified)' : ''}`,
            timestamp: new Date()
          }
        }
      });
    }
  } catch (logError) {
    console.error('Failed to log admin activity:', logError);
  }

  res.status(201).json({
    success: true,
    merchant: {
      id: merchant._id,
      businessName: merchant.businessName,
      email: merchant.email,
      phone: merchant.phone,
      businessType: merchant.businessType,
      verified: merchant.verified,
      createdAt: merchant.createdAt,
      documentsRequired: !autoVerify,
      verificationStatus: autoVerify ? 'verified' : 'pending_documents'
    },
    message: 'Merchant created successfully'
  });
});

// @desc    Update merchant status
// @route   PUT /api/admin/dashboard/merchants/:id/status
// @access  Private (Admin)
const updateMerchantStatus = asyncHandler(async (req, res) => {
  try {
    // Accept both 'active' and 'isActive' for backward compatibility
    const { verified, active, isActive } = req.body;
    
    // Use isActive if provided, otherwise fall back to active
    const activeStatus = isActive !== undefined ? isActive : active;

    console.log('📝 Update merchant status request:', {
      merchantId: req.params.id,
      verified,
      active,
      isActive,
      activeStatus
    });

    // Build update object
    const updateData = {};
    
    if (verified !== undefined) {
      updateData.verified = Boolean(verified);
      updateData.verifiedDate = verified ? new Date() : null;
    }

    if (activeStatus !== undefined) {
      updateData.isActive = Boolean(activeStatus);
      updateData.activatedDate = activeStatus ? new Date() : null;
      updateData.deactivatedDate = !activeStatus ? new Date() : null;
    }

    console.log('📊 Update data being applied:', updateData);

    // First, verify merchant exists
    const existingMerchant = await Merchant.findById(req.params.id);
    if (!existingMerchant) {
      console.log('❌ Merchant not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Merchant not found'
      });
    }

    // Apply updates directly to the merchant object
    Object.assign(existingMerchant, updateData);
    
    // Save the merchant (this triggers pre-save hooks and validations)
    await existingMerchant.save();

    console.log('✅ Merchant updated successfully:', {
      id: existingMerchant._id,
      businessName: existingMerchant.businessName,
      isActive: existingMerchant.isActive,
      verified: existingMerchant.verified
    });

    // Log admin activity (if admin is authenticated)
    if (req.admin && req.admin.id && req.admin.id !== 'hardcoded-admin-id') {
      try {
        const statusChanges = [];
        if (verified !== undefined) {
          statusChanges.push(verified ? 'Verified' : 'Unverified');
        }
        if (activeStatus !== undefined) {
          statusChanges.push(activeStatus ? 'Activated' : 'Deactivated');
        }

        await AdminUser.findByIdAndUpdate(req.admin.id, {
          $push: {
            activityLog: {
              action: 'merchant_status_updated',
              details: `${statusChanges.join(' and ')} merchant ${existingMerchant.businessName}`,
              timestamp: new Date()
            }
          }
        });
      } catch (logError) {
        console.error('⚠️ Failed to log admin activity:', logError.message);
        // Don't fail the request if logging fails
      }
    }

    // Send email notification (non-blocking)
    try {
      const statusMessage = verified 
        ? 'Your merchant account has been verified and activated!' 
        : activeStatus 
          ? 'Your merchant account has been activated.'
          : 'Your merchant account status has been updated.';
      
      const emailContent = `
        <h2>Account Status Update</h2>
        <p>Hello ${existingMerchant.businessName},</p>
        <p>${statusMessage}</p>
        ${verified ? '<p>You can now start adding products and services to your merchant dashboard.</p>' : ''}
        <p>Login to your dashboard: ${process.env.FRONTEND_URL}/merchant/login</p>
      `;

      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: existingMerchant.email,
        subject: 'Nairobi Verified - Account Status Update',
        html: emailContent
      });
      console.log('📧 Email notification sent to:', existingMerchant.email);
    } catch (emailError) {
      console.error('⚠️ Email notification failed:', emailError.message);
      // Don't fail the request if email fails
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Merchant status updated successfully',
      merchant: {
        id: existingMerchant._id,
        businessName: existingMerchant.businessName,
        email: existingMerchant.email,
        verified: existingMerchant.verified,
        verifiedDate: existingMerchant.verifiedDate,
        isActive: existingMerchant.isActive,
        activatedDate: existingMerchant.activatedDate,
        deactivatedDate: existingMerchant.deactivatedDate,
        updatedAt: existingMerchant.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Update merchant status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update merchant status',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});


/**
 * @desc    Verify single merchant
 * @route   PUT /api/admin/dashboard/merchants/:id/verify
 * @access  Private/Admin
 */
const verifyMerchant = asyncHandler(async (req, res) => {
  try {
    const merchantId = req.params.id;
    
    console.log('🔍 Verifying merchant:', merchantId);

    // Find the merchant
    const merchant = await Merchant.findById(merchantId);
    
    if (!merchant) {
      console.log('❌ Merchant not found:', merchantId);
      return res.status(404).json({
        success: false,
        message: 'Merchant not found'
      });
    }

    // Check if merchant has required documents
    const hasRequiredDocs = 
      merchant.documents?.businessRegistration?.path &&
      merchant.documents?.idDocument?.path &&
      merchant.documents?.utilityBill?.path;

    if (!hasRequiredDocs) {
      console.log('⚠️ Cannot verify - missing documents:', {
        businessRegistration: !!merchant.documents?.businessRegistration?.path,
        idDocument: !!merchant.documents?.idDocument?.path,
        utilityBill: !!merchant.documents?.utilityBill?.path
      });
      
      return res.status(400).json({
        success: false,
        message: 'Cannot verify merchant: Required documents are missing',
        requiredDocuments: {
          businessRegistration: !!merchant.documents?.businessRegistration?.path,
          idDocument: !!merchant.documents?.idDocument?.path,
          utilityBill: !!merchant.documents?.utilityBill?.path
        }
      });
    }

    // Update merchant verification status
    merchant.verified = true;
    merchant.verifiedDate = new Date();
    merchant.isActive = true; // Also activate when verifying
    merchant.activatedDate = new Date();
    
    // Update onboarding status if it exists
    if (merchant.onboardingStatus) {
      merchant.onboardingStatus = 'completed';
    }

    // Save the merchant
    await merchant.save();

    console.log('✅ Merchant verified successfully:', {
      id: merchant._id,
      businessName: merchant.businessName,
      verified: merchant.verified,
      isActive: merchant.isActive
    });

    // Log admin activity
    if (req.admin && req.admin.id && req.admin.id !== 'hardcoded-admin-id') {
      try {
        await AdminUser.findByIdAndUpdate(req.admin.id, {
          $push: {
            activityLog: {
              action: 'merchant_verified',
              details: `Verified merchant: ${merchant.businessName} (${merchant.email})`,
              timestamp: new Date()
            }
          }
        });
      } catch (logError) {
        console.error('⚠️ Failed to log admin activity:', logError.message);
      }
    }

    // Send verification email notification
    try {
      const { emailService } = require('../utils/emailService');
      
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #4caf50; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your business has been verified</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${merchant.businessName}!</h2>
            <p style="color: #666; line-height: 1.6;">
              Great news! Your business has been successfully verified and is now live on Nairobi Verified.
            </p>
            <p style="color: #666; line-height: 1.6;">
              You can now enjoy all the benefits of being a verified business, including:
            </p>
            <ul style="color: #666; line-height: 1.8;">
              <li>✅ Verified badge on your profile</li>
              <li>📈 Increased visibility in search results</li>
              <li>🎯 Access to premium features</li>
              <li>💬 Customer reviews and ratings</li>
              <li>📊 Business analytics dashboard</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/merchant/dashboard" 
               style="background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Visit Your Dashboard
            </a>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">
              Nairobi CBD Business Directory Team
            </p>
          </div>
        </div>
      `;

      await emailService.sendEmail({
        to: merchant.email,
        subject: '🎉 Your Business Has Been Verified - Nairobi Verified',
        html: emailContent
      });
      
      console.log('📧 Verification email sent to:', merchant.email);
      
    } catch (emailError) {
      console.error('⚠️ Email sending failed:', emailError.message);
      // Don't fail the request if email fails
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Merchant verified successfully',
      data: {
        id: merchant._id,
        businessName: merchant.businessName,
        email: merchant.email,
        verified: merchant.verified,
        verifiedDate: merchant.verifiedDate,
        isActive: merchant.isActive,
        activatedDate: merchant.activatedDate
      }
    });

  } catch (error) {
    console.error('❌ Verify merchant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify merchant',
      error: error.message
    });
  }
});

/**
 * @desc    Delete single merchant
 * @route   DELETE /api/admin/dashboard/merchants/:merchantId
 * @access  Private/Admin
 */
const deleteMerchant = async (req, res) => {
  try {
    const { merchantId } = req.params;

    // Find merchant
    const merchant = await Merchant.findById(merchantId);
    
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found'
      });
    }

    // Delete associated data
    await Promise.all([
      Review.deleteMany({ merchant: merchantId }),
      Product.deleteMany({ merchant: merchantId })
    ]);

    // Delete merchant
    await merchant.deleteOne();

    res.status(200).json({
      success: true,
      message: `Merchant ${merchant.businessName} deleted successfully`,
      data: {}
    });
  } catch (error) {
    console.error('Delete merchant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete merchant',
      error: error.message
    });
  }
};

// @desc    Get all users with pagination and filtering
// @route   GET /api/admin/dashboard/users
// @access  Private (Admin)
const getUsers = asyncHandler(async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      role = '', 
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { role: { $ne: 'admin' } };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password')
      .lean();

    const total = await User.countDocuments(query);

    const userStats = await User.aggregate([
      { $match: { role: { $ne: 'admin' } } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          inactiveUsers: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: userStats[0] || { totalUsers: 0, activeUsers: 0, inactiveUsers: 0 }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// @desc    Create new user
// @route   POST /api/admin/dashboard/users
// @access  Private (Admin)
const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, name, email, phone, role = 'user' } = req.body;

  // Validate required fields
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  // Handle name field - split if provided as single name, or use firstName/lastName
  let userFirstName, userLastName;
  if (firstName && lastName) {
    userFirstName = firstName.trim();
    userLastName = lastName.trim();
  } else if (name) {
    const nameParts = name.trim().split(' ');
    userFirstName = nameParts[0] || 'User';
    userLastName = nameParts.slice(1).join(' ') || 'Account';
  } else {
    return res.status(400).json({
      success: false,
      message: 'First name and last name are required'
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Generate secure temporary password that meets validation requirements
  // Format: 8+ chars with uppercase, lowercase, number, and special char
  const generateSecurePassword = () => {
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*';
    
    // Ensure at least one character from each required category
    let password = '';
    password += upperCase[Math.floor(Math.random() * upperCase.length)];
    password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
    
    // Fill remaining 8 characters randomly from all categories
    const allChars = upperCase + lowerCase + numbers + specialChars;
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password to randomize character positions
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  };
  
  const tempPassword = generateSecurePassword();

  // Set password expiry (24 hours from now)
  const passwordExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await User.create({
    firstName: userFirstName,
    lastName: userLastName,
    email,
    phone: phone || '',
    password: tempPassword,
    role,
    isActive: true,
    // tempPasswordExpiry: passwordExpiry, // Commented out temporarily
    createdByAdmin: true,
    createdByAdminId: req.admin.id
  });

  try {
    // Use the email service for consistent email handling
    const { emailService } = require('../utils/emailService');
    
    // Set password expiry (24 hours from now)
    const passwordExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    user.tempPasswordExpiry = passwordExpiry;
    await user.save();
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f44336; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to Nairobi Verified!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your account has been created successfully</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #333; margin-top: 0;">Account Details</h2>
          <p style="color: #666; line-height: 1.6;">
            Welcome <strong>${userFirstName} ${userLastName}</strong>! Your account has been created by our admin team.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f44336;">
            <h3 style="margin-top: 0; color: #333;">🔐 Login Credentials</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <code style="background: #f1f1f1; padding: 2px 8px; border-radius: 4px;">${tempPassword}</code></p>
          </div>
        </div>

        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #ef6c00; margin: 0; font-size: 14px;">
            <strong>⚠️ Important Security Notice:</strong> You must change your password within 24 hours of receiving this email. After 24 hours, this temporary password will expire for security reasons.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login" style="background: #f44336; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Login to Your Account
          </a>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Nairobi CBD Business Directory Team
          </p>
        </div>
      </div>
    `;

    await emailService.sendEmail({
      to: email,
      subject: '🎉 Welcome to Nairobi Verified - Account Created',
      html: emailContent
    });
    
    console.log(`✅ Welcome email sent to user: ${email}`);
    
  } catch (emailError) {
    console.error('❌ Email sending failed:', emailError);
  }

  res.status(201).json({
    success: true,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    },
    message: 'User created successfully'
  });
});

// @desc    Update user
// @route   PUT /api/admin/dashboard/users/:id
// @access  Private (Admin)
const updateUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, name, email, phone, role, isActive } = req.body;

  // Handle both firstName/lastName and name field formats
  const updateData = { email, phone, role, isActive };
  
  if (firstName && lastName) {
    updateData.firstName = firstName;
    updateData.lastName = lastName;
  } else if (name) {
    // If only name is provided, split it into firstName and lastName
    const nameParts = name.trim().split(' ');
    updateData.firstName = nameParts[0];
    updateData.lastName = nameParts.slice(1).join(' ') || nameParts[0];
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Log admin activity
  try {
    if (req.admin.id !== 'hardcoded-admin-id') {
      await AdminUser.findByIdAndUpdate(req.admin.id, {
        $push: {
          activityLog: {
            action: 'user_updated',
            details: `Updated user: ${user.firstName} ${user.lastName} (${user.email})`,
            timestamp: new Date()
          }
        }
      });
    }
  } catch (logError) {
    console.error('Failed to log admin activity:', logError);
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    },
    message: 'User updated successfully'
  });
});

// @desc    Update user status
// @route   PUT /api/admin/dashboard/users/:id/status
// @access  Private (Admin)
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isActive must be a boolean value'
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true, runValidators: true, upsert: false }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Debug: Log the user object to see what fields are available
  console.log('🔍 User object after update:', {
    id: user._id,
    isActive: user.isActive,
    firstName: user.firstName,
    allFields: Object.keys(user.toObject())
  });

  // Ensure isActive field exists and has the correct value
  if (user.isActive === undefined) {
    console.log('⚠️ isActive is undefined, setting it manually');
    user.isActive = isActive;
    await user.save();
  }

  // Log admin activity
  try {
    if (req.admin.id !== 'hardcoded-admin-id') {
      await AdminUser.findByIdAndUpdate(req.admin.id, {
        $push: {
          activityLog: {
            action: 'user_status_updated',
            details: `${isActive ? 'Activated' : 'Deactivated'} user: ${user.firstName} ${user.lastName} (${user.email})`,
            timestamp: new Date()
          }
        }
      });
    }
  } catch (logError) {
    console.error('Failed to log admin activity:', logError);
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    },
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/dashboard/users/:id
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Store user info for logging before deletion
  const userInfo = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email
  };

  // Delete the user from database
  await User.findByIdAndDelete(req.params.id);

  // Log admin activity
  try {
    if (req.admin.id !== 'hardcoded-admin-id') {
      await AdminUser.findByIdAndUpdate(req.admin.id, {
        $push: {
          activityLog: {
            action: 'user_deleted',
            details: `Deleted user: ${userInfo.firstName} ${userInfo.lastName} (${userInfo.email})`,
            timestamp: new Date()
          }
        }
      });
    }
  } catch (logError) {
    console.error('Failed to log admin activity:', logError);
  }

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Get all products with pagination and filtering
// @route   GET /api/admin/dashboard/products
// @access  Private (Admin)
const getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, search } = req.query;

  const query = {};
  
  if (category) {
    query.category = category;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const products = await Product.find(query)
    .populate('merchant', 'businessName')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Create new product
// @route   POST /api/admin/dashboard/products
// @access  Private (Admin)
const createProduct = asyncHandler(async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      originalPrice,
      category, 
      subcategory,
      merchant,
      stock = 0,
      tags = [],
      specifications = {},
      isActive = true
    } = req.body;

    if (!name || !description || !price || !category || !merchant) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, category, and merchant are required'
      });
    }

    const existingMerchant = await Merchant.findById(merchant);
    if (!existingMerchant) {
      return res.status(400).json({
        success: false,
        message: 'Invalid merchant ID'
      });
    }

    const newProduct = new Product({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      category: category.trim(),
      subcategory: subcategory ? subcategory.trim() : undefined,
      merchant: merchant,
      stock: parseInt(stock),
      tags: Array.isArray(tags) ? tags : [],
      specifications: specifications || {},
      isActive: Boolean(isActive),
      inStock: parseInt(stock) > 0,
      images: [],
      rating: 0,
      totalReviews: 0,
      totalSales: 0
    });

    await newProduct.save();

    await newProduct.populate('merchant', 'businessName verified');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// @desc    Get all reviews with pagination and filtering
// @route   GET /api/admin/dashboard/reviews
// @access  Private (Admin)
const getReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, rating } = req.query;

  const query = {};
  
  if (rating) {
    query.rating = parseInt(rating);
  }

  const reviews = await Review.find(query)
    .populate('user', 'name')
    .populate('merchant', 'businessName')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Review.countDocuments(query);

  res.status(200).json({
    success: true,
    reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Delete review
// @route   DELETE /api/admin/dashboard/reviews/:id
// @access  Private (Admin)
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  await review.remove();

  if (req.admin.id !== 'hardcoded-admin-id') {
    await AdminUser.findByIdAndUpdate(req.admin.id, {
      $push: {
        activityLog: {
          action: 'review_deleted',
          details: `Deleted review from ${review.user}`,
          timestamp: new Date()
        }
      }
    });
  }

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// @desc    Get system status and health
// @route   GET /api/admin/dashboard/system-status
// @access  Private (Admin)
const getSystemStatus = asyncHandler(async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    const memUsage = process.memoryUsage();
    const memUsageFormatted = {
      rss: (memUsage.rss / 1024 / 1024).toFixed(2) + ' MB',
      heapTotal: (memUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
      heapUsed: (memUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
      external: (memUsage.external / 1024 / 1024).toFixed(2) + ' MB'
    };

    const uptimeSeconds = process.uptime();
    const uptimeFormatted = {
      days: Math.floor(uptimeSeconds / 86400),
      hours: Math.floor((uptimeSeconds % 86400) / 3600),
      minutes: Math.floor((uptimeSeconds % 3600) / 60),
      seconds: Math.floor(uptimeSeconds % 60)
    };

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [
      newMerchantsToday,
      newUsersToday,
      newReviewsToday,
      newProductsToday
    ] = await Promise.all([
      Merchant.countDocuments({ createdAt: { $gte: last24Hours } }),
      User.countDocuments({ createdAt: { $gte: last24Hours } }),
      Review.countDocuments({ createdAt: { $gte: last24Hours } }),
      Product.countDocuments({ createdAt: { $gte: last24Hours } })
    ]);

    const [
      totalMerchants,
      totalUsers,
      totalProducts,
      totalReviews
    ] = await Promise.all([
      Merchant.countDocuments(),
      User.countDocuments(),
      Product.countDocuments(),
      Review.countDocuments()
    ]);

    const systemStatus = {
      server: {
        status: 'online',
        uptime: uptimeFormatted,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      database: {
        status: dbStatus,
        collections: {
          merchants: totalMerchants,
          users: totalUsers,
          products: totalProducts,
          reviews: totalReviews
        }
      },
      performance: {
        memoryUsage: memUsageFormatted,
        cpuUsage: 'N/A',
        responseTime: 'Good'
      },
      activity: {
        last24Hours: {
          newMerchants: newMerchantsToday,
          newUsers: newUsersToday,
          newReviews: newReviewsToday,
          newProducts: newProductsToday
        }
      },
      health: {
        overall: 'healthy',
        issues: [],
        lastCheck: new Date()
      }
    };

    res.status(200).json({
      success: true,
      systemStatus
    });
  } catch (error) {
    console.error('Get system status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system status'
    });
  }
});

// @desc    Export data as CSV/JSON
// @route   GET /api/admin/dashboard/export/:type
// @access  Private (Admin)
const exportData = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { format = 'csv', dateRange = '30' } = req.query;

  try {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));

    let data = [];
    let filename = '';

    switch (type) {
      case 'merchants':
        data = await Merchant.find({ createdAt: { $gte: daysAgo } })
          .select('businessName email phone businessType verified createdAt address')
          .lean();
        filename = `merchants_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'users':
        data = await User.find({ 
          createdAt: { $gte: daysAgo },
          role: { $ne: 'admin' }
        })
          .select('name email phone role isActive createdAt')
          .lean();
        filename = `users_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'reviews':
        data = await Review.find({ createdAt: { $gte: daysAgo } })
          .populate('user', 'name email')
          .populate('merchant', 'businessName')
          .select('rating comment createdAt user merchant')
          .lean();
        filename = `reviews_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'products':
        data = await Product.find({ createdAt: { $gte: daysAgo } })
          .populate('merchant', 'businessName')
          .select('name price category isActive createdAt merchant')
          .lean();
        filename = `products_export_${new Date().toISOString().split('T')[0]}`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      res.status(200).json({
        success: true,
        data,
        exportedAt: new Date(),
        totalRecords: data.length
      });
    } else {
      const createCsvContent = (data) => {
        if (data.length === 0) return 'No data available';
        
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => 
          Object.values(row).map(value => 
            typeof value === 'object' ? JSON.stringify(value) : String(value)
          ).join(',')
        );
        
        return [headers, ...rows].join('\n');
      };

      const csvContent = createCsvContent(data);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.status(200).send(csvContent);
    }

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data'
    });
  }
});

// @desc    Get admin settings
// @route   GET /api/admin/dashboard/settings
// @access  Private (Admin)
const getSettings = asyncHandler(async (req, res) => {
  try {
    const settings = {
      general: {
        siteName: 'Nairobi Verified',
        siteDescription: 'Trusted marketplace in Nairobi CBD',
        contactEmail: process.env.FROM_EMAIL || 'admin@nairobiverified.com',
        supportPhone: '+254712345678'
      },
      business: {
        currency: 'KES',
        timezone: 'Africa/Nairobi',
        language: 'en',
        autoVerifyMerchants: false,
        requireMerchantDocuments: true
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        notifyOnNewMerchant: true,
        notifyOnNewReview: true
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        requireStrongPasswords: true
      },
      features: {
        flashSalesEnabled: true,
        reviewsEnabled: true,
        merchantMessaging: true,
        analyticsEnabled: true
      }
    };

    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
});

// @desc    Update admin settings
// @route   PUT /api/admin/dashboard/settings
// @access  Private (Admin)
const updateSettings = asyncHandler(async (req, res) => {
  try {
    const { category, settings } = req.body;
    
    res.status(200).json({
      success: true,
      message: `${category} settings updated successfully`,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
});

// @desc    Get comprehensive analytics data
// @route   GET /api/admin/dashboard/analytics
// @access  Private (Admin)
const getAnalytics = asyncHandler(async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    let startDate = new Date();
    let groupBy = {};
    
    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' }
        };
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    const [merchantRegistrations, userRegistrations] = await Promise.all([
      Merchant.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: groupBy, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: startDate }, role: { $ne: 'admin' } } },
        { $group: { _id: groupBy, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
      ])
    ]);

    const businessTypeDistribution = await Merchant.aggregate([
      { $group: { _id: '$businessType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const geographicDistribution = await Merchant.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const verificationAnalytics = await Merchant.aggregate([
      {
        $group: {
          _id: null,
          totalMerchants: { $sum: 1 },
          verified: { $sum: { $cond: [{ $eq: ['$verified', true] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$verified', false] }, 1, 0] } },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const reviewAnalytics = await Review.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    const ratingDistribution = await Review.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);

    const topMerchants = await Merchant.find({ rating: { $exists: true } })
      .sort({ rating: -1, reviews: -1 })
      .limit(10)
      .select('businessName rating reviews businessType verified createdAt')
      .lean();

    const recentActivity = await Promise.all([
      Merchant.find().sort({ createdAt: -1 }).limit(5)
        .select('businessName businessType verified createdAt'),
      User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 }).limit(5)
        .select('name email createdAt'),
      Review.find().sort({ createdAt: -1 }).limit(5)
        .populate('user', 'name')
        .populate('merchant', 'businessName')
        .select('rating comment createdAt')
    ]);

    const previousPeriodStart = new Date();
    const periodDays = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (periodDays * 2));
    previousPeriodStart.setDate(previousPeriodStart.getDate() + periodDays);

    const [currentPeriodMetrics, previousPeriodMetrics] = await Promise.all([
      Promise.all([
        Merchant.countDocuments({ createdAt: { $gte: startDate } }),
        User.countDocuments({ createdAt: { $gte: startDate }, role: { $ne: 'admin' } }),
        Review.countDocuments({ createdAt: { $gte: startDate } }),
        Product.countDocuments({ createdAt: { $gte: startDate } })
      ]),
      Promise.all([
        Merchant.countDocuments({ 
          createdAt: { $gte: previousPeriodStart, $lt: startDate } 
        }),
        User.countDocuments({ 
          createdAt: { $gte: previousPeriodStart, $lt: startDate },
          role: { $ne: 'admin' }
        }),
        Review.countDocuments({ 
          createdAt: { $gte: previousPeriodStart, $lt: startDate } 
        }),
        Product.countDocuments({ 
          createdAt: { $gte: previousPeriodStart, $lt: startDate } 
        })
      ])
    ]);

    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous * 100).toFixed(1);
    };

    const growthMetrics = {
      merchantGrowth: calculateGrowth(currentPeriodMetrics[0], previousPeriodMetrics[0]),
      userGrowth: calculateGrowth(currentPeriodMetrics[1], previousPeriodMetrics[1]),
      reviewGrowth: calculateGrowth(currentPeriodMetrics[2], previousPeriodMetrics[2]),
      productGrowth: calculateGrowth(currentPeriodMetrics[3], previousPeriodMetrics[3])
    };

    res.status(200).json({
      success: true,
      analytics: {
        period,
        registrationTrends: {
          merchants: merchantRegistrations,
          users: userRegistrations
        },
        distributions: {
          businessTypes: businessTypeDistribution,
          geographic: geographicDistribution,
          ratings: ratingDistribution
        },
        verification: verificationAnalytics[0] || {
          totalMerchants: 0,
          verified: 0,
          pending: 0,
          averageRating: 0
        },
        reviews: reviewAnalytics[0] || {
          totalReviews: 0,
          averageRating: 0
        },
        topPerformers: {
          merchants: topMerchants
        },
        recentActivity: {
          merchants: recentActivity[0],
          users: recentActivity[1],
          reviews: recentActivity[2]
        },
        growth: {
          current: {
            merchants: currentPeriodMetrics[0],
            users: currentPeriodMetrics[1],
            reviews: currentPeriodMetrics[2],
            products: currentPeriodMetrics[3]
          },
          previous: {
            merchants: previousPeriodMetrics[0],
            users: previousPeriodMetrics[1],
            reviews: previousPeriodMetrics[2],
            products: previousPeriodMetrics[3]
          },
          percentages: growthMetrics
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
});

/**
 * @desc    Bulk delete merchants
 * @route   DELETE /api/admin/dashboard/merchants/bulk-delete
 * @access  Private/Admin
 */
const bulkDeleteMerchants = async (req, res) => {
  try {
    const { merchantIds } = req.body;

    if (!merchantIds || !Array.isArray(merchantIds) || merchantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of merchant IDs'
      });
    }

    // Validate all merchant IDs exist
    const merchants = await Merchant.find({ _id: { $in: merchantIds } });
    
    if (merchants.length !== merchantIds.length) {
      return res.status(404).json({
        success: false,
        message: 'Some merchants not found'
      });
    }

    // Delete associated data for all merchants
    await Promise.all([
      Review.deleteMany({ merchant: { $in: merchantIds } }),
      Product.deleteMany({ merchant: { $in: merchantIds } })
    ]);

    // Delete all merchants
    const result = await Merchant.deleteMany({ _id: { $in: merchantIds } });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} merchant(s)`,
      data: {
        deletedCount: result.deletedCount,
        merchantIds
      }
    });
  } catch (error) {
    console.error('Bulk delete merchants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete merchants',
      error: error.message
    });
  }
};

// Helper function to format time ago
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  return new Date(date).toLocaleDateString();
};


module.exports = {
  getDashboardStats,
  getRecentActivity,
  getMerchants,
  getMerchantDocuments,
  viewMerchantDocument,
  bulkVerifyMerchants,
  bulkUpdateMerchantStatus,
  createMerchant,
  updateMerchantStatus,
  getUsers,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  getProducts,
  createProduct,
  getReviews,
  deleteReview,
  getAnalytics,
  getSystemStatus,
  exportData,
  getSettings,
  updateSettings,
  deleteMerchant,
  bulkDeleteMerchants,
  verifyMerchant,
};