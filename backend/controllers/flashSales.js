const FlashSale = require('../models/FlashSale');
const { validationResult } = require('express-validator');
const { HTTP_STATUS, TIME } = require('../config/constants');

// Error handling utility
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: message });
};

// Calculate time remaining for a flash sale
const calculateTimeRemaining = (endDate, startDate) => {
  const now = new Date();
  const timeDiff = new Date(endDate).getTime() - now.getTime();
  if (timeDiff <= 0) return { expired: true };
  return {
    days: Math.floor(timeDiff / TIME.DAY),
    hours: Math.floor((timeDiff % TIME.DAY) / TIME.HOUR),
    minutes: Math.floor((timeDiff % TIME.HOUR) / TIME.MINUTE),
    seconds: Math.floor((timeDiff % TIME.MINUTE) / TIME.SECOND),
    expired: false,
  };
};

// @desc    Get all active flash sales
// @route   GET /api/flash-sales
// @access  Public
const getActiveFlashSales = async (req, res) => {
  try {
    const flashSales = await FlashSale.find({
      isActive: true,
      endDate: { $gt: new Date() },
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const enhancedFlashSales = flashSales.map((sale) => {
      const timeRemaining = calculateTimeRemaining(sale.endDate, sale.startDate);
      return {
        ...sale,
        timeRemaining,
        isCurrentlyActive: !timeRemaining.expired && new Date(sale.startDate) <= new Date(),
      };
    });

    res.json({
      success: true,
      count: enhancedFlashSales.length,
      data: enhancedFlashSales,
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch active flash sales');
  }
};

// @desc    Get single flash sale
// @route   GET /api/flash-sales/:id
// @access  Public
const getFlashSale = async (req, res) => {
  try {
    const flashSale = await FlashSale.findById(req.params.id)
      .populate('createdBy', 'name email')
      .lean();

    if (!flashSale) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Flash sale not found',
      });
    }

    const timeRemaining = calculateTimeRemaining(flashSale.endDate, flashSale.startDate);

    await FlashSale.findByIdAndUpdate(req.params.id, { $inc: { totalViews: 1 } });

    const enhancedFlashSale = {
      ...flashSale,
      timeRemaining,
      isCurrentlyActive: !timeRemaining.expired && new Date(flashSale.startDate) <= new Date(),
    };

    res.json({
      success: true,
      data: enhancedFlashSale,
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch flash sale');
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
      .limit(limit)
      .lean();

    const total = await FlashSale.countDocuments();

    const enhancedFlashSales = flashSales.map((sale) => {
      const now = new Date();
      const startDate = new Date(sale.startDate);
      const endDate = new Date(sale.endDate);
      const timeRemaining = calculateTimeRemaining(endDate, startDate);
      let status = 'Scheduled';
      if (now >= startDate && now <= endDate) status = 'Active';
      else if (now > endDate) status = 'Expired';

      return {
        ...sale,
        status,
        timeRemaining,
        isCurrentlyActive: status === 'Active',
      };
    });

    res.json({
      success: true,
      count: enhancedFlashSales.length,
      total,
      data: enhancedFlashSales,
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch all flash sales');
  }
};

// @desc    Get flash sales analytics (Admin)
// @route   GET /api/flash-sales/admin/analytics
// @access  Private/Admin
const getFlashSalesAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * TIME.DAY);

    const [stats, activeSales, recentSales, topPerformingSales] = await Promise.all([
      FlashSale.aggregate([
        {
          $facet: {
            totalSales: [{ $group: { _id: null, total: { $sum: '$totalSales' } } }],
            totalViews: [{ $group: { _id: null, total: { $sum: '$totalViews' } } }],
          },
        },
      ]),
      FlashSale.countDocuments({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gt: now },
      }),
      FlashSale.countDocuments({
        createdAt: { $gte: weekAgo },
      }),
      FlashSale.find().sort({ totalSales: -1 }).limit(5).select('title totalSales totalViews').lean(),
    ]);

    res.json({
      success: true,
      data: {
        totalSales: stats[0]?.totalSales[0]?.total || 0,
        totalViews: stats[0]?.totalViews[0]?.total || 0,
        activeSales,
        recentSales,
        topPerformingSales,
      },
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch flash sales analytics');
  }
};

// @desc    Create flash sale
// @route   POST /api/flash-sales
// @access  Private/Admin
const createFlashSale = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { title, description, startDate, endDate, products } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start >= end) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'End date must be after start date',
      });
    }

    if (end <= now) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'End date must be in the future',
      });
    }

    const productsWithDiscounts = products.map((product) => ({
      ...product,
      discountPercentage: Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100),
    }));

    const flashSale = await FlashSale.create({
      title,
      description,
      startDate: start,
      endDate: end,
      products: productsWithDiscounts,
      createdBy: req.user._id,
      isActive: true,
    });

    await flashSale.populate('createdBy', 'name email');

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: flashSale,
    });
  } catch (error) {
    handleError(res, error, 'Failed to create flash sale');
  }
};

// @desc    Update flash sale
// @route   PUT /api/flash-sales/:id
// @access  Private/Admin
const updateFlashSale = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    let flashSale = await FlashSale.findById(req.params.id);

    if (!flashSale) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Flash sale not found',
      });
    }

    const { title, description, startDate, endDate, products, isActive } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'End date must be after start date',
      });
    }

    const productsWithDiscounts = products.map((product) => ({
      ...product,
      discountPercentage: Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100),
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
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .lean();

    res.json({
      success: true,
      data: flashSale,
    });
  } catch (error) {
    handleError(res, error, 'Failed to update flash sale');
  }
};

// @desc    Delete flash sale
// @route   DELETE /api/flash-sales/:id
// @access  Private/Admin
const deleteFlashSale = async (req, res) => {
  try {
    const flashSale = await FlashSale.findById(req.params.id);

    if (!flashSale) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Flash sale not found',
      });
    }

    await FlashSale.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Flash sale deleted successfully',
    });
  } catch (error) {
    handleError(res, error, 'Failed to delete flash sale');
  }
};

module.exports = {
  getActiveFlashSales,
  getFlashSale,
  getAllFlashSales,
  getFlashSalesAnalytics,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale,
};