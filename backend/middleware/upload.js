const multer = require('multer');
const path = require('path');

// Set storage engine for images
const imageStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/images'));
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Set storage engine for documents
const documentStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/documents'));
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allowed image extensions
  const imageFileTypes = /jpeg|jpg|png|gif/;
  // Allowed document extensions
  const documentFileTypes = /pdf|doc|docx|txt/;
  
  // Check extension
  const extname = imageFileTypes.test(path.extname(file.originalname).toLowerCase()) || 
                 documentFileTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check mime
  const mimetype = imageFileTypes.test(file.mimetype) || documentFileTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Invalid file type!'));
  }
};

// Initialize upload for images
const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: fileFilter
});

// Initialize upload for documents
const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 10000000 }, // 10MB
  fileFilter: fileFilter
});

module.exports = {
  uploadImage,
  uploadDocument
};