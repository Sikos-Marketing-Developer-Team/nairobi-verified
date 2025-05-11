const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');

// Create a new order
const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      items, 
      shippingAddress, 
      paymentMethod,
      paymentDetails,
      notes
    } = req.body;
    
    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Validate items and calculate totals
    let orderItems = [];
    let subtotal = 0;
    
    // If items are provided directly
    if (items && items.length > 0) {
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product with ID ${item.product} not found`
          });
        }
        
        // Check stock
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Not enough stock for ${product.name}. Available: ${product.stock}`
          });
        }
        
        // Add to order items
        orderItems.push({
          product: product._id,
          quantity: item.quantity,
          price: product.discountPrice || product.price,
          merchant: product.merchant
        });
        
        // Update subtotal
        subtotal += (product.discountPrice || product.price) * item.quantity;
        
        // Update product stock
        product.stock -= item.quantity;
        await product.save();
      }
    } 
    // If using cart
    else {
      const cart = await Cart.findOne({ user: userId }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty'
        });
      }
      
      for (const item of cart.items) {
        const product = item.product;
        
        // Check stock
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Not enough stock for ${product.name}. Available: ${product.stock}`
          });
        }
        
        // Add to order items
        orderItems.push({
          product: product._id,
          quantity: item.quantity,
          price: product.discountPrice || product.price,
          merchant: product.merchant
        });
        
        // Update subtotal
        subtotal += (product.discountPrice || product.price) * item.quantity;
        
        // Update product stock
        product.stock -= item.quantity;
        await product.save();
      }
      
      // Clear cart after order is created
      cart.items = [];
      cart.subtotal = 0;
      await cart.save();
    }
    
    // Calculate additional costs
    const shippingFee = 200; // Fixed shipping fee (KES)
    const tax = subtotal * 0.16; // 16% VAT
    const total = subtotal + shippingFee + tax;
    
    // Create order
    const order = new Order({
      customer: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentDetails: {
        ...paymentDetails,
        status: 'pending'
      },
      subtotal,
      shippingFee,
      tax,
      total,
      notes
    });
    
    await order.save();
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating order',
      error: error.message 
    });
  }
};

// Get all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only administrators can access all orders' 
      });
    }
    
    const { 
      page = 1, 
      limit = 10, 
      sort = '-createdAt',
      status
    } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    
    // Get orders with pagination
    const orders = await Order.find(query)
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('customer', 'fullName email')
      .populate('items.product', 'name images')
      .populate('items.merchant', 'companyName');
    
    // Get total count
    const total = await Order.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching orders',
      error: error.message 
    });
  }
};

// Get customer orders
const getCustomerOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      page = 1, 
      limit = 10, 
      sort = '-createdAt',
      status
    } = req.query;
    
    // Build query
    const query = { customer: userId };
    if (status) query.status = status;
    
    // Get orders with pagination
    const orders = await Order.find(query)
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('items.product', 'name images')
      .populate('items.merchant', 'companyName');
    
    // Get total count
    const total = await Order.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      orders
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching orders',
      error: error.message 
    });
  }
};

// Get merchant orders
const getMerchantOrders = async (req, res) => {
  try {
    const merchantId = req.user._id;
    
    // Validate merchant
    const merchant = await User.findById(merchantId);
    if (!merchant || merchant.role !== 'merchant') {
      return res.status(403).json({ 
        success: false,
        message: 'Only merchants can access merchant orders' 
      });
    }
    
    const { 
      page = 1, 
      limit = 10, 
      sort = '-createdAt',
      status
    } = req.query;
    
    // Find orders where this merchant has items
    const query = { 'items.merchant': merchantId };
    if (status) query.status = status;
    
    // Get orders with pagination
    const orders = await Order.find(query)
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('customer', 'fullName email')
      .populate('items.product', 'name images');
    
    // Get total count
    const total = await Order.countDocuments(query);
    
    // Filter items to only show this merchant's items
    const filteredOrders = orders.map(order => {
      const merchantItems = order.items.filter(
        item => item.merchant.toString() === merchantId.toString()
      );
      
      // Calculate merchant subtotal
      const merchantSubtotal = merchantItems.reduce(
        (total, item) => total + (item.price * item.quantity), 0
      );
      
      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        customer: order.customer,
        items: merchantItems,
        status: order.status,
        createdAt: order.createdAt,
        merchantSubtotal
      };
    });
    
    res.status(200).json({
      success: true,
      count: filteredOrders.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      orders: filteredOrders
    });
  } catch (error) {
    console.error('Get merchant orders error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching merchant orders',
      error: error.message 
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const order = await Order.findById(id)
      .populate('customer', 'fullName email phone')
      .populate('items.product', 'name images')
      .populate('items.merchant', 'companyName');
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    
    // Check authorization
    const isAdmin = req.user.role === 'admin';
    const isCustomer = order.customer._id.toString() === userId.toString();
    const isMerchant = order.items.some(
      item => item.merchant._id.toString() === userId.toString()
    );
    
    if (!isAdmin && !isCustomer && !isMerchant) {
      return res.status(403).json({ 
        success: false,
        message: 'You are not authorized to view this order' 
      });
    }
    
    // If merchant, filter items to only show their items
    if (isMerchant && !isAdmin && !isCustomer) {
      order.items = order.items.filter(
        item => item.merchant._id.toString() === userId.toString()
      );
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching order',
      error: error.message 
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, estimatedDelivery } = req.body;
    const userId = req.user._id;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    
    // Check authorization
    const isAdmin = req.user.role === 'admin';
    const isMerchant = order.items.some(
      item => item.merchant.toString() === userId.toString()
    );
    
    if (!isAdmin && !isMerchant) {
      return res.status(403).json({ 
        success: false,
        message: 'You are not authorized to update this order' 
      });
    }
    
    // Update fields
    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);
    
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating order',
      error: error.message 
    });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionId } = req.body;
    
    // Only admins can update payment status
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only administrators can update payment status' 
      });
    }
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    
    // Update payment details
    order.paymentDetails.status = status;
    if (transactionId) order.paymentDetails.transactionId = transactionId;
    
    // If payment is completed, set paidAt date
    if (status === 'completed') {
      order.paymentDetails.paidAt = new Date();
    }
    
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating payment status',
      error: error.message 
    });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    
    // Check authorization
    const isAdmin = req.user.role === 'admin';
    const isCustomer = order.customer.toString() === userId.toString();
    
    if (!isAdmin && !isCustomer) {
      return res.status(403).json({ 
        success: false,
        message: 'You are not authorized to cancel this order' 
      });
    }
    
    // Check if order can be cancelled
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ 
        success: false,
        message: `Order cannot be cancelled because it is already ${order.status}` 
      });
    }
    
    // Update order status
    order.status = 'cancelled';
    
    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }
    
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error cancelling order',
      error: error.message 
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getCustomerOrders,
  getMerchantOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder
};