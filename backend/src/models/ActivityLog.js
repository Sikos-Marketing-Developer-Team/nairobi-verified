// src/models/ActivityLog.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.isSystemAction;
    }
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isSystemAction: {
    type: Boolean,
    default: false
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

// Indexes for common queries
activityLogSchema.index({ userId: 1, action: 1 });
activityLogSchema.index({ action: 1, timestamp: -1 });

// Static methods
activityLogSchema.statics.logUserActivity = async function(userId, action, details = {}, req = null) {
  try {
    return await this.create({
      userId,
      action,
      details,
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent']
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - activity logging should not break the main flow
    return null;
  }
};

activityLogSchema.statics.logSystemActivity = async function(action, details = {}) {
  try {
    return await this.create({
      action,
      details,
      isSystemAction: true
    });
  } catch (error) {
    console.error('Error logging system activity:', error);
    return null;
  }
};

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;