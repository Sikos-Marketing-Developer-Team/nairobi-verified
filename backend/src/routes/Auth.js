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
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/auth/signin`, session: false }),
  (req, res) => {
    const token = req.user.token;
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000
    });
    const redirectUrl = req.user.isEmailVerified ? 
      (req.user.role === 'merchant' ? `${process.env.FRONTEND_URL}/vendor/dashboard` : `${process.env.FRONTEND_URL}/dashboard`) :
      `${process.env.FRONTEND_URL}/auth/verify-email`;
    res.redirect(redirectUrl);
  }
);

// Get current user route
router.get('/user', isAuthenticated, getCurrentUser);

// Logout route
router.post('/logout', logout);

// Authenticated user info
router.get('/me', isAuthenticated, getCurrentUser);

module.exports = router;