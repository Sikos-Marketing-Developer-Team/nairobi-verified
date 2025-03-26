// Authentication routes
const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { 
  login,
  signUp,
  logout, 
  getCurrentUser 
} = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');
require('dotenv').config();

// Google Authentication routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: true }));

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
    (req, res) => {
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    }
);

router.get('/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json({
      id: req.user._id,
      email: req.user.email,
      displayName: req.user.displayName,
      photo: req.user.photo,
    });
});

// Logout route
router.post('/logout', isAuthenticated, logout);

// Get current user route
router.get('/me', isAuthenticated, getCurrentUser);

// Local Authentication routes
router.post('/login', login);
router.post('/signup', signUp);

module.exports = router;