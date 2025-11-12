const Product = require('../models/Product');
const Merchant = require('../models/Merchant');
const { HTTP_STATUS } = require('../config/constants');

// Error handling utility
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: message });
};

// Enhanced product filter with better search handling
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
  
  // Enhanced search functionality
  if (search && search.trim()) {
    const searchTerm = search.trim();
    
    // Try text search first (if text index exists)
    productFilter.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } },
      { brand: { $regex: searchTerm, $options: 'i' } },
      { model: { $regex: searchTerm, $options: 'i' } },
      { category: { $regex: searchTerm, $options: 'i' } },
      { subcategory: { $regex: searchTerm, $options: 'i' } },
      { merchantName: { $regex: searchTerm, $options: 'i' } }
    ];
  }
  
  return productFilter;
};

// Get all products with filtering and pagination
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

    // OPTIMIZATION: Parallel queries + reduced merchant fields
    const [products, total] = await Promise.all([
      Product.find(productFilter)
        .populate('merchant', 'businessName address verified rating') // Only needed fields
        .select('-__v')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(productFilter)
    ]);

    // Add inStock field to all products
    const productsWithStock = products.map(product => ({
      ...product,
      inStock: product.isActive && product.stockQuantity > (product.soldQuantity || 0),
      availableQuantity: Math.max(0, product.stockQuantity - (product.soldQuantity || 0))
    }));

    // OPTIMIZATION: Cache product lists
    if (!merchant && !search) { // Cache general product pages
      res.set('Cache-Control', 'public, max-age=300');
      res.set('CDN-Cache-Control', 'max-age=600');
    }

    res.json({
      success: true,
      data: productsWithStock,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      searchTerm: search || null,
      appliedFilters: { category, merchant, featured, minPrice, maxPrice, search }
    });
  } catch (error) {
    console.error('getProducts error:', error);
    handleError(res, error, 'Failed to fetch products');
  }
};

// Dedicated search endpoint for more advanced search functionality
const searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;
    
    if (!q || !q.trim()) {
      return res.json({
        success: true,
        data: [],
        pagination: { page: 1, limit: Number(limit), total: 0, pages: 0 },
        message: 'Please provide a search term'
      });
    }

    const searchTerm = q.trim();
    const skip = (page - 1) * limit;

    // Advanced search with scoring
    const searchFilter = {
      isActive: true,
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } },
        { brand: { $regex: searchTerm, $options: 'i' } },
        { model: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { subcategory: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    const products = await Product.find(searchFilter)
      .populate('merchant', 'businessName address location phone email whatsappNumber verified rating')
      .sort({ rating: -1, reviewCount: -1, createdAt: -1 }) // Sort by relevance
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Product.countDocuments(searchFilter);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      searchTerm,
      resultsFound: products.length > 0
    });
  } catch (error) {
    handleError(res, error, 'Search failed');
  }
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ featured: true, isActive: true })
      .populate('merchant', 'businessName address location phone email whatsappNumber verified rating')
      .sort({ rating: -1, reviewCount: -1 })
      .limit(Number(limit))
      .lean();

    // Add inStock field to all products
    const productsWithStock = products.map(product => ({
      ...product,
      inStock: product.isActive && product.stockQuantity > (product.soldQuantity || 0),
      availableQuantity: Math.max(0, product.stockQuantity - (product.soldQuantity || 0))
    }));

    res.json({
      success: true,
      data: productsWithStock,
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch featured products');
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('merchant', 'businessName address location phone email whatsappNumber verified rating')
      .lean();

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Increment view count
    await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Add inStock field based on stockQuantity and isActive status
    const productWithStock = {
      ...product,
      inStock: product.isActive && product.stockQuantity > (product.soldQuantity || 0),
      availableQuantity: Math.max(0, product.stockQuantity - (product.soldQuantity || 0))
    };

    res.json({
      success: true,
      data: productWithStock,
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch product');
  }
};

// Get products by merchant
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

// Create new product
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
      .populate('merchant', 'businessName address location phone email whatsappNumber verified rating')
      .lean();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: populatedProduct,
    });
  } catch (error) {
    handleError(res, error, 'Failed to create product');
  }
};

// Update product
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
      if (!merchant || !product.merchant.equals(merchant._id) ) {
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
      .populate('merchant', 'businessName address location phone email whatsappNumber verified rating')
      .lean();

    res.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    handleError(res, error, 'Failed to update product');
  }
};

// Delete product
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

// Get product categories
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

// Get valid category enum values from schema
const getValidCategories = async (req, res) => {
  try {
    // Get the enum values directly from the Product schema
    const categoryEnum = Product.schema.path('category').enumValues;

    res.json({
      success: true,
      data: categoryEnum,
      message: 'These are the valid category values for creating/updating products'
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch valid categories');
  }
};

// Get search suggestions
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }

    const searchTerm = q.trim();
    
    // Get suggestions from product names, brands, and categories
    const suggestions = await Product.aggregate([
      {
        $match: {
          isActive: true,
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { brand: { $regex: searchTerm, $options: 'i' } },
            { category: { $regex: searchTerm, $options: 'i' } }
          ]
        }
      },
      {
        $project: {
          name: 1,
          brand: 1,
          category: 1,
          primaryImage: 1
        }
      },
      { $limit: 8 }
    ]);

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch search suggestions');
  }
};

module.exports = {
  getProducts,
  searchProducts,
  getFeaturedProducts,
  getProductById,
  getProductsByMerchant,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getSearchSuggestions
};