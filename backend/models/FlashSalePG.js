const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');

const FlashSalePG = sequelize.define('FlashSalePG', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    }
  },
  bannerImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfterStartDate(value) {
        if (value <= this.startDate) {
          throw new Error('End date must be after start date');
        }
      }
    }
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false,
    defaultValue: 'percentage'
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  maxDiscountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  minimumPurchaseAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  maxRedemptions: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  currentRedemptions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  products: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of product IDs included in the flash sale'
  },
  categories: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of category names included in the flash sale'
  },
  merchants: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of merchant IDs included in the flash sale'
  },
  applicableToAll: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'If true, applies to all products'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'AdminUsers',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Higher numbers = higher priority in display'
  },
  termsAndConditions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'FlashSales',
  timestamps: true,
  indexes: [
    {
      fields: ['isActive']
    },
    {
      fields: ['startDate']
    },
    {
      fields: ['endDate']
    },
    {
      fields: ['discountType']
    },
    {
      fields: ['createdBy']
    },
    {
      fields: ['priority']
    },
    {
      // Compound index for active sales within date range
      fields: ['isActive', 'startDate', 'endDate']
    },
    {
      // Index for current sales
      fields: ['isActive', 'startDate', 'endDate', 'priority']
    }
  ],
  hooks: {
    beforeValidate: (flashSale, options) => {
      // Ensure discount value is reasonable
      if (flashSale.discountType === 'percentage' && flashSale.discountValue > 100) {
        throw new Error('Percentage discount cannot exceed 100%');
      }
    },
    beforeUpdate: (flashSale, options) => {
      // Update usage count validation
      if (flashSale.maxRedemptions && flashSale.currentRedemptions > flashSale.maxRedemptions) {
        throw new Error('Current redemptions cannot exceed maximum redemptions');
      }
    }
  }
});

module.exports = FlashSalePG;