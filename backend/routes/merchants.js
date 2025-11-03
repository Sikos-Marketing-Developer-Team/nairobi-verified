// backend/routes/merchants.js - VERIFIED FIX
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
  completeAccountSetup,
  getSetupInfo,
  sendCredentials,
  setFeatured
} = require('../controllers/merchants');
const { protect, authorize, isMerchant } = require('../middleware/auth');
const { uploadImage, uploadDocs } = require('../middleware/upload');

const { 
  merchantCreationLimiter, 
  bulkUploadLimiter 
} = require('../middleware/rateLimiters');

// Configure multer for handling multiple file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 50 // Maximum 50 files total
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Include other resource routers
const reviewRouter = require('./reviews');

const router = express.Router();

// Re-route into other resource routers
router.use('/:merchantId/reviews', reviewRouter);

// ==========================================
// CRITICAL: Specific routes MUST come BEFORE generic /:id routes
// ==========================================

// Admin routes - BEFORE /:id
router.post(
  '/admin/create', 
  protect, 
  authorize('admin'), 
  merchantCreationLimiter, // Rate limit: 200/hour per admin
  createMerchantByAdmin
);


router.post(
  '/admin/bulk-create',
  protect,
  authorize('admin'),
  bulkUploadLimiter, // Rate limit: 10/hour per admin
  async (req, res) => {
    try {
      const { merchants } = req.body;
      
      if (!Array.isArray(merchants) || merchants.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid merchants array'
        });
      }

      // Limit batch size
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

      // Process in parallel with Promise.allSettled
      const promises = merchants.map(async (merchantData) => {
        try {
          // Reuse createMerchantByAdmin logic
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