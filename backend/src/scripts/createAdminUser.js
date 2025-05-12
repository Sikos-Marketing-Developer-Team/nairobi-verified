require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Admin user details
const adminUser = {
  fullName: 'Admin User',
  email: 'admin@nairobiverifed.com',
  phone: '+254700000000',
  password: 'Admin@123',
  role: 'admin',
  isEmailVerified: true
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nairobi-verified')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Check if admin user already exists
      const existingAdmin = await User.findOne({ email: adminUser.email });
      
      if (existingAdmin) {
        console.log('Admin user already exists');
        process.exit(0);
      }
      
      // Create admin user
      const hashedPassword = await bcrypt.hash(adminUser.password, 10);
      
      const newAdmin = new User({
        fullName: adminUser.fullName,
        email: adminUser.email,
        phone: adminUser.phone,
        password: hashedPassword,
        role: adminUser.role,
        isEmailVerified: adminUser.isEmailVerified
      });
      
      await newAdmin.save();
      
      console.log('Admin user created successfully');
      console.log('Email:', adminUser.email);
      console.log('Password:', adminUser.password);
      
      process.exit(0);
    } catch (error) {
      console.error('Error creating admin user:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });