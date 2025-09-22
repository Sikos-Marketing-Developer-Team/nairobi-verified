const Merchant = require('../models/Merchant');
const Review = require('../models/Review');
const MerchantOnboardingService = require('../services/merchantOnboarding');
const { emailService } = require('../utils/emailService');
const { Op, literal } = require('sequelize');
const { sequelize } = require('../config/db');

// @desc    Get all merchants with enhanced document visibility (Sequelize)
// @route   GET /api/merchants
// @access  Public
exports.getMerchants = async (req, res) => {
  try {
    const { select, sort, page = 1, limit = 25, search, category, documentStatus } = req.query;

    // Base filter
    const where = {};

    // Category filter
    if (category && category !== 'All') {
      where.businessType = category;
    }

    // Search filter (case-insensitive)
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      where[Op.or] = [
        { businessName: { [Op.iLike]: term } },
        { description: { [Op.iLike]: term } },
        { businessType: { [Op.iLike]: term } }
      ];
    }

    // Document status filters using JSONB paths
    const documentFilters = [];
    if (documentStatus) {
      const hasBR = "(documents->'businessRegistration'->>'path' IS NOT NULL AND documents->'businessRegistration'->>'path' != '') OR (documents->>'businessRegistration' IS NOT NULL AND documents->>'businessRegistration' != '')";
      const hasID = "(documents->'idDocument'->>'path' IS NOT NULL AND documents->'idDocument'->>'path' != '') OR (documents->>'idDocument' IS NOT NULL AND documents->>'idDocument' != '')";
      const hasUB = "(documents->'utilityBill'->>'path' IS NOT NULL AND documents->'utilityBill'->>'path' != '') OR (documents->>'utilityBill' IS NOT NULL AND documents->>'utilityBill' != '')";

      if (documentStatus === 'complete') {
        documentFilters.push(literal(`(${hasBR})`));
        documentFilters.push(literal(`(${hasID})`));
        documentFilters.push(literal(`(${hasUB})`));
      } else if (documentStatus === 'incomplete') {
        documentFilters.push(literal(`NOT((${hasBR}) AND (${hasID}) AND (${hasUB}))`));
      } else if (documentStatus === 'pending_review') {
        documentFilters.push(literal(`(${hasBR})`));
        documentFilters.push(literal(`(${hasID})`));
        documentFilters.push(literal(`(${hasUB})`));
        where.verified = false;
      }
    }

    // Sort
    const order = [];
    if (sort) {
      const fields = sort.split(',').map(s => s.trim());
      fields.forEach(f => {
        if (!f) return;
        if (f.startsWith('-')) order.push([f.slice(1), 'DESC']);
        else order.push([f, 'ASC']);
      });
    } else {
      order.push(['createdAt', 'DESC']);
    }

    // Selected attributes
    const attributes = select ? select.split(',').map(f => f.trim()) : undefined;

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 25;
    const offset = (pageNum - 1) * limitNum;

    // Combine where with document filters
    const finalWhere = { ...where };
    if (documentFilters.length) {
      finalWhere[Op.and] = [...(finalWhere[Op.and] || []), ...documentFilters];
    }

    const { rows, count } = await Merchant.findAndCountAll({
      where: finalWhere,
      attributes,
      limit: limitNum,
      offset,
      order
    });

    const endIndex = offset + limitNum;
    const pagination = {};

    if (endIndex < count) {
      pagination.next = { page: pageNum + 1, limit: limitNum };
    }

    if (offset > 0) {
      pagination.prev = { page: pageNum - 1, limit: limitNum };
    }

    res.status(200).json({
      success: true,
      count: rows.length,
      pagination,
      data: rows.map(m => m.toJSON())
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};


// @desc    Get single merchant with full document information
// @route   GET /api/merchants/:id
// @access  Public
exports.getMerchant = async (req, res) => {
  try {
    const merchant = await Merchant.findByPk(req.params.id);

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: `Merchant not found with id of ${req.params.id}`
      });
    }

    // NEW: Add document analysis for admin/merchant view
    let responseData = merchant.toJSON();
    
    // Add document completeness info if user is admin or the merchant themselves
    if (req.user && (req.user.role === 'admin' || req.merchant)) {
      const documentAnalysis = {
        businessRegistration: !!(merchant.documents?.businessRegistration),
        idDocument: !!(merchant.documents?.idDocument),
        utilityBill: !!(merchant.documents?.utilityBill),
        additionalDocs: !!(merchant.documents?.additionalDocs?.length > 0)
      };

      const requiredDocsCount = [
        documentAnalysis.businessRegistration,
        documentAnalysis.idDocument,
        documentAnalysis.utilityBill
      ].filter(Boolean).length;

      responseData.documentAnalysis = {
        ...documentAnalysis,
        completionPercentage: Math.round((requiredDocsCount / 3) * 100),
        canBeVerified: requiredDocsCount === 3 && !merchant.verified,
        requiresDocuments: requiredDocsCount < 3
      };
    } else {
      // Remove sensitive document info for public access
      delete responseData.documents;
    }

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new merchant (Public Registration)
// @route   POST /api/merchants
// @access  Public
// NOTE: Duplicate createMerchant removed (Mongoose-style). Using the Sequelize version below.
// Keeping this space intentionally to preserve file structure; functionality is provided by the later definition.

// @desc    Create new merchant (Public Registration)
// @route   POST /api/merchants
// @access  Public
exports.createMerchant = async (req, res) => {
  try {
    const {
      businessName,
      email,
      phone,
      password,
      businessType,
      description,
      yearEstablished,
      website,
      address,
      landmark,
      businessHours
    } = req.body;

    // Check if merchant already exists
    const existingMerchant = await Merchant.findOne({ where: { email } });
    if (existingMerchant) {
      return res.status(400).json({
        success: false,
        error: 'Merchant with this email already exists'
      });
    }

    // Create merchant
    const merchant = await Merchant.create({
      businessName,
      email,
      phone,
      password,
      businessType,
      description,
      yearEstablished: yearEstablished ? parseInt(yearEstablished) : undefined,
      website,
      address,
      location: address, // Use address as location for now
      landmark,
      businessHours: businessHours || {
        monday: { open: '08:00', close: '18:00', closed: false },
        tuesday: { open: '08:00', close: '18:00', closed: false },
        wednesday: { open: '08:00', close: '18:00', closed: false },
        thursday: { open: '08:00', close: '18:00', closed: false },
        friday: { open: '08:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '16:00', closed: false },
        sunday: { open: '', close: '', closed: true }
      },
      verified: false,
      rating: 0,
      reviews: 0, // Initialize as number, not array
      featured: false
    });

    // Send notification email to admin about new merchant registration
    try {
      await emailService.sendAdminMerchantNotification(merchant);
      console.log('Admin notification sent for new merchant:', merchant.businessName);
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
      // Don't fail the registration if email fails
    }

    res.status(201).json({
      success: true,
      data: {
        id: merchant.id,
        businessName: merchant.businessName,
        email: merchant.email,
        phone: merchant.phone,
        businessType: merchant.businessType,
        verified: merchant.verified,
        createdAt: merchant.createdAt,
        message: 'Merchant registration submitted successfully. You will be contacted within 2-3 business days for verification.'
      }
    });
  } catch (error) {
    console.error('Create merchant error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update merchant with document validation
// @route   PUT /api/merchants/:id
// @access  Private/Merchant
exports.updateMerchant = async (req, res) => {
  try {
    // Make sure merchant is updating their own profile
    if (req.params.id !== req.merchant.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this merchant'
      });
    }

    const {
      businessName,
      email,
      phone,
      businessType,
      description,
      yearEstablished,
      website,
      address,
      location,
      landmark,
      businessHours
    } = req.body;

    const merchant = await Merchant.findByPk(req.params.id);
    if (merchant) {
      merchant.businessName = businessName;
      merchant.email = email;
      merchant.phone = phone;
      merchant.businessType = businessType;
      merchant.description = description;
      merchant.yearEstablished = yearEstablished;
      merchant.website = website;
      merchant.address = address;
      merchant.location = location;
      merchant.landmark = landmark;
      merchant.businessHours = businessHours;
      await merchant.save();
    }

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // NEW: Add document status info to response
    const documentAnalysis = {
      businessRegistration: !!(merchant.documents?.businessRegistration),
      idDocument: !!(merchant.documents?.idDocument),
      utilityBill: !!(merchant.documents?.utilityBill),
      additionalDocs: !!(merchant.documents?.additionalDocs?.length > 0)
    };

    const requiredDocsCount = [
      documentAnalysis.businessRegistration,
      documentAnalysis.idDocument,
      documentAnalysis.utilityBill
    ].filter(Boolean).length;

    const responseData = {
      ...merchant.toJSON(),
      documentStatus: {
        ...documentAnalysis,
        completionPercentage: Math.round((requiredDocsCount / 3) * 100),
        canBeVerified: requiredDocsCount === 3 && !merchant.verified,
        requiresDocuments: requiredDocsCount < 3
      }
    };

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete merchant with document cleanup
// @route   DELETE /api/merchants/:id
// @access  Private/Admin
exports.deleteMerchant = async (req, res) => {
  try {
    // PostgreSQL: find by primary key
    const merchant = await Merchant.findByPk(req.params.id);

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // TODO: When Reviews migrate to Postgres, delete related reviews here

    const hadDocuments = !!(
      merchant.documents?.businessRegistration ||
      merchant.documents?.idDocument ||
      merchant.documents?.utilityBill ||
      (merchant.documents?.additionalDocs && merchant.documents.additionalDocs.length > 0)
    );

    await merchant.destroy();

    res.status(200).json({
      success: true,
      data: {},
      message: `Merchant ${merchant.businessName} deleted successfully${hadDocuments ? ' (including documents)' : ''}`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Upload merchant logo
// @route   PUT /api/merchants/:id/logo
// @access  Private/Merchant
exports.uploadLogo = async (req, res) => {
  try {
    // Make sure merchant is updating their own profile
    if (req.params.id !== req.merchant.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this merchant'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a file'
      });
    }

    const merchant = await Merchant.findByPk(req.params.id);
    if (merchant) {
      merchant.logo = req.file.path;
      await merchant.save();
    }

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    res.status(200).json({
      success: true,
      data: merchant
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Upload merchant banner image
// @route   PUT /api/merchants/:id/banner
// @access  Private/Merchant
exports.uploadBanner = async (req, res) => {
  try {
    // Make sure merchant is updating their own profile
    if (req.params.id !== req.merchant.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this merchant'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a file'
      });
    }

    const merchant = await Merchant.findByPk(req.params.id);
    if (merchant) {
      merchant.bannerImage = req.file.path;
      await merchant.save();
    }

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    res.status(200).json({
      success: true,
      data: merchant
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Upload merchant gallery images
// @route   PUT /api/merchants/:id/gallery
// @access  Private/Merchant
exports.uploadGallery = async (req, res) => {
  try {
    // Make sure merchant is updating their own profile
    if (req.params.id !== req.merchant.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this merchant'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please upload at least one file'
      });
    }

    const merchant = await Merchant.findByPk(req.params.id);

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Add new gallery images
    const galleryImages = req.files.map(file => file.path); // Cloudinary path/URL
    merchant.gallery = [...merchant.gallery, ...galleryImages];
    await merchant.save();

    res.status(200).json({
      success: true,
      data: merchant
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Upload merchant verification documents (ENHANCED)
// @route   PUT /api/merchants/:id/documents
// @access  Private/Merchant
exports.uploadDocuments = async (req, res) => {
  try {
    // Make sure merchant is updating their own profile
    if (req.params.id !== req.merchant.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this merchant'
      });
    }

    if (!req.files) {
      return res.status(400).json({
        success: false,
        error: 'Please upload required documents'
      });
    }

    const merchant = await Merchant.findByPk(req.params.id);

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Update document paths (Cloudinary metadata preserved by multer-storage-cloudinary)
    const documents = { ...merchant.documents };
    let updatedDocuments = [];

    if (req.files.businessRegistration) {
      const f = req.files.businessRegistration[0];
      documents.businessRegistration = {
        path: f.path,
        originalName: f.originalname,
        fileSize: f.size,
        mimeType: f.mimetype,
        uploadedAt: new Date()
      };
      updatedDocuments.push('Business Registration');
    }

    if (req.files.idDocument) {
      const f = req.files.idDocument[0];
      documents.idDocument = {
        path: f.path,
        originalName: f.originalname,
        fileSize: f.size,
        mimeType: f.mimetype,
        uploadedAt: new Date()
      };
      updatedDocuments.push('ID Document');
    }

    if (req.files.utilityBill) {
      const f = req.files.utilityBill[0];
      documents.utilityBill = {
        path: f.path,
        originalName: f.originalname,
        fileSize: f.size,
        mimeType: f.mimetype,
        uploadedAt: new Date()
      };
      updatedDocuments.push('Utility Bill');
    }

    if (req.files.additionalDocs) {
      documents.additionalDocs = req.files.additionalDocs.map(file => ({
        path: file.path,
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date()
      }));
      updatedDocuments.push('Additional Documents');
    }

    // Update merchant documents
    merchant.documents = documents;
    
    // NEW: Update onboarding status based on document completeness
    const hasRequiredDocs = documents.businessRegistration && 
                           documents.idDocument && 
                           documents.utilityBill;
    
    if (hasRequiredDocs && merchant.onboardingStatus === 'credentials_sent') {
      merchant.onboardingStatus = 'documents_submitted';
    }

    await merchant.save();

    // NEW: Document analysis for response
    const documentAnalysis = {
      businessRegistration: !!documents.businessRegistration,
      idDocument: !!documents.idDocument,
      utilityBill: !!documents.utilityBill,
      additionalDocs: !!(documents.additionalDocs?.length > 0)
    };

    const requiredDocsCount = [
      documentAnalysis.businessRegistration,
      documentAnalysis.idDocument,
      documentAnalysis.utilityBill
    ].filter(Boolean).length;

    const responseData = {
      ...merchant.toJSON(),
      documentStatus: {
        ...documentAnalysis,
        completionPercentage: Math.round((requiredDocsCount / 3) * 100),
        canBeVerified: requiredDocsCount === 3 && !merchant.verified,
        requiresDocuments: requiredDocsCount < 3,
        recentlyUpdated: updatedDocuments
      }
    };

    res.status(200).json({
      success: true,
      data: responseData,
      message: `Successfully uploaded: ${updatedDocuments.join(', ')}`,
      documentStatus: hasRequiredDocs ? 'complete' : 'incomplete'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create merchant by admin (ENHANCED)
exports.createMerchantByAdmin = async (req, res) => {
  try {
    // Ensure user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const result = await MerchantOnboardingService.createMerchantByAdmin(
      req.body, 
      req.user
    );

    res.status(201).json({
      success: true,
      data: result.merchant,
      credentials: result.credentials,
      message: result.message,
      // NEW: Document status info
      documentStatus: {
        required: true,
        submitted: false,
        completionPercentage: 0,
        nextStep: 'Upload verification documents'
      }
    });

  } catch (error) {
    console.error('Admin merchant creation error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Complete merchant account setup (ENHANCED)
exports.completeAccountSetup = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, businessHours, description, website } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'New password is required'
      });
    }

    const result = await MerchantOnboardingService.completeAccountSetup(
      token,
      password,
      { businessHours, description, website }
    );

    // NEW: Add document status to setup completion response
    const merchant = await Merchant.findByPk(result.merchant.id);
    
    const documentAnalysis = {
      businessRegistration: !!(merchant.documents?.businessRegistration),
      idDocument: !!(merchant.documents?.idDocument),
      utilityBill: !!(merchant.documents?.utilityBill),
      additionalDocs: !!(merchant.documents?.additionalDocs?.length > 0)
    };

    const requiredDocsCount = [
      documentAnalysis.businessRegistration,
      documentAnalysis.idDocument,
      documentAnalysis.utilityBill
    ].filter(Boolean).length;

    const enhancedResult = {
      ...result,
      documentStatus: {
        ...documentAnalysis,
        completionPercentage: Math.round((requiredDocsCount / 3) * 100),
        nextStep: requiredDocsCount < 3 ? 'Upload verification documents' : 'Wait for admin verification'
      }
    };

    res.status(200).json(enhancedResult);

  } catch (error) {
    console.error('Account setup error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get merchant setup info by token (ENHANCED)
exports.getSetupInfo = async (req, res) => {
  try {
    const { token } = req.params;
    const crypto = require('crypto');
    
    // Hash the token to compare with stored hash
    const setupTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find merchant with valid setup token
    const merchant = await Merchant.findOne({
      where: {
        accountSetupToken: setupTokenHash,
        accountSetupExpire: { [Op.gt]: new Date() }
      }
    });

    if (!merchant) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired setup token'
      });
    }

    // NEW: Add document requirement info
    const documentRequirements = {
      required: [
        'Business Registration Certificate',
        'Valid ID Document (National ID/Passport)',
        'Utility Bill or Proof of Address'
      ],
      optional: [
        'Additional business documents',
        'Business permits/licenses'
      ]
    };

    res.status(200).json({
      success: true,
      data: {
        businessName: merchant.businessName,
        email: merchant.email,
        phone: merchant.phone,
        businessType: merchant.businessType,
        address: merchant.address,
        setupExpire: merchant.accountSetupExpire
      },
      documentRequirements
    });

  } catch (error) {
    console.error('Setup info error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Verify merchant (ENHANCED WITH NOTIFICATION)
exports.verifyMerchant = async (req, res) => {
  try {
    const merchant = await Merchant.findByPk(req.params.id);

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // NEW: Check if merchant has required documents
    const hasRequiredDocs = merchant.documents?.businessRegistration && 
                           merchant.documents?.idDocument && 
                           merchant.documents?.utilityBill;

    if (!hasRequiredDocs) {
      return res.status(400).json({
        success: false,
        error: 'Cannot verify merchant: Required documents are missing'
      });
    }

    merchant.verified = true;
    merchant.verifiedDate = Date.now();
    merchant.onboardingStatus = 'completed';
    // Auto-activate when verified
    merchant.isActive = true;
    await merchant.save();

    // NEW: Send verification confirmation email
    try {
      const { sendEmail } = require('../utils/emailService');
      
      await sendEmail({
        to: merchant.email,
        subject: '🎉 Business Verification Approved - Nairobi CBD',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #4caf50; color: white; padding: 20px; text-align: center;">
              <h1>✅ Verification Approved!</h1>
            </div>
            <div style="padding: 20px;">
              <h2>Congratulations ${merchant.businessName}!</h2>
              <p>Your business has been successfully verified and is now live on Nairobi CBD Business Directory.</p>
              <p>You can now enjoy all the benefits of being a verified business.</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.FRONTEND_URL}/merchant/dashboard" 
                   style="background: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                  Visit Dashboard
                </a>
              </div>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.status(200).json({
      success: true,
      data: merchant,
      message: 'Merchant verified successfully and notification sent'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Send login credentials to merchant email
// @route   POST /api/merchants/send-credentials
// @access  Private (Merchant only)
exports.sendCredentials = async (req, res) => {
  try {
    const merchant = await Merchant.findByPk(req.user.id);

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Import nodemailer
    const nodemailer = require('nodemailer');

    // Create transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #2563eb;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f8fafc;
            padding: 30px;
            border: 1px solid #e2e8f0;
            border-radius: 0 0 8px 8px;
          }
          .credentials {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #64748b;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Nairobi Verified - Merchant Login Credentials</h1>
        </div>
        <div class="content">
          <h2>Hello ${merchant.businessName}!</h2>
          <p>Here are your login credentials for the Nairobi Verified merchant portal:</p>
          
          <div class="credentials">
            <p><strong>Email:</strong> ${merchant.email}</p>
            <p><strong>Dashboard URL:</strong> <a href="${process.env.FRONTEND_URL}/merchant/dashboard">Merchant Dashboard</a></p>
          </div>
          
          <p>You can use these credentials to:</p>
          <ul>
            <li>Access your merchant dashboard</li>
            <li>Update your business information</li>
            <li>View performance analytics</li>
            <li>Manage your business profile</li>
          </ul>
          
          <a href="${process.env.FRONTEND_URL}/merchant/dashboard" class="button">
            Access Dashboard
          </a>
          
          <p>If you have any questions or need support, please contact our team.</p>
          
          <div class="footer">
            <p>© 2024 Nairobi Verified. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: `"Nairobi Verified" <${process.env.EMAIL_USER}>`,
      to: merchant.email,
      subject: 'Your Nairobi Verified Merchant Login Credentials',
      html: emailHtml
    });

    res.status(200).json({
      success: true,
      message: 'Login credentials sent successfully to your email'
    });

  } catch (error) {
    console.error('Error sending credentials:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send credentials'
    });
  }
};

// @desc    Set merchant as featured/unfeatured
// @route   PUT /api/merchants/:id/featured
// @access  Private (Admin only)
exports.setFeatured = async (req, res) => {
  try {
    const { featured } = req.body;
    
    const merchant = await Merchant.findByPk(req.params.id);

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    merchant.featured = featured;
    if (featured) {
      merchant.featuredDate = Date.now();
    } else {
      merchant.featuredDate = null;
    }
    
    await merchant.save();

    res.status(200).json({
      success: true,
      data: merchant
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};