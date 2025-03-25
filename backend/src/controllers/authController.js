// Local login/signup for users

require("dotenv").config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require("../models/User");


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user using the email and check whether passwords match
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token using jwt
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Success response
    return res.status(200).json({ success: true, message: 'Login successful', token });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during login!' });
  }
};

const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists"
      });
    }

    // Create new user
    const user = await User.create({ name, email, password });

    // Generate token
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

module.exports = { login, signUp };
