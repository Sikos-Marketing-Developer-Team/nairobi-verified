const User = require('../models/User');
const Merchant = require('../models/Merchant');
const passport = require('passport');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { HTTP_STATUS, PASSWORD_VALIDATION } = require('../config/constants');
const { emailService } = require('../utils/emailService'); // Import email service

exports.register = async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    const { firstName, lastName, email, phone, password } = req.body;

    if (!PASSWORD_VALIDATION.REGEX.test(password)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: PASSWORD_VALIDATION.ERROR_MESSAGE,
      });
    }

    const userExists = await User.findOne({ email });

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

    // Send welcome email (don't block registration if email fails)
    try {
      await emailService.sendUserWelcome({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
      console.log(`Welcome email sent to: ${user.email}`);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
      // Don't fail registration if email fails
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
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Invalid input data'
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

    if (!PASSWORD_VALIDATION.REGEX.test(password)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: PASSWORD_VALIDATION.ERROR_MESSAGE,
      });
    }

    const merchantExists = await Merchant.findOne({ email });

    if (merchantExists) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Email already registered'
      });
    }

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

    // Send registration confirmation email (don't block registration if email fails)
    try {
      await emailService.sendMerchantRegistrationConfirmation({
        businessName: merchant.businessName,
        email: merchant.email,
        businessType: merchant.businessType
      });
      console.log(`Registration confirmation email sent to: ${merchant.email}`);
    } catch (emailError) {
      console.error('Registration confirmation email failed:', emailError);
      // Don't fail registration if email fails
    }

    // Send admin notification about new merchant registration (don't block registration if email fails)
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
    } catch (emailError) {
      console.error('Admin notification email failed:', emailError);
      // Don't fail registration if email fails
    }

    req.login(merchant, (err) => {
      if (err) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: 'Error logging in after registration'
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
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Invalid input data'
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

    const merchant = await Merchant.findOne({ email }).select('+password +tempPasswordExpiry');

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

    // Check if the account was created by admin and has temporary password restrictions
    if (merchant.createdByAdmin && merchant.tempPasswordExpiry) {
      // Check if temporary password has expired
      if (new Date() > merchant.tempPasswordExpiry) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Your temporary password has expired. Please contact admin for a new password.',
          expired: true
        });
      }

      // If this is their first login with temp password, require password change
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
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: 'Error logging in'
        });
      }
      
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

exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Google credential is required'
      });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, given_name: firstName, family_name: lastName, picture } = payload;

    let user = await User.findOne({ 
      $or: [
        { email: email },
        { googleId: googleId }
      ]
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePicture = picture;
        await user.save();
      }
    } else {
      user = await User.create({
        firstName: firstName || name?.split(' ')[0] || 'User',
        lastName: lastName || name?.split(' ').slice(1).join(' ') || '',
        email: email,
        googleId: googleId,
        profilePicture: picture,
        isVerified: true,
        password: crypto.randomBytes(32).toString('hex')
      });
    }

    req.login(user, (err) => {
      if (err) {
        console.error('Login error after Google auth:', err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: 'Error logging in after Google authentication'
        });
      }

      console.log('Google login successful for user:', user.email);
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
          isMerchant: user.isMerchant,
          businessName: user.businessName
        }
      });
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
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
      
      console.log('Google login successful for user:', user.email);
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
      console.log('Mocking password reset for email:', email);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Password reset email sent'
      });
    }

    // Find user in either User or Merchant collection
    user = await User.findOne({ email });
    let userType = 'user';
    
    if (!user) {
      user = await Merchant.findOne({ email });
      userType = 'merchant';
    }

    // Always return success message for security (don't reveal if email exists)
    if (!user) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'If your email is registered with us, you will receive a password reset link shortly.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expire time (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    
    await user.save();

    // Determine the correct frontend URL based on environment
    let frontendUrl;
    if (process.env.NODE_ENV === 'production') {
      // For production, use the production frontend URL
      frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://nairobi-verified.netlify.app';
    } else {
      // For development, use localhost
      frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    }

    // Create reset URL - Fixed to match frontend route
    const resetUrl = `${frontendUrl}/auth/reset-password/${resetToken}`;
    
    console.log('Reset URL generated:', resetUrl);
    
    try {
      // Send password reset email using the email service
      await emailService.sendPasswordReset(email, resetUrl, userType);
      
      console.log(`Password reset email sent to: ${email}`);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // Reset the user fields if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Email could not be sent. Please try again later.'
      });
    }
    
  } catch (error) {
    console.error('Forgot password error:', error);
    
    // Clean up user fields if error occurs
    if (user) {
      try {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
      } catch (saveError) {
        console.error('Error cleaning up user fields:', saveError);
      }
    }
    
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'An error occurred while processing your request. Please try again later.'
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // Hash the token from params to compare with stored hash
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

    // Get current time for consistent comparison
    const currentTime = Date.now();
    console.log('Password reset attempt at:', new Date(currentTime).toISOString());

    // Find user with the matching reset token (regardless of expiry first)
    let user = await User.findOne({ resetPasswordToken: resetPasswordToken }) || 
               await Merchant.findOne({ resetPasswordToken: resetPasswordToken });

    if (!user) {
      console.log('🔐 SECURITY: Attempted use of invalid token:', {
        clientIP: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });

      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid or expired reset token. Please request a new password reset.'
      });
    }

    // Check if the token has expired
    if (user.resetPasswordExpire <= currentTime) {
      const timeSinceExpiry = Math.floor((currentTime - user.resetPasswordExpire) / 1000);
      console.log('🔐 SECURITY: Attempted use of expired token:', {
        userEmail: user.email,
        tokenExpiry: new Date(user.resetPasswordExpire).toISOString(),
        currentTime: new Date(currentTime).toISOString(),
        expiredBySeconds: timeSinceExpiry,
        clientIP: req.ip || req.connection.remoteAddress
      });

      // Clean up this expired token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid or expired reset token. Please request a new password reset.'
      });
    }

    // Log successful token validation
    console.log('Valid reset token found:', {
      userEmail: user.email,
      tokenExpiry: new Date(user.resetPasswordExpire).toISOString(),
      timeRemaining: Math.floor((user.resetPasswordExpire - currentTime) / 1000) + ' seconds'
    });

    // Validate new password
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

    // Set new password and clear reset fields
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    // Log successful password reset for security monitoring
    console.log('🔐 SECURITY: Password reset completed successfully:', {
      userEmail: user.email,
      userType: user.businessName ? 'merchant' : 'user',
      resetTime: new Date().toISOString(),
      clientIP: req.ip || req.connection.remoteAddress
    });

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

// @desc    Change merchant temporary password
// @route   POST /api/auth/merchant/change-password
// @access  Private (Merchant)
exports.changeMerchantPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

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

    // Get merchant with password field
    const merchant = await Merchant.findById(req.user.id).select('+password +tempPasswordExpiry');

    if (!merchant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Verify current password
    const isMatch = await merchant.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // If this merchant was created by admin, check if temp password has expired
    if (merchant.createdByAdmin && merchant.tempPasswordExpiry) {
      if (new Date() > merchant.tempPasswordExpiry) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Your temporary password has expired. Please contact admin for assistance.',
          expired: true
        });
      }
    }

    // Update password and mark as changed
    merchant.password = newPassword;
    merchant.passwordChanged = true;
    merchant.passwordChangedAt = new Date();
    
    // Clear temporary password restrictions
    if (merchant.createdByAdmin) {
      merchant.tempPasswordExpiry = undefined;
    }

    await merchant.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Could not change password. Please try again later.'
    });
  }
};