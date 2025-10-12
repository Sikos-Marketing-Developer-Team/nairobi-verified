const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { AddressPG } = require('../models/indexPG');
const { Op } = require('sequelize');

// @desc    Get user addresses
// @route   GET /api/addresses
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const addresses = await AddressPG.findAll({ 
      where: { userId: req.user.id },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: addresses.length,
      data: addresses
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single address
// @route   GET /api/addresses/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const address = await Address.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }

    res.json({
      success: true,
      data: address
    });
  } catch (error) {
    console.error('Error fetching address:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create new address
// @route   POST /api/addresses
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      fullName,
      phone,
      address,
      city,
      county,
      postalCode,
      isDefault = false,
      type = 'home',
      label
    } = req.body;

    // Validate required fields
    if (!fullName || !phone || !address || !city || !county) {
      return res.status(400).json({
        success: false,
        error: 'All required fields must be provided'
      });
    }

    const newAddress = await Address.create({
      user: req.user._id,
      fullName,
      phone,
      address,
      city,
      county,
      postalCode,
      isDefault,
      type,
      label
    });

    res.status(201).json({
      success: true,
      data: newAddress
    });
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const address = await Address.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }

    const {
      fullName,
      phone,
      address: addressLine,
      city,
      county,
      postalCode,
      isDefault,
      type,
      label
    } = req.body;

    // Update fields
    if (fullName) address.fullName = fullName;
    if (phone) address.phone = phone;
    if (addressLine) address.address = addressLine;
    if (city) address.city = city;
    if (county) address.county = county;
    if (postalCode) address.postalCode = postalCode;
    if (typeof isDefault === 'boolean') address.isDefault = isDefault;
    if (type) address.type = type;
    if (label) address.label = label;

    await address.save();

    res.json({
      success: true,
      data: address
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const address = await Address.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }

    await Address.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Set default address
// @route   PUT /api/addresses/:id/default
// @access  Private
router.put('/:id/default', protect, async (req, res) => {
  try {
    const address = await Address.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }

    // Remove default from all other addresses
    await Address.updateMany(
      { user: req.user._id, _id: { $ne: req.params.id } },
      { isDefault: false }
    );

    // Set this address as default
    address.isDefault = true;
    await address.save();

    res.json({
      success: true,
      data: address
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
