const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PASSWORD_VALIDATION } = require('../config/constants');

const adminUserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin'
  },
  permissions: [{
    type: String,
    enum: [
      'users.read',
      'users.write',
      'users.delete',
      'merchants.read',
      'merchants.write',
      'merchants.delete',
      'merchants.approve',
      'merchants.verify',
      'products.read',
      'products.write',
      'products.delete',
      'products.approve',
      'orders.read',
      'orders.write',
      'orders.update',
      'reviews.read',
      'reviews.write',
      'reviews.delete',
      'reviews.moderate',
      'analytics.read',
      'settings.read',
      'settings.write',
      'flash_sales.read',
      'flash_sales.write',
      'flash_sales.delete',
      'reports.read',
      'reports.export'
    ]
  }],
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  twoFactorSecret: {
    type: String,
    default: null
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      desktop: {
        type: Boolean,
        default: true
      },
      mobile: {
        type: Boolean,
        default: true
      }
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
adminUserSchema.index({ email: 1 });
adminUserSchema.index({ role: 1 });
adminUserSchema.index({ isActive: 1 });
adminUserSchema.index({ lastLogin: -1 }); // New for recent logins

// Virtual for full name
adminUserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
adminUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  if (!PASSWORD_VALIDATION.REGEX.test(this.password)) {
    return next(new Error(PASSWORD_VALIDATION.ERROR_MESSAGE));
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
adminUserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to match password (alias for comparePassword)
adminUserSchema.methods.matchPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
adminUserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      isAdmin: true,
      role: this.role 
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

// Method to check if account is locked
adminUserSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Virtual for accountLocked
adminUserSchema.virtual('accountLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Method to increment login attempts
adminUserSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // If we've reached max attempts and it's not locked already, lock the account
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
adminUserSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Method to reset failed login attempts
adminUserSchema.methods.resetFailedLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Method to track failed login
adminUserSchema.methods.trackFailedLogin = function() {
  return this.incLoginAttempts();
};

// Method to check permissions
adminUserSchema.methods.hasPermission = function(permission) {
  if (this.role === 'super_admin') return true;
  return this.permissions.includes(permission);
};

// Method to get role-based permissions
adminUserSchema.methods.getRolePermissions = function() {
  const rolePermissions = {
    super_admin: [
      'users.read', 'users.write', 'users.delete',
      'merchants.read', 'merchants.write', 'merchants.delete', 'merchants.approve', 'merchants.verify',
      'products.read', 'products.write', 'products.delete', 'products.approve',
      'orders.read', 'orders.write', 'orders.update',
      'reviews.read', 'reviews.write', 'reviews.delete', 'reviews.moderate',
      'analytics.read', 'settings.read', 'settings.write',
      'flash_sales.read', 'flash_sales.write', 'flash_sales.delete',
      'reports.read', 'reports.export'
    ],
    admin: [
      'users.read', 'users.write',
      'merchants.read', 'merchants.write', 'merchants.approve', 'merchants.verify',
      'products.read', 'products.write', 'products.approve',
      'orders.read', 'orders.write', 'orders.update',
      'reviews.read', 'reviews.write', 'reviews.moderate',
      'analytics.read', 'settings.read',
      'flash_sales.read', 'flash_sales.write',
      'reports.read'
    ],
    moderator: [
      'users.read',
      'merchants.read',
      'products.read', 'products.write',
      'orders.read', 'orders.write',
      'reviews.read', 'reviews.write', 'reviews.moderate',
      'analytics.read',
      'flash_sales.read'
    ]
  };
  
  return rolePermissions[this.role] || [];
};

// Transform output
adminUserSchema.methods.toJSON = function() {
  const adminUser = this.toObject();
  delete adminUser.password;
  delete adminUser.resetPasswordToken;
  delete adminUser.resetPasswordExpires;
  delete adminUser.twoFactorSecret;
  delete adminUser.loginAttempts;
  delete adminUser.lockUntil;
  return adminUser;
};

module.exports = mongoose.model('AdminUser', adminUserSchema);