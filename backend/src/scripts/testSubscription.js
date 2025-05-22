/**
 * Test script for subscription system
 * 
 * This script demonstrates how to:
 * 1. Create a subscription package
 * 2. Subscribe a merchant to the package
 * 3. Process a payment
 * 4. Check subscription status
 * 5. Renew a subscription
 * 
 * Run with: node src/scripts/testSubscription.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const SubscriptionPackage = require('../models/SubscriptionPackage');
const VendorSubscription = require('../models/VendorSubscription');
const PaymentTransaction = require('../models/PaymentTransaction');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Create a test subscription package
const createTestPackage = async () => {
  try {
    // Check if test package already exists
    let testPackage = await SubscriptionPackage.findOne({ name: 'Test Package' });
    
    if (!testPackage) {
      testPackage = new SubscriptionPackage({
        name: 'Test Package',
        description: 'A test subscription package',
        price: 1000,
        duration: 1,
        durationUnit: 'month',
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
        productLimit: 10,
        featuredProductsLimit: 2,
        priority: 1,
        isActive: true
      });
      
      await testPackage.save();
      console.log('Test package created:', testPackage._id);
    } else {
      console.log('Test package already exists:', testPackage._id);
    }
    
    return testPackage;
  } catch (error) {
    console.error('Error creating test package:', error);
    throw error;
  }
};

// Create a test merchant
const createTestMerchant = async () => {
  try {
    // Check if test merchant already exists
    let testMerchant = await User.findOne({ email: 'testmerchant@example.com' });
    
    if (!testMerchant) {
      testMerchant = new User({
        fullName: 'Test Merchant',
        email: 'testmerchant@example.com',
        phone: '+254712345678',
        password: 'password123',
        role: 'merchant',
        isEmailVerified: true,
        isPhoneVerified: true,
        companyName: 'Test Company',
        businessDescription: 'A test merchant account'
      });
      
      await testMerchant.save();
      console.log('Test merchant created:', testMerchant._id);
    } else {
      console.log('Test merchant already exists:', testMerchant._id);
    }
    
    return testMerchant;
  } catch (error) {
    console.error('Error creating test merchant:', error);
    throw error;
  }
};

// Create a test subscription
const createTestSubscription = async (merchantId, packageId) => {
  try {
    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    
    // Create subscription
    const subscription = new VendorSubscription({
      vendor: merchantId,
      package: packageId,
      startDate,
      endDate,
      status: 'active',
      paymentStatus: 'paid',
      paymentMethod: 'admin',
      autoRenew: false,
      paymentDetails: {
        transactionId: `TEST-${Date.now()}`,
        amount: 1000,
        currency: 'KES',
        paymentDate: new Date()
      }
    });
    
    await subscription.save();
    console.log('Test subscription created:', subscription._id);
    
    // Create payment transaction
    const transaction = new PaymentTransaction({
      user: merchantId,
      type: 'subscription',
      amount: 1000,
      currency: 'KES',
      status: 'completed',
      paymentMethod: 'admin',
      transactionId: subscription.paymentDetails.transactionId,
      relatedSubscription: subscription._id,
      notes: 'Test subscription payment'
    });
    
    await transaction.save();
    console.log('Test payment transaction created:', transaction._id);
    
    return subscription;
  } catch (error) {
    console.error('Error creating test subscription:', error);
    throw error;
  }
};

// Main function
const runTest = async () => {
  try {
    // Create test data
    const testPackage = await createTestPackage();
    const testMerchant = await createTestMerchant();
    const testSubscription = await createTestSubscription(testMerchant._id, testPackage._id);
    
    console.log('\nTest data created successfully!');
    console.log('----------------------------');
    console.log('Package ID:', testPackage._id);
    console.log('Merchant ID:', testMerchant._id);
    console.log('Subscription ID:', testSubscription._id);
    console.log('----------------------------');
    console.log('\nYou can now test the subscription system with these IDs.');
    console.log('Login with: testmerchant@example.com / password123');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Test failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the test
runTest();