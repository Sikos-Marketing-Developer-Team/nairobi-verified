const { UserPG, MerchantPG } = require('../models/indexPG');

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');

    res.status(200).json({
      success: true,
      count: user.favorites.length,
      data: user.favorites
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Add merchant to favorites
// @route   POST /api/favorites/:merchantId
// @access  Private
exports.addFavorite = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.merchantId);

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    const user = await User.findById(req.user.id);

    // Check if merchant is already in favorites
    if (user.favorites.includes(req.params.merchantId)) {
      return res.status(400).json({
        success: false,
        error: 'Merchant already in favorites'
      });
    }

    // Add to favorites
    await UserPG.update({
      favorites: [...user.favorites, req.params.merchantId]
    }, {
      where: { id: user.id }
    });

    res.status(200).json({
      success: true,
      data: user.favorites
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Remove merchant from favorites
// @route   DELETE /api/favorites/:merchantId
// @access  Private
exports.removeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Check if merchant is in favorites
    if (!user.favorites.includes(req.params.merchantId)) {
      return res.status(400).json({
        success: false,
        error: 'Merchant not in favorites'
      });
    }

    // Remove from favorites
    const updatedFavorites = user.favorites.filter(
      id => id.toString() !== req.params.merchantId
    );
    
    await UserPG.update({
      favorites: updatedFavorites
    }, {
      where: { id: user.id }
    });

    res.status(200).json({
      success: true,
      data: user.favorites
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};