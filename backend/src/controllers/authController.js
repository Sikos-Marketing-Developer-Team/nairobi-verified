require("dotenv").config({ path: './src/.env' });
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/emailService');

const registerClient = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    console.log('Signup request:', { fullName, email, phone });
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ fullName, email, phone, password, role: 'client' });
    console.log('User created:', user._id);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();
    console.log('Verification token generated:', verificationToken);

    await sendVerificationEmail(email, verificationToken);
    console.log('Verification email triggered for:', email);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });
    res.status(201).json({
      message: 'Registration successful. Please check your email for verification.',
      user: { id: user._id, fullName, email, phone, role: user.role },
    });
  } catch (error) {
    console.error('Client registration error:', error.message);
    res.status(500).json({ message: error.message || 'Error registering client' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired verification token' });

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const tokenJwt = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', tokenJwt, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?verified=true`);
  } catch (error) {
    console.error('Email verification error:', error.message);
    res.status(500).json({ message: 'Error verifying email' });
  }
};

const registerMerchant = async (req, res) => {
  try {
    const { fullName, email, phone, password, companyName, location } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role: 'merchant',
      companyName,
      location,
    });

    const verificationToken = user.generateEmailVerificationToken();
    await user.save();
    await sendVerificationEmail(email, verificationToken);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({
      message: 'Registration successful. Please check your email for verification.',
      token,
      user: { id: user._id, fullName, email, phone, role: user.role, companyName, location },
    });
  } catch (error) {
    console.error('Merchant registration error:', error);
    res.status(500).json({ message: 'Error registering merchant' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;
    const user = await User.findOne({ $or: [{ email: username }, { fullName: username }] });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isEmailVerified) return res.status(401).json({ message: 'Please verify your email first' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    user.rememberMe = rememberMe || false;
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? '30d' : '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = user.generatePasswordResetToken();
    await user.save();
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Error sending password reset email' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });

    const verificationToken = user.generateEmailVerificationToken();
    await user.save();
    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Verification email error:', error);
    res.status(500).json({ message: 'Error sending verification email' });
  }
};

const logout = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Error getting current user' });
  }
};



module.exports = {
  registerClient,
  registerMerchant,
  login,
  requestPasswordReset,
  resetPassword,
  resendVerificationEmail,
  verifyEmail,
  logout,
  getCurrentUser,
};