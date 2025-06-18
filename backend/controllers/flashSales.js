const FlashSale = require('../models/FlashSale');
const { validationResult } = require('express-validator');

// @desc    Get all active flash sales
// @route   GET /api/flash-sales
// @access  Public
const getActiveFlashSales = async (req, res) => {
  try {
    const flashSales = await FlashSale.find({ 
      isActive: true,
      endDate: { $gt: new Date() }
    })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

    // Calculate time remaining for each flash sale
    const flashSalesWithTimeRemaining = flashSales.map(sale => {
      const now = new Date();
      const endDate = new Date(sale.endDate);
      const timeDiff = endDate.getTime() - now.getTime();
      
      let timeRemaining = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: timeDiff <= 0
      };

      if (timeDiff > 0) {
        timeRemaining.days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        timeRemaining.hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        timeRemaining.minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        timeRemaining.seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      }

      return {
        ...sale.toObject(),
        timeRemaining,
        isCurrentlyActive: !timeRemaining.expired && new Date(sale.startDate) <= now
      };
    });

    res.json({
      success: true,
      count: flashSalesWithTimeRemaining.length,
      data: flashSalesWithTimeRemaining
    });
  } catch (error) {
    console.error('Get active flash sales error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single flash sale
// @route   GET /api/flash-sales/:id
// @access  Public
const getFlashSale = async (req, res) => {
  try {
    const flashSale = await FlashSale.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!flashSale) {
      return res.status(404).json({
        success: false,
        error: 'Flash sale not found'
      });
    }

    // Calculate time remaining
    const now = new Date();
    const endDate = new Date(flashSale.endDate);
    const timeDiff = endDate.getTime() - now.getTime();
    
    let timeRemaining = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      expired: timeDiff <= 0
    };

    if (timeDiff > 0) {
      timeRemaining.days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      timeRemaining.hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      timeRemaining.minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      timeRemaining.seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    }

    // Increment view count
    flashSale.totalViews += 1;
    await flashSale.save();

    const flashSaleWithTimeRemaining = {
      ...flashSale.toObject(),
      timeRemaining,
      isCurrentlyActive: !timeRemaining.expired && new Date(flashSale.startDate) <= now
    };

    res.json({
      success: true,
      data: flashSaleWithTimeRemaining
    });
  } catch (error) {
    console.error('Get flash sale error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get all flash sales (Admin)
// @route   GET /api/flash-sales/admin/all
// @access  Private/Admin
const getAllFlashSales = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const flashSales = await FlashSale.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await FlashSale.countDocuments();

    // Add status and time remaining to each flash sale
    const flashSalesWithStatus = flashSales.map(sale => {
      const now = new Date();
      const startDate = new Date(sale.startDate);
      const endDate = new Date(sale.endDate);
      
      let status = 'Scheduled';
      if (now >= startDate && now <= endDate) {
        status = 'Active';
      } else if (now > endDate) {
        status = 'Expired';
      }

      const timeDiff = endDate.getTime() - now.getTime();
      let timeRemaining = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: timeDiff <= 0
      };

      if (timeDiff > 0) {
        timeRemaining.days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        timeRemaining.hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        timeRemaining.minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        timeRemaining.seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      }

      return {
        ...sale.toObject(),
        status,
        timeRemaining,
        isCurrentlyActive: status === 'Active'
      };
    });

    res.json({
      success: true,
      count: flashSalesWithStatus.length,
      total,
      data: flashSalesWithStatus
    });
  } catch (error) {
    console.error('Get all flash sales error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get flash sales analytics (Admin)
// @route   GET /api/flash-sales/admin/analytics
// @access  Private/Admin
const getFlashSalesAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get total stats
    const totalSales = await FlashSale.aggregate([
      { $group: { _id: null, total: { $sum: '$totalSales' } } }
    ]);

    const totalViews = await FlashSale.aggregate([
      { $group: { _id: null, total: { $sum: '$totalViews' } } }
    ]);

    const activeSales = await FlashSale.countDocuments({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gt: now }
    });

    const recentSales = await FlashSale.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    // Get top performing sales
    const topPerformingSales = await FlashSale.find()
      .sort({ totalSales: -1 })
      .limit(5)
      .select('title totalSales totalViews');

    res.json({
      success: true,
      data: {
        totalSales: totalSales[0]?.total || 0,
        totalViews: totalViews[0]?.total || 0,
        activeSales,
        recentSales,
        topPerformingSales
      }
    });
  } catch (error) {
    console.error('Get flash sales analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create flash sale
// @route   POST /api/flash-sales
// @access  Private/Admin
const createFlashSale = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { title, description, startDate, endDate, products } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start >= end) {
      return res.status(400).json({
        success: false,
        error: 'End date must be after start date'
      });
    }

    if (end <= now) {
      return res.status(400).json({
        success: false,
        error: 'End date must be in the future'
      });
    }

    // Calculate discount percentages for products
    const productsWithDiscounts = products.map(product => ({
      ...product,
      discountPercentage: Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)
    }));

    const flashSale = await FlashSale.create({
      title,
      description,
      startDate: start,
      endDate: end,
      products: productsWithDiscounts,
      createdBy: req.user._id,
      isActive: true
    });

    await flashSale.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: flashSale
    });
  } catch (error) {
    console.error('Create flash sale error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update flash sale
// @route   PUT /api/flash-sales/:id
// @access  Private/Admin
const updateFlashSale = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    let flashSale = await FlashSale.findById(req.params.id);

    if (!flashSale) {
      return res.status(404).json({
        success: false,
        error: 'Flash sale not found'
      });
    }

    const { title, description, startDate, endDate, products, isActive } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        error: 'End date must be after start date'
      });
    }

    // Calculate discount percentages for products
    const productsWithDiscounts = products.map(product => ({
      ...product,
      discountPercentage: Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)
    }));

    flashSale = await FlashSale.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        startDate: start,
        endDate: end,
        products: productsWithDiscounts,
        isActive,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      data: flashSale
    });
  } catch (error) {
    console.error('Update flash sale error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete flash sale
// @route   DELETE /api/flash-sales/:id
// @access  Private/Admin
const deleteFlashSale = async (req, res) => {
  try {
    const flashSale = await FlashSale.findById(req.params.id);

    if (!flashSale) {
      return res.status(404).json({
        success: false,
        error: 'Flash sale not found'
      });
    }

    await FlashSale.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Flash sale deleted successfully'
    });
  } catch (error) {
    console.error('Delete flash sale error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  getActiveFlashSales,
  getFlashSale,
  getAllFlashSales,
  getFlashSalesAnalytics,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale
};