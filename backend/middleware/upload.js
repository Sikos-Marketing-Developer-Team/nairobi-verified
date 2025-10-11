const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '../uploads');
const imagesDir = path.join(uploadsDir, 'images');
const documentsDir = path.join(uploadsDir, 'documents');

[uploadsDir, imagesDir, documentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Image storage configuration
const imageStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, imagesDir);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Document storage configuration
const documentStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, documentsDir);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File type filter
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

// Upload configurations
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

module.exports = {
  uploadImage,
  uploadDocument,
  // Aliases for consistency
  uploadProductImages: uploadImage,
  uploadMerchantImages: uploadImage,
  uploadDocuments: uploadDocument
};