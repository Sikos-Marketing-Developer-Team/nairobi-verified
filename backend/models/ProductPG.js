const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');

const ProductPG = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  comparePrice: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'compare_price'
  },
  costPrice: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'cost_price'
  },
  sku: {
    type: DataTypes.STRING(255)
  },
  barcode: {
    type: DataTypes.STRING(255)
  },
  trackInventory: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'track_inventory'
  },
  inventoryQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'inventory_quantity'
  },
  lowStockThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    field: 'low_stock_threshold'
  },
  weight: {
    type: DataTypes.DECIMAL(8, 2)
  },
  dimensions: {
    type: DataTypes.JSONB
  },
  category: {
    type: DataTypes.STRING(255)
  },
  subcategory: {
    type: DataTypes.STRING(255)
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  thumbnail: {
    type: DataTypes.TEXT
  },
  merchantId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'merchant_id',
    references: {
      model: 'merchants',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'active'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_featured'
  },
  isDigital: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_digital'
  },
  requiresShipping: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'requires_shipping'
  },
  seoTitle: {
    type: DataTypes.STRING(255),
    field: 'seo_title'
  },
  seoDescription: {
    type: DataTypes.TEXT,
    field: 'seo_description'
  },
  metaKeywords: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    field: 'meta_keywords'
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'review_count'
  },
  salesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sales_count'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'view_count'
  },
  variants: {
    type: DataTypes.JSONB
  },
  attributes: {
    type: DataTypes.JSONB
  },
  shippingInfo: {
    type: DataTypes.JSONB,
    field: 'shipping_info'
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ProductPG;