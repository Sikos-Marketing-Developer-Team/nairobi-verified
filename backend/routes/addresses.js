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
    const address = await AddressPG.findOne({ 
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
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

    const newAddress = await AddressPG.create({
      userId: req.user.id,
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
    const address = await AddressPG.findOne({ 
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
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

    // Update fields using Sequelize update
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (addressLine) updateData.address = addressLine;
    if (city) updateData.city = city;
    if (county) updateData.county = county;
    if (postalCode) updateData.postalCode = postalCode;
    if (typeof isDefault === 'boolean') updateData.isDefault = isDefault;
    if (type) updateData.type = type;
    if (label) updateData.label = label;

    await address.update(updateData);

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
    const address = await AddressPG.findOne({ 
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }

    await address.destroy();

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
    const address = await AddressPG.findOne({ 
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }

    // Remove default from all other addresses
    await AddressPG.update(
      { isDefault: false },
      { 
        where: { 
          userId: req.user.id, 
          id: { [Op.ne]: req.params.id } 
        } 
      }
    );

    // Set this address as default
    await address.update({ isDefault: true });

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
