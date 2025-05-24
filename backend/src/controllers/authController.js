const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
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
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('login: User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('login: Password mismatch:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isEmailVerified) {
      console.log('login: Email not verified:', email);
      return res.status(403).json({ message: 'Please verify your email' });
    }

    req.session.user = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      companyName: user.companyName
    };
    console.log('login: Session set:', req.session.user);

    res.json({
      message: 'Login successful',
      user: req.session.user
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
  getCurrentUser
};