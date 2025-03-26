const express = require('express');
const router = express.Router();
const { 
  login, 
  googleAuth, 
  googleCallback, 
  logout, 
  getCurrentUser,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  handleGoogleAuth
} = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Local login route
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
router.post('/google', handleGoogleAuth);

// Logout route
router.post('/logout', isAuthenticated, logout);

// Get current user route
router.get('/me', isAuthenticated, getCurrentUser);

module.exports = router; 