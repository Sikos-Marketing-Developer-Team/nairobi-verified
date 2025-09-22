const User = require('../models/User');
const Merchant = require('../models/Merchant');
const passport = require('passport');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log('Register request body:', req.body);
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
        console.error('Login error after registration:', err);
        return res.status(500).json({
          success: false,
          error: 'Error logging in after registration'
        });
      }
      
      return res.status(201).json({
        success: true,
        user: {
          id: user.id,
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
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid input data'
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
          id: merchant.id,
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
    console.error('Merchant registration error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid input data'
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
          id: user.id,
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
    console.error('Login error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid input data'
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
          id: merchant.id,
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
    console.error('Merchant login error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid input data'
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
    console.error('GetMe error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid request'
    });
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({
          success: false,
          error: 'Error logging out'
        });
      }
      
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({
            success: false,
            error: 'Error destroying session'
          });
        }
        res.status(200).json({
          success: true,
          data: {}
        });
      });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Error logging out'
    });
  }
};

// @desc    Google OAuth with credential token
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({
        success: false,
        error: 'Google credential is required'
      });
    }

    // Initialize Google OAuth client
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    // Verify the credential token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, given_name: firstName, family_name: lastName, picture } = payload;

    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { email: email },
        { googleId: googleId }
      ]
    });

    if (user) {
      // Update existing user with Google info if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePicture = picture;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        firstName: firstName || name?.split(' ')[0] || 'User',
        lastName: lastName || name?.split(' ').slice(1).join(' ') || '',
        email: email,
        googleId: googleId,
        profilePicture: picture,
        isVerified: true, // Google accounts are pre-verified
        password: crypto.randomBytes(32).toString('hex') // Generate random password
      });
    }

    // Log the user in via session
    req.login(user, (err) => {
      if (err) {
        console.error('Login error after Google auth:', err);
        return res.status(500).json({
          success: false,
          error: 'Error logging in after Google authentication'
        });
      }

      console.log('Google login successful for user:', user.email);
      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          isVerified: user.isVerified,
          isMerchant: user.isMerchant,
          businessName: user.businessName
        }
      });
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid Google credential or authentication failed'
    });
  }
};

// @desc    Initiate Google OAuth (Legacy - for redirect flow)
// @route   GET /api/auth/google
// @access  Public
exports.googleAuthRedirect = passport.authenticate('google', { 
  scope: ['profile', 'email'] 
});

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth?error=authentication_failed`,
    failureMessage: true,
    session: true 
  }, (err, user, info) => {
    if (err) {
      console.error('Google auth callback error:', err);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth?error=${encodeURIComponent(err.message)}`);
    }
    
    if (!user) {
      console.error('Google auth failed:', info?.message || 'No user returned');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth?error=${encodeURIComponent(info?.message || 'Authentication failed')}`);
    }
    
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error('Google login error:', loginErr);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth?error=${encodeURIComponent(loginErr.message)}`);
      }
      
      console.log('Google login successful for user:', user.email);
      const redirectPath = user.isMerchant || user.businessName ? '/merchant/dashboard' : '/dashboard';
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}${redirectPath}`);
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
      console.log('Mocking password reset for email:', email);
      return res.status(200).json({
        success: true,
        message: 'Password reset email sent'
      });
    }

    // Find user by email
    let user = await User.findOne({ email });
    
    if (!user) {
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
    
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password/${resetToken}`;
    
    console.log('Reset URL:', resetUrl);
    
    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      resetUrl // Only in development
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    
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
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');
    
    if (process.env.NODE_ENV === 'development' && process.env.MOCK_DB === 'true') {
      return res.status(200).json({
        success: true,
        message: 'Password reset successful'
      });
    }

    let user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
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