const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PASSWORD_VALIDATION } = require('../config/constants');

// Reduce schemas complexity
const BusinessHoursSchema = new mongoose.Schema({
  open: String,
  close: String,
  closed: { type: Boolean, default: false }
}, { _id: false });

const DocumentsSchema = new mongoose.Schema({
  businessRegistration: {
    path: { type: String, default: '' },
    uploadedAt: Date,
    originalName: String,
    fileSize: Number,
    mimeType: String,
    cloudinaryUrl: String,
    publicId: String
  },
  idDocument: {
    path: { type: String, default: '' },
    uploadedAt: Date,
    originalName: String,
    fileSize: Number,
    mimeType: String,
    cloudinaryUrl: String,
    publicId: String
  },
  utilityBill: {
    path: { type: String, default: '' },
    uploadedAt: Date,
    originalName: String,
    fileSize: Number,
    mimeType: String,
    cloudinaryUrl: String,
    publicId: String
  },
  additionalDocs: [{
    path: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    originalName: String,
    fileSize: Number,
    mimeType: String,
    cloudinaryUrl: String,
    publicId: String,
    description: String
  }],
  documentsSubmittedAt: Date,
  documentsReviewedAt: Date,
  documentReviewStatus: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  verificationNotes: String
}, { _id: false });

const MerchantSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  },
  businessName: {
    type: String,
    required: [true, 'Please add a business name'],
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    index: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 8,
    select: false
  },
  businessType: {
    type: String,
    required: [true, 'Please add a business type'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  yearEstablished: Number,
  website: String,
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    index: true
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
  logo: { type: String, default: '' },
  bannerImage: { type: String, default: '' },
  gallery: { type: [String], default: [] },
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  whatsappNumber: { type: String, default: '', trim: true },
  services: [{
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: String, trim: true }, // Stored as string to allow "Contact for pricing" or "KES 1,000"
    duration: { type: String, trim: true }, // e.g., "1 hour", "2 days"
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  }],
  documents: { type: DocumentsSchema, default: {} },
  verified: { type: Boolean, default: false, index: true },
  verifiedDate: Date,
  isActive: { type: Boolean, default: false, index: true },
  activatedDate: Date,
  deactivatedDate: Date,
  deactivationReason: String,
  verificationHistory: [{
    action: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'rejected', 'resubmitted', 'activated', 'deactivated']
    },
    performedBy: { type: mongoose.Schema.ObjectId, ref: 'AdminUser' },
    performedAt: { type: Date, default: Date.now },
    notes: String,
    documentsInvolved: [String]
  }],
  rating: { type: Number, default: 0, index: true },
  reviews: { type: Number, default: 0 },
  featured: { type: Boolean, default: false, index: true },
  featuredDate: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  tempPasswordExpiry: Date,
  passwordChanged: { type: Boolean, default: false },
  passwordChangedAt: Date,
  accountSetupToken: String,
  accountSetupExpire: Date,
  accountSetupDate: Date,
  onboardingStatus: {
    type: String,
    enum: ['credentials_sent', 'account_setup', 'documents_submitted', 'under_review', 'completed'],
    default: 'credentials_sent',
    index: true
  },
  createdByAdmin: { type: Boolean, default: false },
  createdByAdminId: String,
  createdByAdminName: String,
  createdProgrammatically: { type: Boolean, default: false },
  createdBy: String,
  lastLoginAt: Date,
  profileCompleteness: { type: Number, default: 0, min: 0, max: 100 },
  documentsCompleteness: { type: Number, default: 0, min: 0, max: 100 },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true, // Let Mongoose handle createdAt/updatedAt automatically
  collection: 'merchants'
});

// OPTIMIZED: Combine pre-save hooks into one to reduce overhead
MerchantSchema.pre('save', async function(next) {
  try {
    // Only calculate profile completeness if relevant fields changed
    if (this.isNew || this.isModified('businessName') || this.isModified('description') || 
        this.isModified('businessType') || this.isModified('website') || this.isModified('logo')) {
      
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
      
      const completedRequired = profileFields.filter(f => f && String(f).trim().length > 0).length;
      const completedOptional = optionalFields.filter(f => !!f).length;
      
      this.profileCompleteness = Math.round(
        ((completedRequired / 7) * 70) + ((completedOptional / 4) * 30)
      );
    }

    // CRITICAL: Hash password only if modified (avoid rehashing on every save)
    if (this.isModified('password')) {
      // Validate password format before hashing
      if (!PASSWORD_VALIDATION.REGEX.test(this.password)) {
        const error = new Error(PASSWORD_VALIDATION.ERROR_MESSAGE);
        error.statusCode = 400;
        return next(error);
      }

      // OPTIMIZED: Reduce bcrypt rounds from 10 to 8 for faster hashing
      // Security note: 8 rounds is still secure (2^8 = 256 iterations)
      const salt = await bcrypt.genSalt(8);
      this.password = await bcrypt.hash(this.password, salt);
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Instance Methods
MerchantSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, isMerchant: true }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

MerchantSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

MerchantSchema.methods.getDocumentStatus = function() {
  const docs = this.documents || {};
  const requiredDocs = {
    businessRegistration: !!(docs.businessRegistration?.path),
    idDocument: !!(docs.idDocument?.path),
    utilityBill: !!(docs.utilityBill?.path)
  };
  
  const completedCount = Object.values(requiredDocs).filter(Boolean).length;
  
  return {
    ...requiredDocs,
    additionalDocs: !!(docs.additionalDocs?.length > 0),
    completedCount,
    totalRequired: 3,
    isComplete: completedCount === 3,
    completionPercentage: Math.round((completedCount / 3) * 100),
    canBeVerified: completedCount === 3 && !this.verified,
    status: docs.documentReviewStatus || 'pending'
  };
};

MerchantSchema.methods.getAccountStatus = function() {
  return {
    isActive: this.isActive,
    verified: this.verified,
    canActivate: this.verified,
    status: this.isActive ? 'active' : 'inactive',
    activatedDate: this.activatedDate,
    deactivatedDate: this.deactivatedDate,
    deactivationReason: this.deactivationReason
  };
};

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

// Static Methods
MerchantSchema.statics.getMerchantsNeedingReview = function() {
  return this.find({
    verified: false,
    'documents.businessRegistration.path': { $exists: true, $ne: '' },
    'documents.idDocument.path': { $exists: true, $ne: '' },
    'documents.utilityBill.path': { $exists: true, $ne: '' },
    'documents.documentReviewStatus': { $in: ['pending', 'under_review'] }
  })
  .sort({ 'documents.documentsSubmittedAt': 1 })
  .lean(); // Use lean() for read-only operations
};

MerchantSchema.statics.getDocumentStats = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        counts: [
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
              verifiedMerchants: { $sum: { $cond: ['$verified', 1, 0] } },
              activeMerchants: { $sum: { $cond: ['$isActive', 1, 0] } },
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
        ]
      }
    },
    { $unwind: '$counts' },
    { $replaceRoot: { newRoot: '$counts' } }
  ]);
  
  return stats[0] || {
    totalMerchants: 0,
    withBusinessReg: 0,
    withIdDoc: 0,
    withUtilityBill: 0,
    completeDocuments: 0,
    verifiedMerchants: 0,
    activeMerchants: 0,
    pendingReview: 0
  };
};

// Compound indexes for common queries
MerchantSchema.index({ verified: 1, isActive: 1 });
MerchantSchema.index({ businessType: 1, verified: 1 });
MerchantSchema.index({ rating: -1, reviews: -1 });
MerchantSchema.index({ 'documents.documentReviewStatus': 1, verified: 1 });
MerchantSchema.index({ email: 1 }, { unique: true });


// 1. List queries (most important)
MerchantSchema.index({ createdAt: -1 });
MerchantSchema.index({ businessType: 1, createdAt: -1 });
MerchantSchema.index({ verified: 1, featured: -1, createdAt: -1 });

// 2. Search optimization
MerchantSchema.index({ 
  businessName: 'text', 
  description: 'text', 
  businessType: 'text' 
});

// 3. Email lookup
MerchantSchema.index({ email: 1 }, { unique: true });

// 4. Featured merchants
MerchantSchema.index({ featured: 1, rating: -1 });

module.exports = mongoose.model('Merchant', MerchantSchema);