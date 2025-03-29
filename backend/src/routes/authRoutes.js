const express = require('express');
const router = express.Router();
const { 
  registerClient,
  registerMerchant,
  login, 
  googleAuth, 
  googleCallback, 
  logout, 
  getCurrentUser,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
  verifyEmail
} = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Registration routes
router.post('/register/client', registerClient);
router.post('/register/merchant', registerMerchant);

// Login route
router.post('/login', login);

// Password reset routes
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Email verification routes
router.post('/send-verification', sendVerificationEmail);
router.get('/verify-email/:token', verifyEmail);

// Google authentication routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Logout route
router.post('/logout', logout);

// Get current user route
router.get('/me', isAuthenticated, getCurrentUser);

module.exports = router; 