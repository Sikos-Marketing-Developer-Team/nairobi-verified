const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const BusinessHoursSchema = new mongoose.Schema({
  open: String,
  close: String,
  closed: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const MerchantSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: [true, 'Please add a business name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  businessType: {
    type: String,
    required: [true, 'Please add a business type']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  yearEstablished: {
    type: Number
  },
  website: {
    type: String
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  landmark: String,
  businessHours: {
    monday: BusinessHoursSchema,
    tuesday: BusinessHoursSchema,
    wednesday: BusinessHoursSchema,
    thursday: BusinessHoursSchema,
    friday: BusinessHoursSchema,
    saturday: BusinessHoursSchema,
    sunday: BusinessHoursSchema
  },
  logo: {
    type: String,
    default: ''
  },
  bannerImage: {
    type: String,
    default: ''
  },
  gallery: [String],
  // ENHANCED: Document schema with metadata
  documents: {
    businessRegistration: {
      path: String,
      uploadedAt: { type: Date, default: Date.now },
      originalName: String,
      fileSize: Number,
      mimeType: String
    },
    idDocument: {
      path: String,
      uploadedAt: { type: Date, default: Date.now },
      originalName: String,
      fileSize: Number,
      mimeType: String
    },
    utilityBill: {
      path: String,
      uploadedAt: { type: Date, default: Date.now },
      originalName: String,
      fileSize: Number,
      mimeType: String
    },
    additionalDocs: [{
      path: String,
      uploadedAt: { type: Date, default: Date.now },
      originalName: String,
      fileSize: Number,
      mimeType: String,
      description: String // NEW: Allow description for additional docs
    }],
    // NEW: Document verification tracking
    verificationNotes: String,
    documentsSubmittedAt: Date,
    documentsReviewedAt: Date,
    documentReviewStatus: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected', 'incomplete'],
      default: 'pending'
    }
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedDate: {
    type: Date
  },
  // NEW: Enhanced verification tracking
  verificationHistory: [{
    action: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'rejected', 'resubmitted']
    },
    performedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'AdminUser'
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    notes: String,
    documentsInvolved: [String]
  }],
  rating: {
    type: Number,
    default: 0
  },
  reviews: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  featuredDate: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // Account setup fields
  accountSetupToken: String,
  accountSetupExpire: Date,
  accountSetupDate: Date,
  onboardingStatus: {
    type: String,
    enum: ['credentials_sent', 'account_setup', 'documents_submitted', 'under_review', 'completed'],
    default: 'credentials_sent'
  },
  // Admin creation tracking
  createdByAdmin: {
    type: Boolean,
    default: false
  },
  createdByAdminId: String,
  createdByAdminName: String,
  // Programmatic creation tracking
  createdProgrammatically: {
    type: Boolean,
    default: false
  },
  createdBy: String,
  // NEW: Additional tracking fields
  lastLoginAt: Date,
  profileCompleteness: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  documentsCompleteness: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
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

// NEW: Pre-save middleware to update timestamps and completeness
MerchantSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
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
  const requiredDocs = [
    this.documents?.businessRegistration?.path,
    this.documents?.idDocument?.path,
    this.documents?.utilityBill?.path
  ];
  
  const completedDocs = requiredDocs.filter(doc => doc && doc.trim()).length;
  this.documentsCompleteness = Math.round((completedDocs / requiredDocs.length) * 100);
  
  // Update onboarding status based on completeness
  if (this.documentsCompleteness === 100 && this.onboardingStatus === 'account_setup') {
    this.onboardingStatus = 'documents_submitted';
    this.documents.documentsSubmittedAt = new Date();
    this.documents.documentReviewStatus = 'pending';
  }
  
  next();
});

// Encrypt password using bcrypt
MerchantSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
MerchantSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id, isMerchant: true }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match merchant entered password to hashed password in database
MerchantSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// NEW: Instance method to check document completeness
MerchantSchema.methods.getDocumentStatus = function() {
  const requiredDocs = {
    businessRegistration: !!(this.documents?.businessRegistration?.path),
    idDocument: !!(this.documents?.idDocument?.path),
    utilityBill: !!(this.documents?.utilityBill?.path)
  };
  
  const completedCount = Object.values(requiredDocs).filter(Boolean).length;
  
  return {
    ...requiredDocs,
    additionalDocs: !!(this.documents?.additionalDocs?.length > 0),
    completedCount,
    totalRequired: 3,
    isComplete: completedCount === 3,
    completionPercentage: Math.round((completedCount / 3) * 100),
    canBeVerified: completedCount === 3 && !this.verified,
    status: this.documents?.documentReviewStatus || 'pending'
  };
};

// NEW: Instance method to add verification history entry
MerchantSchema.methods.addVerificationHistory = function(action, performedBy, notes, documentsInvolved = []) {
  if (!this.verificationHistory) {
    this.verificationHistory = [];
  }
  
  this.verificationHistory.push({
    action,
    performedBy,
    notes,
    documentsInvolved
  });
  
  return this.save();
};

// NEW: Static method to get merchants needing review
MerchantSchema.statics.getMerchantsNeedingReview = function() {
  return this.find({
    verified: false,
    'documents.businessRegistration.path': { $exists: true, $ne: '' },
    'documents.idDocument.path': { $exists: true, $ne: '' },
    'documents.utilityBill.path': { $exists: true, $ne: '' },
    'documents.documentReviewStatus': { $in: ['pending', 'under_review'] }
  }).sort({ 'documents.documentsSubmittedAt': 1 });
};

// NEW: Static method to get document statistics
MerchantSchema.statics.getDocumentStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalMerchants: { $sum: 1 },
        withBusinessReg: {
          $sum: {
            $cond: [
              { $and: [
                { $ne: ['$documents.businessRegistration.path', null] },
                { $ne: ['$documents.businessRegistration.path', ''] }
              ]}, 1, 0
            ]
          }
        },
        withIdDoc: {
          $sum: {
            $cond: [
              { $and: [
                { $ne: ['$documents.idDocument.path', null] },
                { $ne: ['$documents.idDocument.path', ''] }
              ]}, 1, 0
            ]
          }
        },
        withUtilityBill: {
          $sum: {
            $cond: [
              { $and: [
                { $ne: ['$documents.utilityBill.path', null] },
                { $ne: ['$documents.utilityBill.path', ''] }
              ]}, 1, 0
            ]
          }
        },
        completeDocuments: {
          $sum: {
            $cond: [
              { $and: [
                { $ne: ['$documents.businessRegistration.path', null] },
                { $ne: ['$documents.businessRegistration.path', ''] },
                { $ne: ['$documents.idDocument.path', null] },
                { $ne: ['$documents.idDocument.path', ''] },
                { $ne: ['$documents.utilityBill.path', null] },
                { $ne: ['$documents.utilityBill.path', ''] }
              ]}, 1, 0
            ]
          }
        },
        verifiedMerchants: { $sum: { $cond: [{ $eq: ['$verified', true] }, 1, 0] } },
        pendingReview: {
          $sum: {
            $cond: [
              { $and: [
                { $eq: ['$verified', false] },
                { $ne: ['$documents.businessRegistration.path', null] },
                { $ne: ['$documents.businessRegistration.path', ''] },
                { $ne: ['$documents.idDocument.path', null] },
                { $ne: ['$documents.idDocument.path', ''] },
                { $ne: ['$documents.utilityBill.path', null] },
                { $ne: ['$documents.utilityBill.path', ''] }
              ]}, 1, 0
            ]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalMerchants: 0,
    withBusinessReg: 0,
    withIdDoc: 0,
    withUtilityBill: 0,
    completeDocuments: 0,
    verifiedMerchants: 0,
    pendingReview: 0
  };
};

// NEW: Create indexes for better query performance
MerchantSchema.index({ verified: 1 });
MerchantSchema.index({ 'documents.documentsSubmittedAt': 1 });
MerchantSchema.index({ 'documents.documentReviewStatus': 1 });
MerchantSchema.index({ onboardingStatus: 1 });
MerchantSchema.index({ createdAt: -1 });
MerchantSchema.index({ businessType: 1 });

module.exports = mongoose.model('Merchant', MerchantSchema);