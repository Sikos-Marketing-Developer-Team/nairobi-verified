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

// IMPORTANT: Profile routes MUST be BEFORE /:id routes to avoid conflicts
router.get('/me', protect, async (req, res) => {
  try {
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
    const { firstName, lastName, email, phone, address } = req.body;
    const User = require('../models/User');
    
    console.log('📝 Updating user profile:', {
      userId: req.user.id,
      updateData: { firstName, lastName, email, phone, address }
    });
    
    // Validate email format if provided
    if (email && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
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
    if (address !== undefined) updateData.address = address;
    
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

    console.log('✅ User profile updated successfully:', updatedUser.email);

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    
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

// Admin routes for user management (AFTER /me routes to avoid conflicts)
router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/:id')
  .get(protect, authorize('admin'), getUser)
  .put(protect, updateUser)
  .delete(protect, authorize('admin'), deleteUser);

router.put('/:id/password', protect, updatePassword);

module.exports = router;
