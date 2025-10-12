const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');

const SettingsPG = sequelize.define('Settings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  notifications: {
    type: DataTypes.JSONB,
    defaultValue: {
      email: {
        orders: true,
        promotions: false,
        newsletters: false
      },
      push: {
        orders: true,
        promotions: false,
        reminders: true
      }
    }
  },
  privacy: {
    type: DataTypes.JSONB,
    defaultValue: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false
    }
  },
  security: {
    type: DataTypes.JSONB,
    defaultValue: {
      twoFactorEnabled: false,
      loginAlerts: true,
      deviceTracking: true
    }
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      language: 'en',
      currency: 'USD',
      timezone: 'UTC',
      theme: 'light'
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
  tableName: 'settings',
  timestamps: true,
  underscored: true
});

module.exports = SettingsPG;