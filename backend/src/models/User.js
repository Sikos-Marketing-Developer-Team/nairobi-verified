// User Model Schema
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.google; // Password is required only if not using Google auth
    }
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['client', 'merchant', 'admin'],
    default: 'client'
  },
  // Merchant specific fields
  companyName: {
    type: String,
    required: function() {
      return this.role === 'merchant';
    }
  },
  location: {
    type: String,
    required: function() {
      return this.role === 'merchant';
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  documents: {
    businessRegistration: {
      url: String,
      uploadedAt: Date
    },
    taxCertificate: {
      url: String,
      uploadedAt: Date
    },
    idDocument: {
      url: String,
      uploadedAt: Date
    }
  },
  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  // Password reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  // Google auth
  google: {
    id: String,
    email: String,
    name: String,
    picture: String
  },
  // Remember me
  rememberMe: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
