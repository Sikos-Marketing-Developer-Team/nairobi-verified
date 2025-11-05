const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinaryUploadCounter, cloudinaryDeleteCounter, cloudinaryOperationDuration } = require('../utils/metrics'); // MONITORING: Import metrics

// Lazy configuration function
let configured = false;
function ensureConfigured() {
  if (!configured) {
    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      
      // Debug: Log config (without exposing secret)
      console.log('🔧 Cloudinary configured:', {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing',
        api_secret: process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing'
      });
      
      configured = true;
    } catch (error) {
      console.error('❌ Cloudinary configuration error:', error);
      throw error;
    }
  }
}

// Call configuration immediately when module loads
try {
  ensureConfigured();
} catch (error) {
  console.error('⚠️ Failed to configure Cloudinary on module load:', error.message);
}

// Create storage for different types of uploads
const createCloudinaryStorage = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp']) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `nairobi-verified/${folder}`,
      allowed_formats: allowedFormats,
      transformation: [
        { width: 1000, height: 1000, crop: 'limit', quality: 'auto' }
      ],
      public_id: (req, file) => {
        const timestamp = Date.now();
        const originalName = file.originalname.split('.')[0];
        return `${originalName}-${timestamp}`;
      }
    },
  });
};

// Create storage for documents (PDF, images)
const createDocumentStorage = (folder) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `nairobi-verified/documents/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      resource_type: 'auto', // Allows both images and raw files like PDFs
      public_id: (req, file) => {
        const timestamp = Date.now();
        const originalName = file.originalname.split('.')[0];
        return `${originalName}-${timestamp}`;
      }
    },
  });
};

// Multer configurations for different upload types
const productImageUploadRaw = multer({
  storage: createCloudinaryStorage('products'),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('📎 File filter - processing file:', file.originalname, 'mimetype:', file.mimetype);
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      console.warn('⚠️ Rejected non-image file:', file.originalname);
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Wrap with error handler for .any() usage
const productImageUpload = (req, res, next) => {
  productImageUploadRaw.any()(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      console.error('❌ Error type:', err.constructor.name);
      console.error('❌ Error message:', err.message);
      return res.status(400).json({
        success: false,
        error: err.message || 'File upload failed',
        errorType: err.constructor.name
      });
    }
    next();
  });
};

const merchantImageUpload = multer({
  storage: createCloudinaryStorage('merchants'),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const documentUpload = multer({
  storage: createDocumentStorage('merchant-docs'),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed'), false);
    }
  }
});

// Helper functions
const deleteFromCloudinary = async (publicId) => {
  ensureConfigured(); // Ensure Cloudinary is configured
  const end = cloudinaryOperationDuration.startTimer(); // MONITORING: Start timer
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    cloudinaryDeleteCounter.inc(); // MONITORING: Increment delete
    end(); // MONITORING: Record duration
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    end(); // MONITORING: Record duration
    throw error;
  }
};

const uploadToCloudinary = async (filePath, options = {}) => {
  ensureConfigured(); // Ensure Cloudinary is configured
  const end = cloudinaryOperationDuration.startTimer(); // MONITORING: Start timer
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'nairobi-verified',
      ...options
    });
    cloudinaryUploadCounter.inc({ type: options.resource_type || 'image' }); // MONITORING: Increment upload
    end(); // MONITORING: Record duration
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    end(); // MONITORING: Record duration
    throw error;
  }
};

// Get optimized image URL
const getOptimizedImageUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    ...options
  });
};

module.exports = {
  cloudinary,
  ensureConfigured,
  productImageUpload: productImageUploadWithErrorHandler,
  merchantImageUpload,
  documentUpload,
  deleteFromCloudinary,
  uploadToCloudinary,
  getOptimizedImageUrl,
  createCloudinaryStorage,
  createDocumentStorage
};