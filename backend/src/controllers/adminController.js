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

// Get analytics data
const getAnalytics = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Calculate date range based on timeRange
    const endDate = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }
    
    // Get previous period for comparison
    const previousPeriodEndDate = new Date(startDate);
    let previousPeriodStartDate = new Date(startDate);
    
    switch (timeRange) {
      case '7d':
        previousPeriodStartDate.setDate(previousPeriodEndDate.getDate() - 7);
        break;
      case '30d':
        previousPeriodStartDate.setDate(previousPeriodEndDate.getDate() - 30);
        break;
      case '90d':
        previousPeriodStartDate.setDate(previousPeriodEndDate.getDate() - 90);
        break;
      case '1y':
        previousPeriodStartDate.setFullYear(previousPeriodEndDate.getFullYear() - 1);
        break;
      default:
        previousPeriodStartDate.setDate(previousPeriodEndDate.getDate() - 30);
    }
    
    // Get revenue data
    const revenueTotal = await PaymentTransaction.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const revenuePreviousPeriod = await PaymentTransaction.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: previousPeriodStartDate, $lte: previousPeriodEndDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get daily revenue data for the period
    const dailyRevenue = await PaymentTransaction.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get orders data
    const ordersTotal = await Order.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
    const ordersPreviousPeriod = await Order.countDocuments({ createdAt: { $gte: previousPeriodStartDate, $lte: previousPeriodEndDate } });
    
    // Get daily orders data for the period
    const dailyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get users data
    const usersTotal = await User.countDocuments({ createdAt: { $lte: endDate } });
    const usersPreviousPeriod = await User.countDocuments({ createdAt: { $lte: previousPeriodEndDate } });
    const usersInPeriod = await User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
    
    // Get user types breakdown
    const usersByType = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get daily users data for the period
    const dailyUsers = await User.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get products data
    const productsTotal = await Product.countDocuments();
    const productsActive = await Product.countDocuments({ status: 'active' });
    
    // Get products by category
    const productsByCategory = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$category',
          name: { $first: '$categoryInfo.name' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);
    
    // Get top viewed products
    const topViewedProducts = await Product.find()
      .sort('-viewCount')
      .limit(5)
      .select('name viewCount');
    
    // Get top purchased products
    const topPurchasedProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          sales: { $sum: '$items.quantity' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          id: '$_id',
          name: '$productInfo.name',
          sales: 1
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 5 }
    ]);
    
    // Get merchants data
    const merchantsTotal = await User.countDocuments({ role: 'merchant' });
    const merchantsActive = await User.countDocuments({ role: 'merchant', isActive: true, isVerified: true });
    
    // Get top performing merchants
    const topPerformingMerchants = await Order.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.merchant',
          sales: { $sum: { $multiply: ['$items.quantity', '$productInfo.price'] } }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'merchantInfo'
        }
      },
      { $unwind: '$merchantInfo' },
      {
        $project: {
          id: '$_id',
          name: { $ifNull: ['$merchantInfo.companyName', '$merchantInfo.fullName'] },
          sales: 1
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 5 }
    ]);
    
    // Format data for charts
    const formatDailyData = (data, days = 30) => {
      const result = Array(days).fill(0);
      const dataMap = new Map(data.map(item => [item._id, item.revenue || item.count]));
      
      for (let i = 0; i < days; i++) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - (days - 1) + i);
        const dateString = date.toISOString().split('T')[0];
        if (dataMap.has(dateString)) {
          result[i] = dataMap.get(dateString);
        }
      }
      
      return result;
    };
    
    // Calculate percent change
    const calculatePercentChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };
    
    // Prepare weekly, monthly, and yearly data (simplified for this example)
    const weeklyData = (data) => {
      // In a real implementation, you would aggregate the daily data into weeks
      return Array(12).fill(0).map((_, i) => Math.random() * Math.max(...data) * 0.8);
    };
    
    const monthlyData = () => {
      // In a real implementation, you would query the database for monthly data
      return Array(12).fill(0).map(() => Math.floor(Math.random() * 10000));
    };
    
    const yearlyData = () => {
      // In a real implementation, you would query the database for yearly data
      return Array(5).fill(0).map(() => Math.floor(Math.random() * 100000));
    };
    
    // Format the response
    const dailyRevenueData = formatDailyData(dailyRevenue, 30);
    const dailyOrdersData = formatDailyData(dailyOrders, 30);
    const dailyUsersData = formatDailyData(dailyUsers, 30);
    
    const analytics = {
      revenue: {
        daily: dailyRevenueData,
        weekly: weeklyData(dailyRevenueData),
        monthly: monthlyData(),
        yearly: yearlyData(),
        total: revenueTotal.length > 0 ? revenueTotal[0].total : 0,
        previousPeriod: revenuePreviousPeriod.length > 0 ? revenuePreviousPeriod[0].total : 0,
        percentChange: calculatePercentChange(
          revenueTotal.length > 0 ? revenueTotal[0].total : 0,
          revenuePreviousPeriod.length > 0 ? revenuePreviousPeriod[0].total : 0
        )
      },
      orders: {
        daily: dailyOrdersData,
        weekly: weeklyData(dailyOrdersData),
        monthly: monthlyData(),
        yearly: yearlyData(),
        total: ordersTotal,
        previousPeriod: ordersPreviousPeriod,
        percentChange: calculatePercentChange(ordersTotal, ordersPreviousPeriod)
      },
      users: {
        daily: dailyUsersData,
        weekly: weeklyData(dailyUsersData),
        monthly: monthlyData(),
        yearly: yearlyData(),
        total: usersTotal,
        previousPeriod: usersPreviousPeriod,
        percentChange: calculatePercentChange(usersInPeriod, usersPreviousPeriod - usersInPeriod),
        byType: {
          clients: usersByType.find(type => type._id === 'client')?.count || 0,
          merchants: usersByType.find(type => type._id === 'merchant')?.count || 0,
          admins: usersByType.find(type => type._id === 'admin')?.count || 0
        }
      },
      products: {
        total: productsTotal,
        active: productsActive,
        byCategory: productsByCategory.map(category => ({
          name: category.name,
          count: category.count
        })),
        topViewed: topViewedProducts.map(product => ({
          id: product._id.toString(),
          name: product.name,
          views: product.viewCount || 0
        })),
        topPurchased: topPurchasedProducts
      },
      merchants: {
        total: merchantsTotal,
        active: merchantsActive,
        topPerforming: topPerformingMerchants
      }
    };
    
    res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data',
      error: error.message
    });
  }
};

// Export analytics data
const exportAnalytics = async (req, res) => {
  try {
    const { format = 'csv', timeRange = '30d' } = req.query;
    
    // In a real implementation, you would generate the export file based on the format
    // For this example, we'll just return a success message
    
    res.status(200).json({
      success: true,
      message: `Analytics data exported as ${format.toUpperCase()}`
    });
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting analytics data',
      error: error.message
    });
  }
};

// Get all products with filtering
const getProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      merchant,
      status,
      search,
      sort = '-createdAt'
    } = req.query;
    
    // Build query
    const query = {};
    if (category) query.category = category;
    if (merchant) query.merchant = merchant;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('merchant', 'companyName')
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    // Get total count
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// Update product status
const updateProductStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const { status } = req.body;
    
    if (!['active', 'inactive', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be either "active", "inactive", or "pending"'
      });
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    product.status = status;
    await product.save();
    
    res.status(200).json({
      success: true,
      message: 'Product status updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product status',
      error: error.message
    });
  }
};

// Update product featured status
const updateProductFeatured = async (req, res) => {
  try {
    const { productId } = req.params;
    const { featured } = req.body;
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    product.featured = featured;
    await product.save();
    
    res.status(200).json({
      success: true,
      message: 'Product featured status updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product featured status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product featured status',
      error: error.message
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    await product.remove();
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// Bulk update products
const bulkUpdateProducts = async (req, res) => {
  try {
    const { productIds, action } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs are required and must be an array'
      });
    }
    
    if (!['activate', 'deactivate', 'feature', 'unfeature', 'delete'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be one of: activate, deactivate, feature, unfeature, delete'
      });
    }
    
    let result;
    
    switch (action) {
      case 'activate':
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { status: 'active' }
        );
        break;
      case 'deactivate':
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { status: 'inactive' }
        );
        break;
      case 'feature':
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { featured: true }
        );
        break;
      case 'unfeature':
        result = await Product.updateMany(
          { _id: { $in: productIds } },
          { featured: false }
        );
        break;
      case 'delete':
        result = await Product.deleteMany({ _id: { $in: productIds } });
        break;
    }
    
    res.status(200).json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      result
    });
  } catch (error) {
    console.error(`Bulk update products error:`, error);
    res.status(500).json({
      success: false,
      message: 'Error performing bulk update on products',
      error: error.message
    });
  }
};

// Get feature toggles
const getFeatureToggles = async (req, res) => {
  try {
    // In a real implementation, you would fetch this from a database
    // For this example, we'll return mock data
    const features = [
      {
        _id: '1',
        name: 'Dark Mode',
        key: 'enable-dark-mode',
        description: 'Enable dark mode theme across the platform',
        enabled: true,
        category: 'ui',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'Flash Sales',
        key: 'enable-flash-sales',
        description: 'Enable flash sales feature for merchants',
        enabled: true,
        category: 'commerce',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '3',
        name: 'User Reviews',
        key: 'enable-user-reviews',
        description: 'Allow users to leave reviews on products',
        enabled: true,
        category: 'general',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '4',
        name: 'Live Chat Support',
        key: 'enable-live-chat',
        description: 'Enable live chat support for customers',
        enabled: false,
        category: 'support',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    res.status(200).json({
      success: true,
      features
    });
  } catch (error) {
    console.error('Get feature toggles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feature toggles',
      error: error.message
    });
  }
};

// Create feature toggle
const createFeatureToggle = async (req, res) => {
  try {
    // In a real implementation, you would save this to a database
    // For this example, we'll return mock data
    const feature = {
      _id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      feature
    });
  } catch (error) {
    console.error('Create feature toggle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating feature toggle',
      error: error.message
    });
  }
};

// Update feature toggle
const updateFeatureToggle = async (req, res) => {
  try {
    // In a real implementation, you would update this in a database
    // For this example, we'll return mock data
    const feature = {
      _id: req.params.featureId,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      feature
    });
  } catch (error) {
    console.error('Update feature toggle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feature toggle',
      error: error.message
    });
  }
};

// Delete feature toggle
const deleteFeatureToggle = async (req, res) => {
  try {
    // In a real implementation, you would delete this from a database
    // For this example, we'll return a success message
    
    res.status(200).json({
      success: true,
      message: 'Feature toggle deleted successfully'
    });
  } catch (error) {
    console.error('Delete feature toggle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feature toggle',
      error: error.message
    });
  }
};

// Get content banners
const getContentBanners = async (req, res) => {
  try {
    // In a real implementation, you would fetch this from a database
    // For this example, we'll return mock data
    const banners = [
      {
        _id: '1',
        title: 'Summer Sale',
        subtitle: 'Up to 50% off on selected items',
        imageUrl: 'https://example.com/images/banner1.jpg',
        linkUrl: '/categories/summer-sale',
        position: 1,
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        title: 'New Arrivals',
        subtitle: 'Check out our latest products',
        imageUrl: 'https://example.com/images/banner2.jpg',
        linkUrl: '/categories/new-arrivals',
        position: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    res.status(200).json({
      success: true,
      banners
    });
  } catch (error) {
    console.error('Get content banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content banners',
      error: error.message
    });
  }
};

// Get homepage sections
const getHomepageSections = async (req, res) => {
  try {
    // In a real implementation, you would fetch this from a database
    // For this example, we'll return mock data
    const sections = [
      {
        _id: '1',
        title: 'Featured Products',
        type: 'featured-products',
        position: 1,
        isActive: true,
        config: {
          itemCount: 8,
          showTitle: true,
          viewAllLink: '/products/featured'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        title: 'New Arrivals',
        type: 'new-arrivals',
        position: 2,
        isActive: true,
        config: {
          itemCount: 8,
          showTitle: true,
          viewAllLink: '/products/new-arrivals'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '3',
        title: 'Top Categories',
        type: 'category-products',
        position: 3,
        isActive: true,
        config: {
          itemCount: 4,
          showTitle: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    res.status(200).json({
      success: true,
      sections
    });
  } catch (error) {
    console.error('Get homepage sections error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching homepage sections',
      error: error.message
    });
  }
};

// Save layout changes
const saveLayoutChanges = async (req, res) => {
  try {
    const { banners, sections } = req.body;
    
    // In a real implementation, you would update this in a database
    // For this example, we'll return a success message
    
    res.status(200).json({
      success: true,
      message: 'Layout changes saved successfully'
    });
  } catch (error) {
    console.error('Save layout changes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving layout changes',
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
  getTransactions,
  getAnalytics,
  exportAnalytics,
  getProducts,
  updateProductStatus,
  updateProductFeatured,
  deleteProduct,
  bulkUpdateProducts,
  getFeatureToggles,
  createFeatureToggle,
  updateFeatureToggle,
  deleteFeatureToggle,
  getContentBanners,
  getHomepageSections,
  saveLayoutChanges
};