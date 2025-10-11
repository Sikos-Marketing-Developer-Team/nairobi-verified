const { OrderPG, ProductPG } = require('../models/indexPG');

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price image')
      .populate('items.merchant', 'name')
      .sort({ createdAt: -1 })
      .lean(); // Added lean() for performance

    // Handle empty orders gracefully for new users
    if (orders.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: [],
        message: 'No orders found. Start shopping to see your orders here!'
      });
    }

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load orders. Please try again later.'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    })
    .populate('items.product', 'name price image')
    .populate('items.merchant', 'name')
    .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load order. Please try again later.'
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders  
// @access  Private
const createOrder = async (req, res) => {
  // TODO: Convert MongoDB transactions to PostgreSQL/Sequelize
  res.status(501).json({
    success: false,
    message: 'Order creation temporarily disabled - needs PostgreSQL conversion'
  });
  /*
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      notes
    } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: 'Order items are required'
      });
    }

    if (!shippingAddress) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: 'Shipping address is required'
      });
    }

    if (!paymentMethod) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: 'Payment method is required'
      });
    }

    // Calculate total amount
    const totalAmount = items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    const order = new Order({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      notes
    });

    // Update product stock
    for (const item of items) {
      await Product.updateOne(
        { _id: item.product, stockQuantity: { $gte: item.quantity } },
        { $inc: { stockQuantity: -item.quantity, soldQuantity: item.quantity } },
        { session }
      );
    }

    await order.save({ session });

    await session.commitTransaction();

    await order.populate('items.product', 'name price image');
    await order.populate('items.merchant', 'name');

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order. Please try again later.'
    });
  } finally {
    session.endSession();
  }
  */
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status. Please try again later.'
    });
  }
};

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private
const cancelOrder = async (req, res) => {
  // TODO: Convert MongoDB transactions to PostgreSQL/Sequelize
  res.status(501).json({
    success: false,
    message: 'Order cancellation temporarily disabled - needs PostgreSQL conversion'
  });
  /*
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Only allow cancellation if order is pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel order in current status'
      });
    }

    order.status = 'cancelled';

    // Restore stock
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { stockQuantity: item.quantity, soldQuantity: -item.quantity } },
        { session }
      );
    }

    await order.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel order. Please try again later.'
    });
  } finally {
    session.endSession();
  }
  */
};

module.exports = {
  getUserOrders,
  getSingleOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder
};