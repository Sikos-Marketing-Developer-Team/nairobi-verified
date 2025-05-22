const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Creates an admin user if one doesn't already exist
 * Uses environment variables for admin credentials
 */
const createAdminUser = async () => {
  try {
    // Check if admin credentials are set in environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminFullName = process.env.ADMIN_FULLNAME || 'System Administrator';
    const adminPhone = process.env.ADMIN_PHONE || '+254712345678';

    if (!adminEmail || !adminPassword) {
      console.log('Admin credentials not set in environment variables. Skipping admin user creation.');
      return;
    }

    // Check if an admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log(`Admin user ${adminEmail} already exists.`);
      
      // Ensure the user has admin role
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`Updated ${adminEmail} role to admin.`);
      }
      
      return;
    }

    // Create a new admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const adminUser = new User({
      fullName: adminFullName,
      email: adminEmail,
      phone: adminPhone,
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true,
      isPhoneVerified: true
    });

    await adminUser.save();
    console.log(`Admin user ${adminEmail} created successfully.`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

module.exports = createAdminUser;