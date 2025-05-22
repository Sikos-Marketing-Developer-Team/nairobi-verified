const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity cannot be less than 1']
      },
      price: {
        type: Number,
        required: true
      },
      merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    }
  ],
  shippingAddress: {
    fullName: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'mpesa', 'cash_on_delivery', 'bank_transfer'],
    required: true
  },
  paymentDetails: {
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paidAt: Date
  },
  subtotal: {
    type: Number,
    required: true
  },
  shippingFee: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  statusHistory: [
    {
      status: {
        type: String,
        enum: ['pending', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
        required: true
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      note: String
    }
  ],
  notes: String,
  trackingNumber: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  returnRequested: {
    status: Boolean,
    reason: String,
    requestedAt: Date
  }
}, { timestamps: true });

// Generate unique order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    // Generate order number: NV-YYYYMMDD-XXXX (where XXXX is a random number)
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
                   (date.getMonth() + 1).toString().padStart(2, '0') +
                   date.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    this.orderNumber = `NV-${dateStr}-${randomNum}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);