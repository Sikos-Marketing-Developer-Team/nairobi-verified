const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: [true, 'Merchant reference is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a user can't favorite the same merchant twice
FavoriteSchema.index({ user: 1, merchant: 1 }, { unique: true });

// Index for fast lookups
FavoriteSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Favorite', FavoriteSchema);