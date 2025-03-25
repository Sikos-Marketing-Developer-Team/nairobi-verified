const express = require('express');
const router = express.Router();
const { 
  login, 
  googleAuth, 
  googleCallback, 
  logout, 
  getCurrentUser 
} = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Local login route
router.post('/login', login);

// Google authentication routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Logout route
router.post('/logout', isAuthenticated, logout);

// Get current user route
router.get('/me', isAuthenticated, getCurrentUser);

module.exports = router; 