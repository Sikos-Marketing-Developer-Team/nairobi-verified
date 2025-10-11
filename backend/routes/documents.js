const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  uploadDocument,
  getMerchantDocuments,
  getAllDocuments,
  getDocumentById,
  reviewDocument,
  viewDocument,
  deleteDocument,
  getDocumentStats
} = require('../controllers/documentController');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only PDF, images, and common document formats
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, and Word documents are allowed.'), false);
    }
  }
});

// Document routes
router.post('/merchants/:merchantId/documents', upload.single('document'), uploadDocument);
router.get('/merchants/:merchantId/documents', getMerchantDocuments);
router.get('/documents/:id', getDocumentById);
router.get('/documents/:id/view', viewDocument);
router.delete('/documents/:id', deleteDocument);

// Admin routes
router.get('/admin/documents', getAllDocuments);
router.put('/admin/documents/:id/review', reviewDocument);
router.get('/admin/documents/stats', getDocumentStats);

module.exports = router;