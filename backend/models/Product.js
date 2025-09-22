const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  category: {
    type: DataTypes.ENUM('Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Beauty', 'Automotive', 'Food & Beverages'),
    allowNull: false
  },
  subcategory: {
    type: DataTypes.STRING,
    allowNull: false
  },
  images: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  primaryImage: {
    type: DataTypes.STRING,
    allowNull: false
  },
  merchantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'merchants',
      key: 'id'
    }
  },
  merchantName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  stockQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  soldQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  specifications: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  weight: {
    type: DataTypes.DECIMAL(10, 2),
    validate: {
      min: 0
    }
  },
  dimensions: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  warranty: {
    type: DataTypes.STRING
  },
  brand: {
    type: DataTypes.STRING
  },
  model: {
    type: DataTypes.STRING
  },
  condition: {
    type: DataTypes.ENUM('new', 'used', 'refurbished'),
    defaultValue: 'new'
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'products',
  hooks: {
    beforeUpdate: async (product) => {
      product.updatedAt = new Date();
    }
  },
  indexes: [
    { fields: ['category', 'isActive'] },
    { fields: ['merchantId', 'isActive'] },
    { fields: ['featured', 'isActive'] },
    { fields: ['price'] },
    { fields: ['rating'] },
    { fields: ['createdAt'] }
  ]
});

// Virtuals
Product.prototype.getIsInStock = function() {
  return this.stockQuantity > this.soldQuantity;
};

Product.prototype.getAvailableQuantity = function() {
  return Math.max(0, this.stockQuantity - this.soldQuantity);
};

Product.prototype.getDiscountPercentage = function() {
  if (this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
};

module.exports = Product;