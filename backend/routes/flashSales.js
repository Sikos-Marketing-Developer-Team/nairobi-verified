const express = require('express');
const router = express.Router();
const FlashSale = require('../models/FlashSale');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all active flash sales
// @route   GET /api/flash-sales
// @access  Public
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const flashSales = await FlashSale.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ createdAt: -1 });

    // Add time remaining to each flash sale
    const flashSalesWithTime = flashSales.map(sale => ({
      ...sale.toObject(),
      timeRemaining: sale.getTimeRemaining(),
      isCurrentlyActive: sale.isCurrentlyActive
    }));

    res.json({
      success: true,
      count: flashSalesWithTime.length,
      data: flashSalesWithTime
    });
  } catch (error) {
    console.error('Error fetching flash sales:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Get single flash sale
// @route   GET /api/flash-sales/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const flashSale = await FlashSale.findById(req.params.id);

    if (!flashSale) {
      return res.status(404).json({
        success: false,
        error: 'Flash sale not found'
      });
    }

    // Increment view count
    flashSale.totalViews += 1;
    await flashSale.save();

    res.json({
      success: true,
      data: {
        ...flashSale.toObject(),
        timeRemaining: flashSale.getTimeRemaining(),
        isCurrentlyActive: flashSale.isCurrentlyActive
      }
    });
  } catch (error) {
    console.error('Error fetching flash sale:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Create new flash sale
// @route   POST /api/flash-sales
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      products
    } = req.body;

    // Validate required fields
    if (!title || !description || !startDate || !endDate || !products || products.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

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
    const processedProducts = products.map(product => ({
      ...product,
      discountPercentage: Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)
    }));

    const flashSale = await FlashSale.create({
      title,
      description,
      startDate: start,
      endDate: end,
      products: processedProducts,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: flashSale
    });
  } catch (error) {
    console.error('Error creating flash sale:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Update flash sale
// @route   PUT /api/flash-sales/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    let flashSale = await FlashSale.findById(req.params.id);

    if (!flashSale) {
      return res.status(404).json({
        success: false,
        error: 'Flash sale not found'
      });
    }

    const {
      title,
      description,
      startDate,
      endDate,
      products,
      isActive
    } = req.body;

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        return res.status(400).json({
          success: false,
          error: 'End date must be after start date'
        });
      }
    }

    // Process products if provided
    let processedProducts = products;
    if (products && products.length > 0) {
      processedProducts = products.map(product => ({
        ...product,
        discountPercentage: Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)
      }));
    }

    const updateData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      ...(processedProducts && { products: processedProducts }),
      ...(typeof isActive === 'boolean' && { isActive })
    };

    flashSale = await FlashSale.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: flashSale
    });
  } catch (error) {
    console.error('Error updating flash sale:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Delete flash sale
// @route   DELETE /api/flash-sales/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
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
      data: {}
    });
  } catch (error) {
    console.error('Error deleting flash sale:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Get all flash sales (for admin)
// @route   GET /api/flash-sales/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await FlashSale.countDocuments();
    const flashSales = await FlashSale.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex)
      .populate('createdBy', 'name email');

    // Add time remaining and status to each flash sale
    const flashSalesWithStatus = flashSales.map(sale => ({
      ...sale.toObject(),
      timeRemaining: sale.getTimeRemaining(),
      isCurrentlyActive: sale.isCurrentlyActive,
      status: sale.isCurrentlyActive ? 'Active' : 
              new Date() < sale.startDate ? 'Scheduled' : 'Expired'
    }));

    const pagination = {};
    if (startIndex + limit < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.json({
      success: true,
      count: flashSalesWithStatus.length,
      total,
      pagination,
      data: flashSalesWithStatus
    });
  } catch (error) {
    console.error('Error fetching all flash sales:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Get flash sale analytics
// @route   GET /api/flash-sales/admin/analytics
// @access  Private/Admin
router.get('/admin/analytics', protect, authorize('admin'), async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    const analytics = await FlashSale.aggregate([
      {
        $facet: {
          totalSales: [
            { $group: { _id: null, total: { $sum: '$totalSales' } } }
          ],
          totalViews: [
            { $group: { _id: null, total: { $sum: '$totalViews' } } }
          ],
          activeSales: [
            {
              $match: {
                isActive: true,
                startDate: { $lte: now },
                endDate: { $gte: now }
              }
            },
            { $count: 'count' }
          ],
          recentSales: [
            {
              $match: {
                createdAt: { $gte: thirtyDaysAgo }
              }
            },
            { $count: 'count' }
          ],
          topPerformingSales: [
            {
              $match: {
                totalSales: { $gt: 0 }
              }
            },
            {
              $sort: { totalSales: -1 }
            },
            {
              $limit: 5
            },
            {
              $project: {
                title: 1,
                totalSales: 1,
                totalViews: 1,
                startDate: 1,
                endDate: 1
              }
            }
          ]
        }
      }
    ]);

    const result = analytics[0];

    res.json({
      success: true,
      data: {
        totalSales: result.totalSales[0]?.total || 0,
        totalViews: result.totalViews[0]?.total || 0,
        activeSales: result.activeSales[0]?.count || 0,
        recentSales: result.recentSales[0]?.count || 0,
        topPerformingSales: result.topPerformingSales || []
      }
    });
  } catch (error) {
    console.error('Error fetching flash sale analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

module.exports = router;