const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  section: {
    type: String,
    enum: ['general', 'email', 'payment', 'security', 'seo', 'legal'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
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
SettingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create a compound index for faster lookups
SettingSchema.index({ section: 1, key: 1 });

module.exports = mongoose.model('Setting', SettingSchema);