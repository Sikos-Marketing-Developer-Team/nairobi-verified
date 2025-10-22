const User = require('../models/User');
const Merchant = require('../models/Merchant');
const passport = require('passport');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { HTTP_STATUS, PASSWORD_VALIDATION } = require('../config/constants');
const { emailService } = require('../utils/emailService');

async function isEmailTaken(email) {
  const [user, merchant] = await Promise.all([
    User.findOne({ email }).lean().select('_id'),
    Merchant.findOne({ email }).lean().select('_id')
  ]);
  
  if (user) return { taken: true, type: 'user' };
  if (merchant) return { taken: true, type: 'merchant' };
  return { taken: false, type: null };
}

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

    // CRITICAL FIX: Check BOTH collections
    const emailCheck = await isEmailTaken(email);
    if (emailCheck.taken) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: `Email already registered as ${emailCheck.type}`
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password
    });

    queueEmail(async () => {
      await emailService.sendUserWelcome({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
      console.log(`Welcome email sent to: ${user.email}`);
    });

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

    // CRITICAL FIX: Check BOTH collections
    const emailCheck = await isEmailTaken(email);
    if (emailCheck.taken) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: `Email already registered as ${emailCheck.type}`
      });
    }

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

    req.login(merchant, (err) => {
      if (err) {
        console.error('Login error after registration:', err);
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
    
    if (error.code === 11000) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Email already registered'
      });
    }

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
          role: user.role || 'user',  // CRITICAL FIX: Ensure role is always set
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
            role: 'merchant',
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
          role: 'merchant',  // CRITICAL FIX: Add role field
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

    // CRITICAL FIX: Refresh user data from DB to get complete object
    let userData;
    
    // Determine if this is a merchant
    const isMerchant = 
      req.user.constructor?.modelName === 'Merchant' ||
      req.user.collection?.collectionName === 'merchants' ||
      !!req.user.businessName ||
      req.user.isMerchant === true ||
      req.user.role === 'merchant';

    if (isMerchant) {
      console.log('🔄 Refreshing merchant data from DB for getMe');
      const merchant = await Merchant.findById(req.user._id || req.user.id).lean();
      
      if (!merchant) {
        console.error('❌ Merchant not found in DB:', req.user._id);
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Merchant account not found'
        });
      }

      userData = {
        ...merchant,
        role: 'merchant',
        isMerchant: true
      };
      
      console.log('✅ Merchant data refreshed:', {
        id: userData._id,
        email: userData.email,
        businessName: userData.businessName,
        role: userData.role
      });
    } else {
      console.log('🔄 Refreshing user data from DB for getMe');
      const user = await User.findById(req.user._id || req.user.id).lean();
      
      if (!user) {
        console.error('❌ User not found in DB:', req.user._id);
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'User account not found'
        });
      }

      userData = {
        ...user,
        role: user.role || 'user',
        isMerchant: false
      };
      
      console.log('✅ User data refreshed:', {
        id: userData._id,
        email: userData.email,
        role: userData.role
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: userData
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
    
    console.log('🔐 Google OAuth attempt');
    
    if (!credential) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Google credential is required'
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('❌ GOOGLE_CLIENT_ID not configured');
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Google authentication not configured'
      });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, given_name: firstName, family_name: lastName, picture } = payload;

    console.log('✅ Google token verified:', email);

    // CRITICAL FIX: Check Merchant FIRST
    let merchant = await Merchant.findOne({ 
      $or: [
        { email: email },
        { googleId: googleId }
      ]
    });

    if (merchant) {
      console.log('🏪 Found existing MERCHANT:', merchant.businessName);
      
      // Update Google ID if not set
      if (!merchant.googleId) {
        merchant.googleId = googleId;
        merchant.logo = merchant.logo || picture;
        await merchant.save({ validateBeforeSave: false });
        console.log('✅ Updated merchant with Google data');
      }

      // OPTIMIZATION: Skip session in load testing
      if (process.env.SKIP_SESSION === 'true') {
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
          },
          redirectTo: '/merchant/dashboard' // Frontend should handle this
        });
      }

      req.login(merchant, (err) => {
        if (err) {
          console.error('❌ Login error after Google auth:', err);
          return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'Error logging in after Google authentication'
          });
        }

        console.log('✅ Merchant Google login successful');
        
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
          },
          redirectTo: '/merchant/dashboard' // CRITICAL: Tell frontend where to go
        });
      });
      
      return; // Exit early - don't check User
    }

    // Only check User if no Merchant found
    let user = await User.findOne({ 
      $or: [
        { email: email },
        { googleId: googleId }
      ]
    });

    if (user) {
      console.log('👤 Found existing USER:', user.email);
      
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePicture = picture;
        user.isVerified = true;
        await user.save({ validateBeforeSave: false });
        console.log('✅ Updated user with Google data');
      }
    } else {
      console.log('🆕 Creating new USER from Google OAuth');
      
      // Generate compliant password
      const randomPassword = 
        'Google' + 
        'oauth' +  
        Math.random().toString(36).substring(2, 10) + 
        '@' +      
        Date.now().toString().substring(8);
      
      user = await User.create({
        firstName: firstName || name?.split(' ')[0] || 'User',
        lastName: lastName || name?.split(' ').slice(1).join(' ') || '',
        email: email,
        googleId: googleId,
        profilePicture: picture,
        isVerified: true,
        password: randomPassword,
        phone: ''
      });
      
      console.log('✅ New Google user created:', user.email);
    }

    if (process.env.SKIP_SESSION === 'true') {
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
        },
        redirectTo: '/dashboard' // User dashboard
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

      console.log('✅ User Google login successful');
      
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
        },
        redirectTo: '/dashboard' // CRITICAL: User dashboard
      });
    });
  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    
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