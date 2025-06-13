const express = require('express');
const {
  register,
  registerMerchant,
  login,
  loginMerchant,
  getMe,
  logout,
  googleAuth,
  googleCallback,
  forgotPassword,
  resetPassword
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Standard auth routes
router.post('/register', register);
router.post('/register/merchant', registerMerchant);
router.post('/login', login);
router.post('/login/merchant', loginMerchant);
router.get('/me', protect, getMe);
router.get('/logout', logout);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);

module.exports = router;