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

router.route('/')
  .get(getMerchants)
  .post(createMerchant);

router.route('/:id')
  .get(getMerchant)
  .put(protect, isMerchant, updateMerchant)
  .delete(protect, authorize('admin'), deleteMerchant);

// Merchant self-management routes - placed after /:id to avoid conflicts
router.get('/profile/me', protect, isMerchant, (req, res) => {
  // Redirect to getMerchant with the merchant's own ID
  req.params.id = req.user._id;
  getMerchant(req, res);
});

router.put('/profile/me', protect, isMerchant, (req, res) => {
  // Redirect to updateMerchant with the merchant's own ID
  req.params.id = req.user._id;
  updateMerchant(req, res);
});

router.put('/:id/logo', protect, isMerchant, uploadImage.single('logo'), uploadLogo);
router.put('/:id/banner', protect, isMerchant, uploadImage.single('banner'), uploadBanner);
router.put('/:id/gallery', protect, isMerchant, uploadImage.array('gallery', 10), uploadGallery);

// Current merchant image upload routes
router.put('/me/logo', protect, isMerchant, uploadImage.single('logo'), (req, res) => {
  req.params.id = req.user._id;
  uploadLogo(req, res);
});
router.put('/me/banner', protect, isMerchant, uploadImage.single('banner'), (req, res) => {
  req.params.id = req.user._id;
  uploadBanner(req, res);
});
router.put('/me/gallery', protect, isMerchant, uploadImage.array('gallery', 10), (req, res) => {
  req.params.id = req.user._id;
  uploadGallery(req, res);
});

router.put('/:id/documents', protect, isMerchant, uploadDocs.fields([
  { name: 'businessRegistration', maxCount: 1 },
  { name: 'idDocument', maxCount: 1 },
  { name: 'utilityBill', maxCount: 1 },
  { name: 'additionalDocs', maxCount: 5 }
]), uploadDocuments);

router.put('/:id/verify', protect, authorize('admin'), verifyMerchant);

// Admin routes
router.post('/admin/create', protect, authorize('admin'), createMerchantByAdmin);
router.put('/:id/featured', protect, authorize('admin'), setFeatured);

// Send credentials route
router.post('/send-credentials', protect, isMerchant, sendCredentials);

// Setup routes (public)
router.route('/setup/:token')
  .get(getSetupInfo)
  .post(completeAccountSetup);

module.exports = router;