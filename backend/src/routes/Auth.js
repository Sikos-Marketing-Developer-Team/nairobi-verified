const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { 
  registerClient,
  registerMerchant,
  login, 
  logout, 
  getCurrentUser,
  requestPasswordReset,
  resetPassword,
  resendVerificationEmail,
  verifyEmail
} = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// Registration routes
router.post('/register/client', registerClient);
router.post('/register/merchant', registerMerchant);
router.post('/signup', registerClient); // Add this route to match frontend expectation

// Login route
router.post('/login', login);

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
    const token = req.user.token; // From passport.js
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  }
);

// Get current user route (JWT-based)
router.get('/user', (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    User.findById(decoded.userId)
      .then(user => {
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          photo: user.google?.picture,
        });
      })
      .catch(() => res.status(500).json({ message: 'Server error' }));
  });
});

// Logout route
router.post('/logout', logout);

// Authenticated user info
router.get('/me', isAuthenticated, getCurrentUser);

module.exports = router;