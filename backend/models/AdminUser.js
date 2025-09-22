const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const AdminUser = sequelize.define('AdminUser', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      isLowercase: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'admin', 'moderator'),
    defaultValue: 'admin'
  },
  permissions: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lockUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  twoFactorSecret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      theme: 'system',
      notifications: {
        email: true,
        desktop: true,
        mobile: true
      },
      language: 'en',
      timezone: 'UTC'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'admin_users',
  hooks: {
    beforeCreate: async (adminUser) => {
      if (adminUser.password) {
        const salt = await bcrypt.genSalt(12);
        adminUser.password = await bcrypt.hash(adminUser.password, salt);
      }
    },
    beforeUpdate: async (adminUser) => {
      adminUser.updatedAt = new Date();
    }
  },
  indexes: [
    { fields: ['email'] },
    { fields: ['role'] },
    { fields: ['isActive'] }
  ]
});

// Virtual for full name
AdminUser.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Instance methods
AdminUser.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

AdminUser.prototype.matchPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

AdminUser.prototype.getSignedJwtToken = function() {
  return jwt.sign(
    {
      id: this.id,
      isAdmin: true,
      role: this.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

AdminUser.prototype.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

AdminUser.prototype.getAccountLocked = function() {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

AdminUser.prototype.incLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    await this.update({
      lockUntil: null,
      loginAttempts: 1
    });
    return;
  }

  const newAttempts = this.loginAttempts + 1;
  const updates = { loginAttempts: newAttempts };

  // If we've reached max attempts and it's not locked already, lock the account
  if (newAttempts >= 5 && !this.isLocked()) {
    updates.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  }

  await this.update(updates);
};

AdminUser.prototype.resetLoginAttempts = async function() {
  await this.update({
    loginAttempts: 0,
    lockUntil: null
  });
};

AdminUser.prototype.resetFailedLoginAttempts = async function() {
  await this.update({
    loginAttempts: 0,
    lockUntil: null
  });
};

AdminUser.prototype.trackFailedLogin = async function() {
  await this.incLoginAttempts();
};

AdminUser.prototype.hasPermission = function(permission) {
  if (this.role === 'super_admin') return true;
  return this.permissions.includes(permission);
};

AdminUser.prototype.getRolePermissions = function() {
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

AdminUser.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  delete values.resetPasswordToken;
  delete values.resetPasswordExpires;
  delete values.twoFactorSecret;
  delete values.loginAttempts;
  delete values.lockUntil;
  return values;
};

module.exports = AdminUser;