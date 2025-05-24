const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { 
  registerClient,
  registerMerchant,
  login, 
  logout, 
  getCurrentUser,
  checkAuth,
  requestPasswordReset,
  resetPassword,
  resendVerificationEmail,
  verifyEmail
} = require('../controllers/authController');
const { isAuthenticated, isEmailVerified } = require('../middleware/authMiddleware');

// Registration routes
router.post('/register/client', registerClient);
router.post('/register/merchant', registerMerchant);
router.post('/signup', registerClient);

// Login route
router.post('/login', login);

// Auth check route
router.get('/check', checkAuth);

// Password reset routes
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Email verification routes
router.post('/send-verification', resendVerificationEmail);
router.get('/verify-email/:token', verifyEmail);

// Google authentication routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/auth/signin` }),
  (req, res) => {
    // Store user in session
    req.session.user = {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone || '',
      role: req.user.role
    };
    console.log('google/callback: Session set:', req.session.user);

    const redirectUrl = req.user.isEmailVerified 
      ? (req.user.role === 'merchant' ? '/vendor/dashboard' : '/dashboard')
      : '/auth/verify-email';
    res.redirect(`${process.env.FRONTEND_URL}${redirectUrl}`);
  }
);

// Get current user route
router.get('/user', isAuthenticated, getCurrentUser);

// Logout route
router.post('/logout', logout);

// Authenticated user info
router.get('/me', isAuthenticated, getCurrentUser);

module.exports = router;