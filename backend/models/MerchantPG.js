const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const MerchantPG = sequelize.define('Merchant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  businessName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'business_name'
  },
  ownerName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'owner_name'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  businessRegistrationNumber: {
    type: DataTypes.STRING(255),
    field: 'business_registration_number'
  },
  businessAddress: {
    type: DataTypes.JSONB,
    field: 'business_address'
  },
  businessDescription: {
    type: DataTypes.TEXT,
    field: 'business_description'
  },
  businessCategory: {
    type: DataTypes.STRING(255),
    field: 'business_category'
  },
  website: {
    type: DataTypes.STRING(255)
  },
  socialMedia: {
    type: DataTypes.JSONB,
    field: 'social_media'
  },
  operatingHours: {
    type: DataTypes.JSONB,
    field: 'operating_hours'
  },
  deliveryAreas: {
    type: DataTypes.JSONB,
    field: 'delivery_areas'
  },
  minimumOrderAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'minimum_order_amount'
  },
  deliveryFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'delivery_fee'
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending'
  },
  verificationStatus: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending',
    field: 'verification_status'
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    field: 'rejection_reason'
  },
  adminNotes: {
    type: DataTypes.TEXT,
    field: 'admin_notes'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_featured'
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  totalOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_orders'
  },
  totalRevenue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'total_revenue'
  },
  commissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 10.00,
    field: 'commission_rate'
  },
  profileImage: {
    type: DataTypes.TEXT,
    field: 'profile_image'
  },
  bannerImage: {
    type: DataTypes.TEXT,
    field: 'banner_image'
  },
  paymentMethods: {
    type: DataTypes.JSONB,
    field: 'payment_methods'
  },
  shippingMethods: {
    type: DataTypes.JSONB,
    field: 'shipping_methods'
  },
  returnPolicy: {
    type: DataTypes.TEXT,
    field: 'return_policy'
  },
  termsConditions: {
    type: DataTypes.TEXT,
    field: 'terms_conditions'
  },
  passwordResetToken: {
    type: DataTypes.STRING(255),
    field: 'password_reset_token'
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    field: 'password_reset_expires'
  },
  emailVerificationToken: {
    type: DataTypes.STRING(255),
    field: 'email_verification_token'
  },
  emailVerificationExpires: {
    type: DataTypes.DATE,
    field: 'email_verification_expires'
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_email_verified'
  },
  lastLogin: {
    type: DataTypes.DATE,
    field: 'last_login'
  }
}, {
  tableName: 'merchants',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Instance methods
MerchantPG.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

MerchantPG.prototype.getSignedJwtToken = function() {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

MerchantPG.prototype.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Hooks
MerchantPG.beforeCreate(async (merchant) => {
  if (merchant.password) {
    const salt = await bcrypt.genSalt(10);
    merchant.password = await bcrypt.hash(merchant.password, salt);
  }
});

MerchantPG.beforeUpdate(async (merchant) => {
  if (merchant.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    merchant.password = await bcrypt.hash(merchant.password, salt);
  }
});

module.exports = MerchantPG;