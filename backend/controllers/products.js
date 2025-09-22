const Product = require('../models/Product');
const Merchant = require('../models/Merchant');
const { HTTP_STATUS } = require('../config/constants');
const { Op, fn, col } = require('sequelize');
const { sequelize } = require('../config/db');

// Error handling utility
const handleError = (res, error, message, status = HTTP_STATUS.INTERNAL_SERVER_ERROR) => {
  console.error(message, error);
  res.status(status).json({ success: false, error: message });
};

// Helpers
const parseBool = (val) => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val.toLowerCase() === 'true';
  return undefined;
};

const toInt = (val, fallback) => {
  const n = parseInt(val, 10);
  return Number.isNaN(n) ? fallback : n;
};

// Build Sequelize WHERE from query params
const buildWhere = ({ category, merchant, featured, minPrice, maxPrice, search }) => {
  const where = { /* isActive: true */ };

  if (category) where.category = category;

  // Accept either merchant or merchantId as filter
  if (merchant) where.merchantId = toInt(merchant, undefined) || merchant;

  const featuredBool = parseBool(featured);
  if (typeof featuredBool === 'boolean') where.featured = featuredBool;

  // Price range
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price[Op.gte] = Number(minPrice);
    if (maxPrice) where.price[Op.lte] = Number(maxPrice);
  }

  // Case-insensitive search across key fields (skip tags for now)
  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    where[Op.or] = [
      { name: { [Op.iLike]: term } },
      { description: { [Op.iLike]: term } },
      { brand: { [Op.iLike]: term } },
      { model: { [Op.iLike]: term } },
      { category: { [Op.iLike]: term } },
      { subcategory: { [Op.iLike]: term } },
      { merchantName: { [Op.iLike]: term } }
    ];
  }

  return where;
};

// Compose merchant map for populate-like response
const loadMerchantsMap = async (merchantIds) => {
  if (!merchantIds.length) return {};
  const rows = await Merchant.findAll({
    where: { id: { [Op.in]: merchantIds } },
    attributes: ['id', 'businessName', 'address']
  });
  const map = {};
  rows.forEach(m => { map[m.id] = m.toJSON(); });
  return map;
};

// Get all products with filtering and pagination (Sequelize)
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

    const pageNum = toInt(page, 1);
    const limitNum = toInt(limit, 12);
    const offset = (pageNum - 1) * limitNum;

    const where = {} // buildWhere({ category, merchant, featured, minPrice, maxPrice, search });

    // Normalize sort
    const order = [[sortBy, String(sortOrder).toLowerCase() === 'desc' ? 'DESC' : 'ASC']];

    const { rows, count } = await Product.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order
    });

    // Populate-like merchant details for compatibility
    const merchantIds = [...new Set(rows.map(p => p.merchantId).filter(Boolean))];
    const merchantsMap = await loadMerchantsMap(merchantIds);

    const data = rows.map(p => {
      const pj = p.toJSON();
      const m = merchantsMap[pj.merchantId] || null;
      return {
        ...pj,
        merchant: m ? { businessName: m.businessName, address: m.address } : undefined
      };
    });

    res.json({
      success: true,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        pages: Math.ceil(count / limitNum),
      },
      searchTerm: search || null,
      appliedFilters: { category, merchant, featured, minPrice, maxPrice, search }
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch products');
  }
};

// Dedicated search endpoint (reuses getProducts behavior)
const searchProducts = async (req, res) => {
  // Delegate to getProducts for now to avoid duplication
  return getProducts(req, res);
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const limitNum = toInt(limit, 8);

    const rows = await Product.findAll({
      where: { featured: true, isActive: true },
      order: [['rating', 'DESC'], ['reviewCount', 'DESC']],
      limit: limitNum
    });

    const merchantIds = [...new Set(rows.map(p => p.merchantId).filter(Boolean))];
    const merchantsMap = await loadMerchantsMap(merchantIds);

    const data = rows.map(p => {
      const pj = p.toJSON();
      const m = merchantsMap[pj.merchantId] || null;
      return {
        ...pj,
        merchant: m ? { businessName: m.businessName, address: m.address } : undefined
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error, 'Failed to fetch featured products');
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Increment view count (non-blocking)
    product.increment('views').catch(() => {});

    const pj = product.toJSON();

    // Load merchant details for compatibility
    let merchant = null;
    if (pj.merchantId) {
      const m = await Merchant.findByPk(pj.merchantId, { attributes: ['id', 'businessName', 'address', 'phone', 'email'] });
      if (m) merchant = { businessName: m.businessName, address: m.address, phone: m.phone, email: m.email };
    }

    res.json({ success: true, data: { ...pj, merchant } });
  } catch (error) {
    handleError(res, error, 'Failed to fetch product');
  }
};

// Get products by merchant
const getProductsByMerchant = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const pageNum = toInt(page, 1);
    const limitNum = toInt(limit, 12);
    const offset = (pageNum - 1) * limitNum;

    const merchantId = toInt(req.params.merchantId, undefined) || req.params.merchantId;

    const { rows, count } = await Product.findAndCountAll({
      where: { merchantId, isActive: true },
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset
    });

    res.json({
      success: true,
      data: rows.map(p => p.toJSON()),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        pages: Math.ceil(count / limitNum),
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
    let merchantName;

    if (req.user.role === 'merchant' && req.merchant) {
      merchantId = req.merchant.id;
      merchantName = req.merchant.businessName;
    } else {
      const providedId = req.body.merchantId || req.body.merchant;
      if (!providedId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'merchantId is required' });
      }
      const m = await Merchant.findByPk(providedId);
      if (!m) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Merchant not found' });
      }
      merchantId = m.id;
      merchantName = m.businessName;
    }

    const productData = {
      ...req.body,
      merchantId,
      merchantName,
    };

    // Prevent overriding protected fields
    delete productData.id;
    delete productData.views;

    const product = await Product.create(productData);

    // Attach merchant info for response
    const response = product.toJSON();
    response.merchant = { businessName: merchantName };

    res.status(HTTP_STATUS.CREATED).json({ success: true, data: response });
  } catch (error) {
    handleError(res, error, 'Failed to create product');
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Product not found',
      });
    }

    if (req.user.role === 'merchant') {
      if (!req.merchant || product.merchantId !== req.merchant.id) {
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

    const updates = { ...req.body };

    // Handle merchantId change (admin only)
    if (updates.merchantId || updates.merchant) {
      if (req.user.role !== 'admin') {
        delete updates.merchantId;
        delete updates.merchant;
      } else {
        const newMerchantId = updates.merchantId || updates.merchant;
        const m = await Merchant.findByPk(newMerchantId);
        if (!m) return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Merchant not found' });
        updates.merchantId = m.id;
        updates.merchantName = m.businessName;
        delete updates.merchant; // normalize
      }
    }

    // Protected fields
    delete updates.id;
    delete updates.views;

    product.set(updates);
    await product.save();

    res.json({ success: true, data: product.toJSON() });
  } catch (error) {
    handleError(res, error, 'Failed to update product');
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Product not found',
      });
    }

    if (req.user.role === 'merchant') {
      if (!req.merchant || product.merchantId !== req.merchant.id) {
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

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Failed to delete product');
  }
};

// Get product categories (distinct)
const getCategories = async (req, res) => {
  try {
    const rows = await Product.findAll({
      where: { isActive: true },
      attributes: [[fn('DISTINCT', col('category')), 'category']],
      order: [[col('category'), 'ASC']]
    });

    const categories = rows.map(r => r.get('category')).filter(Boolean);

    res.json({ success: true, data: categories });
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

    const term = `%${q.trim()}%`;

    // Fetch candidate suggestions from multiple fields
    const [names, brands, categories] = await Promise.all([
      Product.findAll({ where: { isActive: true, name: { [Op.iLike]: term } }, attributes: ['name'], limit: 10 }),
      Product.findAll({ where: { isActive: true, brand: { [Op.iLike]: term } }, attributes: ['brand'], limit: 10 }),
      Product.findAll({ where: { isActive: true, category: { [Op.iLike]: term } }, attributes: ['category'], limit: 10 })
    ]);

    const set = new Set();
    names.forEach(r => set.add(r.get('name')));
    brands.forEach(r => set.add(r.get('brand')));
    categories.forEach(r => set.add(r.get('category')));

    const suggestions = Array.from(set).filter(Boolean).slice(0, 10);

    res.json({ success: true, data: suggestions });
  } catch (error) {
    handleError(res, error, 'Failed to fetch search suggestions');
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
  getSearchSuggestions,
  searchProducts,
};