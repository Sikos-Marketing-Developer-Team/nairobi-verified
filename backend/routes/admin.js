const express = require('express');
const User = require('../models/User');
const Merchant = require('../models/Merchant');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalMerchants,
      verifiedMerchants,
      pendingVerifications,
      totalProducts,
      activeProducts,
      recentUsers,
      recentMerchants
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Merchant.countDocuments(),
      Merchant.countDocuments({ verified: true }),
      Merchant.countDocuments({ verified: false }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ 
        role: { $ne: 'admin' },
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      Merchant.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    // Calculate growth percentages (mock data for now)
    const previousUsers = Math.floor(totalUsers * 0.85);
    const previousMerchants = Math.floor(totalMerchants * 0.9);

    const stats = {
      totalUsers,
      totalMerchants,
      verifiedMerchants,
      pendingVerifications,
      totalProducts,
      activeFlashSales: 0, // TODO: Add flash sales count
      totalOrders: 0, // TODO: Add orders count
      todayOrders: 0, // TODO: Add today's orders count
      totalRevenue: 0, // TODO: Add revenue calculation
      monthlyRevenue: 0, // TODO: Add monthly revenue
      userGrowth: {
        current: recentUsers,
        previous: previousUsers,
        percentage: previousUsers > 0 ? ((recentUsers - previousUsers) / previousUsers * 100) : 0
      },
      merchantGrowth: {
        current: recentMerchants,
        previous: previousMerchants,
        percentage: previousMerchants > 0 ? ((recentMerchants - previousMerchants) / previousMerchants * 100) : 0
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// @desc    Get users for admin
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { role: { $ne: 'admin' } };
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// @desc    Get merchants for admin
// @route   GET /api/admin/merchants
// @access  Private (Admin)
const getMerchants = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      verified = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { businessType: { $regex: search, $options: 'i' } }
      ];
    }

    if (verified !== '') {
      filter.verified = verified === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const merchants = await Merchant.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');

    const total = await Merchant.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: merchants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get merchants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch merchants'
    });
  }
};

// @desc    Get pending verifications
// @route   GET /api/admin/verifications/pending
// @access  Private (Admin)
const getPendingVerifications = async (req, res) => {
  try {
    const pendingMerchants = await Merchant.find({ 
      verified: false,
      documents: { $exists: true }
    })
    .sort({ createdAt: -1 })
    .limit(20);

    const verifications = pendingMerchants.map(merchant => ({
      id: merchant._id,
      merchant: {
        id: merchant._id,
        businessName: merchant.businessName,
        email: merchant.email,
        businessType: merchant.businessType,
        verified: merchant.verified
      },
      status: 'pending',
      submittedAt: merchant.createdAt,
      documents: merchant.documents || {}
    }));

    res.status(200).json({
      success: true,
      data: verifications
    });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending verifications'
    });
  }
};

// Routes
router.get('/dashboard/stats', protect, authorize('admin'), getDashboardStats);
router.get('/users', protect, authorize('admin'), getUsers);
router.get('/merchants', protect, authorize('admin'), getMerchants);
router.get('/verifications/pending', protect, authorize('admin'), getPendingVerifications);

module.exports = router;
