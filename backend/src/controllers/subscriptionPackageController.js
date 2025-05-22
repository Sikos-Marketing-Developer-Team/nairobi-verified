const SubscriptionPackage = require('../models/SubscriptionPackage');

// Create a new subscription package (admin only)
const createPackage = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      duration,
      durationUnit,
      features,
      productLimit,
      featuredProductsLimit,
      priority,
      isActive
    } = req.body;

    // Create the package
    const subscriptionPackage = new SubscriptionPackage({
      name,
      description,
      price,
      duration,
      durationUnit,
      features: Array.isArray(features) ? features : JSON.parse(features),
      productLimit,
      featuredProductsLimit,
      priority: priority || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await subscriptionPackage.save();

    res.status(201).json({
      success: true,
      message: 'Subscription package created successfully',
      package: subscriptionPackage
    });
  } catch (error) {
    console.error('Create subscription package error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating subscription package',
      error: error.message
    });
  }
};

// Get all subscription packages
const getAllPackages = async (req, res) => {
  try {
    const { active } = req.query;
    
    // Build query
    const query = {};
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    const packages = await SubscriptionPackage.find(query).sort({ priority: -1, price: 1 });
    
    res.status(200).json({
      success: true,
      count: packages.length,
      packages
    });
  } catch (error) {
    console.error('Get subscription packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription packages',
      error: error.message
    });
  }
};

// Get a single subscription package by ID
const getPackageById = async (req, res) => {
  try {
    const packageId = req.params.id;
    
    const subscriptionPackage = await SubscriptionPackage.findById(packageId);
    
    if (!subscriptionPackage) {
      return res.status(404).json({
        success: false,
        message: 'Subscription package not found'
      });
    }
    
    res.status(200).json({
      success: true,
      package: subscriptionPackage
    });
  } catch (error) {
    console.error('Get subscription package error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription package',
      error: error.message
    });
  }
};

// Update a subscription package (admin only)
const updatePackage = async (req, res) => {
  try {
    const packageId = req.params.id;
    
    const {
      name,
      description,
      price,
      duration,
      durationUnit,
      features,
      productLimit,
      featuredProductsLimit,
      priority,
      isActive
    } = req.body;
    
    // Find the package
    const subscriptionPackage = await SubscriptionPackage.findById(packageId);
    
    if (!subscriptionPackage) {
      return res.status(404).json({
        success: false,
        message: 'Subscription package not found'
      });
    }
    
    // Update fields
    if (name) subscriptionPackage.name = name;
    if (description) subscriptionPackage.description = description;
    if (price !== undefined) subscriptionPackage.price = price;
    if (duration) subscriptionPackage.duration = duration;
    if (durationUnit) subscriptionPackage.durationUnit = durationUnit;
    if (features) {
      subscriptionPackage.features = Array.isArray(features) ? features : JSON.parse(features);
    }
    if (productLimit !== undefined) subscriptionPackage.productLimit = productLimit;
    if (featuredProductsLimit !== undefined) subscriptionPackage.featuredProductsLimit = featuredProductsLimit;
    if (priority !== undefined) subscriptionPackage.priority = priority;
    if (isActive !== undefined) subscriptionPackage.isActive = isActive;
    
    await subscriptionPackage.save();
    
    res.status(200).json({
      success: true,
      message: 'Subscription package updated successfully',
      package: subscriptionPackage
    });
  } catch (error) {
    console.error('Update subscription package error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subscription package',
      error: error.message
    });
  }
};

// Delete a subscription package (admin only)
const deletePackage = async (req, res) => {
  try {
    const packageId = req.params.id;
    
    const result = await SubscriptionPackage.findByIdAndDelete(packageId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Subscription package not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Subscription package deleted successfully'
    });
  } catch (error) {
    console.error('Delete subscription package error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting subscription package',
      error: error.message
    });
  }
};

module.exports = {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage
};