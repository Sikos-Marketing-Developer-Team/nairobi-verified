const { ProductPG, MerchantPG } = require('../models/indexPG');
const { Op, literal } = require('sequelize');
const { sequelize } = require('../models/indexPG');
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

    console.log('Search query received:', { search, category, merchant });

    // Build Sequelize where clause
    const whereClause = {};
    
    if (category) whereClause.category = category;
    if (merchant) whereClause.merchantId = merchant;
    if (featured !== undefined) whereClause.featured = featured;
    
    // Price range filter
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = Number(minPrice);
      if (maxPrice) whereClause.price[Op.lte] = Number(maxPrice);
    }
    
    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const orderClause = [[sortBy, sortOrder.toUpperCase()]];
    const offset = (page - 1) * limit;

    console.log('Product filter:', JSON.stringify(whereClause, null, 2));

    const products = await ProductPG.findAll({
      where: whereClause,
      include: [{
        model: MerchantPG,
        as: 'merchant',
        attributes: ['businessName', 'address']
      }],
      order: orderClause,
      offset: offset,
      limit: Number(limit)
    });

    const total = await ProductPG.count({ where: whereClause });

    console.log(`Found ${products.length} products out of ${total} total matching filter`);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      searchTerm: search || null,
      appliedFilters: {
        category,
        merchant,
        featured,
        minPrice,
        maxPrice,
        search
      }
    });
  } catch (error) {
    console.error('Search error:', error);
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
    const offset = (page - 1) * limit;

    // Advanced search with PostgreSQL ILIKE
    const searchFilter = {
      isActive: true,
      [Op.or]: [
        { name: { [Op.iLike]: `%${searchTerm}%` } },
        { description: { [Op.iLike]: `%${searchTerm}%` } },
        { brand: { [Op.iLike]: `%${searchTerm}%` } },
        { model: { [Op.iLike]: `%${searchTerm}%` } },
        { category: { [Op.iLike]: `%${searchTerm}%` } },
        { subcategory: { [Op.iLike]: `%${searchTerm}%` } }
        // Note: tags search needs to be implemented based on how tags are stored in PostgreSQL
      ]
    };

    const products = await ProductPG.findAll({
      where: searchFilter,
      include: [{
        model: MerchantPG,
        as: 'merchant',
        attributes: ['businessName', 'address']
      }],
      order: [['rating', 'DESC'], ['reviewCount', 'DESC'], ['createdAt', 'DESC']], // Sort by relevance
      offset: offset,
      limit: Number(limit)
    });

    const total = await ProductPG.count({ where: searchFilter });

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

    const products = await ProductPG.findAll({
      where: { featured: true, isActive: true },
      include: [{
        model: MerchantPG,
        as: 'merchant',
        attributes: ['businessName', 'address']
      }],
      order: [['rating', 'DESC'], ['reviewCount', 'DESC']],
      limit: Number(limit)
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch featured products');
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
        const product = await ProductPG.findByPk(req.params.id, {
      include: [{
        model: MerchantPG,
        as: 'merchant',
        attributes: ['businessName', 'address', 'phone', 'email']
      }]
    });

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Increment view count
    await ProductPG.update(
      { views: literal('views + 1') },
      { where: { id: req.params.id } }
    );

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch product');
  }
};

// Get products by merchant
const getProductsByMerchant = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const products = await ProductPG.findAll({
      where: {
        merchantId: req.params.merchantId,
        isActive: true,
      },
      order: [['createdAt', 'DESC']],
      offset: offset,
      limit: Number(limit)
    });

    const total = await ProductPG.count({
      where: {
        merchantId: req.params.merchantId,
        isActive: true,
      }
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
      const merchant = await MerchantPG.findOne({ where: { owner: req.user.id } });
      if (!merchant) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Merchant profile not found',
        });
      }
      merchantId = merchant.id;
    } else {
      merchantId = req.body.merchant;
    }

    const productData = {
      ...req.body,
      merchant: merchantId,
    };

    const product = await ProductPG.create(productData);

    const populatedProduct = await ProductPG.findByPk(product.id, {
      include: [{
        model: MerchantPG,
        as: 'merchant',
        attributes: ['businessName', 'address']
      }]
    });

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
    const product = await ProductPG.findByPk(req.params.id, {
      include: [{
        model: MerchantPG,
        as: 'merchant'
      }]
    });

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Product not found',
      });
    }

    if (req.user.role === 'merchant') {
      const merchant = await MerchantPG.findOne({ where: { owner: req.user.id } });
      if (!merchant || product.merchant.id !== merchant.id) {
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

    await product.update(req.body);

    const updatedProduct = await ProductPG.findByPk(req.params.id, {
      include: [{
        model: MerchantPG,
        as: 'merchant',
        attributes: ['businessName', 'address']
      }]
    });

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
    const product = await ProductPG.findByPk(req.params.id, {
      include: [{
        model: MerchantPG,
        as: 'merchant'
      }]
    });

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Product not found',
      });
    }

    if (req.user.role === 'merchant') {
      const merchant = await MerchantPG.findOne({ where: { owner: req.user.id } });
      if (!merchant || product.merchant.id !== merchant.id) {
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

    await product.destroy();

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

// Get search suggestions
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }

    const searchTerm = q.trim();
    
    // Get suggestions from product names, brands, and categories using PostgreSQL
    const suggestions = await ProductPG.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { brand: { [Op.iLike]: `%${searchTerm}%` } },
          { category: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      },
      attributes: ['name', 'brand', 'category', 'primaryImage'],
      limit: 8
    });

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