const User = require('../models/User');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const PaymentMethod = require('../models/PaymentMethod');

// Payment method controllers
exports.getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find({ user: req.user.id });
    res.status(200).json(paymentMethods);
  } catch (error) {
    console.error('Error getting payment methods:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addPaymentMethod = async (req, res) => {
  try {
    const { type, cardNumber, expiryDate, cardholderName, isDefault } = req.body;
    
    // Create new payment method
    const newPaymentMethod = new PaymentMethod({
      user: req.user.id,
      type,
      cardNumber,
      expiryDate,
      cardholderName,
      isDefault: isDefault || false
    });
    
    // If this is the default payment method, unset any existing default
    if (newPaymentMethod.isDefault) {
      await PaymentMethod.updateMany(
        { user: req.user.id, isDefault: true },
        { $set: { isDefault: false } }
      );
    }
    
    // Save payment method
    await newPaymentMethod.save();
    
    res.status(201).json(newPaymentMethod);
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePaymentMethod = async (req, res) => {
  try {
    // Find payment method
    const paymentMethod = await PaymentMethod.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    
    // Delete payment method
    await paymentMethod.remove();
    
    res.status(200).json({ message: 'Payment method removed' });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Checkout session controllers
exports.createCheckoutSession = async (req, res) => {
  try {
    const { cartId, shippingAddress, paymentMethodId } = req.body;
    
    // Validate cart
    const cart = await Cart.findOne({
      _id: cartId,
      user: req.user.id
    }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty or not found' });
    }
    
    // Create checkout session
    const session = {
      id: Date.now().toString(),
      cart: cart,
      shippingAddress,
      paymentMethodId,
      total: cart.items.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0)
    };
    
    res.status(200).json(session);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrderSummary = async (req, res) => {
  try {
    const cartId = req.params.cartId;
    
    // Validate cart
    const cart = await Cart.findOne({
      _id: cartId,
      user: req.user.id
    }).populate('items.product');
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Calculate totals
    const subtotal = cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
    
    const shipping = 10; // Example shipping cost
    const tax = subtotal * 0.16; // Example tax calculation (16%)
    const total = subtotal + shipping + tax;
    
    // Create order summary
    const orderSummary = {
      items: cart.items,
      subtotal,
      shipping,
      tax,
      total
    };
    
    res.status(200).json(orderSummary);
  } catch (error) {
    console.error('Error getting order summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Payment processing controllers
exports.processPayment = async (req, res) => {
  try {
    const { cartId, paymentMethodId, shippingAddress } = req.body;
    
    // Validate cart
    const cart = await Cart.findOne({
      _id: cartId,
      user: req.user.id
    }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty or not found' });
    }
    
    // Validate payment method
    const paymentMethod = await PaymentMethod.findOne({
      _id: paymentMethodId,
      user: req.user.id
    });
    
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    
    // Create order
    const order = new Order({
      user: req.user.id,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      })),
      shippingAddress,
      paymentMethod: paymentMethodId,
      total: cart.items.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0),
      status: 'processing',
      paymentStatus: 'paid'
    });
    
    // Save order
    await order.save();
    
    // Clear cart
    cart.items = [];
    await cart.save();
    
    // Return payment confirmation
    const paymentConfirmation = {
      paymentId: Date.now().toString(),
      orderId: order._id,
      amount: order.total,
      status: 'success'
    };
    
    res.status(200).json(paymentConfirmation);
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    
    // In a real implementation, this would verify with a payment provider
    // For now, we'll just return a success response
    
    res.status(200).json({
      paymentId,
      status: 'verified',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};