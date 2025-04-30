const express = require('express');
const router = express.Router();
const { isAuthenticated, isEmailVerified } = require('../middleware/authMiddleware');
const { 
  upload, 
  uploadDocuments, 
  getMerchantProfile, 
  updateMerchantProfile 
} = require('../controllers/merchantController');

// Get merchant profile
router.get('/profile', isAuthenticated, isEmailVerified, getMerchantProfile);

// Update merchant profile
router.put('/profile', isAuthenticated, isEmailVerified, updateMerchantProfile);

// Upload merchant documents
router.post(
  '/upload-documents',
  isAuthenticated,
  isEmailVerified,
  upload.fields([
    { name: 'businessRegistration', maxCount: 1 },
    { name: 'taxCertificate', maxCount: 1 },
    { name: 'idDocument', maxCount: 1 }
  ]),
  uploadDocuments
);

module.exports = router;