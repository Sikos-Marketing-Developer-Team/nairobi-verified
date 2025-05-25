const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    trim: true, // Optional, filled by Google displayName if not provided
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.google?.id; // Password required only for non-Google users
    },
  },
  phone: {
    type: String,
    trim: true, // Optional
  },
  role: {
    type: String,
    enum: ['client', 'merchant', 'admin'],
    default: 'client',
  },
  companyName: {
    type: String,
    required: function () {
      return this.role === 'merchant';
    },
  },
  location: {
    type: String,
    required: function () {
      return this.role === 'merchant';
    },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  documents: {
    businessRegistration: { url: String, publicId: String, uploadedAt: Date, status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' } },
    taxCertificate: { url: String, publicId: String, uploadedAt: Date, status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' } },
    idDocument: { url: String, publicId: String, uploadedAt: Date, status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' } },
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  google: {
    id: String,
    email: String,
    name: String,
    picture: String,
  },
  rememberMe: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return token;
};

module.exports = mongoose.model('User', userSchema);