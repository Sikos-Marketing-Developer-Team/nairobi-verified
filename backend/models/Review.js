const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String,
    required: [true, 'Please add content to your reply']
  }
}, { _id: false });

const ReviewSchema = new mongoose.Schema({
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  content: {
    type: String,
    required: [true, 'Please add a review text'],
    trim: true
  },
  helpful: {
    type: Number,
    default: 0
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reply: ReplySchema,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from submitting more than one review per merchant
ReviewSchema.index({ merchant: 1, user: 1 }, { unique: true });

// Add indexes for better query performance
ReviewSchema.index({ merchant: 1, createdAt: -1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ createdAt: -1 });

// Static method to get average rating and update merchant
ReviewSchema.statics.getAverageRating = async function(merchantId) {
  try {
    const obj = await this.aggregate([
      {
        $match: { merchant: merchantId }
      },
      {
        $group: {
          _id: '$merchant',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    const averageRating = obj[0] ? Math.round(obj[0].averageRating * 10) / 10 : 0;
    const reviewCount = obj[0] ? obj[0].reviewCount : 0;

    await this.model('Merchant').findByIdAndUpdate(merchantId, {
      rating: averageRating,
      reviews: reviewCount
    });

    console.log(`Updated merchant ${merchantId}: rating=${averageRating}, reviews=${reviewCount}`);
  } catch (err) {
    console.error('Error updating merchant rating:', err);
  }
};

// Virtual for formatted date
ReviewSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for time ago
ReviewSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
});

// Call getAverageRating after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.merchant);
});

// Call getAverageRating after delete (updated from deprecated 'remove')
ReviewSchema.post('findOneAndDelete', function(doc) {
  if (doc) {
    doc.constructor.getAverageRating(doc.merchant);
  }
});

// Also handle deleteOne
ReviewSchema.post('deleteOne', { document: true }, function() {
  this.constructor.getAverageRating(this.merchant);
});

// Ensure virtuals are included in JSON
ReviewSchema.set('toJSON', { virtuals: true });
ReviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Review', ReviewSchema);