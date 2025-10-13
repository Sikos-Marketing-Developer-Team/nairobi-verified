# NAIROBI VERIFIED
## Sample Code Extracts Document

**For:** Kenya Copyright Board (KECOBO) Registration  
**Author:** Joseph Mwangi  
**Company:** Sikos Marketing  
**Date:** October 13, 2025

---

## IMPORTANT NOTICE

**This document contains representative code samples and technical specifications that demonstrate the originality and complexity of the Nairobi Verified platform. In accordance with standard software industry practices and legal requirements, the complete source code is not included in this copyright submission to maintain:**

- **Trade Secret Protection**
- **Competitive Advantage Security**  
- **System Security Integrity**
- **Customer Data Protection**
- **Business Confidentiality**

The samples provided below are sufficient to demonstrate the original authorship, technical complexity, and innovative nature of the software system while protecting proprietary implementation details.

---

## 1. DATABASE SCHEMA DESIGN SAMPLES

### 1.1 Merchant Model Structure (PostgreSQL/Sequelize)

```javascript
// Merchant Model - Core business entity with verification system
const MerchantPG = sequelize.define('Merchant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  businessName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verifiedDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  businessType: {
    type: DataTypes.ENUM('restaurant', 'retail', 'services', 'technology', 'healthcare', 'other'),
    allowNull: false
  },
  // JSONB field for flexible document storage
  documents: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  onboardingStatus: {
    type: DataTypes.ENUM('pending', 'documents_pending', 'under_review', 'completed'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'merchants',
  timestamps: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['verified'] },
    { fields: ['businessType'] }
  ]
});

// Custom method for document status analysis
MerchantPG.prototype.getDocumentStatus = function() {
  const requiredDocs = {
    businessRegistration: !!(this.documents?.businessRegistration?.path),
    idDocument: !!(this.documents?.idDocument?.path),
    utilityBill: !!(this.documents?.utilityBill?.path)
  };
  
  const submittedCount = Object.values(requiredDocs).filter(Boolean).length;
  return {
    ...requiredDocs,
    completionPercentage: Math.round((submittedCount / 3) * 100),
    isComplete: submittedCount === 3,
    nextStep: submittedCount < 3 ? 'Upload verification documents' : 'Wait for admin verification'
  };
};
```

### 1.2 Advanced Order System with JSONB Storage

```javascript
// Order Model - E-commerce functionality with flexible item storage
const OrderPG = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  merchantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'merchants',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // JSONB for flexible order items structure
  items: {
    type: DataTypes.JSONB,
    allowNull: false,
    validate: {
      isValidItems(value) {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('Order must contain at least one item');
        }
      }
    }
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: true // DPO payment reference
  }
});

// Association definitions
OrderPG.belongsTo(MerchantPG, { foreignKey: 'merchantId', as: 'merchant' });
OrderPG.belongsTo(UserPG, { foreignKey: 'userId', as: 'customer' });
```

---

## 2. AUTHENTICATION SYSTEM IMPLEMENTATION

### 2.1 JWT Authentication Middleware

```javascript
// Advanced JWT authentication with role-based access control
const jwt = require('jsonwebtoken');
const AdminUserPG = require('../models/AdminUserPG');
const UserPG = require('../models/UserPG');
const MerchantPG = require('../models/MerchantPG');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Multi-role user resolution
    let user = null;
    if (decoded.isAdmin) {
      user = await AdminUserPG.findByPk(decoded.id);
    } else if (decoded.isMerchant) {
      user = await MerchantPG.findByPk(decoded.id);
    } else {
      user = await UserPG.findByPk(decoded.id);
    }

    if (!user) {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid token: User not found' 
      });
    }

    // Attach user info to request
    req.user = user;
    req.userRole = decoded.isAdmin ? 'admin' : decoded.isMerchant ? 'merchant' : 'customer';
    
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
};

// Role-based authorization middleware
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    next();
  };
};

module.exports = { authenticateToken, requireRole };
```

### 2.2 Google OAuth Integration

```javascript
// Google OAuth strategy implementation
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check for existing merchant first
    const merchant = await MerchantPG.findOne({ 
      where: { email: profile.emails[0].value } 
    });
    
    if (merchant) {
      if (!merchant.verified) {
        return done(null, false, { 
          message: 'Merchant account requires verification' 
        });
      }
      return done(null, { user: merchant, type: 'merchant' });
    }

    // Check for regular user
    let user = await UserPG.findOne({ 
      where: { email: profile.emails[0].value } 
    });

    if (!user) {
      // Create new user from Google profile
      user = await UserPG.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        isActive: true
      });
    }

    return done(null, { user, type: 'customer' });
  } catch (error) {
    return done(error, null);
  }
}));
```

---

## 3. BUSINESS VERIFICATION SYSTEM

### 3.1 Document Processing Controller

```javascript
// Advanced document verification workflow
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Secure file upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/documents');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, JPEG, JPG, and PNG files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Document upload endpoint with validation
const uploadDocuments = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const merchant = await MerchantPG.findByPk(merchantId);

    if (!merchant) {
      return res.status(404).json({ 
        success: false, 
        error: 'Merchant not found' 
      });
    }

    const documentUpdates = {};
    
    // Process uploaded files
    if (req.files) {
      for (const [fieldname, files] of Object.entries(req.files)) {
        const file = Array.isArray(files) ? files[0] : files;
        
        documentUpdates[fieldname] = {
          path: file.path,
          originalName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date()
        };
      }
    }

    // Update merchant documents
    const updatedDocuments = {
      ...merchant.documents,
      ...documentUpdates,
      documentsSubmittedAt: new Date(),
      documentReviewStatus: 'pending_review'
    };

    await merchant.update({ documents: updatedDocuments });

    // Analyze document completeness
    const documentStatus = merchant.getDocumentStatus();
    
    // Notify admin of new documents for review
    if (documentStatus.isComplete) {
      // Trigger admin notification system
      await notifyAdminOfPendingVerification(merchantId);
    }

    res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully',
      documentStatus,
      merchant: {
        id: merchant.id,
        businessName: merchant.businessName,
        verified: merchant.verified
      }
    });

  } catch (error) {
    console.error('Document upload error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};
```

### 3.2 Admin Verification Controller

```javascript
// Administrative verification system
const verifyMerchant = async (req, res) => {
  try {
    const { id: merchantId } = req.params;
    const { notes } = req.body;
    
    const merchant = await MerchantPG.findByPk(merchantId);
    if (!merchant) {
      return res.status(404).json({ 
        success: false, 
        error: 'Merchant not found' 
      });
    }

    // Verify required documents are present
    const documentStatus = merchant.getDocumentStatus();
    if (!documentStatus.isComplete) {
      return res.status(400).json({
        success: false,
        error: 'Cannot verify: Required documents missing',
        missingDocuments: Object.entries(documentStatus)
          .filter(([key, value]) => key !== 'completionPercentage' && !value)
          .map(([key]) => key)
      });
    }

    // Update merchant verification status
    await merchant.update({
      verified: true,
      verifiedDate: new Date(),
      onboardingStatus: 'completed',
      documents: {
        ...merchant.documents,
        documentReviewStatus: 'approved',
        reviewedAt: new Date(),
        reviewedBy: req.user.id,
        reviewNotes: notes
      }
    });

    // Send verification confirmation email
    await sendVerificationEmail(merchant);

    // Create verification audit log
    await createAuditLog({
      action: 'MERCHANT_VERIFIED',
      merchantId: merchant.id,
      adminId: req.user.id,
      details: { notes }
    });

    res.status(200).json({
      success: true,
      message: 'Merchant verified successfully',
      merchant: {
        id: merchant.id,
        businessName: merchant.businessName,
        verified: merchant.verified,
        verifiedDate: merchant.verifiedDate
      }
    });

  } catch (error) {
    console.error('Merchant verification error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Verification process failed' 
    });
  }
};
```

---

## 4. FRONTEND REACT COMPONENTS

### 4.1 Advanced Form Validation Component

```typescript
// Merchant registration form with comprehensive validation
import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zod validation schema
const merchantRegistrationSchema = z.object({
  businessName: z
    .string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must not exceed 100 characters'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^254[0-9]{9}$/, 'Please enter a valid Kenyan phone number (254XXXXXXXXX)'),
  businessType: z
    .enum(['restaurant', 'retail', 'services', 'technology', 'healthcare', 'other'], {
      required_error: 'Please select a business type'
    }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character')
});

type MerchantRegistrationForm = z.infer<typeof merchantRegistrationSchema>;

const MerchantRegistrationComponent: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    trigger
  } = useForm<MerchantRegistrationForm>({
    resolver: zodResolver(merchantRegistrationSchema),
    mode: 'onChange'
  });

  const onSubmit = useCallback(async (data: MerchantRegistrationForm) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/merchants/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        // Handle successful registration
        setStep(4); // Move to confirmation step
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      // Handle error state
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const validateStep = useCallback(async (stepNumber: number) => {
    const fieldsToValidate = {
      1: ['businessName', 'email', 'phone'],
      2: ['businessType', 'password'],
      3: [] // Document upload step
    };

    const fields = fieldsToValidate[stepNumber as keyof typeof fieldsToValidate];
    return await trigger(fields as any);
  }, [trigger]);

  // Progressive form validation with real-time feedback
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Name *
              </label>
              <input
                type="text"
                {...register('businessName')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                          ${errors.businessName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your business name"
              />
              {errors.businessName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.businessName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                {...register('email')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                          ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="business@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-6 flex justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
          )}
          
          {step < 3 ? (
            <button
              type="button"
              onClick={async () => {
                const isStepValid = await validateStep(step);
                if (isStepValid) setStep(step + 1);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MerchantRegistrationComponent;
```

### 4.2 Real-time Document Upload Component

```typescript
// Advanced document upload with progress tracking
import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, AlertCircle, File } from 'lucide-react';

interface DocumentUploadProps {
  merchantId: string;
  onUploadComplete: (status: DocumentStatus) => void;
}

interface DocumentStatus {
  businessRegistration: boolean;
  idDocument: boolean;
  utilityBill: boolean;
  completionPercentage: number;
}

const DocumentUploadComponent: React.FC<DocumentUploadProps> = ({
  merchantId,
  onUploadComplete
}) => {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[], documentType: string) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));

    const formData = new FormData();
    formData.append(documentType, file);

    try {
      const response = await fetch(`/api/merchants/${merchantId}/documents`, {
        method: 'PUT',
        body: formData,
        // XMLHttpRequest for progress tracking
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(prev => ({ 
            ...prev, 
            [documentType]: percentCompleted 
          }));
        }
      });

      const result = await response.json();

      if (result.success) {
        setUploadedFiles(prev => ({ ...prev, [documentType]: file }));
        onUploadComplete(result.documentStatus);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setUploadProgress(prev => ({ ...prev, [documentType]: 100 }));
    }
  }, [merchantId, onUploadComplete]);

  const createDropzone = (documentType: string, label: string) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (files) => onDrop(files, documentType),
      accept: {
        'application/pdf': ['.pdf'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png']
      },
      maxSize: 5 * 1024 * 1024, // 5MB
      multiple: false
    });

    const isUploaded = uploadedFiles[documentType];
    const progress = uploadProgress[documentType] || 0;

    return (
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                   ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
                   ${isUploaded ? 'border-green-400 bg-green-50' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-2">
          {isUploaded ? (
            <CheckCircle className="h-8 w-8 text-green-500" />
          ) : (
            <Upload className="h-8 w-8 text-gray-400" />
          )}
          
          <h4 className="font-medium text-gray-900">{label}</h4>
          
          {isUploaded ? (
            <p className="text-sm text-green-600">
              ✓ {uploadedFiles[documentType].name}
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Drop file here or click to upload
            </p>
          )}
          
          {progress > 0 && progress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Upload Verification Documents
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {createDropzone('businessRegistration', 'Business Registration Certificate')}
        {createDropzone('idDocument', 'National ID / Passport')}
        {createDropzone('utilityBill', 'Utility Bill / Address Proof')}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Upload Requirements:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Maximum file size: 5MB</li>
          <li>• Accepted formats: PDF, JPG, PNG</li>
          <li>• Documents must be clear and legible</li>
          <li>• All documents are required for verification</li>
        </ul>
      </div>
    </div>
  );
};

export default DocumentUploadComponent;
```

---

## 5. API INTEGRATION SAMPLES

### 5.1 Payment Integration (DPO Group)

```javascript
// DPO Group payment processing integration
const crypto = require('crypto');
const axios = require('axios');

class DPOPaymentService {
  constructor() {
    this.companyToken = process.env.DPO_COMPANY_TOKEN;
    this.serviceType = process.env.DPO_SERVICE_TYPE;
    this.apiUrl = process.env.DPO_API_URL;
  }

  // Create payment token for transaction
  async createPaymentToken(orderData) {
    const { orderId, amount, currency, customerEmail, merchantId } = orderData;
    
    const paymentData = {
      companyToken: this.companyToken,
      serviceType: this.serviceType,
      paymentAmount: amount,
      paymentCurrency: currency || 'KES',
      customerEmail: customerEmail,
      customerPhone: orderData.customerPhone,
      companyRef: `NV-${orderId}`,
      redirectURL: `${process.env.FRONTEND_URL}/payment/success`,
      backURL: `${process.env.FRONTEND_URL}/payment/cancel`,
      companyAccRef: merchantId
    };

    try {
      const response = await axios.post(`${this.apiUrl}/createToken`, paymentData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.result === '000') {
        return {
          success: true,
          token: response.data.transToken,
          paymentUrl: `${this.apiUrl}/pay?ID=${response.data.transToken}`
        };
      } else {
        throw new Error(response.data.resultExplanation);
      }
    } catch (error) {
      console.error('DPO payment token creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify payment status
  async verifyPayment(transactionToken) {
    try {
      const verifyData = {
        companyToken: this.companyToken,
        transToken: transactionToken
      };

      const response = await axios.post(`${this.apiUrl}/verifyToken`, verifyData);
      
      return {
        success: response.data.result === '000',
        status: response.data.result,
        amount: response.data.customerAmount,
        currency: response.data.customerCurrency,
        reference: response.data.companyRef
      };
    } catch (error) {
      console.error('Payment verification failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Payment processing endpoint
const processPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;
    
    const order = await OrderPG.findByPk(orderId, {
      include: [
        { model: MerchantPG, as: 'merchant' },
        { model: UserPG, as: 'customer' }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const dpoService = new DPOPaymentService();
    const paymentResult = await dpoService.createPaymentToken({
      orderId: order.id,
      amount: order.totalAmount,
      currency: 'KES',
      customerEmail: order.customer.email,
      customerPhone: order.customer.phone,
      merchantId: order.merchant.id
    });

    if (paymentResult.success) {
      // Update order with payment token
      await order.update({
        paymentId: paymentResult.token,
        status: 'payment_pending'
      });

      res.status(200).json({
        success: true,
        paymentUrl: paymentResult.paymentUrl,
        token: paymentResult.token
      });
    } else {
      res.status(400).json({
        success: false,
        error: paymentResult.error
      });
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment processing failed'
    });
  }
};
```

---

## 6. CONCLUSION

These code samples demonstrate the **original, complex, and innovative nature** of the Nairobi Verified platform. The technical implementations show:

### **Technical Innovation:**
- Advanced PostgreSQL schema design with JSONB for flexible data storage
- Sophisticated authentication system with multi-role support
- Comprehensive document upload and verification workflows
- Real-time payment processing with DPO Group integration
- Progressive web application with modern React/TypeScript implementation

### **Security Implementation:**
- JWT-based authentication with role-based access control
- Secure file upload with validation and virus scanning
- Encrypted data storage and secure API endpoints
- PCI DSS compliant payment processing
- Comprehensive input validation and sanitization

### **Business Logic Complexity:**
- Multi-step business verification workflow
- Real-time document status tracking
- Advanced order management with flexible item storage
- Integrated payment processing with multiple African payment methods
- Comprehensive audit logging and tracking systems

### **Code Quality and Architecture:**
- Modern TypeScript implementation with strict type checking
- Comprehensive error handling and validation
- Modular, scalable architecture design
- Performance optimization and caching strategies
- Extensive documentation and code comments

**These samples represent a small portion of the complete system while demonstrating the sophistication, originality, and technical excellence of the Nairobi Verified platform, supporting its copyright registration as a significant software work.**

---

**Note:** This document contains representative samples only. The complete source code remains proprietary and confidential to maintain trade secret protection and competitive advantage.