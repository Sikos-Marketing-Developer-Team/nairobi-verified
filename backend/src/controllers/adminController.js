const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const VendorSubscription = require('../models/VendorSubscription');
const PaymentTransaction = require('../models/PaymentTransaction');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const userCount = await User.countDocuments();
    const merchantCount = await User.countDocuments({ role: 'merchant' });
    const clientCount = await User.countDocuments({ role: 'client' });
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    
    // Get pending verification merchants
    const pendingVerificationCount = await User.countDocuments({ 
      role: 'merchant',
      isVerified: false
    });
    
    // Get active subscriptions
    const activeSubscriptionsCount = await VendorSubscription.countDocuments({
      status: 'active'
    });
    
    // Get recent transactions
    const recentTransactions = await PaymentTransaction.find()
      .sort('-createdAt')
      .limit(5)
      .populate('user', 'fullName email companyName');
    
    // Get revenue stats
    const totalRevenue = await PaymentTransaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get monthly revenue for the current year
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await PaymentTransaction.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { 
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        } 
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Format monthly revenue
    const monthlyRevenueData = Array(12).fill(0);
    monthlyRevenue.forEach(item => {
      monthlyRevenueData[item._id - 1] = item.revenue;
    });
    
    res.status(200).json({
      success: true,
      stats: {
        userCount,
        merchantCount,
        clientCount,
        productCount,
        orderCount,
        pendingVerificationCount,
        activeSubscriptionsCount,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        monthlyRevenue: monthlyRevenueData,
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// Get pending merchant verifications
const getPendingVerifications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const pendingMerchants = await User.find({
      role: 'merchant',
      isVerified: false
    })
    .select('fullName email companyName location documents createdAt')
    .sort('-createdAt')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));
    
    const total = await User.countDocuments({
      role: 'merchant',
      isVerified: false
    });
    
    res.status(200).json({
      success: true,
      count: pendingMerchants.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      merchants: pendingMerchants
    });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending verifications',
      error: error.message
    });
  }
};

// Approve or reject merchant verification
const processMerchantVerification = async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { action, notes } = req.body;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be either "approve" or "reject"'
      });
    }
    
    const merchant = await User.findById(merchantId);
    
    if (!merchant || merchant.role !== 'merchant') {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found'
      });
    }
    
    if (action === 'approve') {
      merchant.isVerified = true;
      await merchant.save();
      
      // Send approval email to merchant
      try {
        const emailService = require('../utils/emailService');
        await emailService.sendMerchantVerificationEmail(
          merchant.email,
          merchant.companyName || merchant.fullName,
          'approved'
        );
      } catch (emailError) {
        console.error('Failed to send merchant approval email:', emailError);
        // Continue with the response even if email fails
      }
      
      // Emit socket event for real-time notification
      const io = req.app.get('io');
      if (io) {
        io.emit('merchantVerified', {
          id: merchant._id,
          companyName: merchant.companyName || merchant.fullName,
          email: merchant.email
        });
        console.log('Emitted merchantVerified event for:', merchant.companyName || merchant.fullName);
      }
      
      res.status(200).json({
        success: true,
        message: 'Merchant verification approved successfully',
        merchant: {
          id: merchant._id,
          fullName: merchant.fullName,
          email: merchant.email,
          companyName: merchant.companyName
        }
      });
    } else {
      // Store rejection reason but don't delete the account
      merchant.verificationNotes = notes || 'Verification rejected by admin';
      await merchant.save();
      
      // Send rejection email to merchant
      try {
        const emailService = require('../utils/emailService');
        await emailService.sendMerchantVerificationEmail(
          merchant.email,
          merchant.companyName || merchant.fullName,
          'rejected',
          notes || 'Your verification was rejected. Please update your information and try again.'
        );
      } catch (emailError) {
        console.error('Failed to send merchant rejection email:', emailError);
        // Continue with the response even if email fails
      }
      
      // Emit socket event for real-time notification
      const io = req.app.get('io');
      if (io) {
        io.emit('merchantRejected', {
          id: merchant._id,
          companyName: merchant.companyName || merchant.fullName,
          email: merchant.email,
          reason: notes || 'Verification rejected by admin'
        });
        console.log('Emitted merchantRejected event for:', merchant.companyName || merchant.fullName);
      }
      
      res.status(200).json({
        success: true,
        message: 'Merchant verification rejected',
        merchant: {
          id: merchant._id,
          fullName: merchant.fullName,
          email: merchant.email,
          companyName: merchant.companyName
        }
      });
    }
  } catch (error) {
    console.error('Process merchant verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing merchant verification',
      error: error.message
    });
  }
};

// Get all users with filtering
const getUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      role, 
      search,
      sort = '-createdAt'
    } = req.query;
    
    // Build query
    const query = {};
    if (role) query.role = role;
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination
    const users = await User.find(query)
      .select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires')
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    // Get total count
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Update user role or status
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, isActive, isVerified } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update fields if provided
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (isVerified !== undefined) user.isVerified = isVerified;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Get all transactions with filtering
const getTransactions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      type,
      user: userId,
      startDate,
      endDate,
      sort = '-createdAt'
    } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (userId) query.user = userId;
    
    // Date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Execute query with pagination
    const transactions = await PaymentTransaction.find(query)
      .populate('user', 'fullName email companyName')
      .populate('relatedSubscription')
      .populate('relatedOrder')
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    // Get total count
    const total = await PaymentTransaction.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getPendingVerifications,
  processMerchantVerification,
  getUsers,
  updateUser,
  getTransactions
};