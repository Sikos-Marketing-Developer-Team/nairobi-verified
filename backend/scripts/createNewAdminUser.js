const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nairobi_verified', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@nairobiverified.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      
      // Update role if needed
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('Updated user role to admin');
      }
      
      return;
    }

    // Create admin user
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@nairobiverified.com',
      phone: '+254700000000',
      password: 'admin123',
      role: 'admin',
      emailVerified: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', adminUser.email);
    console.log('Password: admin123');
    console.log('Role:', adminUser.role);
    console.log('');
    console.log('🚨 IMPORTANT: Change the default password after first login!');
    console.log('');
    console.log('You can now access the admin dashboard at:');
    console.log('- Development: http://localhost:3001');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    
    if (error.code === 11000) {
      console.log('User with this email already exists');
    }
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
createAdminUser();
