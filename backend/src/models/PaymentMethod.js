const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['credit', 'debit', 'paypal', 'mpesa']
  },
  cardNumber: {
    type: String,
    required: function() {
      return this.type === 'credit' || this.type === 'debit';
    },
    // Store only last 4 digits for security
    set: function(cardNumber) {
      if (cardNumber && (this.type === 'credit' || this.type === 'debit')) {
        return `**** **** **** ${cardNumber.slice(-4)}`;
      }
      return cardNumber;
    }
  },
  expiryDate: {
    type: String,
    required: function() {
      return this.type === 'credit' || this.type === 'debit';
    }
  },
  cardholderName: {
    type: String,
    required: function() {
      return this.type === 'credit' || this.type === 'debit';
    }
  },
  isDefault: {
    type: Boolean,
    default: false
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

// Update the updatedAt timestamp before saving
PaymentMethodSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PaymentMethod', PaymentMethodSchema);