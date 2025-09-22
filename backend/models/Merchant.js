const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Merchant = sequelize.define('Merchant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  businessName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  businessType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  yearEstablished: {
    type: DataTypes.INTEGER
  },
  website: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  landmark: {
    type: DataTypes.STRING
  },
  businessHours: {
    type: DataTypes.JSONB,
    defaultValue: {
      monday: { open: '', close: '', closed: false },
      tuesday: { open: '', close: '', closed: false },
      wednesday: { open: '', close: '', closed: false },
      thursday: { open: '', close: '', closed: false },
      friday: { open: '', close: '', closed: false },
      saturday: { open: '', close: '', closed: false },
      sunday: { open: '', close: '', closed: false }
    }
  },
  logo: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  bannerImage: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  gallery: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  documents: {
    type: DataTypes.JSONB,
    defaultValue: {
      businessRegistration: {},
      idDocument: {},
      utilityBill: {},
      additionalDocs: [],
      verificationNotes: '',
      documentsSubmittedAt: null,
      documentsReviewedAt: null,
      documentReviewStatus: 'pending'
    }
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verifiedDate: {
    type: DataTypes.DATE
  },
  verificationHistory: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0
  },
  reviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Activation status for admin-controlled visibility
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  featuredDate: {
    type: DataTypes.DATE
  },
  resetPasswordToken: {
    type: DataTypes.STRING
  },
  resetPasswordExpire: {
    type: DataTypes.DATE
  },
  accountSetupToken: {
    type: DataTypes.STRING
  },
  accountSetupExpire: {
    type: DataTypes.DATE
  },
  accountSetupDate: {
    type: DataTypes.DATE
  },
  onboardingStatus: {
    type: DataTypes.ENUM('credentials_sent', 'account_setup', 'documents_submitted', 'under_review', 'completed'),
    defaultValue: 'credentials_sent'
  },
  createdByAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdByAdminId: {
    type: DataTypes.STRING
  },
  createdByAdminName: {
    type: DataTypes.STRING
  },
  createdProgrammatically: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdBy: {
    type: DataTypes.STRING
  },
  lastLoginAt: {
    type: DataTypes.DATE
  },
  profileCompleteness: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  documentsCompleteness: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
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
  tableName: 'merchants',
  hooks: {
    beforeCreate: async (merchant) => {
      if (merchant.password) {
        const salt = await bcrypt.genSalt(10);
        merchant.password = await bcrypt.hash(merchant.password, salt);
      }
    },
    beforeUpdate: async (merchant) => {
      merchant.updatedAt = new Date();
      merchant.calculateCompleteness();
    }
  }
});

// Instance methods
Merchant.prototype.getSignedJwtToken = function() {
  return jwt.sign({ id: this.id, isMerchant: true }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

Merchant.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

Merchant.prototype.getDocumentStatus = function() {
  const docs = this.documents || {};
  const requiredDocs = [
    docs.businessRegistration?.path,
    docs.idDocument?.path,
    docs.utilityBill?.path
  ];

  const completedCount = requiredDocs.filter(doc => doc && doc.trim()).length;

  return {
    businessRegistration: !!(docs.businessRegistration?.path),
    idDocument: !!(docs.idDocument?.path),
    utilityBill: !!(docs.utilityBill?.path),
    additionalDocs: !!(docs.additionalDocs?.length > 0),
    completedCount,
    totalRequired: 3,
    isComplete: completedCount === 3,
    completionPercentage: Math.round((completedCount / 3) * 100),
    canBeVerified: completedCount === 3 && !this.verified,
    status: docs.documentReviewStatus || 'pending'
  };
};

Merchant.prototype.addVerificationHistory = async function(action, performedBy, notes, documentsInvolved = []) {
  const history = this.verificationHistory || [];
  history.push({
    action,
    performedBy,
    performedAt: new Date(),
    notes,
    documentsInvolved
  });
  this.verificationHistory = history;
  return await this.save();
};

Merchant.prototype.calculateCompleteness = function() {
  // Calculate profile completeness
  const profileFields = [
    this.businessName,
    this.email,
    this.phone,
    this.businessType,
    this.description,
    this.address,
    this.location
  ];

  const optionalFields = [
    this.website,
    this.yearEstablished,
    this.logo,
    this.businessHours
  ];

  const completedRequired = profileFields.filter(field => field && field.trim()).length;
  const completedOptional = optionalFields.filter(field => field).length;

  this.profileCompleteness = Math.round(
    ((completedRequired / profileFields.length) * 70) +
    ((completedOptional / optionalFields.length) * 30)
  );

  // Calculate documents completeness
  const docs = this.documents || {};
  const requiredDocs = [
    docs.businessRegistration?.path,
    docs.idDocument?.path,
    docs.utilityBill?.path
  ];

  const completedDocs = requiredDocs.filter(doc => doc && doc.trim()).length;
  this.documentsCompleteness = Math.round((completedDocs / requiredDocs.length) * 100);

  // Update onboarding status based on completeness
  if (this.documentsCompleteness === 100 && this.onboardingStatus === 'account_setup') {
    this.onboardingStatus = 'documents_submitted';
    this.documents = {
      ...docs,
      documentsSubmittedAt: new Date(),
      documentReviewStatus: 'pending'
    };
  }
};

// Static methods
Merchant.getMerchantsNeedingReview = async function() {
  return await this.findAll({
    where: {
      verified: false,
      [sequelize.Op.and]: [
        sequelize.literal("documents->>'businessRegistration'->>'path' IS NOT NULL"),
        sequelize.literal("documents->>'businessRegistration'->>'path' != ''"),
        sequelize.literal("documents->>'idDocument'->>'path' IS NOT NULL"),
        sequelize.literal("documents->>'idDocument'->>'path' != ''"),
        sequelize.literal("documents->>'utilityBill'->>'path' IS NOT NULL"),
        sequelize.literal("documents->>'utilityBill'->>'path' != ''"),
        sequelize.literal("documents->>'documentReviewStatus' IN ('pending', 'under_review')")
      ]
    },
    order: [['createdAt', 'ASC']]
  });
};

Merchant.getDocumentStats = async function() {
  const [stats] = await sequelize.query(`
    SELECT
      COUNT(*) as totalMerchants,
      COUNT(CASE WHEN documents->'businessRegistration'->>'path' IS NOT NULL AND documents->'businessRegistration'->>'path' != '' THEN 1 END) as withBusinessReg,
      COUNT(CASE WHEN documents->'idDocument'->>'path' IS NOT NULL AND documents->'idDocument'->>'path' != '' THEN 1 END) as withIdDoc,
      COUNT(CASE WHEN documents->'utilityBill'->>'path' IS NOT NULL AND documents->'utilityBill'->>'path' != '' THEN 1 END) as withUtilityBill,
      COUNT(CASE WHEN
        documents->'businessRegistration'->>'path' IS NOT NULL AND documents->'businessRegistration'->>'path' != '' AND
        documents->'idDocument'->>'path' IS NOT NULL AND documents->'idDocument'->>'path' != '' AND
        documents->'utilityBill'->>'path' IS NOT NULL AND documents->'utilityBill'->>'path' != ''
      THEN 1 END) as completeDocuments,
      COUNT(CASE WHEN verified = true THEN 1 END) as verifiedMerchants,
      COUNT(CASE WHEN
        verified = false AND
        documents->'businessRegistration'->>'path' IS NOT NULL AND documents->'businessRegistration'->>'path' != '' AND
        documents->'idDocument'->>'path' IS NOT NULL AND documents->'idDocument'->>'path' != '' AND
        documents->'utilityBill'->>'path' IS NOT NULL AND documents->'utilityBill'->>'path' != ''
      THEN 1 END) as pendingReview
    FROM merchants
  `, { type: sequelize.QueryTypes.SELECT });

  return stats;
};

module.exports = Merchant;