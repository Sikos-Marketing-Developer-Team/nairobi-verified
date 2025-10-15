// backend/controllers/favorites.js - FIXED VERSION
const User = require('../models/User');
const Merchant = require('../models/Merchant');

// @desc Get user favorites
// @route GET /api/favorites
// @access Private
exports.getFavorites = async (req, res) => {
  try {
    // CRITICAL FIX: Block merchants from accessing favorites
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Please log in to view favorites'
      });
    }

    // Check if user is a merchant (they shouldn't access favorites)
    if (req.user.role === 'merchant' || req.user.businessName) {
      return res.status(400).json({
        success: false,
        error: 'Favorites feature is only available for regular users, not merchants'
      });
    }

    // CRITICAL FIX: Use _id instead of id (MongoDB uses _id)
    const userId = req.user._id || req.user.id;
    
    const user = await User.findById(userId).populate({
      path: 'favorites',
      select: 'businessName logo rating reviews businessType address verified'
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      count: user.favorites ? user.favorites.length : 0,
      data: user.favorites || []
    });
  } catch (error) {
    console.error('getFavorites error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc Add merchant to favorites
// @route POST /api/favorites/:merchantId
// @access Private
exports.addFavorite = async (req, res) => {
  try {
    // Block merchants
    if (req.user.role === 'merchant' || req.user.businessName) {
      return res.status(400).json({
        success: false,
        error: 'Merchants cannot add favorites'
      });
    }

    const merchant = await Merchant.findById(req.params.merchantId);
    
    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // CRITICAL FIX: Use _id instead of id
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Initialize favorites array if it doesn't exist
    if (!user.favorites) {
      user.favorites = [];
    }

    // Check if merchant is already in favorites
    const merchantIdStr = req.params.merchantId.toString();
    const isAlreadyFavorite = user.favorites.some(
      fav => fav.toString() === merchantIdStr
    );

    if (isAlreadyFavorite) {
      return res.status(400).json({
        success: false,
        error: 'Merchant already in favorites'
      });
    }

    // Add to favorites
    user.favorites.push(req.params.merchantId);
    await user.save();

    // Populate the favorites before sending response
    await user.populate({
      path: 'favorites',
      select: 'businessName logo rating reviews businessType address verified'
    });

    res.status(200).json({
      success: true,
      count: user.favorites.length,
      data: user.favorites
    });
  } catch (error) {
    console.error('addFavorite error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc Remove merchant from favorites
// @route DELETE /api/favorites/:merchantId
// @access Private
exports.removeFavorite = async (req, res) => {
  try {
    // Block merchants
    if (req.user.role === 'merchant' || req.user.businessName) {
      return res.status(400).json({
        success: false,
        error: 'Merchants cannot manage favorites'
      });
    }

    // CRITICAL FIX: Use _id instead of id
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Initialize favorites array if it doesn't exist
    if (!user.favorites) {
      user.favorites = [];
    }

    const merchantIdStr = req.params.merchantId.toString();
    const isFavorite = user.favorites.some(
      fav => fav.toString() === merchantIdStr
    );

    // Check if merchant is in favorites
    if (!isFavorite) {
      return res.status(400).json({
        success: false,
        error: 'Merchant not in favorites'
      });
    }

    // Remove from favorites
    user.favorites = user.favorites.filter(
      id => id.toString() !== merchantIdStr
    );

    await user.save();

    // Populate the remaining favorites
    await user.populate({
      path: 'favorites',
      select: 'businessName logo rating reviews businessType address verified'
    });

    res.status(200).json({
      success: true,
      count: user.favorites.length,
      data: user.favorites
    });
  } catch (error) {
    console.error('removeFavorite error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};