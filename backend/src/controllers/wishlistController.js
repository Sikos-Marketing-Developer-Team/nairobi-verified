const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Get all wishlist items
exports.getItems = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('items.product');
    
    if (!wishlist) {
      wishlist = { items: [] };
    }
    
    res.status(200).json(wishlist);
  } catch (error) {
    console.error('Error getting wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add item to wishlist
exports.addItem = async (req, res) => {
  try {
    const { productId } = req.body;
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user.id,
        items: []
      });
    }
    
    // Check if product already in wishlist
    const itemIndex = wishlist.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (itemIndex > -1) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    
    // Add to wishlist
    wishlist.items.push({ product: productId });
    
    // Save wishlist
    await wishlist.save();
    
    // Return populated wishlist
    wishlist = await Wishlist.findById(wishlist._id).populate('items.product');
    
    res.status(200).json(wishlist);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove item from wishlist
exports.removeItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    
    // Find wishlist
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    // Remove item
    wishlist.items = wishlist.items.filter(
      item => item._id.toString() !== itemId
    );
    
    // Save wishlist
    await wishlist.save();
    
    res.status(200).json(wishlist);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear wishlist
exports.clear = async (req, res) => {
  try {
    // Find wishlist
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    // Clear items
    wishlist.items = [];
    
    // Save wishlist
    await wishlist.save();
    
    res.status(200).json({ message: 'Wishlist cleared' });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};