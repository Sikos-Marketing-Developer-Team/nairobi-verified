const Merchant = require('../models/Merchant');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { HTTP_STATUS } = require('../config/constants');
const cloudinary = require('cloudinary').v2;

// ==================== DASHBOARD OVERVIEW ====================

/**
 * @desc    Get merchant dashboard overview
 * @route   GET /api/merchants/dashboard/overview
 * @access  Private/Merchant
 */
exports.getDashboardOverview = async (req, res) => {
  try {
    const merchantId = req.user._id;

    const merchant = await Merchant.findById(merchantId)
      .select('businessName email phone verified featured rating reviews profileCompleteness documentsCompleteness createdAt verifiedDate logo banner')
      .lean();

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Get verification status
    const verificationStatus = {
      isVerified: merchant.verified,
      isFeatured: merchant.featured || false,
      verificationLevel: merchant.verified ? (merchant.featured ? 'Premium' : 'Standard') : 'Basic',
      verificationBadge: merchant.verified ? 'Verified Business' : 'Pending Verification',
      statusMessage: merchant.verified 
        ? 'Your business is verified and visible to customers' 
        : 'Complete your profile and upload documents to get verified',
      verifiedDate: merchant.verifiedDate || null
    };

    // Get profile completion
    const profileCompletion = {
      percentage: merchant.profileCompleteness || 0,
      documentsPercentage: merchant.documentsCompleteness || 0,
      nextSteps: []
    };

    if (merchant.profileCompleteness < 100) {
      profileCompletion.nextSteps.push('Complete your business profile');
    }
    if (merchant.documentsCompleteness < 100) {
      profileCompletion.nextSteps.push('Upload verification documents');
    }
    if (!merchant.verified && merchant.documentsCompleteness === 100) {
      profileCompletion.nextSteps.push('Documents under review');
    }

    // Get quick stats
    const [reviewCount, productCount] = await Promise.all([
      Review.countDocuments({ merchant: merchantId }),
      Product.countDocuments({ merchant: merchantId })
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        merchant: {
          id: merchant._id,
          businessName: merchant.businessName,
          email: merchant.email,
          phone: merchant.phone,
          rating: merchant.rating || 0,
          totalReviews: reviewCount,
          totalProducts: productCount,
          memberSince: merchant.createdAt,
          logo: merchant.logo,
          banner: merchant.banner
        },
        verificationStatus,
        profileCompletion
      }
    });

  } catch (error) {
    console.error('getDashboardOverview error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch dashboard overview'
    });
  }
};
