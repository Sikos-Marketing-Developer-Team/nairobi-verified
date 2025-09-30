const Merchant = require('../models/Merchant');
const Review = require('../models/Review');
const MerchantOnboardingService = require('../services/merchantOnboarding');
const { emailService, sendEmail } = require('../utils/emailService');
const { HTTP_STATUS } = require('../config/constants');
const crypto = require('crypto');
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

    query = Merchant.find(JSON.parse(queryStr)).lean();

    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-password');
    }

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Merchant.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    if (req.query.search) {
      query = query.where(
        '$or',
        [
          { businessName: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } },
          { businessType: { $regex: req.query.search, $options: 'i' } }
        ]
      );
    }

    if (req.query.category && req.query.category !== 'All') {
      query = query.where('businessType', req.query.category);
    }

    if (req.query.documentStatus) {
      switch (req.query.documentStatus) {
        case 'complete':
          query = query.where({
            $and: [
              { 'documents.businessRegistration.path': { $exists: true, $ne: '' } },
              { 'documents.idDocument.path': { $exists: true, $ne: '' } },
              { 'documents.utilityBill.path': { $exists: true, $ne: '' } }
            ]
          });
          break;
        case 'incomplete':
          query = query.where({
            $or: [
              { 'documents.businessRegistration.path': { $exists: false } },
              { 'documents.businessRegistration.path': '' },
              { 'documents.idDocument.path': { $exists: false } },
              { 'documents.idDocument.path': '' },
              { 'documents.utilityBill.path': { $exists: false } },
              { 'documents.utilityBill.path': '' }
            ]
          });
          break;
        case 'pending_review':
          query = query.where({
            $and: [
              { 'documents.businessRegistration.path': { $exists: true, $ne: '' } },
              { 'documents.idDocument.path': { $exists: true, $ne: '' } },
              { 'documents.utilityBill.path': { $exists: true, $ne: '' } },
              { verified: false }
            ]
          });
          break;
      }
    }

    const merchants = await query;

    const pagination = {};
    if (endIndex < total) pagination.next = { page: page + 1, limit };
    if (startIndex > 0) pagination.prev = { page: page - 1, limit };

    res.status(200).json({
      success: true,
      count: merchants.length,
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

    // Try sending admin notification (non-blocking)
    try {
      if (emailService && typeof emailService.sendAdminMerchantNotification === 'function') {
        await emailService.sendAdminMerchantNotification(merchant);
      }
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
    }

    res.status(201).json({
      success: true,
      data: {
        id: merchant._id,
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
    const requesterId = getUserIdFromReq(req);
    if (!requesterId || String(req.params.id) !== requesterId) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, error: 'Not authorized to update this merchant' });
    }

    const updateFields = {};
    // pick allowed fields from req.body to avoid overwriting sensitive fields
    const allowed = ['businessName','email','phone','businessType','description','yearEstablished','website','address','location','landmark','businessHours','logo','bannerImage'];
    allowed.forEach(key => {
      if (req.body[key] !== undefined) updateFields[key] = req.body[key];
    });

    const merchant = await Merchant.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true }).lean();

    if (!merchant) {
      return res.status(404).json({ success: false, error: 'Merchant not found' });
    }

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

    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error('updateMerchant error:', error);
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

// @desc    Upload merchant verification documents (ENHANCED)
// @route   PUT /api/merchants/:id/documents
// @access  Private/Merchant
exports.uploadDocuments = async (req, res) => {
  try {
    const requesterId = getUserIdFromReq(req);
    if (!requesterId || String(req.params.id) !== requesterId) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, error: 'Not authorized to update this merchant' });
    }

    if (!req.files) {
      return res.status(400).json({ success: false, error: 'Please upload required documents' });
    }

    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) return res.status(404).json({ success: false, error: 'Merchant not found' });

    const documents = merchant.documents || { additionalDocs: [] };
    const updatedDocuments = [];

    if (req.files.businessRegistration) {
      documents.businessRegistration = {
        path: `/uploads/documents/${req.files.businessRegistration[0].filename}`,
        uploadedAt: Date.now()
      };
      updatedDocuments.push('Business Registration');
    }

    if (req.files.idDocument) {
      documents.idDocument = {
        path: `/uploads/documents/${req.files.idDocument[0].filename}`,
        uploadedAt: Date.now()
      };
      updatedDocuments.push('ID Document');
    }

    if (req.files.utilityBill) {
      documents.utilityBill = {
        path: `/uploads/documents/${req.files.utilityBill[0].filename}`,
        uploadedAt: Date.now()
      };
      updatedDocuments.push('Utility Bill');
    }

    if (req.files.additionalDocs) {
      const additional = req.files.additionalDocs.map(file => `/uploads/documents/${file.filename}`);
      documents.additionalDocs = [...(documents.additionalDocs || []), ...additional];
      updatedDocuments.push('Additional Documents');
    }

    documents.documentsSubmittedAt = Date.now();
    documents.documentReviewStatus = 'pending';
    merchant.documents = documents;

    // Update onboarding status if required docs now exist
    const hasRequiredDocs = documents.businessRegistration?.path && documents.idDocument?.path && documents.utilityBill?.path;
    if (hasRequiredDocs && merchant.onboardingStatus === 'credentials_sent') {
      merchant.onboardingStatus = 'documents_submitted';
    }

    await merchant.save();

    const documentAnalysis = {
      businessRegistration: !!documents.businessRegistration?.path,
      idDocument: !!documents.idDocument?.path,
      utilityBill: !!documents.utilityBill?.path,
      additionalDocs: !!(documents.additionalDocs?.length > 0)
    };

    const requiredDocsCount = [
      documentAnalysis.businessRegistration,
      documentAnalysis.idDocument,
      documentAnalysis.utilityBill
    ].filter(Boolean).length;

    const responseData = {
      ...merchant.toObject(),
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
    console.error('uploadDocuments error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create merchant by admin (ENHANCED)
exports.createMerchantByAdmin = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied. Admin privileges required.' });
    }

    const result = await MerchantOnboardingService.createMerchantByAdmin(req.body, req.user);

    res.status(201).json({
      success: true,
      data: result.merchant,
      credentials: result.credentials,
      message: result.message,
      documentStatus: {
        required: true,
        submitted: false,
        completionPercentage: 0,
        nextStep: 'Upload verification documents'
      }
    });
  } catch (error) {
    console.error('createMerchantByAdmin error:', error);
    res.status(400).json({ success: false, error: error.message });
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
