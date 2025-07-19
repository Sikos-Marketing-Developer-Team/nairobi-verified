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
  documents: {
    businessRegistration: String,
    idDocument: String,
    utilityBill: String,
    additionalDocs: [String]
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedDate: {
    type: Date
  },
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
    enum: ['credentials_sent', 'completed'],
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
  createdAt: {
    type: Date,
    default: Date.now
  }
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

module.exports = mongoose.model('Merchant', MerchantSchema);