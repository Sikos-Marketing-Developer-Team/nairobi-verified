const User = require('../models/User');
const Merchant = require('../models/Merchant');
const passport = require('passport');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password
    });

    // Log the user in via session
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Error logging in after registration'
        });
      }
      
      return res.status(201).json({
        success: true,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isMerchant: false
        }
      });
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Register merchant
// @route   POST /api/auth/register/merchant
// @access  Public
exports.registerMerchant = async (req, res) => {
  try {
    const { 
      businessName, 
      email, 
      phone, 
      password,
      businessType,
      description,
      yearEstablished,
      website,
      address,
      location,
      landmark,
      businessHours
    } = req.body;

    // Check if merchant already exists
    const merchantExists = await Merchant.findOne({ email });

    if (merchantExists) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Create merchant
    const merchant = await Merchant.create({
      businessName,
      email,
      phone,
      password,
      businessType,
      description,
      yearEstablished,
      website,
      address,
      location,
      landmark,
      businessHours
    });

    // Log the merchant in via session
    req.login(merchant, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Error logging in after registration'
        });
      }
      
      return res.status(201).json({
        success: true,
        user: {
          id: merchant._id,
          businessName: merchant.businessName,
          email: merchant.email,
          phone: merchant.phone,
          businessType: merchant.businessType,
          verified: merchant.verified,
          isMerchant: true
        }
      });
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Log the user in via session
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Error logging in'
        });
      }
      
      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isMerchant: false
        }
      });
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Login merchant
// @route   POST /api/auth/login/merchant
// @access  Public
exports.loginMerchant = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    // Check for merchant
    const merchant = await Merchant.findOne({ email }).select('+password');

    if (!merchant) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await merchant.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Log the merchant in via session
    req.login(merchant, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Error logging in'
        });
      }
      
      return res.status(200).json({
        success: true,
        user: {
          id: merchant._id,
          businessName: merchant.businessName,
          email: merchant.email,
          phone: merchant.phone,
          businessType: merchant.businessType,
          verified: merchant.verified,
          isMerchant: true
        }
      });
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    // User is already attached to req by passport
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  // Handle passport logout
  req.logout(function(err) {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Error logging out'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  });
};

// @desc    Google OAuth login
// @route   GET /api/auth/google
// @access  Public
exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: true }, (err, user, info) => {
    if (err) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=${err.message}`);
    }
    
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=Authentication failed`);
    }
    
    // Log in the user
    req.login(user, (loginErr) => {
      if (loginErr) {
        return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=${loginErr.message}`);
      }
      
      // Redirect to frontend after successful login
      return res.redirect(`${process.env.FRONTEND_URL}/auth/social-callback?success=true`);
    });
  })(req, res, next);
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Use mock data in development
    if (process.env.NODE_ENV === 'development' && process.env.MOCK_DB === 'true') {
      // In mock mode, just return success
      return res.status(200).json({
        success: true,
        message: 'Password reset email sent'
      });
    }

    // Find user by email
    let user = await User.findOne({ email });
    
    if (!user) {
      // Check if it's a merchant
      user = await Merchant.findOne({ email });
    }

    // Return success even if user not found (security)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Password reset email sent'
      });
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    await user.save();

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;
    
    // In a production app, send email with reset URL
    console.log('Reset URL:', resetUrl);
    
    // For now, just log it and return success
    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      resetUrl // Only include in development
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    
    // If there is an error, clean user fields
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
    }
    
    res.status(500).json({
      success: false,
      error: 'Email could not be sent'
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');
    
    // Use mock data in development
    if (process.env.NODE_ENV === 'development' && process.env.MOCK_DB === 'true') {
      // In mock mode, just return success
      return res.status(200).json({
        success: true,
        message: 'Password reset successful'
      });
    }

    // Find user with token and valid expire time
    let user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      // Check if it's a merchant
      user = await Merchant.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Could not reset password'
    });
  }
};

