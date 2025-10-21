const express = require('express');
const {
  // Dashboard Overview
  getDashboardOverview,
  getPerformanceAnalytics,
  getRecentActivity,
  getNotifications,
  getQuickActions,
  
  // Business Profile Management
  getBusinessProfile,
  updateBusinessProfile,
  updateBusinessHours,
  updateSocialLinks,
  uploadBusinessLogo,
  uploadBusinessBanner,
  
  // Photo Gallery Management
  getPhotoGallery,
  uploadPhotos,
  deletePhoto,
  reorderPhotos,
  setFeaturedPhoto,
  
  // Product/Service Management
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
  uploadProductImages,
  deleteProductImage,
  
  // Review Management
  getMerchantReviews,
  respondToReview,
  flagReview,
  getReviewStats,
  
  // Verification Status
  getVerificationStatus,
  requestVerification,
  uploadVerificationDocuments,
  getVerificationHistory,
  
  // Customer Engagement
  getEngagementStats,
  getWhatsAppClicks,
  getCallClicks,
  getProfileViews
} = require('../controllers/merchantDashboard');
const { protect, isMerchant } = require('../middleware/auth');
const { 
  merchantImageUpload, 
  productImageUpload,
  documentUpload 
} = require('../services/cloudinaryService');

const router = express.Router();

// All routes require merchant authentication
router.use(protect);
router.use(isMerchant);

// ==================== DASHBOARD OVERVIEW ====================
router.get('/overview', getDashboardOverview);
router.get('/analytics', getPerformanceAnalytics);
router.get('/activity', getRecentActivity);
router.get('/notifications', getNotifications);
router.get('/quick-actions', getQuickActions);

// ==================== BUSINESS PROFILE MANAGEMENT ====================
router.get('/profile', getBusinessProfile);
router.put('/profile', updateBusinessProfile);
router.put('/profile/hours', updateBusinessHours);
router.put('/profile/social', updateSocialLinks);
router.post('/profile/logo', merchantImageUpload.single('logo'), uploadBusinessLogo);
router.post('/profile/banner', merchantImageUpload.single('banner'), uploadBusinessBanner);

// ==================== PHOTO GALLERY MANAGEMENT ====================
router.get('/gallery', getPhotoGallery);
router.post('/gallery', merchantImageUpload.array('photos', 10), uploadPhotos);
router.delete('/gallery/:photoId', deletePhoto);
router.put('/gallery/reorder', reorderPhotos);
router.put('/gallery/:photoId/featured', setFeaturedPhoto);

// ==================== PRODUCT/SERVICE MANAGEMENT ====================
router.get('/products', getProducts);
router.get('/products/:productId', getProductById);
router.post('/products', createProduct);
router.put('/products/:productId', updateProduct);
router.delete('/products/:productId', deleteProduct);
router.patch('/products/:productId/availability', toggleProductAvailability);
router.post('/products/:productId/images', productImageUpload.array('images', 5), uploadProductImages);
router.delete('/products/:productId/images/:imageId', deleteProductImage);

// ==================== REVIEW MANAGEMENT ====================
router.get('/reviews', getMerchantReviews);
router.post('/reviews/:reviewId/respond', respondToReview);
router.post('/reviews/:reviewId/flag', flagReview);
router.get('/reviews/stats', getReviewStats);

// ==================== VERIFICATION STATUS ====================
router.get('/verification/status', getVerificationStatus);
router.post('/verification/request', requestVerification);
router.post('/verification/documents', documentUpload.fields([
  { name: 'businessRegistration', maxCount: 1 },
  { name: 'idDocument', maxCount: 1 },
  { name: 'utilityBill', maxCount: 1 },
  { name: 'additionalDocs', maxCount: 5 }
]), uploadVerificationDocuments);
router.get('/verification/history', getVerificationHistory);

// ==================== CUSTOMER ENGAGEMENT ====================
router.get('/engagement', getEngagementStats);
router.get('/engagement/whatsapp', getWhatsAppClicks);
router.get('/engagement/calls', getCallClicks);
router.get('/engagement/views', getProfileViews);

module.exports = router;