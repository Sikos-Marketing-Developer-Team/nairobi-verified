const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');

const ReviewPG = sequelize.define('ReviewPG', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  merchantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Merchants',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Orders',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 200]
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    }
  },
  images: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  isVerifiedPurchase: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isHelpful: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isReported: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reportReason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  merchantResponse: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  merchantResponseDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'Reviews',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['productId']
    },
    {
      fields: ['merchantId']
    },
    {
      fields: ['rating']
    },
    {
      fields: ['isApproved']
    },
    {
      fields: ['isVerifiedPurchase']
    },
    {
      fields: ['createdAt']
    },
    {
      // Compound index for product reviews
      fields: ['productId', 'isApproved', 'createdAt']
    },
    {
      // Compound index for merchant reviews
      fields: ['merchantId', 'isApproved', 'createdAt']
    },
    {
      // Unique constraint to prevent duplicate reviews for same product by same user
      fields: ['userId', 'productId'],
      unique: true
    }
  ]
});

module.exports = ReviewPG;