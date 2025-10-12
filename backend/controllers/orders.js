const { OrderPG, ProductPG, MerchantPG, UserPG } = require('../models/indexPG');
const { Op } = require('sequelize');

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const orders = await OrderPG.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: ProductPG,
          as: 'products',
          attributes: ['name', 'price', 'image']
        },
        {
          model: MerchantPG,
          as: 'merchant',
          attributes: ['businessName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

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
    const order = await OrderPG.findOne({ 
      where: {
        id: req.params.id, 
        userId: req.user.id 
      },
      include: [
        {
          model: ProductPG,
          as: 'products',
          attributes: ['name', 'price', 'image']
        },
        {
          model: MerchantPG,
          as: 'merchant',
          attributes: ['businessName']
        }
      ]
    });

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
  const { sequelize } = require('../models/indexPG');
  const transaction = await sequelize.transaction();

  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      notes
    } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Order items are required'
      });
    }

    if (!shippingAddress) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Shipping address is required'
      });
    }

    if (!paymentMethod) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Payment method is required'
      });
    }

    // Calculate total amount
    const totalAmount = items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Create order
    const order = await OrderPG.create({
      userId: req.user.id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      notes
    }, { transaction });

    // Update product stock
    for (const item of items) {
      const [updatedRows] = await ProductPG.update(
        { 
          stockQuantity: sequelize.literal(`stockQuantity - ${item.quantity}`),
          soldQuantity: sequelize.literal(`soldQuantity + ${item.quantity}`)
        },
        { 
          where: { 
            id: item.product, 
            stockQuantity: { [Op.gte]: item.quantity } 
          },
          transaction 
        }
      );

      if (updatedRows === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for product ${item.product}`
        });
      }
    }

    await transaction.commit();

    // Fetch the created order with associations
    const createdOrder = await OrderPG.findByPk(order.id, {
      include: [
        {
          model: ProductPG,
          as: 'products',
          attributes: ['name', 'price', 'image']
        },
        {
          model: MerchantPG,
          as: 'merchant',
          attributes: ['businessName']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdOrder
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order. Please try again later.'
    });
  }
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

    const order = await OrderPG.findOne({
      where: { 
        id: req.params.id, 
        user: req.user.id 
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    await order.update({ status });

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
// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  const { sequelize } = require('../models/indexPG');
  const transaction = await sequelize.transaction();

  try {
    const order = await OrderPG.findOne({ 
      where: {
        id: req.params.id, 
        userId: req.user.id 
      },
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Only allow cancellation if order is pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel order in current status'
      });
    }

    // Update order status
    await OrderPG.update(
      { status: 'cancelled' },
      { 
        where: { id: order.id },
        transaction 
      }
    );

    // Restore stock for each item
    for (const item of order.items) {
      await ProductPG.update(
        { 
          stockQuantity: sequelize.literal(`stockQuantity + ${item.quantity}`),
          soldQuantity: sequelize.literal(`soldQuantity - ${item.quantity}`)
        },
        { 
          where: { id: item.product },
          transaction 
        }
      );
    }

    await transaction.commit();

    // Fetch updated order
    const updatedOrder = await OrderPG.findByPk(order.id);

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel order. Please try again later.'
    });
  }
};

module.exports = {
  getUserOrders,
  getSingleOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder
};