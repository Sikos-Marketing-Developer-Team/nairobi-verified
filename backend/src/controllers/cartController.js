const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user cart
const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    
    let cart = await Cart.findOne({ user: userId })
      .populate({
        path: 'items.product',
        select: 'name price discountPrice images stock merchant',
        populate: {
          path: 'merchant',
          select: 'companyName isVerified'
        }
      });
    
    // If cart doesn't exist, create an empty one
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        subtotal: 0
      });
      await cart.save();
    }
    
    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching cart',
      error: error.message 
    });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1 } = req.body;
    
    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough stock. Available: ${product.stock}`
      });
    }
    
    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        subtotal: 0
      });
    }
    
    // Check if product already in cart
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (itemIndex > -1) {
      // Update quantity if product exists
      cart.items[itemIndex].quantity += quantity;
      
      // Check if new quantity exceeds stock
      if (cart.items[itemIndex].quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more items. Available stock: ${product.stock}`
        });
      }
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity,
        price: product.discountPrice || product.price,
        merchant: product.merchant
      });
    }
    
    // Calculate subtotal
    cart.subtotal = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    await cart.save();
    
    // Populate product details for response
    await cart.populate({
      path: 'items.product',
      select: 'name price discountPrice images stock merchant',
      populate: {
        path: 'merchant',
        select: 'companyName isVerified'
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding item to cart',
      error: error.message 
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;
    
    // Validate quantity
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }
    
    // Find cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ 
        success: false,
        message: 'Cart not found' 
      });
    }
    
    // Find item in cart
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found in cart' 
      });
    }
    
    // Check stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Not enough stock. Available: ${product.stock}`
      });
    }
    
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    
    // Recalculate subtotal
    cart.subtotal = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    await cart.save();
    
    // Populate product details for response
    await cart.populate({
      path: 'items.product',
      select: 'name price discountPrice images stock merchant',
      populate: {
        path: 'merchant',
        select: 'companyName isVerified'
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      cart
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating cart',
      error: error.message 
    });
  }
};

// Remove item from cart
const removeCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    
    // Find cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ 
        success: false,
        message: 'Cart not found' 
      });
    }
    
    // Remove item
    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );
    
    // Recalculate subtotal
    cart.subtotal = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    await cart.save();
    
    // Populate product details for response
    await cart.populate({
      path: 'items.product',
      select: 'name price discountPrice images stock merchant',
      populate: {
        path: 'merchant',
        select: 'companyName isVerified'
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error removing item from cart',
      error: error.message 
    });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ 
        success: false,
        message: 'Cart not found' 
      });
    }
    
    // Clear items
    cart.items = [];
    cart.subtotal = 0;
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error clearing cart',
      error: error.message 
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};