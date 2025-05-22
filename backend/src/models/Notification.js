const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['system', 'marketing', 'order', 'payment', 'account', 'other'],
    default: 'system'
  },
  audience: {
    type: String,
    enum: ['all', 'clients', 'merchants', 'admins', 'specific'],
    default: 'all'
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'failed'],
    default: 'draft'
  },
  scheduledFor: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
NotificationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for faster lookups
NotificationSchema.index({ status: 1 });
NotificationSchema.index({ audience: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ scheduledFor: 1 }, { sparse: true });

module.exports = mongoose.model('Notification', NotificationSchema);