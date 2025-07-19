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

router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/:id')
  .get(protect, authorize('admin'), getUser)
  .put(protect, updateUser)
  .delete(protect, authorize('admin'), deleteUser);

router.put('/:id/password', protect, updatePassword);

// Profile routes
router.get('/me', protect, async (req, res) => {
  try {
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
    // TODO: Update user profile in database
    res.json({
      success: true,
      data: { ...req.user, ...req.body }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// Wishlist routes
router.get('/wishlist', protect, async (req, res) => {
  try {
    const userWishlist = mockWishlists[req.user.id] || [];
    
    res.json({
      success: true,
      data: userWishlist
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wishlist'
    });
  }
});

router.post('/wishlist', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!mockWishlists[req.user.id]) {
      mockWishlists[req.user.id] = [];
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
      error: 'Failed to add to wishlist'
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
      data: {}
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove from wishlist'
    });
  }
});

// User addresses routes
router.get('/addresses', protect, async (req, res) => {
  try {
    const userAddresses = mockUserAddresses[req.user.id] || [];
    
    res.json({
      success: true,
      data: userAddresses
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch addresses'
    });
  }
});

router.post('/addresses', protect, async (req, res) => {
  try {
    const { name, phone, address, city, area, landmark, isDefault } = req.body;
    
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
      error: 'Failed to add address'
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
      name,
      phone,
      address,
      city,
      area,
      landmark,
      isDefault: isDefault || false,
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
      error: 'Failed to update address'
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
      data: {}
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete address'
    });
  }
});

// Change password route
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // TODO: Validate current password and update with new password
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

module.exports = router;