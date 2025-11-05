const Merchant = require('../models/Merchant');
const Review = require('../models/Review');
const MerchantOnboardingService = require('../services/merchantOnboarding');
const { emailService, sendEmail } = require('../utils/emailService');
const { HTTP_STATUS } = require('../config/constants');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

/**
 * Helper: normalize id from req.user / req.merchant
 */
function getUserIdFromReq(req) {
  if (!req) return null;
  if (req.merchant && (req.merchant._id || req.merchant.id)) return String(req.merchant._id || req.merchant.id);
  if (req.user && (req.user._id || req.user.id)) return String(req.user._id || req.user.id);
  return null;
}

// @desc    Get all merchants with enhanced document visibility
// @route   GET /api/merchants
// @access  Public
exports.getMerchants = async (req, res) => {
  try {
    let query;
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit', 'search', 'category', 'documentStatus'];
    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Build base query
    let baseQuery = JSON.parse(queryStr);
    
    // Add search filter
    if (req.query.search) {
      baseQuery.$or = [
        { businessName: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { businessType: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Add category filter
    if (req.query.category && req.query.category !== 'All') {
      baseQuery.businessType = req.query.category;
    }

    // Add document status filter
    if (req.query.documentStatus) {
      switch (req.query.documentStatus) {
        case 'complete':
          baseQuery.$and = [
            { 'documents.businessRegistration.path': { $exists: true, $ne: '' } },
            { 'documents.idDocument.path': { $exists: true, $ne: '' } },
            { 'documents.utilityBill.path': { $exists: true, $ne: '' } }
          ];
          break;
        case 'incomplete':
          baseQuery.$or = [
            { 'documents.businessRegistration.path': { $exists: false } },
            { 'documents.businessRegistration.path': '' },
            { 'documents.idDocument.path': { $exists: false } },
            { 'documents.idDocument.path': '' },
            { 'documents.utilityBill.path': { $exists: false } },
            { 'documents.utilityBill.path': '' }
          ];
          break;
        case 'pending_review':
          baseQuery.$and = [
            { 'documents.businessRegistration.path': { $exists: true, $ne: '' } },
            { 'documents.idDocument.path': { $exists: true, $ne: '' } },
            { 'documents.utilityBill.path': { $exists: true, $ne: '' } },
            { verified: false }
          ];
          break;
      }
    }

    // Count total documents matching the query
    const total = await Merchant.countDocuments(baseQuery);

    // Initialize query with filters
    query = Merchant.find(baseQuery).lean();

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-password');
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const merchants = await query;

    // Build pagination response
    const pagination = {};
    if (endIndex < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
      success: true,
      count: merchants.length,
      total: total, // Add total count for frontend
      pagination,
      data: merchants
    });
  } catch (error) {
    console.error('getMerchants error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get single merchant with full document information
// @route   GET /api/merchants/:id
// @access  Public
exports.getMerchant = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id).lean();
    if (!merchant) {
      return res.status(404).json({ success: false, error: `Merchant not found with id of ${req.params.id}` });
    }

    let responseData = { ...merchant };

    // Expose document analysis only to admin or the merchant themselves
    if (req.user && (req.user.role === 'admin' || getUserIdFromReq(req) === String(merchant._id))) {
      const documentAnalysis = {
        businessRegistration: !!(merchant.documents?.businessRegistration?.path),
        idDocument: !!(merchant.documents?.idDocument?.path),
        utilityBill: !!(merchant.documents?.utilityBill?.path),
        additionalDocs: !!(merchant.documents?.additionalDocs?.length > 0)
      };

      const requiredDocsCount = [
        documentAnalysis.businessRegistration,
        documentAnalysis.idDocument,
        documentAnalysis.utilityBill
      ].filter(Boolean).length;

      responseData.documentAnalysis = {
        ...documentAnalysis,
        requiredDocsSubmitted: requiredDocsCount,
        totalRequiredDocs: 3,
        completionPercentage: Math.round((requiredDocsCount / 3) * 100),
        canBeVerified: requiredDocsCount === 3 && !merchant.verified,
        requiresDocuments: requiredDocsCount < 3
      };
    } else {
      // hide sensitive document info from public
      delete responseData.documents;
    }

    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error('getMerchant error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

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

    // Simple validation for required fields
    if (!businessName || !email || !phone || !password || !businessType || !address || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields (businessName, email, phone, password, businessType, address, description)'
      });
    }

    // Check if merchant already exists
    const existingMerchant = await Merchant.findOne({ email: email.toLowerCase() });
    if (existingMerchant) {
      return res.status(400).json({ success: false, error: 'Merchant with this email already exists' });
    }

    // Build merchant payload
    const merchantPayload = {
      businessName,
      email: email.toLowerCase(),
      phone,
      password,
      businessType,
      description,
      yearEstablished: yearEstablished ? parseInt(yearEstablished, 10) : undefined,
      website,
      address,
      location: address,
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
      logo: '',
      bannerImage: '',
      gallery: [],
      documents: {
        businessRegistration: { path: '', uploadedAt: null },
        idDocument: { path: '', uploadedAt: null },
        utilityBill: { path: '', uploadedAt: null },
        additionalDocs: [],
        documentsSubmittedAt: null,
        documentReviewStatus: 'pending'
      },
      featured: false,
      rating: 0,
      reviews: 0
    };

    const merchant = await Merchant.create(merchantPayload);

    // 🔑 CRITICAL FIX: Auto-login the merchant after registration
    // This allows them to upload documents in the next step
    req.login(merchant, (err) => {
      if (err) {
        console.error('❌ Auto-login failed after merchant creation:', err);
        // Still return success but without session
        return res.status(201).json({
          success: true,
          data: {
            id: merchant._id,
            businessName: merchant.businessName,
            email: merchant.email,
            phone: merchant.phone,
            businessType: merchant.businessType,
            verified: merchant.verified,
            createdAt: merchant.createdAt,
            message: 'Merchant registration submitted successfully. Please log in to upload documents.'
          },
          requiresLogin: true
        });
      }

      console.log('✅ Merchant auto-logged in after registration:', merchant.email);

      // Try sending admin notification (non-blocking)
      try {
        if (emailService && typeof emailService.sendAdminMerchantNotification === 'function') {
          emailService.sendAdminMerchantNotification(merchant);
        }
      } catch (emailError) {
        console.error('Failed to send admin notification email:', emailError);
      }

      res.status(201).json({
        success: true,
        authenticated: true, // Flag to frontend that user is now logged in
        data: {
          id: merchant._id,
          businessName: merchant.businessName,
          email: merchant.email,
          phone: merchant.phone,
          businessType: merchant.businessType,
          verified: merchant.verified,
          createdAt: merchant.createdAt,
          message: 'Merchant registration submitted successfully. You can now upload documents.'
        }
      });
    });

  } catch (error) {
    console.error('createMerchant error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ success: false, error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update merchant with document status
// @route   PUT /api/merchants/:id
// @access  Private/Merchant
exports.updateMerchant = async (req, res) => {
  try {
    console.log('🔧 updateMerchant called:', {
      merchantIdFromUrl: req.params.id,
      userId: req.user?._id,
      userEmail: req.user?.email,
      isMerchant: !!req.user?.businessName
    });

    // CRITICAL FIX: When a merchant logs in, req.user IS the merchant
    // So we need to check if the logged-in merchant's ID matches the ID being updated
    const requesterId = getUserIdFromReq(req);
    const merchantIdToUpdate = String(req.params.id);
    
    console.log('🔐 Authorization check:', {
      requesterId,
      merchantIdToUpdate,
      matches: requesterId === merchantIdToUpdate
    });

    // Authorization: merchant can only update their own profile
    if (!requesterId || requesterId !== merchantIdToUpdate) {
      console.error('❌ Authorization failed:', {
        requesterId,
        merchantIdToUpdate,
        message: 'Merchant can only update their own profile'
      });
      return res.status(HTTP_STATUS.FORBIDDEN).json({ 
        success: false, 
        error: 'Not authorized to update this merchant' 
      });
    }

    // Pick only allowed fields from req.body to avoid overwriting sensitive fields
    const updateFields = {};
    const allowed = [
      'businessName', 'email', 'phone', 'businessType', 'description', 
      'yearEstablished', 'website', 'address', 'location', 'landmark', 
      'businessHours', 'logo', 'bannerImage', 'gallery', 'socialLinks',
      'whatsappNumber', 'priceRange', 'latitude', 'longitude', 'seoTitle', 
      'seoDescription', 'googleBusinessUrl'
    ];
    
    allowed.forEach(key => {
      if (req.body[key] !== undefined) {
        updateFields[key] = req.body[key];
      }
    });

    console.log('📝 Updating fields:', Object.keys(updateFields));

    const merchant = await Merchant.findByIdAndUpdate(
      merchantIdToUpdate, 
      updateFields, 
      { new: true, runValidators: true }
    ).lean();

    if (!merchant) {
      console.error('❌ Merchant not found:', merchantIdToUpdate);
      return res.status(404).json({ success: false, error: 'Merchant not found' });
    }

    // Add document analysis to response
    const documentAnalysis = {
      businessRegistration: !!(merchant.documents?.businessRegistration?.path),
      idDocument: !!(merchant.documents?.idDocument?.path),
      utilityBill: !!(merchant.documents?.utilityBill?.path),
      additionalDocs: !!(merchant.documents?.additionalDocs?.length > 0)
    };

    const requiredDocsCount = [
      documentAnalysis.businessRegistration,
      documentAnalysis.idDocument,
      documentAnalysis.utilityBill
    ].filter(Boolean).length;

    const responseData = {
      ...merchant,
      documentStatus: {
        ...documentAnalysis,
        completionPercentage: Math.round((requiredDocsCount / 3) * 100),
        canBeVerified: requiredDocsCount === 3 && !merchant.verified,
        requiresDocuments: requiredDocsCount < 3
      }
    };

    console.log('✅ Merchant updated successfully:', merchant._id);

    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error('❌ updateMerchant error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};


// @desc    Delete merchant with document cleanup
// @route   DELETE /api/merchants/:id
// @access  Private/Admin
exports.deleteMerchant = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) return res.status(404).json({ success: false, error: 'Merchant not found' });

    // Delete all reviews associated with the merchant
    await Review.deleteMany({ merchant: req.params.id });

    const hadDocuments = !!(
      merchant.documents?.businessRegistration?.path ||
      merchant.documents?.idDocument?.path ||
      merchant.documents?.utilityBill?.path ||
      (merchant.documents?.additionalDocs && merchant.documents.additionalDocs.length > 0)
    );

    await merchant.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: `Merchant ${merchant.businessName} deleted successfully${hadDocuments ? ' (including documents)' : ''}`
    });
  } catch (error) {
    console.error('deleteMerchant error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Upload merchant logo
// @route   PUT /api/merchants/:id/logo
// @access  Private/Merchant
exports.uploadLogo = async (req, res) => {
  try {
    const requesterId = getUserIdFromReq(req);
    if (!requesterId || String(req.params.id) !== requesterId) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, error: 'Not authorized to update this merchant' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    const updated = await Merchant.findByIdAndUpdate(req.params.id, { logo: `/uploads/images/${req.file.filename}` }, { new: true, runValidators: true }).lean();
    if (!updated) return res.status(404).json({ success: false, error: 'Merchant not found' });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('uploadLogo error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Upload merchant banner image
// @route   PUT /api/merchants/:id/banner
// @access  Private/Merchant
exports.uploadBanner = async (req, res) => {
  try {
    const requesterId = getUserIdFromReq(req);
    if (!requesterId || String(req.params.id) !== requesterId) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, error: 'Not authorized to update this merchant' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    const updated = await Merchant.findByIdAndUpdate(req.params.id, { bannerImage: `/uploads/images/${req.file.filename}` }, { new: true, runValidators: true }).lean();
    if (!updated) return res.status(404).json({ success: false, error: 'Merchant not found' });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('uploadBanner error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Upload merchant gallery images
// @route   PUT /api/merchants/:id/gallery
// @access  Private/Merchant
exports.uploadGallery = async (req, res) => {
  try {
    const requesterId = getUserIdFromReq(req);
    if (!requesterId || String(req.params.id) !== requesterId) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, error: 'Not authorized to update this merchant' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'Please upload at least one file' });
    }

    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) return res.status(404).json({ success: false, error: 'Merchant not found' });

    const galleryImages = req.files.map(file => `/uploads/images/${file.filename}`);
    merchant.gallery = [...(merchant.gallery || []), ...galleryImages];
    await merchant.save();

    res.status(200).json({ success: true, data: merchant.toObject() });
  } catch (error) {
    console.error('uploadGallery error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Upload merchant verification documents (FIXED)
// @route   PUT /api/merchants/:id/documents
// @access  Private/Merchant
exports.uploadDocuments = async (req, res) => {
  try {
    console.log('=== uploadDocuments Start ==='); // DEBUG: Start of request
    console.log('Request Headers:', JSON.stringify(req.headers, null, 2)); // DEBUG: Log headers (check Content-Type)
    console.log('Request Body:', JSON.stringify(req.body, null, 2)); // DEBUG: Log any text fields
    console.log('Request Files:', JSON.stringify(req.files, null, 2)); // DEBUG: Log file details

    const requesterId = getUserIdFromReq(req);
    console.log('Requester ID:', requesterId, 'Merchant ID:', req.params.id); // DEBUG: Auth check
    if (!requesterId || String(req.params.id) !== requesterId) {
      console.log('Authorization failed: Requester ID does not match merchant ID'); // DEBUG
      return res.status(HTTP_STATUS.FORBIDDEN).json({ 
        success: false, 
        error: 'Not authorized to update this merchant' 
      });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      console.log('No files received in req.files'); // DEBUG: Critical check
      return res.status(400).json({ 
        success: false, 
        error: 'Please upload required documents' 
      });
    }

    console.log('Fetching merchant from DB'); // DEBUG
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      console.log('Merchant not found for ID:', req.params.id); // DEBUG
      return res.status(404).json({ 
        success: false, 
        error: 'Merchant not found' 
      });
    }

    console.log('Merchant found:', merchant.businessName, merchant._id); // DEBUG
    if (!merchant.documents) {
      console.log('Initializing empty documents object'); // DEBUG
      merchant.documents = {
        businessRegistration: { path: '', uploadedAt: null },
        idDocument: { path: '', uploadedAt: null },
        utilityBill: { path: '', uploadedAt: null },
        additionalDocs: [],
        documentReviewStatus: 'pending'
      };
    }

    const updatedDocuments = [];

    if (req.files.businessRegistration && req.files.businessRegistration[0]) {
      const file = req.files.businessRegistration[0];
      console.log('Processing businessRegistration:', file.originalname); // DEBUG
      merchant.documents.businessRegistration = {
        path: file.path || `/uploads/documents/${file.filename}`,
        uploadedAt: new Date(),
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        cloudinaryUrl: file.path,
        publicId: file.filename
      };
      updatedDocuments.push('Business Registration');
      console.log('Set businessRegistration:', merchant.documents.businessRegistration); // DEBUG
    }

    if (req.files.idDocument && req.files.idDocument[0]) {
      const file = req.files.idDocument[0];
      console.log('Processing idDocument:', file.originalname); // DEBUG
      merchant.documents.idDocument = {
        path: file.path || `/uploads/documents/${file.filename}`,
        uploadedAt: new Date(),
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        cloudinaryUrl: file.path,
        publicId: file.filename
      };
      updatedDocuments.push('ID Document');
      console.log('Set idDocument:', merchant.documents.idDocument); // DEBUG
    }

    if (req.files.utilityBill && req.files.utilityBill[0]) {
      const file = req.files.utilityBill[0];
      console.log('Processing utilityBill:', file.originalname); // DEBUG
      merchant.documents.utilityBill = {
        path: file.path || `/uploads/documents/${file.filename}`,
        uploadedAt: new Date(),
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        cloudinaryUrl: file.path,
        publicId: file.filename
      };
      updatedDocuments.push('Utility Bill');
      console.log('Set utilityBill:', merchant.documents.utilityBill); // DEBUG
    }

    if (req.files.additionalDocs && req.files.additionalDocs.length > 0) {
      console.log('Processing additionalDocs, count:', req.files.additionalDocs.length); // DEBUG
      const additionalDocs = req.files.additionalDocs.map(file => ({
        path: file.path || `/uploads/documents/${file.filename}`,
        uploadedAt: new Date(),
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        cloudinaryUrl: file.path,
        publicId: file.filename,
        description: 'Additional Document'
      }));
      
      merchant.documents.additionalDocs = [
        ...(merchant.documents.additionalDocs || []), 
        ...additionalDocs
      ];
      updatedDocuments.push(`${additionalDocs.length} Additional Document(s)`);
      console.log('Set additionalDocs:', merchant.documents.additionalDocs); // DEBUG
    }

    merchant.documents.documentsSubmittedAt = new Date();
    merchant.documents.documentReviewStatus = 'pending';
    console.log('Updated submission timestamp and status:', merchant.documents.documentsSubmittedAt, merchant.documents.documentReviewStatus); // DEBUG

    const hasRequiredDocs = 
      merchant.documents.businessRegistration?.path && merchant.documents.businessRegistration.path !== '' && 
      merchant.documents.idDocument?.path && merchant.documents.idDocument.path !== '' && 
      merchant.documents.utilityBill?.path && merchant.documents.utilityBill.path !== '';
    console.log('Required docs check:', hasRequiredDocs); // DEBUG

    if (hasRequiredDocs && merchant.onboardingStatus === 'credentials_sent') {
      merchant.onboardingStatus = 'documents_submitted';
      console.log('Updated onboardingStatus to documents_submitted'); // DEBUG
    }

    console.log('Saving merchant to DB'); // DEBUG
    await merchant.save();
    console.log('Merchant saved successfully, documents:', merchant.documents); // DEBUG

    const documentAnalysis = {
      businessRegistration: !!merchant.documents.businessRegistration?.path && merchant.documents.businessRegistration.path !== '',
      idDocument: !!merchant.documents.idDocument?.path && merchant.documents.idDocument.path !== '',
      utilityBill: !!merchant.documents.utilityBill?.path && merchant.documents.utilityBill.path !== '',
      additionalDocs: !!(merchant.documents.additionalDocs?.length > 0)
    };

    const requiredDocsCount = [
      documentAnalysis.businessRegistration,
      documentAnalysis.idDocument,
      documentAnalysis.utilityBill
    ].filter(Boolean).length;

    console.log('Document analysis:', documentAnalysis, 'Required count:', requiredDocsCount); // DEBUG

    res.status(200).json({
      success: true,
      data: {
        id: merchant._id,
        businessName: merchant.businessName,
        documents: merchant.documents
      },
      documentStatus: {
        ...documentAnalysis,
        completionPercentage: Math.round((requiredDocsCount / 3) * 100),
        canBeVerified: requiredDocsCount === 3 && !merchant.verified,
        requiresDocuments: requiredDocsCount < 3,
        recentlyUpdated: updatedDocuments
      },
      message: `Successfully uploaded: ${updatedDocuments.join(', ')}`,
      isComplete: hasRequiredDocs
    });

  } catch (error) {
    console.error('❌ uploadDocuments error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message
    });
  }
};

// @desc    Create merchant by admin (OPTIMIZED WITH SERVICE)
// @route   POST /api/merchants/admin/create
// @access  Private/Admin
exports.createMerchantByAdmin = async (req, res) => {
  try {
    // AUTHORIZATION CHECK - Support both session (req.user) and JWT admin auth (req.admin)
    const adminUser = req.admin || req.user;
    const isAdmin = adminUser && (adminUser.role === 'admin' || adminUser.role === 'super_admin');
    
    if (!isAdmin) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ 
        success: false, 
        error: 'Access denied. Admin privileges required.' 
      });
    }

    // USE OPTIMIZED SERVICE: All validation, duplicate checks, and email sending handled
    const result = await MerchantOnboardingService.createMerchantByAdmin(
      req.body, 
      adminUser
    );

    // FIX: Don't initialize documents object when creating manually
    // Documents should only be counted when actually uploaded
    const merchant = result.merchant;

    // RETURN SUCCESS IMMEDIATELY (email sent in background)
    res.status(201).json({
      success: true,
      data: merchant,
      credentials: result.credentials,
      message: result.message,
      documentStatus: {
        required: true,
        submitted: false,
        completionPercentage: 0,
        hasDocuments: false, // FIXED: No documents until uploaded
        nextStep: merchant.verified 
          ? 'Complete business profile' 
          : 'Upload verification documents'
      }
    });

  } catch (error) {
    console.error('createMerchantByAdmin error:', error);
    
    // RETURN USER-FRIENDLY ERROR
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Failed to create merchant account'
    });
  }
};

// @desc    Create merchant with products by admin (WITH FILE UPLOADS)
// @route   POST /api/merchants/admin/create-with-products
// @access  Private/Admin
exports.createMerchantWithProducts = async (req, res) => {
  try {
    // AUTHORIZATION CHECK - Support both session (req.user) and JWT admin auth (req.admin)
    const adminUser = req.admin || req.user;
    const isAdmin = adminUser && (adminUser.role === 'admin' || adminUser.role === 'super_admin');
    
    if (!isAdmin) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ 
        success: false, 
        error: 'Access denied. Admin privileges required.' 
      });
    }

    const Product = require('../models/Product');
    const { cloudinary, ensureConfigured } = require('../services/cloudinaryService');
    
    // Ensure Cloudinary is configured before using it
    ensureConfigured();

    console.log('📦 Creating merchant with products...');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Files received:', req.files ? req.files.length : 'none');

    // Extract merchant data
    const merchantData = {
      businessName: req.body.businessName,
      email: req.body.email,
      phone: req.body.phone,
      businessType: req.body.businessType,
      description: req.body.description,
      address: req.body.address,
      location: req.body.location,
      website: req.body.website,
      yearEstablished: req.body.yearEstablished,
      autoVerify: req.body.autoVerify === 'true'
    };

    // Create merchant first
    const result = await MerchantOnboardingService.createMerchantByAdmin(
      merchantData, 
      adminUser
    );
    const merchant = result.merchant;

    console.log('✅ Merchant created:', merchant._id);

    // Parse products data if provided
    let createdProducts = [];
    if (req.body.products) {
      const productsData = JSON.parse(req.body.products);
      console.log(`📦 Creating ${productsData.length} products...`);

      // Group files by product index
      const filesByProduct = {};
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach(file => {
          // Parse fieldname like "product_0_image_0"
          const match = file.fieldname.match(/product_(\d+)_image_(\d+)/);
          if (match) {
            const productIndex = parseInt(match[1]);
            if (!filesByProduct[productIndex]) {
              filesByProduct[productIndex] = [];
            }
            filesByProduct[productIndex].push(file);
          }
        });
      }

      for (let i = 0; i < productsData.length; i++) {
        const productData = productsData[i];
        
        // Upload product images
        const productImages = [];
        const productFiles = filesByProduct[i] || [];
        
        console.log(`Uploading ${productFiles.length} images for product ${i}...`);
        
        for (const imageFile of productFiles) {
          try {
            // Upload buffer to Cloudinary using upload_stream
            const uploadResult = await new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                {
                  folder: 'nairobi-verified/products',
                  resource_type: 'image'
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              );
              uploadStream.end(imageFile.buffer);
            });
            
            productImages.push(uploadResult.secure_url);
            console.log(`✅ Image uploaded successfully: ${uploadResult.secure_url}`);
          } catch (uploadError) {
            console.error(`Error uploading image:`, uploadError);
            console.error('Upload error details:', JSON.stringify(uploadError, null, 2));
          }
        }

        // Create product
        const product = await Product.create({
          name: productData.name,
          description: productData.description,
          category: productData.category,
          subcategory: productData.subcategory,
          price: productData.price,
          originalPrice: productData.originalPrice || productData.price,
          stockQuantity: productData.stockQuantity || 0,
          merchant: merchant._id,
          merchantName: merchant.businessName,
          images: productImages,
          primaryImage: productImages[0] || '/placeholder-product.jpg',
          isActive: true,
          featured: false,
          tags: []
        });

        createdProducts.push(product);
        console.log(`✅ Product created: ${product.name} with ${productImages.length} images`);
      }
    }

    // RETURN SUCCESS
    res.status(201).json({
      success: true,
      data: merchant,
      products: createdProducts,
      credentials: result.credentials,
      message: result.message,
      productsCreated: createdProducts.length,
      documentStatus: {
        required: true,
        submitted: false,
        completionPercentage: 0,
        hasDocuments: false,
        nextStep: merchant.verified 
          ? 'Complete business profile' 
          : 'Upload verification documents'
      }
    });

  } catch (error) {
    console.error('❌ createMerchantWithProducts error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Failed to create merchant with products'
    });
  }
};

// @desc    Update merchant with products by admin (WITH FILE UPLOADS)
// @route   PUT /api/merchants/admin/:id/update-with-products
// @access  Private/Admin
exports.updateMerchantWithProducts = async (req, res) => {
  console.log('🔵 updateMerchantWithProducts called');
  console.log('🔵 req.admin:', req.admin ? 'exists' : 'missing');
  console.log('🔵 req.user:', req.user ? 'exists' : 'missing');
  console.log('🔵 req.params.id:', req.params.id);
  
  try {
    // AUTHORIZATION CHECK - Support both session (req.user) and JWT admin auth (req.admin)
    const adminUser = req.admin || req.user;
    const isAdmin = adminUser && (adminUser.role === 'admin' || adminUser.role === 'super_admin');
    
    console.log('🔵 adminUser:', adminUser ? adminUser.email : 'none');
    console.log('🔵 isAdmin:', isAdmin);
    
    if (!isAdmin) {
      console.log('⛔ Access denied - not admin');
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied. Admin privileges required.' 
      });
    }

    console.log('✅ Authorization passed');
    
    const Product = require('../models/Product');
    const Merchant = require('../models/Merchant');
    const { cloudinary, ensureConfigured } = require('../services/cloudinaryService');
    
    console.log('✅ Models loaded');
    
    // Ensure Cloudinary is configured before using it
    ensureConfigured();
    
    console.log('✅ Cloudinary configured');

    const merchantId = req.params.id;
    console.log(`📝 Updating merchant ${merchantId} with products...`);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Files received:', req.files ? req.files.length : 'none');

    // Find existing merchant
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Update merchant data
    const updateData = {
      businessName: req.body.businessName || merchant.businessName,
      ownerName: req.body.ownerName || merchant.ownerName,
      email: req.body.email || merchant.email,
      phone: req.body.phone || merchant.phone,
      businessType: req.body.businessType || merchant.businessType,
      description: req.body.description || merchant.description,
      address: req.body.address || merchant.address,
      location: req.body.location || merchant.location,
      website: req.body.website || merchant.website,
      yearEstablished: req.body.yearEstablished || merchant.yearEstablished
    };

    // Update status fields if provided
    if (req.body.verified !== undefined) {
      updateData.verified = req.body.verified === 'true' || req.body.verified === true;
    }
    if (req.body.isActive !== undefined) {
      updateData.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    }
    if (req.body.featured !== undefined) {
      updateData.featured = req.body.featured === 'true' || req.body.featured === true;
    }

    // Update merchant
    Object.assign(merchant, updateData);
    await merchant.save();
    console.log('✅ Merchant updated:', merchant._id);

    // Handle products if provided
    let createdProducts = [];
    if (req.body.products) {
      const productsData = JSON.parse(req.body.products);
      console.log(`📦 Creating ${productsData.length} new products...`);

      // Validate products data
      if (!Array.isArray(productsData)) {
        console.warn('⚠️ Products data is not an array, skipping product creation');
      } else {
        // Group files by product index
        const filesByProduct = {};
        if (req.files && Array.isArray(req.files)) {
          req.files.forEach(file => {
            // Parse fieldname like "product_0_image_0"
            const match = file.fieldname.match(/product_(\d+)_image_(\d+)/);
            if (match) {
              const productIndex = parseInt(match[1]);
              if (!filesByProduct[productIndex]) {
                filesByProduct[productIndex] = [];
              }
              filesByProduct[productIndex].push(file);
            }
          });
        }

        for (let i = 0; i < productsData.length; i++) {
          const productData = productsData[i];
          
          // Validate required fields
          if (!productData.name || !productData.price) {
            console.warn(`⚠️ Skipping product ${i}: missing required fields`);
            continue;
          }
          
          // Upload product images
          const productImages = [];
          const productFiles = filesByProduct[i] || [];
          
          console.log(`Uploading ${productFiles.length} images for product ${i}...`);
        
        for (const imageFile of productFiles) {
          try {
            // Upload buffer to Cloudinary using upload_stream
            const uploadResult = await new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                {
                  folder: 'nairobi-verified/products',
                  resource_type: 'image'
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              );
              uploadStream.end(imageFile.buffer);
            });
            
            productImages.push(uploadResult.secure_url);
            console.log(`✅ Image uploaded successfully: ${uploadResult.secure_url}`);
          } catch (uploadError) {
            console.error(`Error uploading image:`, uploadError);
          }
        }

        // Create product
        const product = await Product.create({
          name: productData.name,
          description: productData.description,
          category: productData.category,
          subcategory: productData.subcategory,
          price: productData.price,
          originalPrice: productData.originalPrice || productData.price,
          stockQuantity: productData.stockQuantity || 0,
          merchant: merchant._id,
          merchantName: merchant.businessName,
          images: productImages,
          primaryImage: productImages[0] || '/placeholder-product.jpg',
          isActive: true,
          featured: false,
          tags: []
        });

        createdProducts.push(product);
        console.log(`✅ Product created: ${product.name} with ${productImages.length} images`);
        }
      }
    }

    // RETURN SUCCESS
    res.status(200).json({
      success: true,
      data: merchant,
      products: createdProducts,
      message: `Merchant updated successfully. ${createdProducts.length} new product(s) added.`,
      productsCreated: createdProducts.length
    });

  } catch (error) {
    console.error('❌ updateMerchantWithProducts error:', error);
    console.error('❌ Error type:', typeof error);
    console.error('❌ Error constructor:', error?.constructor?.name);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error stack:', error?.stack);
    console.error('❌ Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    res.status(500).json({ 
      success: false, 
      error: error?.message || error?.toString() || 'Failed to update merchant with products',
      errorType: error?.constructor?.name || typeof error,
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
};

// @desc    Bulk create merchants (OPTIMIZED WITH SERVICE)
// @route   POST /api/merchants/admin/bulk-create
// @access  Private/Admin
exports.bulkCreateMerchants = async (req, res) => {
  try {
    // AUTHORIZATION CHECK
    if (!req.user || req.user.role !== 'admin') {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ 
        success: false, 
        error: 'Access denied. Admin privileges required.' 
      });
    }

    const { merchants } = req.body;

    // VALIDATION
    if (!Array.isArray(merchants) || merchants.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid merchants array. Provide an array of merchant data.'
      });
    }

    // LIMIT BATCH SIZE
    if (merchants.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 100 merchants per batch. Please split into smaller batches.'
      });
    }

    // USE OPTIMIZED BULK SERVICE
    const results = await MerchantOnboardingService.bulkCreateMerchants(
      merchants,
      req.user
    );

    // RETURN DETAILED RESULTS
    res.status(200).json({
      success: true,
      results: {
        total: results.total,
        successful: results.successful.length,
        failed: results.failed.length,
        successRate: `${Math.round((results.successful.length / results.total) * 100)}%`,
        successfulMerchants: results.successful,
        failedMerchants: results.failed
      },
      message: `Bulk creation complete: ${results.successful.length}/${results.total} successful`
    });

  } catch (error) {
    console.error('❌ bulkCreateMerchants error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Bulk creation failed'
    });
  }
};

// @desc    Complete merchant account setup (ENHANCED)
exports.completeAccountSetup = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, businessHours, description, website } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, error: 'New password is required' });
    }

    const result = await MerchantOnboardingService.completeAccountSetup(token, password, { businessHours, description, website });

    const merchant = await Merchant.findById(result.merchant.id).lean();
    const documentAnalysis = {
      businessRegistration: !!(merchant.documents?.businessRegistration?.path),
      idDocument: !!(merchant.documents?.idDocument?.path),
      utilityBill: !!(merchant.documents?.utilityBill?.path),
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
    console.error('completeAccountSetup error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get merchant setup info by token (ENHANCED)
exports.getSetupInfo = async (req, res) => {
  try {
    const { token } = req.params;
    const setupTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const merchant = await Merchant.findOne({
      accountSetupToken: setupTokenHash,
      accountSetupExpire: { $gt: Date.now() }
    }).lean();

    if (!merchant) {
      return res.status(400).json({ success: false, error: 'Invalid or expired setup token' });
    }

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
    console.error('getSetupInfo error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Verify merchant (ENHANCED WITH NOTIFICATION)
exports.verifyMerchant = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) return res.status(404).json({ success: false, error: 'Merchant not found' });

    const hasRequiredDocs = merchant.documents?.businessRegistration?.path && merchant.documents?.idDocument?.path && merchant.documents?.utilityBill?.path;

    if (!hasRequiredDocs) {
      return res.status(400).json({ success: false, error: 'Cannot verify merchant: Required documents are missing' });
    }

    merchant.verified = true;
    merchant.verifiedDate = Date.now();
    merchant.onboardingStatus = 'completed';
    await merchant.save();

    try {
      if (sendEmail) {
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
      }
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.status(200).json({ success: true, data: merchant, message: 'Merchant verified successfully and notification sent' });
  } catch (error) {
    console.error('verifyMerchant error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Send login credentials to merchant email
// @route   POST /api/merchants/send-credentials
// @access  Private (Merchant only)
exports.sendCredentials = async (req, res) => {
  try {
    const requesterId = getUserIdFromReq(req);
    if (!requesterId) return res.status(404).json({ success: false, error: 'Merchant not found' });

    const merchant = await Merchant.findById(requesterId).lean();
    if (!merchant) return res.status(404).json({ success: false, error: 'Merchant not found' });

    // nodemailer transporter (best to store credentials in env)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px; }
          .credentials { background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0; }
          .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header"><h1>Nairobi Verified - Merchant Login Credentials</h1></div>
        <div class="content">
          <h2>Hello ${merchant.businessName}!</h2>
          <p>Here are your login credentials for the Nairobi Verified merchant portal:</p>
          <div class="credentials">
            <p><strong>Email:</strong> ${merchant.email}</p>
            <p><strong>Dashboard URL:</strong> <a href="${process.env.FRONTEND_URL}/merchant/dashboard">Merchant Dashboard</a></p>
          </div>
          <p>If you have any questions or need support, please contact our team.</p>
          <a href="${process.env.FRONTEND_URL}/merchant/dashboard" class="button">Access Dashboard</a>
          <div class="footer"><p>© 2024 Nairobi Verified. All rights reserved.</p></div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Nairobi Verified" <${process.env.EMAIL_USER}>`,
      to: merchant.email,
      subject: 'Your Nairobi Verified Merchant Login Credentials',
      html: emailHtml
    });

    res.status(200).json({ success: true, message: 'Login credentials sent successfully to your email' });
  } catch (error) {
    console.error('sendCredentials error:', error);
    res.status(500).json({ success: false, error: 'Failed to send credentials' });
  }
};

// @desc    Set merchant as featured/unfeatured
// @route   PUT /api/merchants/:id/featured
// @access  Private (Admin only)
exports.setFeatured = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied. Admin privileges required.' });
    }

    const { featured } = req.body;
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) return res.status(404).json({ success: false, error: 'Merchant not found' });

    merchant.featured = !!featured;
    merchant.featuredDate = featured ? Date.now() : null;
    await merchant.save();

    res.status(200).json({ success: true, data: merchant });
  } catch (error) {
    console.error('setFeatured error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Resend welcome email with new password
// @route   POST /api/admin/merchants/:id/resend-welcome
// @access  Private (Admin only)
exports.resendWelcomeEmail = async (req, res) => {
  try {
    console.log('🔵 resendWelcomeEmail called for merchant:', req.params.id);
    
    // Check admin authentication
    if (!req.admin) {
      return res.status(401).json({ success: false, error: 'Admin authentication required' });
    }

    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      return res.status(404).json({ success: false, error: 'Merchant not found' });
    }

    console.log('✅ Found merchant:', merchant.businessName, merchant.email);

    // Generate new temporary password that meets validation requirements
    // Must have: min 8 chars, uppercase, lowercase, number, special char (!@#$%^&*)
    const specialChars = '!@#$%^&*';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    
    // Ensure we have at least one of each required type
    const newTempPassword = 
      uppercase.charAt(Math.floor(Math.random() * uppercase.length)) + // 1 uppercase
      lowercase.charAt(Math.floor(Math.random() * lowercase.length)) + // 1 lowercase
      lowercase.charAt(Math.floor(Math.random() * lowercase.length)) + // 1 lowercase
      lowercase.charAt(Math.floor(Math.random() * lowercase.length)) + // 1 lowercase
      digits.charAt(Math.floor(Math.random() * digits.length)) + // 1 digit
      digits.charAt(Math.floor(Math.random() * digits.length)) + // 1 digit
      uppercase.charAt(Math.floor(Math.random() * uppercase.length)) + // 1 uppercase
      specialChars.charAt(Math.floor(Math.random() * specialChars.length)); // 1 special char
    // Total: 8 characters (2 uppercase, 3 lowercase, 2 digits, 1 special)
    
    console.log('🔑 Generated password:', newTempPassword, 'length:', newTempPassword.length);
    
    // Set PLAIN password - the Merchant model pre-save hook will validate and hash it
    merchant.password = newTempPassword;
    merchant.isFirstLogin = true; // Mark as first login to force password change
    await merchant.save();

    console.log('✅ Generated new password for merchant');

    // Generate new setup token
    const setupToken = crypto.randomBytes(32).toString('hex');
    merchant.accountSetupToken = crypto.createHash('sha256').update(setupToken).digest('hex');
    merchant.accountSetupExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    await merchant.save();

    console.log('✅ Generated new setup token');

    // Send welcome email with new credentials
    const setupUrl = `${process.env.FRONTEND_URL}/merchant/account-setup/${setupToken}`;
    const loginUrl = `${process.env.FRONTEND_URL}/merchant/login`;
    const googleLoginUrl = `${process.env.FRONTEND_URL}/merchant/login?oauth=google`;

    const emailContent = {
      to: merchant.email,
      subject: '🎉 Welcome to Nairobi CBD - Your Updated Account Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Nairobi CBD!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your merchant account credentials have been updated</p>
          </div>
          
          <!-- Greeting -->
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${merchant.businessName}!</h2>
            <p style="color: #666; line-height: 1.6;">
              We're resending your welcome email with updated login credentials. 
              You can now access your merchant dashboard and start managing your business profile.
            </p>
          </div>

          <!-- Credentials -->
          <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #2e7d32; margin-top: 0;">🔐 Your New Login Credentials</h3>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${merchant.email}</p>
            <p style="margin: 10px 0;">
              <strong>New Temporary Password:</strong> 
              <code style="background: #fff; padding: 8px 12px; border-radius: 4px; color: #d32f2f; font-weight: bold; font-size: 16px; display: inline-block; border: 2px dashed #d32f2f;">${newTempPassword}</code>
            </p>
            <p style="color: #f57c00; font-size: 14px; margin-top: 15px; background: #fff3e0; padding: 10px; border-radius: 4px;">
              ⚠️ <strong>Security Alert:</strong> Change this password immediately after your first login.
            </p>
          </div>

          <!-- Sign in Options -->
          <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #1565c0; margin-top: 0;">🚀 Two Ways to Sign In</h3>
            <div style="margin: 15px 0;">
              <p style="margin: 5px 0; color: #333;"><strong>1. Email & Password:</strong></p>
              <p style="margin: 5px 0; color: #666; font-size: 14px;">Use your email and the temporary password above</p>
            </div>
            <div style="margin: 15px 0;">
              <p style="margin: 5px 0; color: #333;"><strong>2. Sign in with Google:</strong></p>
              <p style="margin: 5px 0; color: #666; font-size: 14px;">Use the same email address (${merchant.email}) to sign in with Google for faster access</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 0 5px 10px 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              🔑 Login with Password
            </a>
            <a href="${googleLoginUrl}" style="background: #4285f4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 0 5px 10px 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 8px;" alt="Google" />
              Sign in with Google
            </a>
          </div>

          <!-- Next Steps -->
          <div style="background: #fff; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #333; margin-top: 0;">📋 Next Steps</h3>
            <ol style="color: #666; line-height: 1.8; padding-left: 20px;">
              <li><strong>Choose your sign-in method</strong> (Password or Google)</li>
              <li><strong>Change your password</strong> if using email/password login</li>
              <li><strong>Complete your profile</strong> with photos and details</li>
              <li><strong>Upload verification documents</strong> (Business Registration, ID, Utility Bill)</li>
              <li><strong>Start connecting with customers!</strong></li>
            </ol>
          </div>

          <!-- Important Notice -->
          <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin-bottom: 25px;">
            <p style="color: #e65100; margin: 0; font-size: 14px; line-height: 1.6;">
              <strong>📄 Document Verification Required:</strong> To complete your verification and appear in customer searches, 
              please upload your Business Registration Certificate, ID Document, and Utility Bill through your dashboard.
            </p>
          </div>

          <!-- Account Info -->
          <div style="text-align: center; padding: 15px; background: #f5f5f5; border-radius: 8px; margin-bottom: 25px;">
            <p style="color: #666; margin: 0; font-size: 13px; line-height: 1.5;">
              <strong>Email Resent By:</strong> ${req.admin.firstName} ${req.admin.lastName}<br>
              <strong>Setup Link Valid:</strong> 7 days<br>
              <strong>Account Status:</strong> ${merchant.verified ? '✅ Verified' : '⏳ Pending Document Upload'}
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 12px; line-height: 1.5; margin: 0;">
              <strong>Nairobi CBD Business Directory</strong><br>
              Connecting Businesses with Customers<br>
              Need help? Contact our support team
            </p>
          </div>
        </div>
      `
    };

    // Try to send email but don't fail if it times out
    let emailSent = false;
    try {
      await sendEmail(emailContent);
      console.log(`✅ Welcome email resent to ${merchant.email}`);
      emailSent = true;
    } catch (emailError) {
      console.error(`⚠️ Email failed but password was updated:`, emailError.message);
      // Continue anyway - password is already updated
    }

    res.status(200).json({
      success: true,
      message: emailSent 
        ? 'Welcome email resent successfully with new credentials'
        : 'Password updated successfully. Email delivery failed - please contact merchant directly.',
      emailSent,
      data: {
        email: merchant.email,
        businessName: merchant.businessName,
        setupTokenExpires: merchant.accountSetupExpires
      }
    });

  } catch (error) {
    console.error('❌ resendWelcomeEmail error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resend welcome email',
      details: error.message
    });
  }
};
