const express = require('express');
const {
  getMerchants,
  getMerchant,
  updateMerchant,
  deleteMerchant,
  uploadLogo,
  uploadBanner,
  uploadGallery,
  uploadDocuments,
  verifyMerchant,
  createMerchantByAdmin,
  completeAccountSetup,
  getSetupInfo
} = require('../controllers/merchants');
const { protect, authorize, isMerchant } = require('../middleware/auth');
const { uploadImage, uploadDocument } = require('../middleware/upload');

// Include other resource routers
const reviewRouter = require('./reviews');

const router = express.Router();

// Re-route into other resource routers
router.use('/:merchantId/reviews', reviewRouter);

router.route('/')
  .get(getMerchants);

router.route('/:id')
  .get(getMerchant)
  .put(protect, isMerchant, updateMerchant)
  .delete(protect, authorize('admin'), deleteMerchant);

router.put('/:id/logo', protect, isMerchant, uploadImage.single('logo'), uploadLogo);
router.put('/:id/banner', protect, isMerchant, uploadImage.single('banner'), uploadBanner);
router.put('/:id/gallery', protect, isMerchant, uploadImage.array('gallery', 10), uploadGallery);

router.put('/:id/documents', protect, isMerchant, uploadDocument.fields([
  { name: 'businessRegistration', maxCount: 1 },
  { name: 'idDocument', maxCount: 1 },
  { name: 'utilityBill', maxCount: 1 },
  { name: 'additionalDocs', maxCount: 5 }
]), uploadDocuments);

router.put('/:id/verify', protect, authorize('admin'), verifyMerchant);

// Admin routes
router.post('/admin/create', protect, authorize('admin'), createMerchantByAdmin);

// Setup routes (public)
router.route('/setup/:token')
  .get(getSetupInfo)
  .post(completeAccountSetup);

module.exports = router;