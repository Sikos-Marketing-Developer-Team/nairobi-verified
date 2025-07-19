const Merchant = require('../models/Merchant');
const Review = require('../models/Review');
const MerchantOnboardingService = require('../services/merchantOnboarding');

// @desc    Get all merchants
// @route   GET /api/merchants
// @access  Public
exports.getMerchants = async (req, res) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit', 'search', 'category'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  query = Merchant.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
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
  const total = await Merchant.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Search
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

  // Category Filter
  if (req.query.category && req.query.category !== 'All') {
    query = query.where('businessType', req.query.category);
  }

  const merchants = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: merchants.length,
    pagination,
    data: merchants
  });
};

// @desc    Get single merchant
// @route   GET /api/merchants/:id
// @access  Public
exports.getMerchant = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id);

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: `Merchant not found with id of ${req.params.id}`
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

// @desc    Update merchant
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

    const merchant = await Merchant.findByIdAndUpdate(
      req.params.id,
      {
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
      },
      { new: true, runValidators: true }
    );

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

// @desc    Delete merchant
// @route   DELETE /api/merchants/:id
// @access  Private/Admin
exports.deleteMerchant = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id);

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Delete all reviews associated with the merchant
    await Review.deleteMany({ merchant: req.params.id });

    // Delete the merchant
    await merchant.remove();

    res.status(200).json({
      success: true,
      data: {}
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

    const merchant = await Merchant.findByIdAndUpdate(
      req.params.id,
      { logo: `/uploads/images/${req.file.filename}` },
      { new: true }
    );

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

    const merchant = await Merchant.findByIdAndUpdate(
      req.params.id,
      { bannerImage: `/uploads/images/${req.file.filename}` },
      { new: true }
    );

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

    const merchant = await Merchant.findById(req.params.id);

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Add new gallery images
    const galleryImages = req.files.map(file => `/uploads/images/${file.filename}`);
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

// @desc    Upload merchant verification documents
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

    const merchant = await Merchant.findById(req.params.id);

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Update document paths
    const documents = {};
    
    if (req.files.businessRegistration) {
      documents.businessRegistration = `/uploads/documents/${req.files.businessRegistration[0].filename}`;
    }
    
    if (req.files.idDocument) {
      documents.idDocument = `/uploads/documents/${req.files.idDocument[0].filename}`;
    }
    
    if (req.files.utilityBill) {
      documents.utilityBill = `/uploads/documents/${req.files.utilityBill[0].filename}`;
    }
    
    if (req.files.additionalDocs) {
      documents.additionalDocs = req.files.additionalDocs.map(
        file => `/uploads/documents/${file.filename}`
      );
    }

    // Update merchant documents
    merchant.documents = { ...merchant.documents, ...documents };
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

// @desc    Create merchant by admin
// @route   POST /api/merchants/admin/create
// @access  Private/Admin
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
      message: result.message
    });

  } catch (error) {
    console.error('Admin merchant creation error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Complete merchant account setup
// @route   POST /api/merchants/setup/:token
// @access  Public
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

    res.status(200).json(result);

  } catch (error) {
    console.error('Account setup error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get merchant setup info by token
// @route   GET /api/merchants/setup/:token
// @access  Public
exports.getSetupInfo = async (req, res) => {
  try {
    const { token } = req.params;
    const crypto = require('crypto');
    
    // Hash the token to compare with stored hash
    const setupTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find merchant with valid setup token
    const merchant = await Merchant.findOne({
      accountSetupToken: setupTokenHash,
      accountSetupExpire: { $gt: Date.now() }
    });

    if (!merchant) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired setup token'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        businessName: merchant.businessName,
        email: merchant.email,
        phone: merchant.phone,
        businessType: merchant.businessType,
        address: merchant.address,
        setupExpire: merchant.accountSetupExpire
      }
    });

  } catch (error) {
    console.error('Setup info error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Verify merchant
// @route   PUT /api/merchants/:id/verify
// @access  Private/Admin
exports.verifyMerchant = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id);

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    merchant.verified = true;
    merchant.verifiedDate = Date.now();
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

// @desc    Send login credentials to merchant email
// @route   POST /api/merchants/send-credentials
// @access  Private (Merchant only)
exports.sendCredentials = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.user.id);

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
    
    const merchant = await Merchant.findById(req.params.id);

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