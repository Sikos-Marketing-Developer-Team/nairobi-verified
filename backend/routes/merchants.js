const express = require('express');
const multer = require('multer');
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
  createMerchantWithProducts,
  updateMerchantWithProducts,
  completeAccountSetup,
  getSetupInfo,
  sendCredentials,
  setFeatured,
  resendWelcomeEmail
} = require('../controllers/merchants');
const { protect, authorize, isMerchant } = require('../middleware/auth');
const { protectAdmin } = require('../middleware/adminAuth');
const { uploadImage, uploadDocs } = require('../middleware/upload');
const { 
  merchantCreationLimiter, 
  bulkUploadLimiter 
} = require('../middleware/rateLimiters');

const reviewRouter = require('./reviews');
const router = express.Router();

router.use('/:merchantId/reviews', reviewRouter);

// ==========================================
// ADMIN ROUTES - BEFORE /:id
// ==========================================
router.post(
  '/admin/create', 
  protectAdmin,
  merchantCreationLimiter,
  createMerchantByAdmin
);

router.post(
  '/admin/create-with-products', 
  protectAdmin,
  merchantCreationLimiter,
  multer().any(),
  createMerchantWithProducts
);

router.put(
  '/admin/:id/update-with-products',
  protectAdmin,
  multer().any(),
  updateMerchantWithProducts
);

router.post(
  '/admin/:id/resend-welcome',
  protectAdmin,
  resendWelcomeEmail
);

router.post(
  '/admin/bulk-create',
  protect,
  authorize('admin'),
  bulkUploadLimiter,
  async (req, res) => {
    try {
      const { merchants } = req.body;
      
      if (!Array.isArray(merchants) || merchants.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid merchants array'
        });
      }

      if (merchants.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 100 merchants per batch. Please split into smaller batches.'
        });
      }

      const results = {
        total: merchants.length,
        successful: [],
        failed: []
      };

      const promises = merchants.map(async (merchantData) => {
        try {
          const merchant = await createMerchantByAdminLogic(merchantData, req.user);
          return { success: true, merchant };
        } catch (error) {
          return { 
            success: false, 
            error: error.message,
            merchantData 
          };
        }
      });

      const settled = await Promise.allSettled(promises);

      settled.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          results.successful.push(result.value.merchant);
        } else {
          results.failed.push({
            ...merchants[index],
            error: result.value?.error || result.reason?.message || 'Unknown error'
          });
        }
      });

      res.status(200).json({
        success: true,
        results
      });

    } catch (error) {
      console.error('Bulk create error:', error);
      res.status(500).json({
        success: false,
        error: 'Bulk creation failed'
      });
    }
  }
);

// ==========================================
// SETUP ROUTES (PUBLIC) - BEFORE /:id
// ==========================================
router.route('/setup/:token')
  .get(getSetupInfo)
  .post(completeAccountSetup);

router.post('/send-credentials', protect, isMerchant, sendCredentials);

// ==========================================
// MERCHANT PROFILE ROUTES - BEFORE /:id
// ==========================================
router.get('/profile/me', protect, isMerchant, (req, res) => {
  console.log('GET /merchants/profile/me - Fetching current merchant profile');
  console.log('Merchant:', req.merchant?.businessName, 'Merchant ID:', req.merchant?._id);
  
  req.params.id = req.merchant._id || req.user._id;
  getMerchant(req, res);
});

router.put('/profile/me', protect, isMerchant, (req, res, next) => {
  console.log('PUT /merchants/profile/me - Updating current merchant profile');
  console.log('Merchant:', req.merchant?.businessName, 'Merchant ID:', req.merchant?._id);
  req.params.id = req.merchant._id || req.user._id;
  next();
}, updateMerchant);

router.get('/me', protect, isMerchant, (req, res) => {
  console.log('GET /merchants/me - Fetching current merchant profile');
  console.log('User:', req.user?.email, 'Merchant ID:', req.user?._id);
  
  req.params.id = req.user._id;
  getMerchant(req, res);
});

router.put('/me', protect, isMerchant, (req, res, next) => {
  console.log('PUT /merchants/me - Updating current merchant profile');
  console.log('User:', req.user?.email, 'Merchant ID:', req.user?._id);
  
  req.params.id = req.user._id;
  next();
}, updateMerchant);

// ==========================================
// PROFILE IMAGE UPLOAD ROUTES - BEFORE /:id
// ==========================================
router.put('/profile/me/logo', protect, isMerchant, uploadImage.single('logo'), (req, res, next) => {
  console.log('PUT /merchants/profile/me/logo - Uploading logo');
  req.params.id = req.user._id;
  next();
}, uploadLogo);

router.put('/profile/me/banner', protect, isMerchant, uploadImage.single('banner'), (req, res, next) => {
  console.log('PUT /merchants/profile/me/banner - Uploading banner');
  req.params.id = req.user._id;
  next();
}, uploadBanner);

router.put('/profile/me/gallery', protect, isMerchant, uploadImage.array('gallery', 10), (req, res, next) => {
  console.log('PUT /merchants/profile/me/gallery - Uploading gallery images');
  req.params.id = req.user._id;
  next();
}, uploadGallery);

router.put('/me/logo', protect, isMerchant, uploadImage.single('logo'), (req, res, next) => {
  console.log('PUT /merchants/me/logo - Uploading logo');
  req.params.id = req.user._id;
  next();
}, uploadLogo);

router.put('/me/banner', protect, isMerchant, uploadImage.single('banner'), (req, res, next) => {
  console.log('PUT /merchants/me/banner - Uploading banner');
  req.params.id = req.user._id;
  next();
}, uploadBanner);

router.put('/me/gallery', protect, isMerchant, uploadImage.array('gallery', 10), (req, res, next) => {
  console.log('PUT /merchants/me/gallery - Uploading gallery images');
  req.params.id = req.user._id;
  next();
}, uploadGallery);

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get all merchants
router.get('/', getMerchants);

// Get single merchant
router.get('/:id', getMerchant);

// ==========================================
// PROTECTED UPDATE ROUTES
// ==========================================
router.put('/:id', protect, isMerchant, updateMerchant);

router.delete('/:id', protect, authorize('admin'), deleteMerchant);

// ==========================================
// IMAGE UPLOAD ROUTES (ID-BASED)
// ==========================================
router.put('/:id/logo', protect, isMerchant, uploadImage.single('logo'), uploadLogo);
router.put('/:id/banner', protect, isMerchant, uploadImage.single('banner'), uploadBanner);
router.put('/:id/gallery', protect, isMerchant, uploadImage.array('gallery', 10), uploadGallery);

router.put('/:id/documents', protect, isMerchant, uploadDocs.fields([
  { name: 'businessRegistration', maxCount: 1 },
  { name: 'idDocument', maxCount: 1 },
  { name: 'utilityBill', maxCount: 1 },
  { name: 'additionalDocs', maxCount: 5 }
]), uploadDocuments);

// ==========================================
// ADMIN ACTIONS
// ==========================================
router.put('/:id/verify', protect, authorize('admin'), verifyMerchant);
router.put('/:id/featured', protect, authorize('admin'), setFeatured);

// Create merchant (public registration)
router.post('/', createMerchant);

module.exports = router;
