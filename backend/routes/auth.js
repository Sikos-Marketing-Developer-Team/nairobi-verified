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
  changeMerchantPassword,
  changeTemporaryPassword
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const { strictAuthLimiter, merchantRegisterLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// OPTIMIZED: Validation middleware for register
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
      return res.status(400).json({ 
        success: false, 
        error: errors.array()[0].msg // Return first error only
      });
    }
    // Normalize phone number
    req.body.phone = req.body.phone.replace(/\s|-/g, '');
    next();
  }
];

// OPTIMIZED: Validation middleware for merchant registration
const validateMerchantRegister = [
  check('businessName').trim().notEmpty().withMessage('Business name is required'),
  check('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  check('phone')
    .trim()
    .notEmpty()
    .matches(/^\+?\d{10,15}$/)
    .withMessage('Phone number must be 10-15 digits'),
  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  check('businessType').trim().notEmpty().withMessage('Business type is required'),
  check('description').trim().notEmpty().withMessage('Description is required'),
  check('address').trim().notEmpty().withMessage('Address is required'),
  check('location').trim().notEmpty().withMessage('Location is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: errors.array()[0].msg // Return first error only
      });
    }
    // Normalize phone number
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
      return res.status(400).json({ 
        success: false, 
        error: errors.array()[0].msg // Return first error only
      });
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

// Auth routes with optimized rate limiting
router.post('/register', strictAuthLimiter, validateRegister, register);

// CRITICAL: Merchant registration with dedicated rate limiter and validation
router.post('/register/merchant', 
  merchantRegisterLimiter,        // NEW: Dedicated merchant limiter
  validateMerchantRegister,       // NEW: Merchant-specific validation
  registerMerchant
);

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

// Merchant password change routes
router.post('/merchant/change-temporary-password', protect, changeTemporaryPassword); // First time login
router.post('/merchant/change-password', changeMerchantPassword); // Subsequent changes

module.exports = router;