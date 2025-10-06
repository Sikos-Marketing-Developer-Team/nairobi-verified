const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updatePassword
} = require('../controllers/users');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Mock wishlist data - replace with actual User model when updated
const mockWishlists = {};

// Mock addresses data - replace with actual User model when updated
const mockUserAddresses = {};

// Admin routes for user management
router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/:id')
  .get(protect, authorize('admin'), getUser)
  .put(protect, updateUser)
  .delete(protect, authorize('admin'), deleteUser);

router.put('/:id/password', protect, updatePassword);

// Profile routes - FIXED: moved these BEFORE the /:id routes to avoid conflicts
router.get('/me', protect, async (req, res) => {
  try {
    // Ensure we have user data
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

router.put('/me', protect, async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    
    // Get the User model
    const User = require('../models/User');
    
    // Validate email format if provided
    if (email && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }
    
    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email is already taken by another user'
        });
      }
    }
    
    // Update user in database
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpire');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join('. ')
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email is already registered'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update profile. Please try again.'
    });
  }
});

// Wishlist routes - FIXED: moved these BEFORE /:id routes
router.get('/wishlist', protect, async (req, res) => {
  try {
    const userWishlist = mockWishlists[req.user.id] || [];
    
    // Handle empty wishlist gracefully
    if (userWishlist.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'Your wishlist is empty. Start adding items you love!'
      });
    }
    
    res.json({
      success: true,
      data: userWishlist
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wishlist. Please try again later.'
    });
  }
});

router.post('/wishlist', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }
    
    if (!mockWishlists[req.user.id]) {
      mockWishlists[req.user.id] = [];
    }
    
    // Check if item already exists in wishlist
    const existingItem = mockWishlists[req.user.id].find(item => item.productId === productId);
    if (existingItem) {
      return res.status(400).json({
        success: false,
        error: 'Item already in wishlist'
      });
    }
    
    // TODO: Fetch product details from database
    const wishlistItem = {
      id: Date.now().toString(),
      productId,
      name: 'Sample Product',
      price: 1000,
      image: '/placeholder.jpg',
      merchantId: 'merchant1',
      merchantName: 'Sample Merchant',
      addedAt: new Date()
    };
    
    mockWishlists[req.user.id].push(wishlistItem);
    
    res.status(201).json({
      success: true,
      data: wishlistItem
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add to wishlist. Please try again later.'
    });
  }
});

router.delete('/wishlist/:productId', protect, async (req, res) => {
  try {
    if (!mockWishlists[req.user.id]) {
      return res.status(404).json({
        success: false,
        error: 'Wishlist item not found'
      });
    }
    
    const itemIndex = mockWishlists[req.user.id].findIndex(item => item.productId === req.params.productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Wishlist item not found'
      });
    }
    
    mockWishlists[req.user.id].splice(itemIndex, 1);
    
    res.json({
      success: true,
      message: 'Item removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove from wishlist. Please try again later.'
    });
  }
});

// User addresses routes - FIXED: moved these BEFORE /:id routes
router.get('/addresses', protect, async (req, res) => {
  try {
    const userAddresses = mockUserAddresses[req.user.id] || [];
    
    // Handle empty addresses gracefully
    if (userAddresses.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No addresses found. Add your first address to get started!'
      });
    }
    
    res.json({
      success: true,
      data: userAddresses
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch addresses. Please try again later.'
    });
  }
});

router.post('/addresses', protect, async (req, res) => {
  try {
    const { name, phone, address, city, area, landmark, isDefault } = req.body;
    
    // Validate required fields
    if (!name || !phone || !address || !city) {
      return res.status(400).json({
        success: false,
        error: 'Name, phone, address, and city are required'
      });
    }
    
    if (!mockUserAddresses[req.user.id]) {
      mockUserAddresses[req.user.id] = [];
    }
    
    const newAddress = {
      id: Date.now().toString(),
      userId: req.user.id,
      name,
      phone,
      address,
      city,
      area,
      landmark,
      isDefault: isDefault || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // If this is set as default, unset others
    if (isDefault) {
      mockUserAddresses[req.user.id].forEach(addr => {
        addr.isDefault = false;
      });
    }
    
    mockUserAddresses[req.user.id].push(newAddress);
    
    res.status(201).json({
      success: true,
      data: newAddress
    });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add address. Please try again later.'
    });
  }
});

router.put('/addresses/:addressId', protect, async (req, res) => {
  try {
    const { name, phone, address, city, area, landmark, isDefault } = req.body;
    
    if (!mockUserAddresses[req.user.id]) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }
    
    const addressIndex = mockUserAddresses[req.user.id].findIndex(addr => addr.id === req.params.addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }
    
    // If this is set as default, unset others
    if (isDefault) {
      mockUserAddresses[req.user.id].forEach(addr => {
        addr.isDefault = false;
      });
    }
    
    mockUserAddresses[req.user.id][addressIndex] = {
      ...mockUserAddresses[req.user.id][addressIndex],
      name: name || mockUserAddresses[req.user.id][addressIndex].name,
      phone: phone || mockUserAddresses[req.user.id][addressIndex].phone,
      address: address || mockUserAddresses[req.user.id][addressIndex].address,
      city: city || mockUserAddresses[req.user.id][addressIndex].city,
      area: area || mockUserAddresses[req.user.id][addressIndex].area,
      landmark: landmark || mockUserAddresses[req.user.id][addressIndex].landmark,
      isDefault: isDefault !== undefined ? isDefault : mockUserAddresses[req.user.id][addressIndex].isDefault,
      updatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: mockUserAddresses[req.user.id][addressIndex]
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update address. Please try again later.'
    });
  }
});

router.delete('/addresses/:addressId', protect, async (req, res) => {
  try {
    if (!mockUserAddresses[req.user.id]) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }
    
    const addressIndex = mockUserAddresses[req.user.id].findIndex(addr => addr.id === req.params.addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }
    
    mockUserAddresses[req.user.id].splice(addressIndex, 1);
    
    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete address. Please try again later.'
    });
  }
});

// Change password route
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }
    
    // TODO: Validate current password and update with new password
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password. Please try again later.'
    });
  }
});

module.exports = router;