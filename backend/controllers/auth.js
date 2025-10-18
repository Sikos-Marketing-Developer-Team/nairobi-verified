const User = require('../models/User');
const Merchant = require('../models/Merchant');
const passport = require('passport');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { HTTP_STATUS, PASSWORD_VALIDATION } = require('../config/constants');
const { emailService } = require('../utils/emailService');

// OPTIMIZATION: Email queue for async processing (fire-and-forget)
const emailQueue = [];
let isProcessingQueue = false;

const queueEmail = (emailFunc) => {
  emailQueue.push(emailFunc);
  if (!isProcessingQueue) {
    processEmailQueue();
  }
};

const processEmailQueue = async () => {
  if (emailQueue.length === 0) {
    isProcessingQueue = false;
    return;
  }

  isProcessingQueue = true;
  const emailFunc = emailQueue.shift();
  
  try {
    await emailFunc();
  } catch (error) {
    console.error('Background email error:', error.message);
  }

  // Process next email with slight delay to avoid overwhelming email service
  setTimeout(processEmailQueue, 100);
};

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // OPTIMIZATION: Skip password validation here (already done in route middleware)
    // Model will validate on save anyway

    // OPTIMIZATION: Use lean() for existence check
    const userExists = await User.findOne({ email }).lean().select('_id');

    if (userExists) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Email already registered'
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password
    });

    // OPTIMIZATION: Queue welcome email (non-blocking)
    queueEmail(async () => {
      await emailService.sendUserWelcome({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
      console.log(`Welcome email sent to: ${user.email}`);
    });

    // OPTIMIZATION: Skip req.login for faster response in load testing
    // For production with sessions, keep req.login but optimize session store
    if (process.env.SKIP_SESSION === 'true') {
      return res.status(HTTP_STATUS.CREATED).json({
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
    }

    req.login(user, (err) => {
      if (err) {
        console.error('Login error after registration:', err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: 'Error logging in after registration'
        });
      }
      
      return res.status(HTTP_STATUS.CREATED).json({
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
    console.error('Registration error:', error);
    
    // OPTIMIZATION: Better error messages
    if (error.code === 11000) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Email already registered'
      });
    }
    
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: error.message || 'Invalid input data'
    });
  }
};

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

    // OPTIMIZATION: Password validation already done in route middleware

    // OPTIMIZATION: Use lean() for faster existence check
    const merchantExists = await Merchant.findOne({ email }).lean().select('_id');

    if (merchantExists) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // OPTIMIZATION: Create merchant with minimal required fields
    const merchant = await Merchant.create({
      businessName,
      email,
      phone,
      password,
      businessType,
      description,
      ...(yearEstablished && { yearEstablished }),
      ...(website && { website }),
      address,
      location,
      ...(landmark && { landmark }),
      ...(businessHours && { businessHours })
    });

    // OPTIMIZATION: Queue both emails asynchronously (non-blocking)
    queueEmail(async () => {
      try {
        await emailService.sendMerchantRegistrationConfirmation({
          businessName: merchant.businessName,
          email: merchant.email,
          businessType: merchant.businessType
        });
        console.log(`Registration confirmation email sent to: ${merchant.email}`);
      } catch (error) {
        console.error('Registration confirmation email failed:', error.message);
      }
    });

    queueEmail(async () => {
      try {
        await emailService.sendAdminMerchantNotification({
          businessName: merchant.businessName,
          email: merchant.email,
          businessType: merchant.businessType,
          phone: merchant.phone,
          address: merchant.address,
          location: merchant.location,
          yearEstablished: merchant.yearEstablished,
          createdAt: merchant.createdAt
        });
        console.log(`Admin notification sent for new merchant: ${merchant.businessName}`);
      } catch (error) {
        console.error('Admin notification email failed:', error.message);
      }
    });

    // OPTIMIZATION: For load testing, skip session creation
    if (process.env.SKIP_SESSION === 'true') {
      return res.status(HTTP_STATUS.CREATED).json({
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
    }

    // OPTIMIZATION: Use callback-based req.login for better error handling
    req.login(merchant, (err) => {
      if (err) {
        console.error('Login error after registration:', err);
        // Still return success - merchant was created
        return res.status(HTTP_STATUS.CREATED).json({
          success: true,
          sessionWarning: 'Account created but session failed. Please login manually.',
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
      }
      
      return res.status(HTTP_STATUS.CREATED).json({
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
    console.error('Merchant registration error:', error);
    
    // OPTIMIZATION: Handle duplicate key errors specifically
    if (error.code === 11000) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // OPTIMIZATION: Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: messages[0] || 'Validation failed'
      });
    }
    
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: error.message || 'Invalid input data'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    req.login(user, (err) => {
      if (err) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: 'Error logging in'
        });
      }
      
      return res.status(HTTP_STATUS.OK).json({
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
    console.error('Login error:', error);
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Invalid input data'
    });
  }
};

exports.loginMerchant = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    const merchant = await Merchant.findOne({ email }).select('+password +tempPasswordExpiry +passwordChanged');

    if (!merchant) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isMatch = await merchant.matchPassword(password);

    if (!isMatch) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check temporary password restrictions
    if (merchant.createdByAdmin && merchant.tempPasswordExpiry) {
      if (new Date() > merchant.tempPasswordExpiry) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Your temporary password has expired. Please contact admin for a new password.',
          expired: true
        });
      }

      if (!merchant.passwordChanged) {
        return res.status(HTTP_STATUS.OK).json({
          success: true,
          requirePasswordChange: true,
          message: 'Please change your password to continue',
          user: {
            id: merchant._id,
            businessName: merchant.businessName,
            email: merchant.email,
            phone: merchant.phone,
            businessType: merchant.businessType,
            verified: merchant.verified,
            isMerchant: true,
            tempPasswordExpiry: merchant.tempPasswordExpiry
          }
        });
      }
    }

    req.login(merchant, (err) => {
      if (err) {
        console.error('❌ req.login error for merchant:', err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: 'Error logging in'
        });
      }
      
      console.log('✅ Merchant logged in:', merchant.email);
      
      return res.status(HTTP_STATUS.OK).json({
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
    console.error('Merchant login error:', error);
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Invalid input data'
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Invalid request'
    });
  }
};

exports.logout = async (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: 'Error logging out'
        });
      }
      
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'Error destroying session'
          });
        }
        res.status(HTTP_STATUS.OK).json({
          success: true,
          data: {}
        });
      });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Error logging out'
    });
  }
};

// Keep other exports unchanged
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    
    console.log('🔐 Google OAuth attempt:', { hasCredential: !!credential });
    
    if (!credential) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Google credential is required'
      });
    }

    // Verify Google Client ID is configured
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('❌ GOOGLE_CLIENT_ID not configured');
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Google authentication not configured'
      });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    console.log('🔍 Verifying Google token...');
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, given_name: firstName, family_name: lastName, picture } = payload;

    console.log('✅ Google token verified:', { email, googleId });

    let user = await User.findOne({ 
      $or: [
        { email: email },
        { googleId: googleId }
      ]
    });

    if (user) {
      console.log('👤 Existing user found:', user.email);
      
      // Update Google ID and profile picture if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePicture = picture;
        user.isVerified = true;
        await user.save({ validateBeforeSave: false }); // Skip password validation
        console.log('✅ Updated user with Google data');
      }
    } else {
      console.log('🆕 Creating new user from Google OAuth');
      
      // CRITICAL FIX: Generate a password that passes validation
      // Password pattern: Uppercase + Lowercase + Number + Special
      const randomPassword = 
        'Google' + // Uppercase
        'oauth' +  // Lowercase
        Math.random().toString(36).substring(2, 10) + // Random alphanumeric
        '@' +      // Special character
        Date.now().toString().substring(8); // Numbers
      
      console.log('🔑 Generated compliant password for Google user');
      
      user = await User.create({
        firstName: firstName || name?.split(' ')[0] || 'User',
        lastName: lastName || name?.split(' ').slice(1).join(' ') || '',
        email: email,
        googleId: googleId,
        profilePicture: picture,
        isVerified: true,
        password: randomPassword, // Now passes validation
        phone: '' // Google users don't have phone initially
      });
      
      console.log('✅ New Google user created:', user.email);
    }

    // OPTIMIZATION: Skip session in load testing mode
    if (process.env.SKIP_SESSION === 'true') {
      console.log('⚠️ Skipping session creation (SKIP_SESSION=true)');
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          isVerified: user.isVerified,
          isMerchant: false
        }
      });
    }

    req.login(user, (err) => {
      if (err) {
        console.error('❌ Login error after Google auth:', err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: 'Error logging in after Google authentication'
        });
      }

      console.log('✅ Google login successful:', user.email);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          isVerified: user.isVerified,
          isMerchant: false
        }
      });
    });
  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    
    // Better error messages
    if (error.message?.includes('Token used too early')) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid Google token - clock skew detected'
      });
    }
    
    if (error.message?.includes('Invalid token')) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid Google token'
      });
    }
    
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Invalid Google credential or authentication failed'
    });
  }
};

exports.googleAuthRedirect = passport.authenticate('google', { 
  scope: ['profile', 'email'] 
});

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
      
      const redirectPath = user.isMerchant || user.businessName ? '/merchant/dashboard' : '/dashboard';
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}${redirectPath}`);
    });
  })(req, res, next);
};

exports.forgotPassword = async (req, res) => {
  let user;
  
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Please provide an email address'
      });
    }

    if (process.env.NODE_ENV === 'development' && process.env.MOCK_DB === 'true') {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Password reset email sent'
      });
    }

    user = await User.findOne({ email }).lean();
    let userType = 'user';
    
    if (!user) {
      user = await Merchant.findOne({ email }).lean();
      userType = 'merchant';
    }

    if (!user) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'If your email is registered with us, you will receive a password reset link shortly.'
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Update user directly
    const Model = userType === 'user' ? User : Merchant;
    await Model.findByIdAndUpdate(user._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: Date.now() + 10 * 60 * 1000
    });

    const frontendUrl = process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL || 'https://nairobi-verified.netlify.app'
      : process.env.FRONTEND_URL || 'http://localhost:3000';

    const resetUrl = `${frontendUrl}/auth/reset-password/${resetToken}`;
    
    // Queue email asynchronously
    queueEmail(async () => {
      try {
        await emailService.sendPasswordReset(email, resetUrl, userType);
        console.log(`Password reset email sent to: ${email}`);
      } catch (emailError) {
        console.error('Password reset email failed:', emailError.message);
      }
    });
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password reset email sent successfully'
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'An error occurred while processing your request. Please try again later.'
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');
    
    if (process.env.NODE_ENV === 'development' && process.env.MOCK_DB === 'true') {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Password reset successful'
      });
    }

    const currentTime = Date.now();

    let user = await User.findOne({ resetPasswordToken }) || 
               await Merchant.findOne({ resetPasswordToken });

    if (!user) {
      console.log('🔐 SECURITY: Invalid token attempt from:', req.ip);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid or expired reset token. Please request a new password reset.'
      });
    }

    if (user.resetPasswordExpire <= currentTime) {
      console.log('🔐 SECURITY: Expired token attempt for:', user.email);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid or expired reset token. Please request a new password reset.'
      });
    }

    if (!req.body.password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Please provide a new password'
      });
    }

    if (!PASSWORD_VALIDATION.REGEX.test(req.body.password)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: PASSWORD_VALIDATION.ERROR_MESSAGE,
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    console.log('🔐 Password reset completed for:', user.email);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Could not reset password. Please try again later.'
    });
  }
};

exports.changeMerchantPassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Please provide current password and new password'
      });
    }

    if (!PASSWORD_VALIDATION.REGEX.test(newPassword)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: PASSWORD_VALIDATION.ERROR_MESSAGE,
      });
    }

    let merchant;
    
    if (email) {
      merchant = await Merchant.findOne({ email }).select('+password +tempPasswordExpiry +passwordChanged');
      
      if (!merchant) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Merchant not found'
        });
      }

      if (!merchant.createdByAdmin || !merchant.tempPasswordExpiry) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'This account does not have temporary password restrictions'
        });
      }

      if (new Date() > merchant.tempPasswordExpiry) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Your temporary password has expired. Please contact admin for assistance.',
          expired: true
        });
      }
    } else {
      if (!req.user || !req.user.id) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Authentication required'
        });
      }

      merchant = await Merchant.findById(req.user.id).select('+password +tempPasswordExpiry +passwordChanged');

      if (!merchant) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Merchant not found'
        });
      }
    }

    const isMatch = await merchant.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    merchant.password = newPassword;
    merchant.passwordChanged = true;
    merchant.passwordChangedAt = new Date();
    
    if (merchant.createdByAdmin) {
      merchant.tempPasswordExpiry = undefined;
    }

    await merchant.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password changed successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Could not change password. Please try again later.'
    });
  }
};