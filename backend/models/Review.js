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

// Static method to get average rating and update merchant
ReviewSchema.statics.getAverageRating = async function(merchantId) {
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

  try {
    await this.model('Merchant').findByIdAndUpdate(merchantId, {
      rating: obj[0] ? obj[0].averageRating : 0,
      reviews: obj[0] ? obj[0].reviewCount : 0
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.merchant);
});

// Call getAverageRating after remove
ReviewSchema.post('remove', function() {
  this.constructor.getAverageRating(this.merchant);
});

module.exports = mongoose.model('Review', ReviewSchema);