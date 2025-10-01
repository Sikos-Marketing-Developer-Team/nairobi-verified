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
    // Enhanced statistics with document verification tracking
    const [
      totalMerchants,
      totalUsers,
      totalProducts,
      totalReviews,
      verifiedMerchants,
      pendingMerchants,
      activeProducts,
      totalOrders,
      // NEW: Document verification statistics
      merchantsWithDocuments,
      merchantsPendingDocuments,
      documentsAwaitingReview
    ] = await Promise.all([
      Merchant.countDocuments(),
      User.countDocuments({ role: { $ne: 'admin' } }),
      Product.countDocuments(),
      Review.countDocuments(),
      Merchant.countDocuments({ verified: true }),
      Merchant.countDocuments({ verified: false }),
      Product.countDocuments({ isActive: true }),
      Promise.resolve(0), // Placeholder for orders
      // NEW: Document verification counts
      Merchant.countDocuments({
        $or: [
          { 'documents.businessRegistration': { $exists: true, $ne: '' } },
          { 'documents.idDocument': { $exists: true, $ne: '' } },
          { 'documents.utilityBill': { $exists: true, $ne: '' } }
        ]
      }),
      Merchant.countDocuments({
        verified: false,
        $and: [
          {
            $or: [
              { 'documents.businessRegistration': { $exists: false } },
              { 'documents.businessRegistration': '' },
              { 'documents.idDocument': { $exists: false } },
              { 'documents.idDocument': '' },
              { 'documents.utilityBill': { $exists: false } },
              { 'documents.utilityBill': '' }
            ]
          }
        ]
      }),
      Merchant.countDocuments({
        verified: false,
        $and: [
          { 'documents.businessRegistration': { $exists: true, $ne: '' } },
          { 'documents.idDocument': { $exists: true, $ne: '' } },
          { 'documents.utilityBill': { $exists: true, $ne: '' } }
        ]
      })
    ]);

    // Get active flash sales
    let activeFlashSales = 0;
    try {
      activeFlashSales = await FlashSale.countDocuments({ 
        isActive: true, 
        endDate: { $gt: new Date() } 
      });
    } catch (error) {
      console.log('Flash sales model not available yet');
    }

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      recentMerchants,
      recentUsers,
      recentReviews,
      merchantsThisMonth,
      usersThisMonth,
      reviewsThisMonth,
      // NEW: Recent merchants with document info
      merchantsNeedingVerification
    ] = await Promise.all([
      Merchant.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('businessName email verified createdAt businessType documents'),
      User.find({ role: { $ne: 'admin' } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt'),
      Review.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name')
        .populate('merchant', 'businessName')
        .select('rating comment createdAt'),
      Merchant.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ 
        role: { $ne: 'admin' },
        createdAt: { $gte: thirtyDaysAgo } 
      }),
      Review.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      // NEW: Merchants needing verification
      Merchant.find({
        verified: false,
        $and: [
          { 'documents.businessRegistration': { $exists: true, $ne: '' } },
          { 'documents.idDocument': { $exists: true, $ne: '' } },
          { 'documents.utilityBill': { $exists: true, $ne: '' } }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('businessName email createdAt documents businessType')
    ]);

    // Calculate growth percentages
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 60);
    previousPeriodStart.setDate(previousPeriodStart.getDate() + 30);

    const [
      previousMerchants,
      previousUsers,
      previousReviews
    ] = await Promise.all([
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

    // Calculate growth rates
    const merchantGrowth = previousMerchants > 0 
      ? ((merchantsThisMonth - previousMerchants) / previousMerchants * 100).toFixed(1)
      : merchantsThisMonth > 0 ? 100 : 0;

    const userGrowth = previousUsers > 0 
      ? ((usersThisMonth - previousUsers) / previousUsers * 100).toFixed(1)
      : usersThisMonth > 0 ? 100 : 0;

    const reviewGrowth = previousReviews > 0 
      ? ((reviewsThisMonth - previousReviews) / previousReviews * 100).toFixed(1)
      : reviewsThisMonth > 0 ? 100 : 0;

    // Get merchant verification rate
    const verificationRate = totalMerchants > 0 
      ? ((verifiedMerchants / totalMerchants) * 100).toFixed(1)
      : 0;

    // NEW: Document completion rate
    const documentCompletionRate = totalMerchants > 0
      ? ((merchantsWithDocuments / totalMerchants) * 100).toFixed(1)
      : 0;

    // System health metrics
    const systemHealth = {
      database: 'healthy',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version
    };

    res.status(200).json({
      success: true,
      data: {
        // Main stats (UPDATED)
        totalMerchants,
        totalUsers,
        totalProducts,
        totalReviews,
        verifiedMerchants,
        pendingMerchants,
        activeProducts,
        activeFlashSales,
        totalOrders,
        
        // NEW: Document verification stats
        verification: {
          merchantsWithDocuments,
          merchantsPendingDocuments,
          documentsAwaitingReview,
          documentCompletionRate: parseFloat(documentCompletionRate),
          merchantsNeedingVerification
        },
        
        // Growth metrics
        growth: {
          merchantsThisMonth,
          usersThisMonth,
          reviewsThisMonth,
          merchantGrowth: parseFloat(merchantGrowth),
          userGrowth: parseFloat(userGrowth),
          reviewGrowth: parseFloat(reviewGrowth)
        },
        
        // Performance metrics (UPDATED)
        metrics: {
          verificationRate: parseFloat(verificationRate),
          documentCompletionRate: parseFloat(documentCompletionRate),
          averageRating: totalReviews > 0 ? 4.5 : 0,
          productUploadRate: totalProducts > 0 ? (totalProducts / totalMerchants).toFixed(1) : 0
        },
        
        // Recent activity (UPDATED with document info)
        recentActivity: {
          recentMerchants: recentMerchants.map(merchant => ({
            ...merchant.toObject(),
            hasDocuments: !!(
              merchant.documents?.businessRegistration ||
              merchant.documents?.idDocument ||
              merchant.documents?.utilityBill
            )
          })),
          recentUsers,
          recentReviews
        },
        
        // System status
        systemHealth
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});


// @desc    Get all merchants with enhanced document information
// @route   GET /api/admin/dashboard/merchants
// @access  Private (Admin)
const getMerchants = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    verified, 
    businessType, 
    search,
    documentStatus // NEW: Filter by document status
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

  // NEW: Document status filtering
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
    .select('-password') // UPDATED: Include all fields including documents
    .lean();

  // NEW: Enhance merchant data with document analysis
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

  // NEW: Additional statistics for this query
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
    // NEW: Query-specific statistics
    queryStats: queryStats[0] || {
      totalMerchants: 0,
      verifiedMerchants: 0,
      withBusinessReg: 0,
      withIdDoc: 0,
      withUtilityBill: 0
    }
  });
});


// NEW: Get merchant documents for review
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

    // Analyze document completeness
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

    // Validate document type and get document path
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
        // Check if it's an additional document with format "additionalDocs[index]"
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

    // Construct full file path
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const filePath = path.join(uploadsDir, documentInfo.path);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found on server'
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    
    // Set appropriate headers
    res.setHeader('Content-Type', documentInfo.mimeType || 'application/octet-stream');
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Content-Disposition', `inline; filename="${documentInfo.originalName || docType}"`);
    
    // For security, add headers to prevent XSS
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Handle stream errors
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

// NEW: Bulk document verification actions
// @desc    Process multiple merchant verifications
// @route   POST /api/admin/dashboard/merchants/bulk-verify
// @access  Private (Admin)
const bulkVerifyMerchants = asyncHandler(async (req, res) => {
  try {
    const { merchantIds, action } = req.body; // action: 'verify' or 'reject'

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

    // Get updated merchants for response
    const updatedMerchants = await Merchant.find({ _id: { $in: merchantIds } })
      .select('businessName email verified verifiedDate');

    // Log admin activity (skip for hardcoded admin)
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

// UPDATED: Enhanced createMerchant function
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
    autoVerify = false // NEW: Option to auto-verify
  } = req.body;

  // Generate temporary password
  const tempPassword = crypto.randomBytes(8).toString('hex');

  // Set default business hours
  const defaultBusinessHours = {
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '09:00', close: '16:00', closed: false },
    sunday: { open: '10:00', close: '16:00', closed: true }
  };

  const merchant = await Merchant.create({
    businessName,
    email,
    phone,
    password: tempPassword,
    businessType,
    description,
    address,
    location,
    website,
    yearEstablished,
    businessHours: defaultBusinessHours,
    verified: autoVerify, // NEW: Auto-verify option
    verifiedDate: autoVerify ? new Date() : null, // NEW
    createdByAdmin: true,
    createdByAdminId: req.admin.id,
    createdByAdminName: req.admin.firstName + ' ' + req.admin.lastName,
    onboardingStatus: 'credentials_sent'
  });

  // Send email with login credentials
  const emailContent = `
    <h2>Welcome to Nairobi Verified!</h2>
    <p>Your merchant account has been created by our admin team.</p>
    <p><strong>Business Name:</strong> ${businessName}</p>
    <p><strong>Login Credentials:</strong></p>
    <p>Email: ${email}</p>
    <p>Temporary Password: ${tempPassword}</p>
    ${autoVerify ? 
      '<p><strong>Your account has been pre-verified!</strong></p>' : 
      '<p>Please log in and upload your verification documents.</p>'
    }
    <p>Login here: ${process.env.FRONTEND_URL}/merchant/login</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Your Nairobi Verified Merchant Account',
      html: emailContent
    });

    // Log admin activity (skip for hardcoded admin)
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
        // NEW: Document status info
        documentsRequired: !autoVerify,
        verificationStatus: autoVerify ? 'verified' : 'pending_documents'
      },
      message: 'Merchant created successfully and credentials sent via email'
    });
  } catch (error) {
    console.error('Email sending failed:', error);
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
      message: 'Merchant created successfully but email sending failed'
    });
  }
});


// FIXED: Update merchant status - THIS WAS THE ISSUE
// @desc    Update merchant status (activate/verify merchant)
// @route   PUT /api/admin/dashboard/merchants/:id/status
// @access  Private (Admin)
const updateMerchantStatus = asyncHandler(async (req, res) => {
  try {
    const { verified, active } = req.body;

    console.log('Update merchant status request:', {
      merchantId: req.params.id,
      verified,
      active,
      body: req.body
    });

    // Build update object
    const updateData = {};
    
    // Handle verification status
    if (verified !== undefined) {
      updateData.verified = verified;
      updateData.verifiedDate = verified ? new Date() : null;
    }

    // Handle active status (if your schema has isActive field)
    if (active !== undefined) {
      updateData.isActive = active;
    }

    console.log('Update data:', updateData);

    const merchant = await Merchant.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!merchant) {
      console.log('Merchant not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Merchant not found'
      });
    }

    console.log('Merchant updated successfully:', merchant);

    // Send email notification to merchant
    try {
      const statusMessage = verified 
        ? 'Your merchant account has been verified and activated!' 
        : 'Your merchant account status has been updated.';
      
      const emailContent = `
        <h2>Account Status Update</h2>
        <p>Hello ${merchant.businessName},</p>
        <p>${statusMessage}</p>
        ${verified ? '<p>You can now start adding products and services to your merchant dashboard.</p>' : ''}
        <p>Login to your dashboard: ${process.env.FRONTEND_URL}/merchant/login</p>
      `;

      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: merchant.email,
        subject: 'Nairobi Verified - Account Status Update',
        html: emailContent
      });
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the request if email fails
    }

    // Log admin activity (skip for hardcoded admin)
    if (req.admin && req.admin.id !== 'hardcoded-admin-id') {
      try {
        await AdminUser.findByIdAndUpdate(req.admin.id, {
          $push: {
            activityLog: {
              action: 'merchant_status_updated',
              details: `${verified ? 'Verified' : 'Unverified'} merchant ${merchant.businessName}${active !== undefined ? ` and ${active ? 'activated' : 'deactivated'}` : ''}`,
              timestamp: new Date()
            }
          }
        });
      } catch (logError) {
        console.error('Failed to log admin activity:', logError);
        // Don't fail the request if logging fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'Merchant status updated successfully',
      merchant: {
        id: merchant._id,
        businessName: merchant.businessName,
        email: merchant.email,
        verified: merchant.verified,
        verifiedDate: merchant.verifiedDate,
        isActive: merchant.isActive,
        updatedAt: merchant.updatedAt
      }
    });
  } catch (error) {
    console.error('Update merchant status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update merchant status',
      error: error.message
    });
  }
});

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

    const query = { role: { $ne: 'admin' } }; // Exclude admin users
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by role
    if (role && role !== 'all') {
      query.role = role;
    }

    // Filter by status
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password')
      .lean();

    const total = await User.countDocuments(query);

    // Get user statistics
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
  const { name, email, phone, role = 'user' } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Generate temporary password
  const tempPassword = crypto.randomBytes(8).toString('hex');

  const user = await User.create({
    name,
    email,
    phone,
    password: tempPassword,
    role,
    isActive: true,
    createdByAdmin: true,
    createdByAdminId: req.admin.id
  });

  // Send welcome email (optional)
  try {
    const emailContent = `
      <h2>Welcome to Nairobi Verified!</h2>
      <p>Your account has been created by our admin team.</p>
      <p><strong>Login Credentials:</strong></p>
      <p>Email: ${email}</p>
      <p>Temporary Password: ${tempPassword}</p>
      <p>Please log in and change your password immediately.</p>
      <p>Login here: ${process.env.FRONTEND_URL}/login</p>
    `;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Welcome to Nairobi Verified',
      html: emailContent
    });
  } catch (emailError) {
    console.log('Email sending failed:', emailError.message);
  }

  res.status(201).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
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
  const { name, email, phone, role, isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, phone, role, isActive },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    user,
    message: 'User updated successfully'
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

  await user.deleteOne();

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

    // Validation
    if (!name || !description || !price || !category || !merchant) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, category, and merchant are required'
      });
    }

    // Verify merchant exists
    const Merchant = require('../models/Merchant');
    const existingMerchant = await Merchant.findById(merchant);
    if (!existingMerchant) {
      return res.status(400).json({
        success: false,
        message: 'Invalid merchant ID'
      });
    }

    // Create new product
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
      images: [], // Will be added later through separate image upload
      rating: 0,
      totalReviews: 0,
      totalSales: 0
    });

    await newProduct.save();

    // Populate merchant details for response
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

  // Log admin activity (skip for hardcoded admin)
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
    // Database connection status
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Memory usage
    const memUsage = process.memoryUsage();
    const memUsageFormatted = {
      rss: (memUsage.rss / 1024 / 1024).toFixed(2) + ' MB',
      heapTotal: (memUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
      heapUsed: (memUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
      external: (memUsage.external / 1024 / 1024).toFixed(2) + ' MB'
    };

    // Server uptime
    const uptimeSeconds = process.uptime();
    const uptimeFormatted = {
      days: Math.floor(uptimeSeconds / 86400),
      hours: Math.floor((uptimeSeconds % 86400) / 3600),
      minutes: Math.floor((uptimeSeconds % 3600) / 60),
      seconds: Math.floor(uptimeSeconds % 60)
    };

    // Recent activity counts
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

    // Storage metrics (approximate)
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
        cpuUsage: 'N/A', // Would need additional monitoring
        responseTime: 'Good' // Based on request processing
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
      // CSV format
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
    // For now, return default settings - later can store in database
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
        sessionTimeout: 24, // hours
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
    
    // For now, just return success - later implement database storage
    // This would typically update a Settings model in the database
    
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

    // Registration trends
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

    // Business type distribution
    const businessTypeDistribution = await Merchant.aggregate([
      { $group: { _id: '$businessType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Geographic distribution
    const geographicDistribution = await Merchant.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Verification status analytics
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

    // Review analytics
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

    // Rating distribution breakdown
    const ratingDistribution = await Review.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);

    // Top performing merchants
    const topMerchants = await Merchant.find({ rating: { $exists: true } })
      .sort({ rating: -1, reviews: -1 })
      .limit(10)
      .select('businessName rating reviews businessType verified createdAt')
      .lean();

    // Recent activity
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

    // Growth metrics
    const previousPeriodStart = new Date();
    const periodDays = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (periodDays * 2));
    previousPeriodStart.setDate(previousPeriodStart.getDate() + periodDays);

    const [currentPeriodMetrics, previousPeriodMetrics] = await Promise.all([
      // Current period
      Promise.all([
        Merchant.countDocuments({ createdAt: { $gte: startDate } }),
        User.countDocuments({ createdAt: { $gte: startDate }, role: { $ne: 'admin' } }),
        Review.countDocuments({ createdAt: { $gte: startDate } }),
        Product.countDocuments({ createdAt: { $gte: startDate } })
      ]),
      // Previous period
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

    // Calculate growth percentages
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

const getRecentActivity = asyncHandler(async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const recentActivities = [];

    // Get recent user registrations
    const recentUsers = await User.find({ role: { $ne: 'admin' } })
      .select('name email createdAt role')
      .sort({ createdAt: -1 })
      .limit(Math.floor(limit / 4))
      .lean();

    // Get recent merchant registrations
    const recentMerchants = await Merchant.find()
      .select('businessName email createdAt verified')
      .sort({ createdAt: -1 })
      .limit(Math.floor(limit / 4))
      .lean();

    // Get recent products
    const recentProducts = await Product.find()
      .select('name price merchant createdAt')
      .populate('merchant', 'businessName')
      .sort({ createdAt: -1 })
      .limit(Math.floor(limit / 4))
      .lean();

    // Get recent reviews
    const recentReviews = await Review.find()
      .select('rating comment user merchant createdAt')
      .populate('user', 'name')
      .populate('merchant', 'businessName')
      .sort({ createdAt: -1 })
      .limit(Math.floor(limit / 4))
      .lean();

    // Format activities
    recentUsers.forEach(user => {
      recentActivities.push({
        id: `user_${user._id}`,
        type: 'user_signup',
        description: `New ${user.role} "${user.name}" registered`,
        timestamp: user.createdAt,
        user: user.name,
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
      recentActivities.push({
        id: `review_${review._id}`,
        type: 'review_posted',
        description: `${review.user?.name || 'Anonymous'} left a ${review.rating}★ review for ${review.merchant?.businessName || 'Unknown'}`,
        timestamp: review.createdAt,
        user: review.user?.name,
        details: { rating: review.rating, merchant: review.merchant?.businessName }
      });
    });

    // Sort by timestamp and limit
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
  createMerchant,
  updateMerchantStatus,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getProducts,
  createProduct,
  getReviews,
  deleteReview,
  getAnalytics,
  getSystemStatus,
  exportData,
  getSettings,
  updateSettings
};