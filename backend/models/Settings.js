const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  profile: {
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      trim: true
    },
    avatar: {
      type: String
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    }
  },
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    currency: {
      type: String,
      default: 'KES'
    },
    timezone: {
      type: String,
      default: 'Africa/Nairobi'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    }
  },
  notifications: {
    email: {
      orderUpdates: {
        type: Boolean,
        default: true
      },
      promotions: {
        type: Boolean,
        default: true
      },
      newsletter: {
        type: Boolean,
        default: false
      },
      flashSales: {
        type: Boolean,
        default: true
      }
    },
    push: {
      orderUpdates: {
        type: Boolean,
        default: true
      },
      promotions: {
        type: Boolean,
        default: false
      },
      flashSales: {
        type: Boolean,
        default: true
      }
    }
  },
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'friends'],
      default: 'private'
    },
    showOnlineStatus: {
      type: Boolean,
      default: true
    },
    allowMessages: {
      type: Boolean,
      default: true
    }
  },
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    loginNotifications: {
      type: Boolean,
      default: true
    },
    passwordLastChanged: {
      type: Date
    }
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

// Update timestamp on save
settingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
settingsSchema.index({ user: 1 });

module.exports = mongoose.model('Settings', settingsSchema);
