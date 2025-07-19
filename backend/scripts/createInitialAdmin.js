const mongoose = require('mongoose');
const AdminUser = require('../models/AdminUser');
const connectDB = require('../config/db');
require('dotenv').config();

const createInitialAdmin = async () => {
  try {
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({ role: 'super_admin' });
    if (existingAdmin) {
      console.log('Super admin already exists');
      console.log('Email:', existingAdmin.email);
      process.exit(0);
    }

    // Create initial super admin
    const adminData = {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@nairobiverified.com',
      password: 'SuperAdmin123!',
      role: 'super_admin',
      isActive: true,
      permissions: [
        'users.read', 'users.write', 'users.delete',
        'merchants.read', 'merchants.write', 'merchants.delete', 'merchants.approve', 'merchants.verify',
        'products.read', 'products.write', 'products.delete', 'products.approve',
        'orders.read', 'orders.write', 'orders.update',
        'reviews.read', 'reviews.write', 'reviews.delete', 'reviews.moderate',
        'analytics.read', 'settings.read', 'settings.write',
        'flash_sales.read', 'flash_sales.write', 'flash_sales.delete',
        'reports.read', 'reports.export'
      ]
    };

    const admin = await AdminUser.create(adminData);
    console.log('Initial super admin created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: SuperAdmin123!');
    console.log('Role:', admin.role);
    console.log('Please change the password after first login');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating initial admin:', error);
    process.exit(1);
  }
};

createInitialAdmin();
