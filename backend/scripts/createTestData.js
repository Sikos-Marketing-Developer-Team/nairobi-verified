const mongoose = require('mongoose');
const User = require('../models/User');
const Merchant = require('../models/Merchant');
const Product = require('../models/Product');
require('dotenv').config();

const createTestData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create test users
    console.log('Creating test users...');
    const testUsers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+254700123456',
        password: 'password123',
        role: 'user',
        emailVerified: true
      },
      {
        firstName: 'Jane',
        lastName: 'Smith', 
        email: 'jane.smith@example.com',
        phone: '+254701234567',
        password: 'password123',
        role: 'user',
        emailVerified: true
      },
      {
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob.wilson@example.com',
        phone: '+254702345678',
        password: 'password123',
        role: 'user',
        emailVerified: false
      }
    ];

    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Created user: ${userData.email}`);
      } else {
        console.log(`ℹ️ User already exists: ${userData.email}`);
      }
    }

    // Create test merchants
    console.log('Creating test merchants...');
    const testMerchants = [
      {
        businessName: 'Green Valley Grocers',
        email: 'contact@greenvalley.com',
        phone: '+254700123456',
        password: 'merchant123',
        businessType: 'Retail',
        category: 'Grocery',
        description: 'Fresh organic vegetables and fruits sourced from local farmers',
        address: '123 Market Street, Nairobi',
        location: 'Nairobi CBD',
        verified: true,
        isActive: true
      },
      {
        businessName: 'Urban Eats Restaurant',
        email: 'info@urbaneats.com', 
        phone: '+254701234567',
        password: 'merchant123',
        businessType: 'Restaurant',
        category: 'Food & Beverage',
        description: 'Modern African cuisine with a contemporary twist',
        address: '456 Food Court, Westlands',
        location: 'Westlands, Nairobi',
        verified: false,
        isActive: true
      },
      {
        businessName: 'Tech Solutions Kenya',
        email: 'hello@techsolutions.com',
        phone: '+254702345678',
        password: 'merchant123',
        businessType: 'Retail',
        category: 'Electronics',
        description: 'Quality electronics and gadgets with warranty',
        address: '789 Tech Hub, Karen',
        location: 'Karen, Nairobi',
        verified: false,
        isActive: true
      }
    ];

    for (const merchantData of testMerchants) {
      const existingMerchant = await Merchant.findOne({ email: merchantData.email });
      if (!existingMerchant) {
        await Merchant.create(merchantData);
        console.log(`✅ Created merchant: ${merchantData.businessName}`);
      } else {
        console.log(`ℹ️ Merchant already exists: ${merchantData.businessName}`);
      }
    }

    console.log('✅ Test data creation completed!');
    console.log('');
    console.log('📝 Test Credentials:');
    console.log('Admin: admin@nairobiverified.com / admin123');
    console.log('User: john.doe@example.com / password123');
    console.log('Merchant: contact@greenvalley.com / merchant123');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestData();
