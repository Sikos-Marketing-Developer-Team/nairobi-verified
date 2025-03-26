require("dotenv").config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require("../models/User");

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ $or: [{ username }, { email: username }] });
    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    next(error);
  }
};

const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: "All fields are required" });
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ success: false, message: "User already exists" });
    const user = await User.create({ name, email, password });
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.status(201).json({ success: true, message: "User created successfully", token });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ success: false, message: "Internal server error during sign up!" });
  }
};

const logout = (req, res) => {
  // For JWT, no server-side session to clear—client discards token
  if (req.isAuthenticated()) { // Google session
    req.logout((err) => {
      if (err) return res.status(500).json({ message: 'Error logging out' });
      return res.status(200).json({ message: 'Logged out successfully' });
    });
  } else {
    res.status(200).json({ message: 'Logged out (JWT discarded by client)' });
  }
};

const getCurrentUser = (req, res) => {
  if (req.isAuthenticated()) { // Google session
    return res.status(200).json({
      user: { id: req.user._id, username: req.user.username, email: req.user.email, photo: req.user.photo }
    });
  }
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    User.findById(decoded.userId).then(user => {
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.status(200).json({
        user: { id: user._id, username: user.username, email: user.email }
      });
    });
  });
};

module.exports = { login, signUp, logout, getCurrentUser };