const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  type: {
    type: String,
    enum: ['subscription', 'order', 'refund', 'other'],
    required: [true, 'Transaction type is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'KES'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'card', 'bank', 'admin'],
    required: [true, 'Payment method is required']
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  mpesaDetails: {
    phoneNumber: String,
    merchantRequestID: String,
    checkoutRequestID: String,
    responseCode: String,
    responseDescription: String,
    customerMessage: String,
    mpesaReceiptNumber: String,
    transactionDate: Date
  },
  cardDetails: {
    last4: String,
    brand: String,
    expiryMonth: String,
    expiryYear: String,
    authorizationCode: String
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    referenceNumber: String
  },
  relatedSubscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorSubscription'
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  notes: String,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

// Indexes for efficient queries
paymentTransactionSchema.index({ user: 1, type: 1 });
paymentTransactionSchema.index({ status: 1 });
paymentTransactionSchema.index({ transactionId: 1 });

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  type: {
    type: String,
    enum: ['subscription', 'order', 'refund', 'other'],
    required: [true, 'Transaction type is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'KES'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'card', 'bank', 'admin'],
    required: [true, 'Payment method is required']
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  mpesaDetails: {
    phoneNumber: String,
    merchantRequestID: String,
    checkoutRequestID: String,
    responseCode: String,
    responseDescription: String,
    customerMessage: String,
    mpesaReceiptNumber: String,
    transactionDate: Date
  },
  cardDetails: {
    last4: String,
    brand: String,
    expiryMonth: String,
    expiryYear: String,
    authorizationCode: String
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    referenceNumber: String
  },
  relatedSubscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorSubscription'
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  notes: String,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

// Indexes for efficient queries
paymentTransactionSchema.index({ user: 1, type: 1 });
paymentTransactionSchema.index({ status: 1 });
paymentTransactionSchema.index({ transactionId: 1 });

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);