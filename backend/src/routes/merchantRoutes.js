const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const { 
  upload, 
  uploadDocuments, 
  getMerchantProfile, 
  updateMerchantProfile 
} = require('../controllers/merchantController');

// Get merchant profile
router.get('/profile', isAuthenticated, getMerchantProfile);

// Update merchant profile
router.put('/profile', isAuthenticated, updateMerchantProfile);

// Upload merchant documents
router.post(
  '/upload-documents',
  isAuthenticated,
  upload.fields([
    { name: 'businessRegistration', maxCount: 1 },
    { name: 'taxCertificate', maxCount: 1 },
    { name: 'idDocument', maxCount: 1 }
  ]),
  uploadDocuments
);

module.exports = router; 