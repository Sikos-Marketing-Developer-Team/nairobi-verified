const { ProductPG, MerchantPG, CartPG } = require('../models/indexPG');
const { HTTP_STATUS } = require('../config/constants');

// Error handling utility
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
    success: false, 
    error: message 
  });
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await CartPG.findOne({ 
      where: { userId: req.user.id }
    });

    if (!cart) {
      cart = await CartPG.create({ userId: req.user.id, items: [] });
    }

    // Enrich cart items with product and merchant details
    const enrichedItems = [];
    for (const item of cart.items) {
      const product = await ProductPG.findByPk(item.productId, {
        attributes: ['name', 'price', 'originalPrice', 'images', 'primaryImage', 'stockQuantity', 'soldQuantity', 'isActive'],
        include: [{
          model: MerchantPG,
          as: 'merchant',
          attributes: ['businessName', 'address', 'verified']
        }]
      });

      if (product && product.isActive && product.stockQuantity > product.soldQuantity) {
        enrichedItems.push({
          ...item,
          product
        });
      }
    }

    // Update cart with filtered items and recalculate total
    const totalAmount = enrichedItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);

    await CartPG.update({
      items: enrichedItems,
      totalAmount
    }, {
      where: { id: cart.id }
    });

    // Fetch updated cart
    const updatedCart = await CartPG.findByPk(cart.id);
    updatedCart.items = enrichedItems; // Add enriched items for response

    res.json({
      success: true,
      data: updatedCart
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch cart');
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    if (quantity < 1 || quantity > 10) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Quantity must be between 1 and 10'
      });
    }

    // Verify product exists and is available
    const product = await ProductPG.findByPk(productId, {
      include: [{
        model: MerchantPG,
        as: 'merchant',
        attributes: ['businessName']
      }]
    });
    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (!product.isActive) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Product is no longer available'
      });
    }

    // Check stock availability
    const availableStock = product.stockQuantity - product.soldQuantity;
    if (availableStock < quantity) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: `Only ${availableStock} items available in stock`
      });
    }

    let cart = await CartPG.findOne({ 
      where: { userId: req.user.id }
    });
    if (!cart) {
      cart = await CartPG.create({ userId: req.user.id, items: [] });
    }

    // Get current items array
    const currentItems = cart.items || [];

    // Check if item already exists in cart
    const existingItemIndex = currentItems.findIndex(
      item => item.productId === productId
    );

    let updatedItems = [...currentItems];

    if (existingItemIndex > -1) {
      // Check total quantity after addition
      const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
      if (newQuantity > availableStock) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: `Cannot add ${quantity} more items. Only ${availableStock - updatedItems[existingItemIndex].quantity} more available`
        });
      }
      
      if (newQuantity > 10) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Maximum quantity per item is 10'
        });
      }

      // Update quantity
      updatedItems[existingItemIndex].quantity = newQuantity;
      updatedItems[existingItemIndex].price = product.price; // Update price in case it changed
    } else {
      // Add new item
      updatedItems.push({
        productId: productId,
        productName: product.name,
        quantity,
        price: product.price,
        image: product.primaryImage || product.images[0],
        merchantId: product.merchant.id,
        merchantName: product.merchant.businessName
      });
    }

    // Calculate total amount
    const totalAmount = updatedItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Update cart
    await cart.update({
      items: updatedItems,
      totalAmount
    });
    
    // Fetch updated cart with enriched items for response
    const updatedCart = await CartPG.findByPk(cart.id);
    
    // Enrich items with current product data
    const enrichedItems = [];
    for (const item of updatedItems) {
      const productData = await ProductPG.findByPk(item.productId, {
        attributes: ['name', 'price', 'originalPrice', 'images', 'primaryImage', 'stockQuantity', 'soldQuantity', 'isActive'],
        include: [{
          model: MerchantPG,
          as: 'merchant',
          attributes: ['businessName', 'address', 'verified']
        }]
      });
      enrichedItems.push({
        ...item,
        product: productData
      });
    }

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: {
        ...updatedCart.dataValues,
        items: enrichedItems
      },
      message: 'Item added to cart successfully'
    });
  } catch (error) {
    handleError(res, error, 'Failed to add item to cart');
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1 || quantity > 10) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Quantity must be between 1 and 10'
      });
    }

    const cart = await CartPG.findOne({ 
      where: { userId: req.user.id }
    });
    if (!cart) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Cart not found'
      });
    }

    const currentItems = cart.items || [];
    const itemIndex = currentItems.findIndex(
      item => item.productId === req.params.itemId
    );

    if (itemIndex === -1) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Item not found in cart'
      });
    }

    // Check product availability
    const product = await ProductPG.findByPk(currentItems[itemIndex].productId);
    if (!product || !product.isActive) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Product is no longer available'
      });
    }

    const availableStock = product.stockQuantity - product.soldQuantity;
    if (quantity > availableStock) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: `Only ${availableStock} items available in stock`
      });
    }

    // Update item quantity
    const updatedItems = [...currentItems];
    updatedItems[itemIndex].quantity = quantity;
    updatedItems[itemIndex].price = product.price; // Update price in case it changed
    
    // Calculate new total
    const totalAmount = updatedItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    await cart.update({
      items: updatedItems,
      totalAmount
    });

    // Fetch updated cart with enriched items
    const updatedCart = await CartPG.findByPk(cart.id);
    const enrichedItems = [];
    for (const item of updatedItems) {
      const productData = await ProductPG.findByPk(item.productId, {
        attributes: ['name', 'price', 'originalPrice', 'images', 'primaryImage', 'stockQuantity', 'soldQuantity', 'isActive'],
        include: [{
          model: MerchantPG,
          as: 'merchant',
          attributes: ['businessName', 'address', 'verified']
        }]
      });
      enrichedItems.push({
        ...item,
        product: productData
      });
    }

    res.json({
      success: true,
      data: {
        ...updatedCart.dataValues,
        items: enrichedItems
      },
      message: 'Cart item updated successfully'
    });
  } catch (error) {
    handleError(res, error, 'Failed to update cart item');
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Cart not found'
      });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      item => item._id.toString() !== req.params.itemId
    );

    if (cart.items.length === initialLength) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Item not found in cart'
      });
    }

    await cart.save();

    await cart.populate('items.product', 'name price originalPrice images primaryImage stockQuantity soldQuantity isActive');
    await cart.populate('items.merchant', 'businessName address verified');

    res.json({
      success: true,
      data: cart,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    handleError(res, error, 'Failed to remove cart item');
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      data: cart,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    handleError(res, error, 'Failed to clear cart');
  }
};

// @desc    Get cart summary (item count and total)
// @route   GET /api/cart/summary
// @access  Private
exports.getCartSummary = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    
    const summary = {
      itemCount: cart ? cart.totalItems : 0,
      totalAmount: cart ? cart.totalAmount : 0,
      isEmpty: !cart || cart.items.length === 0
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch cart summary');
  }
};

// @desc    Move item from cart to wishlist (if wishlist is implemented)
// @route   POST /api/cart/items/:itemId/move-to-wishlist
// @access  Private
exports.moveToWishlist = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Item not found in cart'
      });
    }

    const item = cart.items[itemIndex];
    
    // TODO: Add to wishlist logic here when wishlist is fully implemented
    // await addToWishlist(req.user._id, item.product);

    // Remove from cart
    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.json({
      success: true,
      data: cart,
      message: 'Item moved to wishlist successfully'
    });
  } catch (error) {
    handleError(res, error, 'Failed to move item to wishlist');
  }
};

// @desc    Validate cart before checkout
// @route   POST /api/cart/validate
// @access  Private
exports.validateCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price stockQuantity soldQuantity isActive');

    if (!cart || cart.items.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    const issues = [];
    const validItems = [];

    for (let item of cart.items) {
      if (!item.product || !item.product.isActive) {
        issues.push({
          itemId: item._id,
          productName: item.productName,
          issue: 'Product is no longer available'
        });
        continue;
      }

      const availableStock = item.product.stockQuantity - item.product.soldQuantity;
      if (item.quantity > availableStock) {
        issues.push({
          itemId: item._id,
          productName: item.productName,
          issue: `Only ${availableStock} items available, but ${item.quantity} requested`
        });
        continue;
      }

      if (item.price !== item.product.price) {
        issues.push({
          itemId: item._id,
          productName: item.productName,
          issue: `Price changed from ${item.price} to ${item.product.price}`,
          priceChange: {
            old: item.price,
            new: item.product.price
          }
        });
      }

      validItems.push(item);
    }

    res.json({
      success: true,
      data: {
        isValid: issues.length === 0,
        issues,
        validItems,
        totalValidItems: validItems.length,
        totalValidAmount: validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    });
  } catch (error) {
    handleError(res, error, 'Failed to validate cart');
  }
};