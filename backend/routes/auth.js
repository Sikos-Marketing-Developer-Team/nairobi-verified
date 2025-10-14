const express = require('express');
const passport = require('passport');
const {
  register,
  registerMerchant,
  login,
  loginMerchant,
  getMe,
  logout,
  googleAuth,
  googleAuthRedirect,
  googleCallback,
  forgotPassword,
  resetPassword,
  changeMerchantPassword
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const { strictAuthLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// Validation middleware for register
const validateRegister = [
  check('firstName').trim().notEmpty().withMessage('First name is required'),
  check('lastName').trim().notEmpty().withMessage('Last name is required'),
  check('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  check('phone')
    .trim()
    .notEmpty()
    .matches(/^\+?\d{10,15}$/)
    .withMessage('Phone number must be 10-15 digits, optionally starting with +'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, error: errors.array().map(err => err.msg).join(', ') });
    }
    // normalize phone number
    req.body.phone = req.body.phone.replace(/\s|-/g, '');
    next();
  }
];

// Validation middleware for login
const validateLogin = [
  check('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  check('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, error: errors.array().map(err => err.msg).join(', ') });
    }
    next();
  }
];

// Check session status
router.get('/check', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ success: true, isAuthenticated: true, user: req.user });
  } else {
    res.json({ success: true, isAuthenticated: false });
  }
});

// Auth routes with strict limiter on sensitive endpoints
router.post('/register', strictAuthLimiter, validateRegister, register);
router.post('/register/merchant', strictAuthLimiter, registerMerchant);
router.post('/login', strictAuthLimiter, validateLogin, login);
router.post('/login/merchant', strictAuthLimiter, validateLogin, loginMerchant);

router.get('/me', protect, getMe);
router.get('/logout', logout);

// Google OAuth routes
router.post('/google', googleAuth); // For handling Google ID tokens from frontend
router.get('/google', googleAuthRedirect); // Redirect-based OAuth
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: process.env.FRONTEND_URL + '/auth?error=authentication_failed',
    failureMessage: true
  }),
  googleCallback
);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);

module.exports = router;
