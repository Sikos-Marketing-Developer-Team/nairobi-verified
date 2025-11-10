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
      
      // CRITICAL FIX: Merchants with COMPLETE documents (all 3 required docs)
      Merchant.countDocuments({
        $and: [
          { 'documents.businessRegistration.path': { $exists: true, $ne: '', $ne: null } },
          { 'documents.idDocument.path': { $exists: true, $ne: '', $ne: null } },
          { 'documents.utilityBill.path': { $exists: true, $ne: '', $ne: null } }
        ]
      }),
      
      // FIXED: Merchants pending documents (missing at least one required doc)
      Merchant.countDocuments({
        verified: false,
        $or: [
          { 'documents.businessRegistration.path': { $exists: false } },
          { 'documents.businessRegistration.path': '' },
          { 'documents.businessRegistration.path': null },
          { 'documents.idDocument.path': { $exists: false } },
          { 'documents.idDocument.path': '' },
          { 'documents.idDocument.path': null },
          { 'documents.utilityBill.path': { $exists: false } },
          { 'documents.utilityBill.path': '' },
          { 'documents.utilityBill.path': null }
        ]
      }),
      
      // Documents awaiting review (complete docs but not verified)
      Merchant.countDocuments({
        verified: false,
        $and: [
          { 'documents.businessRegistration.path': { $exists: true, $ne: '', $ne: null } },
          { 'documents.idDocument.path': { $exists: true, $ne: '', $ne: null } },
          { 'documents.utilityBill.path': { $exists: true, $ne: '', $ne: null } }
        ]
      })
    ]);

    console.log('📊 Merchant counts:', {
      total: totalMerchants,
      verified: verifiedMerchants,
      active: activeMerchants,
      pending: pendingMerchants,
      withCompleteDocuments: merchantsWithDocuments,
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
          { 'documents.businessRegistration.path': { $exists: true, $ne: '', $ne: null } },
          { 'documents.idDocument.path': { $exists: true, $ne: '', $ne: null } },
          { 'documents.utilityBill.path': { $exists: true, $ne: '', $ne: null } }
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
            merchant.documents?.businessRegistration?.path &&
            merchant.documents?.businessRegistration?.path !== '' &&
            merchant.documents?.idDocument?.path &&
            merchant.documents?.idDocument?.path !== '' &&
            merchant.documents?.utilityBill?.path &&
            merchant.documents?.utilityBill?.path !== ''
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
  console.log('📋 getMerchants called by:', req.admin?.email);
  console.log('📋 Query params:', req.query);
  
  try {
    const { 
      page = 1, 
      limit = 100, // Default limit
      search, 
      verified, 
      isActive,
      featured,
      businessType 
    } = req.query;

    // Build filter query
    const filter = {};
    
    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (verified !== undefined) {
      filter.verified = verified === 'true';
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (featured !== undefined) {
      filter.featured = featured === 'true';
    }
    
    if (businessType) {
      filter.businessType = businessType;
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination metadata
    const totalMerchants = await Merchant.countDocuments(filter);
    
    // Fetch merchants with pagination
    const merchants = await Merchant.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Calculate document completeness for each merchant
    const merchantsWithCompleteness = merchants.map(merchant => {
      const hasBusinessReg = !!merchant.documents?.businessRegistration?.path;
      const hasIdDoc = !!merchant.documents?.idDocument?.path;
      const hasUtilityBill = !!merchant.documents?.utilityBill?.path;
      
      const docsComplete = [hasBusinessReg, hasIdDoc, hasUtilityBill].filter(Boolean).length;
      const documentsCompleteness = Math.round((docsComplete / 3) * 100);
      const isDocumentComplete = docsComplete === 3;
      
      // Profile completeness calculation
      const profileFields = [
        merchant.businessName,
        merchant.email,
        merchant.phone,
        merchant.address,
        merchant.businessType,
        merchant.description,
        merchant.logo
      ].filter(Boolean).length;
      
      const profileCompleteness = Math.round((profileFields / 7) * 100);
      
      return {
        ...merchant,
        documentsCompleteness,
        isDocumentComplete,
        profileCompleteness,
        needsVerification: isDocumentComplete && !merchant.verified,
        documentStatus: {
          businessRegistration: hasBusinessReg,
          idDocument: hasIdDoc,
          utilityBill: hasUtilityBill,
          additionalDocs: !!(merchant.documents?.additionalDocs?.length > 0)
        }
      };
    });

    console.log('✅ Returning', merchantsWithCompleteness.length, 'merchants');
    
    res.status(200).json({
      success: true,
      merchants: merchantsWithCompleteness,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalMerchants / limitNum),
        totalMerchants,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(totalMerchants / limitNum),
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('❌ getMerchants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch merchants',
      error: error.message
    });
  }
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

    console.log('📄 Document view request:', {
      merchantId,
      docType,
      timestamp: new Date().toISOString()
    });

    const merchant = await Merchant.findById(merchantId)
      .select('businessName documents');

    if (!merchant) {
      console.error('❌ Merchant not found:', merchantId);
      return res.status(404).json({
        success: false,
        message: 'Merchant not found'
      });
    }

    console.log('✅ Merchant found:', merchant.businessName);

    let documentInfo = null;
    let isAdditionalDoc = false;
    let additionalDocIndex = null;
    
    // Determine which document is being requested
    switch (docType) {
      case 'businessRegistration':
        documentInfo = merchant.documents?.businessRegistration;
        console.log('📋 Requesting Business Registration');
        break;
      case 'idDocument':
        documentInfo = merchant.documents?.idDocument;
        console.log('🆔 Requesting ID Document');
        break;
      case 'utilityBill':
        documentInfo = merchant.documents?.utilityBill;
        console.log('💡 Requesting Utility Bill');
        break;
      default:
        // Handle additional documents (format: additionalDocs[0], additionalDocs[1], etc.)
        const additionalMatch = docType.match(/additionalDocs\[(\d+)\]/);
        if (additionalMatch && merchant.documents?.additionalDocs) {
          additionalDocIndex = parseInt(additionalMatch[1]);
          if (additionalDocIndex < merchant.documents.additionalDocs.length) {
            documentInfo = merchant.documents.additionalDocs[additionalDocIndex];
            isAdditionalDoc = true;
            console.log('📎 Requesting Additional Document', additionalDocIndex);
          }
        }
        
        if (!documentInfo) {
          console.error('❌ Invalid document type:', docType);
          return res.status(400).json({
            success: false,
            message: 'Invalid document type'
          });
        }
        break;
    }

    // Check if document exists
    if (!documentInfo || !documentInfo.path) {
      console.error('❌ Document not uploaded:', docType);
      return res.status(404).json({
        success: false,
        message: 'Document not found or not uploaded'
      });
    }

    console.log('📂 Document info:', {
      path: documentInfo.path,
      originalName: documentInfo.originalName,
      mimeType: documentInfo.mimeType,
      fileSize: documentInfo.fileSize
    });

    // Check if it's a Cloudinary URL (starts with http/https)
    if (documentInfo.path.startsWith('http://') || documentInfo.path.startsWith('https://')) {
      console.log('🌐 Cloudinary URL detected, redirecting to:', documentInfo.path);
      return res.redirect(documentInfo.path);
    }
    
    // Handle local file storage
    // Documents are stored as "documents/filename.pdf"
    // We need to construct the full path: backend/uploads/documents/filename.pdf
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const filePath = path.join(uploadsDir, documentInfo.path);

    console.log('🔍 Constructed file path:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('❌ File not found at path:', filePath);
      console.error('   Stored path was:', documentInfo.path);
      console.error('   Uploads directory:', uploadsDir);
      
      return res.status(404).json({
        success: false,
        message: 'Document file not found on server',
        debug: process.env.NODE_ENV === 'development' ? {
          storedPath: documentInfo.path,
          searchedPath: filePath,
          uploadsDir: uploadsDir
        } : undefined
      });
    }

    console.log('✅ File found, preparing to stream...');

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    
    console.log('📊 File stats:', {
      size: `${(fileSize / 1024).toFixed(2)} KB`,
      modified: stats.mtime
    });

    // Set response headers
    res.setHeader('Content-Type', documentInfo.mimeType || 'application/pdf');
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Content-Disposition', `inline; filename="${documentInfo.originalName || docType}.pdf"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
    
    console.log('📤 Streaming file to client...');

    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('open', () => {
      console.log('✅ File stream opened successfully');
    });

    fileStream.on('error', (error) => {
      console.error('❌ File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error reading document file',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    });

    fileStream.on('end', () => {
      console.log('✅ File stream completed');
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error('❌ View merchant document error:', error);
    console.error('Stack trace:', error.stack);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve document',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
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
          <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/merchant/sign-in" style="background: #f44336; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
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
      _id: merchant._id,
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
        <p>Login to your dashboard: ${process.env.FRONTEND_URL}/merchant/sign-in</p>
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
 * @desc    Verify single merchant (FIXED: Documents now optional)
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

    // FIXED: Check if merchant has documents (now optional, just for logging)
    const hasRequiredDocs = 
      merchant.documents?.businessRegistration?.path &&
      merchant.documents?.idDocument?.path &&
      merchant.documents?.utilityBill?.path;

    // Log document status but DON'T block verification
    if (!hasRequiredDocs) {
      console.log('⚠️ Verifying merchant without complete documents:', {
        businessName: merchant.businessName,
        businessRegistration: !!merchant.documents?.businessRegistration?.path,
        idDocument: !!merchant.documents?.idDocument?.path,
        utilityBill: !!merchant.documents?.utilityBill?.path
      });
    } else {
      console.log('✅ Merchant has complete documents');
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

    // Update document review status if documents exist
    if (merchant.documents) {
      if (hasRequiredDocs) {
        merchant.documents.documentReviewStatus = 'approved';
        merchant.documents.documentsReviewedAt = new Date();
      } else {
        // Mark as approved even without documents (admin override)
        merchant.documents.documentReviewStatus = 'approved';
        merchant.documents.documentsReviewedAt = new Date();
        merchant.documents.verificationNotes = 'Verified by admin without complete documentation';
      }
    }

    // Save the merchant
    await merchant.save();

    console.log('✅ Merchant verified successfully:', {
      id: merchant._id,
      businessName: merchant.businessName,
      verified: merchant.verified,
      isActive: merchant.isActive,
      hasDocuments: hasRequiredDocs
    });

    // Log admin activity
    if (req.admin && req.admin.id && req.admin.id !== 'hardcoded-admin-id') {
      try {
        const verificationNote = hasRequiredDocs 
          ? 'with complete documents' 
          : 'without complete documents (admin override)';
        
        await AdminUser.findByIdAndUpdate(req.admin.id, {
          $push: {
            activityLog: {
              action: 'merchant_verified',
              details: `Verified merchant: ${merchant.businessName} (${merchant.email}) ${verificationNote}`,
              timestamp: new Date()
            }
          }
        });
      } catch (logError) {
        console.error('⚠️ Failed to log admin activity:', logError.message);
      }
    }

    // Add verification history entry
    try {
      if (merchant.verificationHistory) {
        // Only add performedBy if it's a valid ObjectId (not the hardcoded-admin-id)
        const historyEntry = {
          action: 'approved',
          performedAt: new Date(),
          notes: hasRequiredDocs 
            ? 'Verified with complete documentation' 
            : 'Verified by admin without complete documentation',
          documentsInvolved: [
            merchant.documents?.businessRegistration?.path ? 'businessRegistration' : null,
            merchant.documents?.idDocument?.path ? 'idDocument' : null,
            merchant.documents?.utilityBill?.path ? 'utilityBill' : null
          ].filter(Boolean)
        };

        // Only add performedBy if we have a valid admin ID (not the hardcoded one)
        if (req.admin?.id && req.admin.id !== 'hardcoded-admin-id') {
          historyEntry.performedBy = req.admin.id;
        }

        merchant.verificationHistory.push(historyEntry);
        await merchant.save();
      }
    } catch (historyError) {
      console.error('⚠️ Failed to add verification history:', historyError.message);
      // Don't fail the entire verification if history fails
    }

    // Send verification email notification
    try {
      const { emailService } = require('../utils/emailService');
      
      const documentNote = hasRequiredDocs 
        ? 'with all required documents' 
        : 'You can upload your verification documents later from your dashboard.';
      
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #4caf50; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your business has been verified</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${merchant.businessName}!</h2>
            <p style="color: #666; line-height: 1.6;">
              Great news! Your business has been successfully verified and is now live on Nairobi Verified ${documentNote}
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

          ${!hasRequiredDocs ? `
          <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #ef6c00; margin: 0; font-size: 14px;">
              <strong>📋 Next Steps:</strong> While your account is now verified, we recommend uploading your verification documents (Business Registration, ID Document, and Utility Bill) from your dashboard to maintain full verification status.
            </p>
          </div>
          ` : ''}

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
      message: hasRequiredDocs 
        ? 'Merchant verified successfully with complete documentation' 
        : 'Merchant verified successfully (documents can be uploaded later)',
      data: {
        id: merchant._id,
        businessName: merchant.businessName,
        email: merchant.email,
        verified: merchant.verified,
        verifiedDate: merchant.verifiedDate,
        isActive: merchant.isActive,
        activatedDate: merchant.activatedDate,
        hasCompleteDocuments: hasRequiredDocs,
        documentStatus: {
          businessRegistration: !!merchant.documents?.businessRegistration?.path,
          idDocument: !!merchant.documents?.idDocument?.path,
          utilityBill: !!merchant.documents?.utilityBill?.path
        }
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
      site: {
        name: 'Nairobi Verified',
        description: 'Trusted Business Directory for Nairobi CBD',
        url: process.env.FRONTEND_URL || 'https://nairobiverified.co.ke',
        logo: '',
        favicon: '',
        contactEmail: process.env.EMAIL_USER || 'contact@nairobiverified.com',
        supportEmail: process.env.EMAIL_USER || 'support@nairobiverified.com'
      },
      email: {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUsername: process.env.EMAIL_USER || '',
        smtpPassword: '', // Don't send password to frontend
        fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@nairobiverified.com',
        fromName: 'Nairobi Verified'
      },
      security: {
        enableTwoFactor: false,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        requireSpecialChars: true
      },
      notifications: {
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: false,
        merchantApprovalEmails: true,
        userRegistrationEmails: true,
        systemAlertsEmails: true
      },
      business: {
        currency: 'KES',
        timezone: 'Africa/Nairobi',
        dateFormat: 'DD/MM/YYYY',
        businessHours: {
          monday: { open: '08:00', close: '18:00', closed: false },
          tuesday: { open: '08:00', close: '18:00', closed: false },
          wednesday: { open: '08:00', close: '18:00', closed: false },
          thursday: { open: '08:00', close: '18:00', closed: false },
          friday: { open: '08:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '17:00', closed: false },
          sunday: { open: '10:00', close: '16:00', closed: true }
        }
      },
      features: {
        userRegistrationEnabled: true,
        merchantRegistrationEnabled: true,
        reviewsEnabled: true,
        flashSalesEnabled: true,
        analyticsEnabled: true,
        maintenanceMode: false
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
      data: {
        period,
        registrationTrends: {
          merchants: merchantRegistrations,
          users: userRegistrations
        },
        businessTypeDistribution: businessTypeDistribution.map(item => ({
          businessType: item._id,
          count: item.count,
          _id: item._id
        })),
        geographicDistribution,
        verificationAnalytics: [verificationAnalytics[0] || {
          totalMerchants: 0,
          verified: 0,
          pending: 0,
          averageRating: 0
        }],
        reviewAnalytics: {
          totalReviews: reviewAnalytics[0]?.totalReviews || 0,
          averageRating: reviewAnalytics[0]?.averageRating || 0,
          ratingDistribution: ratingDistribution.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        topMerchants: topMerchants.map(m => ({
          _id: m._id,
          businessName: m.businessName,
          rating: m.rating,
          reviews: m.reviews,
          verified: m.verified,
          businessType: m.businessType
        })),
        productAnalytics: {
          totalProducts: currentPeriodMetrics[3],
          activeProducts: currentPeriodMetrics[3],
          categoryDistribution: []
        },
        revenueAnalytics: {
          totalRevenue: 0,
          monthlyRevenue: []
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