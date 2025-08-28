const express = require('express');
const router = express.Router();
const { uploadProductImages, uploadMerchantImages, uploadDocuments } = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const { protectAdmin } = require('../middleware/adminAuth');
const asyncHandler = require('express-async-handler');

// @desc    Upload product images
// @route   POST /api/uploads/products
// @access  Private (Merchant/Admin)
const uploadProductImage = asyncHandler(async (req, res) => {
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
    size: file.size
  }));

  res.status(200).json({
    success: true,
    message: 'Images uploaded successfully',
    files: uploadedFiles
  });
});

// @desc    Upload merchant images (logo, banner, gallery)
// @route   POST /api/uploads/merchants
// @access  Private (Merchant/Admin)
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
    size: file.size
  }));

  res.status(200).json({
    success: true,
    message: 'Images uploaded successfully',
    files: uploadedFiles
  });
});

// @desc    Upload merchant documents
// @route   POST /api/uploads/documents
// @access  Private (Merchant/Admin)
const uploadDocument = asyncHandler(async (req, res) => {
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
    message: 'Documents uploaded successfully',
    files: uploadedFiles
  });
});

// Routes
router.post('/products', protect, uploadProductImages.array('images', 5), uploadProductImage);
router.post('/merchants', protect, uploadMerchantImages.array('images', 10), uploadMerchantImage);
router.post('/documents', protect, uploadDocuments.array('documents', 5), uploadDocument);

// Admin routes
router.post('/admin/products', protectAdmin, uploadProductImages.array('images', 5), uploadProductImage);
router.post('/admin/merchants', protectAdmin, uploadMerchantImages.array('images', 10), uploadMerchantImage);
router.post('/admin/documents', protectAdmin, uploadDocuments.array('documents', 5), uploadDocument);

module.exports = router;