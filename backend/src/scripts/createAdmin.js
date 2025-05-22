require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Admin credentials
    const adminEmail = 'admin@nairobiverifed.com';
    const adminPassword = 'Admin@123456';
    const adminFullName = 'System Administrator';
    const adminPhone = '+254712345678';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin user already exists. Updating password...');
      
      // Update admin password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      existingAdmin.password = hashedPassword;
      existingAdmin.isEmailVerified = true;
      
      await existingAdmin.save();
      console.log('Admin password updated successfully');
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const adminUser = new User({
        fullName: adminFullName,
        email: adminEmail,
        phone: adminPhone,
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true
      });
      
      await adminUser.save();
      console.log('Admin user created successfully');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminUser();