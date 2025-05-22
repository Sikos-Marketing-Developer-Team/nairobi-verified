require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function checkAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check for admin user
    const adminEmail = process.env.ADMIN_EMAIL;
    console.log('Looking for admin user with email:', adminEmail);
    
    const adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      console.log('Admin user found:');
      console.log('- ID:', adminUser._id);
      console.log('- Name:', adminUser.fullName);
      console.log('- Email:', adminUser.email);
      console.log('- Role:', adminUser.role);
      console.log('- Email Verified:', adminUser.isEmailVerified);
    } else {
      console.log('Admin user not found in the database');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAdminUser();