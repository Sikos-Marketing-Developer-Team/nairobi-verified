const { MerchantPG, UserPG, ProductPG, DocumentPG } = require('../models/indexPG');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const { MerchantOnboardingService } = require('../services/merchantOnboarding');

// Utility function to get user ID from request
const getUserIdFromReq = (req) => {
  if (req.user && (req.user._id || req.user.id)) return String(req.user._id || req.user.id);
  if (req.merchant && (req.merchant._id || req.merchant.id)) return String(req.merchant._id || req.merchant.id);
  return null;
}

// @desc    Get all merchants
// @route   GET /api/merchants
// @access  Public
exports.getMerchants = async (req, res) => {
  try {
    const merchants = await MerchantPG.findAll({ 
      limit: 25,
      raw: true 
    });

    res.status(200).json({
      success: true,
      count: merchants.length,
      data: merchants
    });
  } catch (error) {
    console.error('getMerchants error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get single merchant
// @route   GET /api/merchants/:id
// @access  Public
exports.getMerchant = async (req, res) => {
  try {
    const merchant = await MerchantPG.findByPk(req.params.id, { raw: true });
    if (!merchant) {
      return res.status(404).json({ success: false, error: `Merchant not found with id of ${req.params.id}` });
    }

    res.status(200).json({ success: true, data: merchant });
  } catch (error) {
    console.error('getMerchant error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create merchant (registration)
// @route   POST /api/merchants/register
// @access  Public
exports.createMerchant = async (req, res) => {
  try {
    const { businessName, email, phone, password, businessType, description } = req.body;

    // Check if merchant already exists
    const existingMerchant = await MerchantPG.findOne({
      where: { email }
    });

    if (existingMerchant) {
      return res.status(400).json({
        success: false,
        error: 'Merchant with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password || 'temporary123', 10);

    // Create new merchant
    const merchant = await MerchantPG.create({
      businessName,
      ownerName: businessName, // Use businessName as ownerName for now
      email,
      phone,
      password: hashedPassword,
      businessCategory: businessType,
      businessDescription: description || 'Business description to be updated',
      verificationStatus: 'pending',
      isFeatured: false,
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: {
        id: merchant.id,
        businessName: merchant.businessName,
        email: merchant.email,
        phone: merchant.phone,
        businessCategory: merchant.businessCategory,
        verificationStatus: merchant.verificationStatus
      }
    });
  } catch (error) {
    console.error('createMerchant error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update merchant
// @route   PUT /api/merchants/:id
// @access  Private
exports.updateMerchant = async (req, res) => {
  try {
    const [updatedRowsCount] = await MerchantPG.update(
      req.body, 
      { 
        where: { id: req.params.id },
        returning: true
      }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({ success: false, error: 'Merchant not found' });
    }

    const merchant = await MerchantPG.findByPk(req.params.id, { raw: true });

    res.status(200).json({ success: true, data: merchant });
  } catch (error) {
    console.error('updateMerchant error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete merchant
// @route   DELETE /api/merchants/:id
// @access  Private
exports.deleteMerchant = async (req, res) => {
  try {
    const deleted = await MerchantPG.destroy({
      where: { id: req.params.id }
    });

    if (deleted === 0) {
      return res.status(404).json({ success: false, error: 'Merchant not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('deleteMerchant error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Placeholder functions for other routes
exports.uploadLogo = async (req, res) => {
  res.status(501).json({ success: false, message: 'Upload logo functionality needs implementation' });
};

exports.uploadBanner = async (req, res) => {
  res.status(501).json({ success: false, message: 'Upload banner functionality needs implementation' });
};

exports.uploadGallery = async (req, res) => {
  res.status(501).json({ success: false, message: 'Upload gallery functionality needs implementation' });
};

exports.uploadDocuments = async (req, res) => {
  res.status(501).json({ success: false, message: 'Upload documents functionality needs implementation' });
};

exports.verifyMerchant = async (req, res) => {
  res.status(501).json({ success: false, message: 'Verify merchant functionality needs implementation' });
};

exports.createMerchantByAdmin = async (req, res) => {
  res.status(501).json({ success: false, message: 'Admin create merchant functionality needs implementation' });
};

exports.completeAccountSetup = async (req, res) => {
  res.status(501).json({ success: false, message: 'Account setup functionality needs implementation' });
};

exports.getSetupInfo = async (req, res) => {
  res.status(501).json({ success: false, message: 'Setup info functionality needs implementation' });
};

exports.sendCredentials = async (req, res) => {
  res.status(501).json({ success: false, message: 'Send credentials functionality needs implementation' });
};

exports.setFeatured = async (req, res) => {
  res.status(501).json({ success: false, message: 'Set featured functionality needs implementation' });
};