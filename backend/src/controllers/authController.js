const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { sendPasswordResetNotificationEmail } = require('../services/emailService');
const { validatePasswordStrength } = require('../utils/auth');
const { validationResult } = require('express-validator');

const registerClient = async (req, res) => {
  console.log('registerClient: Request received:', req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('registerClient: Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, fullName, phone } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      console.log('registerClient: User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      email,
      password: hashedPassword,
      fullName,
      phone,
      role: 'client',
      emailVerificationToken
    });

    req.session.user = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      role: user.role
    };
    console.log('registerClient: Session set:', req.session.user);

    await sendVerificationEmail(email, emailVerificationToken);
    console.log('registerClient: Verification email sent to:', email);

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      user: req.session.user
    });
  } catch (error) {
    console.error('registerClient: Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const registerMerchant = async (req, res) => {
  console.log('registerMerchant: Request received:', req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('registerMerchant: Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, fullName, phone, companyName, location } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      console.log('registerMerchant: User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      email,
      password: hashedPassword,
      fullName,
      phone,
      companyName,
      location,
      role: 'merchant',
      emailVerificationToken,
      avatar: '/images/avatars/default.jpg'
    });

    req.session.user = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      companyName: user.companyName,
      role: user.role
    };
    console.log('registerMerchant: Session set:', req.session.user);

    await sendVerificationEmail(email, emailVerificationToken);
    console.log('registerMerchant: Verification email sent to:', email);

    req.app.get('io').emit('newMerchantRegistration', {
      companyName,
      email,
      timestamp: new Date()
    });
    console.log('registerMerchant: Emitted newMerchantRegistration event:', companyName);

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      user: req.session.user
    });
  } catch (error) {
    console.error('registerMerchant: Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  console.log('login: Request received:', req.body);
  const { email, password, rememberMe } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('login: User not found:', email);
      
      // Log failed login attempt
      await ActivityLog.logSystemActivity('login_failed', {
        email,
        reason: 'user_not_found',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      console.log('login: Account locked:', email);
      return res.status(403).json({ 
        message: 'Account is temporarily locked due to too many failed attempts. Please try again later.' 
      });
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      console.log('login: Account suspended:', email);
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('login: Password mismatch:', email);
      
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
        console.log('login: Account locked due to too many failed attempts:', email);
      }
      
      await user.save();
      
      // Log failed login attempt
      await ActivityLog.logUserActivity(
        user._id,
        'login_failed',
        { 
          reason: 'invalid_password',
          attempts: user.loginAttempts,
          locked: !!user.lockUntil
        },
        req
      );
      
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    
    // Update metadata
    if (!user.metadata) user.metadata = {};
    user.metadata.lastActivity = new Date();
    user.metadata.ipAddress = req.ip;
    user.metadata.userAgent = req.headers['user-agent'];
    
    await user.save();

    if (!user.isEmailVerified && user.metadata?.registrationSource !== 'admin_import') {
      console.log('login: Email not verified:', email);
      return res.status(403).json({ message: 'Please verify your email' });
    }

    // Create session with user data
    req.session.user = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      companyName: user.companyName,
      requirePasswordChange: user.requirePasswordChange
    };
    
    // Set session expiration based on rememberMe
    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      user.rememberMe = true;
    } else {
      req.session.cookie.expires = false; // Session cookie
      user.rememberMe = false;
    }
    
    await user.save();
    console.log('login: Session set:', req.session.user);

    // Log successful login
    await ActivityLog.logUserActivity(
      user._id,
      'login_successful',
      { 
        rememberMe: !!rememberMe,
        requirePasswordChange: user.requirePasswordChange
      },
      req
    );

    res.json({
      message: 'Login successful',
      user: req.session.user,
      requirePasswordChange: user.requirePasswordChange
    });
  } catch (error) {
    console.error('login: Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const checkAuth = async (req, res) => {
  console.log('checkAuth: Checking session:', req.session.user);
  if (req.session.user) {
    console.log('checkAuth: Session found:', req.session.user);
    res.json({
      isAuthenticated: true,
      user: req.session.user
    });
  } else {
    console.log('checkAuth: No session user found');
    res.json({ isAuthenticated: false });
  }
};

const verifyEmail = async (req, res) => {
  console.log('verifyEmail: Token received:', req.params.token);
  const { token } = req.params;

  try {
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      console.log('verifyEmail: Invalid or expired token');
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    console.log('verifyEmail: Email verified for:', user.email);

    req.session.user = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      companyName: user.companyName
    };
    console.log('verifyEmail: Session set:', req.session.user);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('verifyEmail: Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const resendVerificationEmail = async (req, res) => {
  console.log('resendVerificationEmail: Request received:', req.body);
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('resendVerificationEmail: User not found:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      console.log('resendVerificationEmail: Email already verified:', email);
      return res.status(400).json({ message: 'Email already verified' });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;
    await user.save();

    await sendVerificationEmail(email, emailVerificationToken);
    console.log('resendVerificationEmail: Verification email sent to:', email);

    res.json({ message: 'Verification email resent successfully' });
  } catch (error) {
    console.error('resendVerificationEmail: Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const requestPasswordReset = async (req, res) => {
  console.log('requestPasswordReset: Request received:', req.body);
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('requestPasswordReset: User not found:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendPasswordResetEmail(email, resetToken);
    console.log('requestPasswordReset: Password reset email sent to:', email);

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('requestPasswordReset: Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  console.log('resetPassword: Request received:', req.body);
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('resetPassword: Invalid or expired token');
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    console.log('resetPassword: Password reset for:', user.email);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('resetPassword: Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const logout = async (req, res) => {
  console.log('logout: Destroying session:', req.session.user);
  req.session.destroy((err) => {
    if (err) {
      console.error('logout: Error destroying session:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    console.log('logout: Session destroyed and cookie cleared');
    res.json({ message: 'Logout successful' });
  });
};

const getCurrentUser = async (req, res) => {
  console.log('getCurrentUser: Session:', req.session.user);
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    console.log('getCurrentUser: No session user');
    res.status(401).json({ message: 'Not authenticated' });
  }
};

// Change password endpoint for first login and regular password changes
const changePassword = async (req, res) => {
  console.log('changePassword: Request received');
  const { currentPassword, newPassword } = req.body;
  const userId = req.session.user?.id;

  if (!userId) {
    console.log('changePassword: No authenticated user');
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log('changePassword: User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate current password (skip for admin-imported users on first login)
    if (!user.requirePasswordChange) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        console.log('changePassword: Current password mismatch');
        
        // Log failed attempt
        await ActivityLog.logUserActivity(
          user._id,
          'password_change_failed',
          { reason: 'incorrect_current_password' },
          req
        );
        
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      console.log('changePassword: Password strength validation failed');
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Update password
    await user.updatePassword(newPassword);
    console.log('changePassword: Password updated for user:', user.email);

    // Log the password change
    await ActivityLog.logUserActivity(
      user._id,
      'password_changed',
      { 
        wasFirstLogin: user.requirePasswordChange,
        source: user.requirePasswordChange ? 'first_login' : 'user_initiated'
      },
      req
    );

    // If this was a first login password change, update the session
    if (user.requirePasswordChange) {
      req.session.user = {
        ...req.session.user,
        requirePasswordChange: false
      };
    }

    res.json({ 
      message: 'Password changed successfully',
      requirePasswordChange: false
    });
  } catch (error) {
    console.error('changePassword: Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerClient,
  registerMerchant,
  login,
  checkAuth,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  logout,
  getCurrentUser,
  changePassword
};