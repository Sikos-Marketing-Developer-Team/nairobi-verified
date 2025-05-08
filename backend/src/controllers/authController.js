const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/emailService');
require("dotenv").config({ path: './src/.env' });

const registerClient = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ fullName, email, phone, password, role: 'client' });
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await sendVerificationEmail(email, verificationToken);
    res.status(201).json({
      message: 'Registration successful. Please check your email for verification.',
      user: { id: user._id, fullName, email, phone, role: user.role }
    });
  } catch (error) {
    console.error('Client registration error:', error);
    res.status(500).json({ message: 'Error registering client' });
  }
};

const registerMerchant = async (req, res) => {
  try {
    const { fullName, email, phone, password, companyName, location } = req.body;
    if (!fullName || !email || !phone || !password || !companyName || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role: 'merchant',
      companyName,
      location
    });
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await sendVerificationEmail(email, verificationToken);
    res.status(201).json({
      message: 'Registration successful. Please check your email for verification.',
      user: { id: user._id, fullName, email, phone, role: user.role, companyName, location }
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: rememberMe ? '30d' : '24h'
    });
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      path: '/', // Ensures cookie is sent to all routes
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Overwrites stale cookies
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    });
    console.log('login: Set-Cookie:', res.get('Set-Cookie'));

    res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
};

const checkAuth = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      console.log('checkAuth: No token provided');
      return res.status(401).json({ isAuthenticated: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      console.log('checkAuth: User not found');
      return res.status(401).json({ isAuthenticated: false });
    }

    res.status(200).json({
      isAuthenticated: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('checkAuth: Auth check error:', error);
    res.status(401).json({ isAuthenticated: false });
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
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      path: '/', // Ensures cookie is sent to all routes
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Overwrites stale cookies
      maxAge: 24 * 60 * 60 * 1000,
    });
    console.log('verifyEmail: Set-Cookie:', res.get('Set-Cookie'));
    const redirectUrl = user.role === 'merchant' ? '/dashboard/vendor/dashboard' : '/dashboard/user';
    res.redirect(`${process.env.FRONTEND_URL}${redirectUrl}`);
  } catch (error) {
    console.error('verifyEmail: Email verification error:', error);
    res.status(500).json({ message: 'Error verifying email' });
  }
};


module.exports = { registerClient, registerMerchant, login, checkAuth, verifyEmail };