const Product = require('../models/Product');
const Merchant = require('../models/Merchant');
const { HTTP_STATUS } = require('../config/constants');

// Error handling utility
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: message });
};

// Build product filter
const buildProductFilter = ({ category, merchant, featured, minPrice, maxPrice, search }) => {
  const productFilter = { isActive: true };
  if (category) productFilter.category = category;
  if (merchant) productFilter.merchant = merchant;
  if (featured !== undefined) productFilter.featured = featured === 'true';
  if (minPrice || maxPrice) {
    productFilter.price = {};
    if (minPrice) productFilter.price.$gte = Number(minPrice);
    if (maxPrice) productFilter.price.$lte = Number(maxPrice);
  }
  if (search) productFilter.$text = { $search: search };
  return productFilter;
};

// @desc    Get all products with filtering and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      merchant,
      featured,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const productFilter = buildProductFilter({ category, merchant, featured, minPrice, maxPrice, search });
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (page - 1) * limit;

    const products = await Product.find(productFilter)
      .populate('merchant', 'businessName address')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Product.countDocuments(productFilter);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch products');
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ featured: true, isActive: true })
      .populate('merchant', 'businessName address')
      .sort({ rating: -1, reviewCount: -1 })
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch featured products');
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('merchant', 'businessName address phone email')
      .lean();

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Product not found',
      });
    }

    await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch product');
  }
};

// @desc    Get products by merchant
// @route   GET /api/products/merchant/:merchantId
// @access  Public
const getProductsByMerchant = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const products = await Product.find({
      merchant: req.params.merchantId,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Product.countDocuments({
      merchant: req.params.merchantId,
      isActive: true,
    });

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch merchant products');
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Merchant/Admin)
const createProduct = async (req, res) => {
  try {
    if (req.user.role !== 'merchant' && req.user.role !== 'admin') {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: 'Only merchants or admins can create products',
      });
    }

    let merchantId;
    if (req.user.role === 'merchant') {
      const merchant = await Merchant.findOne({ owner: req.user.id });
      if (!merchant) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Merchant profile not found',
        });
      }
      merchantId = merchant._id;
    } else {
      merchantId = req.body.merchant;
    }

    const productData = {
      ...req.body,
      merchant: merchantId,
    };

    const product = new Product(productData);
    await product.save();

    const populatedProduct = await Product.findById(product._id)
      .populate('merchant', 'businessName address')
      .lean();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: populatedProduct,
    });
  } catch (error) {
    handleError(res, error, 'Failed to create product');
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Merchant/Admin)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Product not found',
      });
    }

    if (req.user.role === 'merchant') {
      const merchant = await Merchant.findOne({ owner: req.user.id });
      if (!merchant || !product.merchant.equals(merchant._id)) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: 'Not authorized to update this product',
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: 'Not authorized to update products',
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('merchant', 'businessName address')
      .lean();

    res.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    handleError(res, error, 'Failed to update product');
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Merchant/Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Product not found',
      });
    }

    if (req.user.role === 'merchant') {
      const merchant = await Merchant.findOne({ owner: req.user.id });
      if (!merchant || !product.merchant.equals(merchant._id)) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: 'Not authorized to delete this product',
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: 'Not authorized to delete products',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    handleError(res, error, 'Failed to delete product');
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch categories');
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductById,
  getProductsByMerchant,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
};