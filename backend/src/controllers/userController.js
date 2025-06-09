const User = require('../models/User');
const Address = require('../models/Address');
const Notification = require('../models/Notification');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');

// Profile controllers
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email, phone, avatar } = req.body;
    
    // Build update object
    const updateFields = {};
    if (fullName) updateFields.fullName = fullName;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;
    if (avatar) updateFields.avatar = avatar;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Save user
    await user.save();
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Address controllers
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id });
    res.status(200).json(addresses);
  } catch (error) {
    console.error('Error getting addresses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const { street, city, state, zipCode, country, isDefault, label } = req.body;
    
    // Create new address
    const newAddress = new Address({
      user: req.user.id,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || false,
      label: label || 'Home'
    });
    
    // If this is the default address, unset any existing default
    if (newAddress.isDefault) {
      await Address.updateMany(
        { user: req.user.id, isDefault: true },
        { $set: { isDefault: false } }
      );
    }
    
    // Save address
    await newAddress.save();
    
    res.status(201).json(newAddress);
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { street, city, state, zipCode, country, isDefault, label } = req.body;
    
    // Find address
    let address = await Address.findOne({ 
      _id: req.params.addressId,
      user: req.user.id
    });
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // Update address fields
    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (zipCode) address.zipCode = zipCode;
    if (country) address.country = country;
    if (label) address.label = label;
    
    // Handle default address
    if (isDefault && !address.isDefault) {
      await Address.updateMany(
        { user: req.user.id, isDefault: true },
        { $set: { isDefault: false } }
      );
      address.isDefault = true;
    } else if (isDefault !== undefined) {
      address.isDefault = isDefault;
    }
    
    // Save address
    await address.save();
    
    res.status(200).json(address);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    // Find address
    const address = await Address.findOne({
      _id: req.params.addressId,
      user: req.user.id
    });
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // Delete address
    await address.remove();
    
    res.status(200).json({ message: 'Address removed' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    // Find address
    const address = await Address.findOne({
      _id: req.params.addressId,
      user: req.user.id
    });
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // Unset any existing default
    await Address.updateMany(
      { user: req.user.id, isDefault: true },
      { $set: { isDefault: false } }
    );
    
    // Set this address as default
    address.isDefault = true;
    await address.save();
    
    res.status(200).json(address);
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Notification controllers
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.notificationId,
      user: req.user.id
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.isRead = true;
    await notification.save();
    
    res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.notificationId,
      user: req.user.id
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    await notification.remove();
    
    res.status(200).json({ message: 'Notification removed' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Order controllers
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.product');
    
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user.id
    }).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};