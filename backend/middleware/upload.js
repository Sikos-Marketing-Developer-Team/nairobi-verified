const multer = require('multer');
const path = require('path');
const { 
  productImageUpload, 
  merchantImageUpload, 
  documentUpload 
} = require('../services/cloudinaryService');

// Legacy local storage (keeping for backward compatibility)
const imageStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/images'));
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const documentStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../Uploads/documents'));
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  const imageFileTypes = /jpeg|jpg|png|gif|webp/;
  const documentFileTypes = /pdf|doc|docx|txt/;
  
  const extname = imageFileTypes.test(path.extname(file.originalname).toLowerCase()) || 
                 documentFileTypes.test(path.extname(file.originalname).toLowerCase());
  
  const mimetype = imageFileTypes.test(file.mimetype) || documentFileTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Invalid file type!'));
  }
};

// Legacy local uploads (keeping for backward compatibility)
const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: fileFilter
});

const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 10000000 }, // 10MB
  fileFilter: fileFilter
});

// Cloudinary uploads (new preferred method)
const uploadProductImages = productImageUpload;
const uploadMerchantImages = merchantImageUpload;
const uploadDocs = documentUpload; // Renamed to avoid conflict

module.exports = {
  // Legacy uploads
  uploadImage,
  uploadDocument,
  
  // New Cloudinary uploads
  uploadProductImages,
  uploadMerchantImages,
  uploadDocs
};