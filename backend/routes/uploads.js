const express = require('express'); 
const router = express.Router();
const { uploadProductImages, uploadMerchantImages, uploadDocs } = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const { protectAdmin } = require('../middleware/adminAuth');
const asyncHandler = require('express-async-handler');

// @desc Upload product images
// @route POST /api/uploads/products
// @access Private (Merchant/Admin)
const uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }

  const uploadedFiles = req.files.map(file => ({
    url: file.path, // Cloudinary URL
    publicId: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype
  }));

  res.status(200).json({
    success: true,
    message: 'Images uploaded successfully',
    files: uploadedFiles
  });
});

// @desc Upload merchant images (logo, banner, gallery)
// @route POST /api/uploads/merchants
// @access Private (Merchant/Admin)
const uploadMerchantImage = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }

  const uploadedFiles = req.files.map(file => ({
    url: file.path,
    publicId: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype
  }));

  res.status(200).json({
    success: true,
    message: 'Images uploaded successfully',
    files: uploadedFiles
  });
});

// @desc Upload merchant verification documents (FIXED - Using fields)
// @route POST /api/uploads/documents
// @access Private (Merchant/Admin)
const uploadDocument = asyncHandler(async (req, res) => {
  console.log('📁 Document upload request received');
  console.log('Files:', req.files);
  console.log('Body:', req.body);

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }

  // Process each document type
  const uploadedDocuments = {
    businessRegistration: null,
    idDocument: null,
    utilityBill: null,
    additionalDocs: []
  };

  // Business Registration
  if (req.files.businessRegistration && req.files.businessRegistration[0]) {
    const file = req.files.businessRegistration[0];
    uploadedDocuments.businessRegistration = {
      url: file.path, // Cloudinary URL
      path: file.path, // For backward compatibility
      publicId: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date()
    };
    console.log('✅ Business Registration uploaded:', file.originalname);
  }

  // ID Document
  if (req.files.idDocument && req.files.idDocument[0]) {
    const file = req.files.idDocument[0];
    uploadedDocuments.idDocument = {
      url: file.path,
      path: file.path,
      publicId: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date()
    };
    console.log('✅ ID Document uploaded:', file.originalname);
  }

  // Utility Bill
  if (req.files.utilityBill && req.files.utilityBill[0]) {
    const file = req.files.utilityBill[0];
    uploadedDocuments.utilityBill = {
      url: file.path,
      path: file.path,
      publicId: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date()
    };
    console.log('✅ Utility Bill uploaded:', file.originalname);
  }

  // Additional Documents
  if (req.files.additionalDocs && req.files.additionalDocs.length > 0) {
    uploadedDocuments.additionalDocs = req.files.additionalDocs.map(file => ({
      url: file.path,
      path: file.path,
      publicId: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date(),
      description: req.body[`description_${file.originalname}`] || 'Additional Document'
    }));
    console.log('✅ Additional Documents uploaded:', uploadedDocuments.additionalDocs.length);
  }

  // Count uploaded documents
  const uploadedCount = [
    uploadedDocuments.businessRegistration,
    uploadedDocuments.idDocument,
    uploadedDocuments.utilityBill
  ].filter(Boolean).length;

  const isComplete = uploadedCount === 3;

  console.log(`📊 Documents uploaded: ${uploadedCount}/3 required documents`);

  res.status(200).json({
    success: true,
    message: `Successfully uploaded ${uploadedCount} document(s)`,
    documents: uploadedDocuments,
    summary: {
      totalUploaded: uploadedCount,
      requiredDocuments: 3,
      isComplete,
      completionPercentage: Math.round((uploadedCount / 3) * 100),
      hasBusinessRegistration: !!uploadedDocuments.businessRegistration,
      hasIdDocument: !!uploadedDocuments.idDocument,
      hasUtilityBill: !!uploadedDocuments.utilityBill,
      additionalDocsCount: uploadedDocuments.additionalDocs.length
    }
  });
});

// FIXED: Use .fields() instead of .array() for structured document upload
router.post('/documents', protect, uploadDocs.fields([
  { name: 'businessRegistration', maxCount: 1 },
  { name: 'idDocument', maxCount: 1 },
  { name: 'utilityBill', maxCount: 1 },
  { name: 'additionalDocs', maxCount: 5 }
]), uploadDocument);

// Product routes
router.post('/products', protect, uploadProductImages.array('images', 5), uploadProductImage);

// Merchant image routes
router.post('/merchants', protect, uploadMerchantImages.array('images', 10), uploadMerchantImage);

// Admin routes with same structure
router.post('/admin/products', protectAdmin, uploadProductImages.array('images', 5), uploadProductImage);
router.post('/admin/merchants', protectAdmin, uploadMerchantImages.array('images', 10), uploadMerchantImage);
router.post('/admin/documents', protectAdmin, uploadDocs.fields([
  { name: 'businessRegistration', maxCount: 1 },
  { name: 'idDocument', maxCount: 1 },
  { name: 'utilityBill', maxCount: 1 },
  { name: 'additionalDocs', maxCount: 5 }
]), uploadDocument);

module.exports = router;