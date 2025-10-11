const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');

const OrderPG = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderNumber: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'order_number'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
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
    defaultValue: 'pending'
  },
  paymentStatus: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending',
    field: 'payment_status'
  },
  fulfillmentStatus: {
    type: DataTypes.STRING(50),
    defaultValue: 'unfulfilled',
    field: 'fulfillment_status'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'tax_amount'
  },
  shippingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'shipping_amount'
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'discount_amount'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount'
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'KES'
  },
  paymentMethod: {
    type: DataTypes.STRING(100),
    field: 'payment_method'
  },
  paymentReference: {
    type: DataTypes.STRING(255),
    field: 'payment_reference'
  },
  shippingAddress: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'shipping_address'
  },
  billingAddress: {
    type: DataTypes.JSONB,
    field: 'billing_address'
  },
  deliveryInstructions: {
    type: DataTypes.TEXT,
    field: 'delivery_instructions'
  },
  estimatedDeliveryDate: {
    type: DataTypes.DATE,
    field: 'estimated_delivery_date'
  },
  deliveredAt: {
    type: DataTypes.DATE,
    field: 'delivered_at'
  },
  cancelledAt: {
    type: DataTypes.DATE,
    field: 'cancelled_at'
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    field: 'cancellation_reason'
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'refund_amount'
  },
  refundStatus: {
    type: DataTypes.STRING(50),
    field: 'refund_status'
  },
  refundReason: {
    type: DataTypes.TEXT,
    field: 'refund_reason'
  },
  notes: {
    type: DataTypes.TEXT
  },
  trackingNumber: {
    type: DataTypes.STRING(255),
    field: 'tracking_number'
  },
  courierService: {
    type: DataTypes.STRING(255),
    field: 'courier_service'
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = OrderPG;