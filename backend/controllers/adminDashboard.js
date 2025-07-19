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

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalMerchants = await Merchant.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalReviews = await Review.countDocuments();
  const verifiedMerchants = await Merchant.countDocuments({ verified: true });
  const pendingMerchants = await Merchant.countDocuments({ verified: false });
  const activeFlashSales = await FlashSale.countDocuments({ 
    isActive: true, 
    endDate: { $gt: new Date() } 
  });

  // Get recent activity
  const recentMerchants = await Merchant.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('businessName email verified createdAt');

  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name email createdAt');

  const recentReviews = await Review.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name')
    .populate('merchant', 'businessName');

  // Monthly growth statistics
  const currentMonth = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(currentMonth.getMonth() - 1);

  const merchantsThisMonth = await Merchant.countDocuments({
    createdAt: { $gte: lastMonth }
  });

  const usersThisMonth = await User.countDocuments({
    createdAt: { $gte: lastMonth }
  });

  const reviewsThisMonth = await Review.countDocuments({
    createdAt: { $gte: lastMonth }
  });

  res.status(200).json({
    success: true,
    stats: {
      totalMerchants,
      totalUsers,
      totalProducts,
      totalReviews,
      verifiedMerchants,
      pendingMerchants,
      activeFlashSales,
      growth: {
        merchantsThisMonth,
        usersThisMonth,
        reviewsThisMonth
      }
    },
    recentActivity: {
      recentMerchants,
      recentUsers,
      recentReviews
    }
  });
});

// @desc    Get all merchants with pagination and filtering
// @route   GET /api/admin/dashboard/merchants
// @access  Private (Admin)
const getMerchants = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, verified, businessType, search } = req.query;

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

  const merchants = await Merchant.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-password');

  const total = await Merchant.countDocuments(query);

  res.status(200).json({
    success: true,
    merchants,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Create new merchant manually
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
    yearEstablished
  } = req.body;

  // Generate temporary password
  const tempPassword = crypto.randomBytes(8).toString('hex');

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
    <p>Please log in and change your password immediately.</p>
    <p>Login here: ${process.env.FRONTEND_URL}/merchant/login</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Your Nairobi Verified Merchant Account',
      html: emailContent
    });

    // Log admin activity
    await AdminUser.findByIdAndUpdate(req.admin.id, {
      $push: {
        activityLog: {
          action: 'merchant_created',
          details: `Created merchant account for ${businessName}`,
          timestamp: new Date()
        }
      }
    });

    res.status(201).json({
      success: true,
      merchant: {
        id: merchant._id,
        businessName: merchant.businessName,
        email: merchant.email,
        phone: merchant.phone,
        businessType: merchant.businessType,
        verified: merchant.verified,
        createdAt: merchant.createdAt
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
        createdAt: merchant.createdAt
      },
      message: 'Merchant created successfully but email sending failed'
    });
  }
});

// @desc    Update merchant status
// @route   PUT /api/admin/dashboard/merchants/:id/status
// @access  Private (Admin)
const updateMerchantStatus = asyncHandler(async (req, res) => {
  const { verified } = req.body;

  const merchant = await Merchant.findByIdAndUpdate(
    req.params.id,
    { 
      verified,
      verifiedDate: verified ? new Date() : null
    },
    { new: true }
  );

  if (!merchant) {
    return res.status(404).json({
      success: false,
      message: 'Merchant not found'
    });
  }

  // Log admin activity
  await AdminUser.findByIdAndUpdate(req.admin.id, {
    $push: {
      activityLog: {
        action: 'merchant_status_updated',
        details: `${verified ? 'Verified' : 'Unverified'} merchant ${merchant.businessName}`,
        timestamp: new Date()
      }
    }
  });

  res.status(200).json({
    success: true,
    merchant
  });
});

// @desc    Get all users with pagination and filtering
// @route   GET /api/admin/dashboard/users
// @access  Private (Admin)
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  const query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-password');

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
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

  // Log admin activity
  await AdminUser.findByIdAndUpdate(req.admin.id, {
    $push: {
      activityLog: {
        action: 'review_deleted',
        details: `Deleted review from ${review.user}`,
        timestamp: new Date()
      }
    }
  });

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// @desc    Get analytics data
// @route   GET /api/admin/dashboard/analytics
// @access  Private (Admin)
const getAnalytics = asyncHandler(async (req, res) => {
  const { period = '7d' } = req.query;

  let startDate = new Date();
  
  switch (period) {
    case '24h':
      startDate.setHours(startDate.getHours() - 24);
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }

  // Get registration trends
  const merchantRegistrations = await Merchant.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);

  const userRegistrations = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);

  // Get business type distribution
  const businessTypeDistribution = await Merchant.aggregate([
    {
      $group: {
        _id: '$businessType',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get top rated merchants
  const topRatedMerchants = await Merchant.find({ rating: { $gte: 4 } })
    .sort({ rating: -1 })
    .limit(10)
    .select('businessName rating reviews');

  res.status(200).json({
    success: true,
    analytics: {
      merchantRegistrations,
      userRegistrations,
      businessTypeDistribution,
      topRatedMerchants
    }
  });
});

module.exports = {
  getDashboardStats,
  getMerchants,
  createMerchant,
  updateMerchantStatus,
  getUsers,
  getProducts,
  getReviews,
  deleteReview,
  getAnalytics
};
