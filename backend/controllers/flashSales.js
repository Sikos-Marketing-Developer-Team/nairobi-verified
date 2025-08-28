const FlashSale = require('../models/FlashSale');
const { validationResult } = require('express-validator');
const { HTTP_STATUS, TIME } = require('../config/constants');

// Error handling utility
const handleError = (res, error, message) => {
  console.error(message, error);
  
  // Don't expose internal errors in production
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Server Error' 
    : error.message || message;
    
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
    success: false, 
    error: errorMessage 
  });
};

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return id && id.match(/^[0-9a-fA-F]{24}$/);
};

// Calculate time remaining for a flash sale
const calculateTimeRemaining = (endDate, startDate) => {
  const now = new Date();
  const timeDiff = new Date(endDate).getTime() - now.getTime();
  
  if (timeDiff <= 0) {
    return { expired: true };
  }
  
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
    const now = new Date();
    
    // Find active flash sales that are currently running or will start soon
    const flashSales = await FlashSale.find({
      isActive: true,
      endDate: { $gt: now } // Only get sales that haven't ended yet
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Enhance flash sales with time remaining and current status
    const enhancedFlashSales = flashSales.map((sale) => {
      const timeRemaining = calculateTimeRemaining(sale.endDate, sale.startDate);
      const isCurrentlyActive = !timeRemaining.expired && new Date(sale.startDate) <= now;
      
      return {
        ...sale,
        timeRemaining,
        isCurrentlyActive
      };
    }).filter(sale => !sale.timeRemaining.expired); // Remove expired sales

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
    // Validate ObjectId format
    if (!isValidObjectId(req.params.id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid flash sale ID format',
      });
    }

    const flashSale = await FlashSale.findById(req.params.id)
      .populate('createdBy', 'name email')
      .lean();

    if (!flashSale) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Flash sale not found',
      });
    }

    // Increment view count atomically to avoid race conditions
    await FlashSale.findByIdAndUpdate(
      req.params.id, 
      { $inc: { totalViews: 1 } },
      { new: false } // Don't return the updated document for performance
    );

    const timeRemaining = calculateTimeRemaining(flashSale.endDate, flashSale.startDate);
    const isCurrentlyActive = !timeRemaining.expired && 
                             new Date(flashSale.startDate) <= new Date() && 
                             flashSale.isActive;

    const enhancedFlashSale = {
      ...flashSale,
      timeRemaining,
      isCurrentlyActive,
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
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Get total count and flash sales in parallel
    const [flashSales, total] = await Promise.all([
      FlashSale.find()
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FlashSale.countDocuments()
    ]);

    // Enhance flash sales with status information
    const enhancedFlashSales = flashSales.map((sale) => {
      const now = new Date();
      const startDate = new Date(sale.startDate);
      const endDate = new Date(sale.endDate);
      const timeRemaining = calculateTimeRemaining(endDate, startDate);
      
      let status = 'Scheduled';
      if (now >= startDate && now <= endDate && sale.isActive) {
        status = 'Active';
      } else if (now > endDate) {
        status = 'Expired';
      } else if (!sale.isActive) {
        status = 'Inactive';
      }

      return {
        ...sale,
        status,
        timeRemaining,
        isCurrentlyActive: status === 'Active',
      };
    });

    // Pagination info
    const pagination = {};
    if (skip + limit < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (skip > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.json({
      success: true,
      count: enhancedFlashSales.length,
      total,
      pagination,
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
    const monthAgo = new Date(now.getTime() - 30 * TIME.DAY);

    // Use aggregation pipeline for better performance
    const [stats, activeSales, recentSales, topPerformingSales] = await Promise.all([
      // Get total sales and views
      FlashSale.aggregate([
        {
          $facet: {
            totalSales: [{ $group: { _id: null, total: { $sum: '$totalSales' } } }],
            totalViews: [{ $group: { _id: null, total: { $sum: '$totalViews' } } }],
            totalFlashSales: [{ $group: { _id: null, count: { $sum: 1 } } }]
          },
        },
      ]),
      
      // Count active sales
      FlashSale.countDocuments({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gt: now },
      }),
      
      // Count recent sales (last 7 days)
      FlashSale.countDocuments({
        createdAt: { $gte: weekAgo },
      }),
      
      // Get top performing sales
      FlashSale.find({ totalSales: { $gt: 0 } })
        .sort({ totalSales: -1 })
        .limit(5)
        .select('title totalSales totalViews startDate endDate')
        .lean(),
    ]);

    const result = stats[0];

    res.json({
      success: true,
      data: {
        totalSales: result?.totalSales[0]?.total || 0,
        totalViews: result?.totalViews[0]?.total || 0,
        totalFlashSales: result?.totalFlashSales[0]?.count || 0,
        activeSales,
        recentSales,
        topPerformingSales,
        analytics: {
          averageViewsPerSale: result?.totalFlashSales[0]?.count > 0 
            ? Math.round((result?.totalViews[0]?.total || 0) / result.totalFlashSales[0].count)
            : 0,
          averageSalesPerFlashSale: result?.totalFlashSales[0]?.count > 0
            ? Math.round((result?.totalSales[0]?.total || 0) / result.totalFlashSales[0].count)
            : 0
        }
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
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { title, description, startDate, endDate, products } = req.body;

    // Validate required fields
    if (!title || !description || !startDate || !endDate || !products || products.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Please provide all required fields: title, description, startDate, endDate, and products',
      });
    }

    // Parse and validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid date format. Please use ISO date format (YYYY-MM-DDTHH:mm:ss.sssZ)',
      });
    }

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

    // Validate and process products
    const processedProducts = products.map((product, index) => {
      // Validate required product fields
      if (!product.name || !product.originalPrice || !product.salePrice || !product.image) {
        throw new Error(`Product at index ${index} is missing required fields: name, originalPrice, salePrice, or image`);
      }

      // Validate price logic
      if (product.salePrice >= product.originalPrice) {
        throw new Error(`Product "${product.name}" sale price must be less than original price`);
      }

      if (product.originalPrice <= 0 || product.salePrice <= 0) {
        throw new Error(`Product "${product.name}" prices must be greater than 0`);
      }

      // Calculate discount percentage
      const discountPercentage = Math.round(
        ((product.originalPrice - product.salePrice) / product.originalPrice) * 100
      );

      return {
        ...product,
        discountPercentage,
        stockQuantity: product.stockQuantity || 100,
        soldQuantity: product.soldQuantity || 0,
        maxQuantityPerUser: product.maxQuantityPerUser || 5,
      };
    });

    const flashSale = await FlashSale.create({
      title: title.trim(),
      description: description.trim(),
      startDate: start,
      endDate: end,
      products: processedProducts,
      createdBy: req.user._id,
      isActive: true,
    });

    // Populate the created flash sale
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
    // Validate ObjectId format
    if (!isValidObjectId(req.params.id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid flash sale ID format',
      });
    }

    // Check validation errors
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

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Invalid date format',
        });
      }

      if (start >= end) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'End date must be after start date',
        });
      }
    }

    // Process products if provided
    let processedProducts = products;
    if (products && Array.isArray(products) && products.length > 0) {
      processedProducts = products.map((product, index) => {
        // Validate required product fields
        if (!product.name || !product.originalPrice || !product.salePrice) {
          throw new Error(`Product at index ${index} is missing required fields`);
        }

        if (product.salePrice >= product.originalPrice) {
          throw new Error(`Product "${product.name}" sale price must be less than original price`);
        }

        return {
          ...product,
          discountPercentage: Math.round(
            ((product.originalPrice - product.salePrice) / product.originalPrice) * 100
          ),
        };
      });
    }

    // Build update object with only provided fields
    const updateData = {
      updatedAt: new Date(),
    };

    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (processedProducts) updateData.products = processedProducts;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    flashSale = await FlashSale.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
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
    // Validate ObjectId format
    if (!isValidObjectId(req.params.id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid flash sale ID format',
      });
    }

    const flashSale = await FlashSale.findById(req.params.id);

    if (!flashSale) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Flash sale not found',
      });
    }

    // Check if flash sale is currently active before deletion
    const now = new Date();
    const isCurrentlyActive = flashSale.isActive && 
                             now >= flashSale.startDate && 
                             now <= flashSale.endDate;

    if (isCurrentlyActive) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Cannot delete an active flash sale. Please deactivate it first.',
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

// @desc    Toggle flash sale status
// @route   PATCH /api/flash-sales/:id/toggle
// @access  Private/Admin
const toggleFlashSaleStatus = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid flash sale ID format',
      });
    }

    const flashSale = await FlashSale.findById(req.params.id);

    if (!flashSale) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Flash sale not found',
      });
    }

    const updatedFlashSale = await FlashSale.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: !flashSale.isActive,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      data: updatedFlashSale,
      message: `Flash sale ${updatedFlashSale.isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    handleError(res, error, 'Failed to toggle flash sale status');
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
  toggleFlashSaleStatus,
};