const mongoose = require('mongoose');

const vendorSubscriptionSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendor is required']
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPackage',
    required: [true, 'Subscription package is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid', 'refunded', 'failed'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'card', 'bank', 'admin'],
    required: [true, 'Payment method is required']
  },
  paymentDetails: {
    transactionId: String,
    amount: Number,
    currency: {
      type: String,
      default: 'KES'
    },
    paymentDate: Date,
    receiptNumber: String
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  renewalReminder: {
    type: Boolean,
    default: true
  },
  renewalReminderSent: {
    type: Boolean,
    default: false
  },
  lastRenewalNotification: {
    type: Date
  },
  previousSubscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorSubscription'
  }
}, { timestamps: true });

// Index for efficient queries
vendorSubscriptionSchema.index({ vendor: 1, status: 1 });

module.exports = mongoose.model('VendorSubscription', vendorSubscriptionSchema);