const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  items: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.ENUM('mpesa', 'card', 'cash_on_delivery'),
    allowNull: false
  },
  shippingAddress: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  trackingNumber: {
    type: DataTypes.STRING
  },
  notes: {
    type: DataTypes.TEXT
  },
  orderDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  deliveryDate: {
    type: DataTypes.DATE
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
  tableName: 'orders',
  hooks: {
    beforeCreate: async (order) => {
      if (!order.orderNumber) {
        order.orderNumber = 'NV' + Date.now() + Math.floor(Math.random() * 1000);
      }
    },
    beforeUpdate: async (order) => {
      order.updatedAt = new Date();
    }
  },
  indexes: [
    { fields: ['userId', 'orderDate'] },
    { fields: ['orderNumber'] },
    { fields: ['status'] },
    { fields: ['paymentStatus'] }
  ]
});

module.exports = Order;