// backend/routes/merchants.js - VERIFIED FIX
const express = require('express');
const {
  getMerchants,
  getMerchant,
  createMerchant,
  updateMerchant,
  deleteMerchant,
  uploadLogo,
  uploadBanner,
  uploadGallery,
  uploadDocuments,
  verifyMerchant,
  createMerchantByAdmin,
  completeAccountSetup,
  getSetupInfo,
  sendCredentials,
  setFeatured
} = require('../controllers/merchants');
const { protect, authorize, isMerchant } = require('../middleware/auth');
const { uploadImage, uploadDocs } = require('../middleware/upload');

// Include other resource routers
const reviewRouter = require('./reviews');

const router = express.Router();

// Re-route into other resource routers
router.use('/:merchantId/reviews', reviewRouter);

// ==========================================
// CRITICAL: Specific routes MUST come BEFORE generic /:id routes
// ==========================================

// Admin routes - BEFORE /:id
router.post('/admin/create', protect, authorize('admin'), createMerchantByAdmin);

// Setup routes (public) - BEFORE /:id
router.route('/setup/:token')
  .get(getSetupInfo)
  .post(completeAccountSetup);

// Send credentials route - BEFORE /:id
router.post('/send-credentials', protect, isMerchant, sendCredentials);

// ==========================================
// MERCHANT PROFILE ROUTES - BEFORE /:id
// These handle /api/merchants/profile/me
// ==========================================

router.get('/profile/me', protect, isMerchant, (req, res) => {
  console.log('📍 GET /merchants/profile/me - Fetching current merchant profile');
  console.log('Merchant:', req.merchant?.businessName, 'Merchant ID:', req.merchant?._id);
  
  // CRITICAL: Use req.merchant._id (set by isMerchant middleware)
  req.params.id = req.merchant._id || req.user._id;
  getMerchant(req, res);
});

router.put('/profile/me', protect, isMerchant, (req, res) => {
  console.log('📍 PUT /merchants/profile/me - Updating current merchant profile');
  console.log('Merchant:', req.merchant?.businessName, 'Merchant ID:', req.merchant?._id);
  
  // CRITICAL: Use req.merchant._id (set by isMerchant middleware)
  req.params.id = req.merchant._id || req.user._id;
  updateMerchant(req, res);
});

// Alternative shorter routes: /api/merchants/me
router.get('/me', protect, isMerchant, (req, res) => {
  console.log('📍 GET /merchants/me - Fetching current merchant profile');
  console.log('User:', req.user?.email, 'Merchant ID:', req.user?._id);
  
  req.params.id = req.user._id;
  getMerchant(req, res);
});

router.put('/me', protect, isMerchant, (req, res) => {
  console.log('📍 PUT /merchants/me - Updating current merchant profile');
  console.log('User:', req.user?.email, 'Merchant ID:', req.user?._id);
  
  req.params.id = req.user._id;
  updateMerchant(req, res);
});

// Profile image upload routes - BEFORE /:id
router.put('/profile/me/logo', protect, isMerchant, uploadImage.single('logo'), (req, res) => {
  console.log('📍 PUT /merchants/profile/me/logo - Uploading logo');
  req.params.id = req.user._id;
  uploadLogo(req, res);
});

router.put('/profile/me/banner', protect, isMerchant, uploadImage.single('banner'), (req, res) => {
  console.log('📍 PUT /merchants/profile/me/banner - Uploading banner');
  req.params.id = req.user._id;
  uploadBanner(req, res);
});

router.put('/profile/me/gallery', protect, isMerchant, uploadImage.array('gallery', 10), (req, res) => {
  console.log('📍 PUT /merchants/profile/me/gallery - Uploading gallery images');
  req.params.id = req.user._id;
  uploadGallery(req, res);
});

// Shorter routes for image uploads
router.put('/me/logo', protect, isMerchant, uploadImage.single('logo'), (req, res) => {
  console.log('📍 PUT /merchants/me/logo - Uploading logo');
  req.params.id = req.user._id;
  uploadLogo(req, res);
});

router.put('/me/banner', protect, isMerchant, uploadImage.single('banner'), (req, res) => {
  console.log('📍 PUT /merchants/me/banner - Uploading banner');
  req.params.id = req.user._id;
  uploadBanner(req, res);
});

router.put('/me/gallery', protect, isMerchant, uploadImage.array('gallery', 10), (req, res) => {
  console.log('📍 PUT /merchants/me/gallery - Uploading gallery images');
  req.params.id = req.user._id;
  uploadGallery(req, res);
});

// ==========================================
// NOW define generic routes with :id parameter
// These MUST come AFTER all specific routes
// ==========================================

// General merchant routes
router.route('/')
  .get(getMerchants)
  .post(createMerchant);

router.route('/:id')
  .get(getMerchant)
  .put(protect, isMerchant, updateMerchant)
  .delete(protect, authorize('admin'), deleteMerchant);

// ID-based routes (for admin or direct access)
router.put('/:id/logo', protect, isMerchant, uploadImage.single('logo'), uploadLogo);
router.put('/:id/banner', protect, isMerchant, uploadImage.single('banner'), uploadBanner);
router.put('/:id/gallery', protect, isMerchant, uploadImage.array('gallery', 10), uploadGallery);

router.put('/:id/documents', protect, isMerchant, uploadDocs.fields([
  { name: 'businessRegistration', maxCount: 1 },
  { name: 'idDocument', maxCount: 1 },
  { name: 'utilityBill', maxCount: 1 },
  { name: 'additionalDocs', maxCount: 5 }
]), uploadDocuments);

router.put('/:id/verify', protect, authorize('admin'), verifyMerchant);
router.put('/:id/featured', protect, authorize('admin'), setFeatured);

module.exports = router;