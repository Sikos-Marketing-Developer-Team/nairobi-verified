const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config();

async function testTokenExpiration() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nairobi-verified');
    console.log('Connected to database');
    
    const User = require('../backend/models/User');
    const Merchant = require('../backend/models/Merchant');
    
    // Create a test user with an expired token
    const testEmail = 'test-expiry@example.com';
    
    console.log('Cleaning up any existing test user...');
    await User.deleteOne({ email: testEmail });
    
    console.log('Creating test user...');
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      phone: '1234567890',
      password: 'TestPassword123!'
    });
    
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set token with past expiration (should be expired)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() - 5 * 60 * 1000; // 5 minutes ago (expired)
    await user.save();
    
    console.log('\n=== TOKEN EXPIRY TEST ===');
    console.log('Test user created with expired token');
    console.log('Token expiry:', new Date(user.resetPasswordExpire).toISOString());
    console.log('Current time:', new Date().toISOString());
    console.log('Is expired:', user.resetPasswordExpire < Date.now());
    
    // Now test if we can find this user with the expired token (this should return null)
    console.log('\n=== TESTING TOKEN VALIDATION ===');
    const foundUser = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    console.log('Found user with valid token (should be null):', foundUser ? 'FOUND - BUG!' : 'null - CORRECT');
    
    // Also test without expiry check (this should find the user)
    const foundUserNoExpiry = await User.findOne({
      resetPasswordToken: hashedToken
    });
    
    console.log('Found user without expiry check (should find user):', foundUserNoExpiry ? 'FOUND - CORRECT' : 'null - UNEXPECTED');
    
    // Now let's test with a VALID token
    console.log('\n=== TESTING VALID TOKEN ===');
    const validToken = crypto.randomBytes(20).toString('hex');
    const validHashedToken = crypto.createHash('sha256').update(validToken).digest('hex');
    
    user.resetPasswordToken = validHashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes from now (valid)
    await user.save({ validateBeforeSave: false }); // Skip password validation on update
    
    console.log('Token expiry (valid):', new Date(user.resetPasswordExpire).toISOString());
    console.log('Current time:', new Date().toISOString());
    console.log('Is valid:', user.resetPasswordExpire > Date.now());
    
    const foundValidUser = await User.findOne({
      resetPasswordToken: validHashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    console.log('Found user with valid token (should find user):', foundValidUser ? 'FOUND - CORRECT' : 'null - BUG!');
    
    // Clean up
    console.log('\nCleaning up...');
    await User.deleteOne({ email: testEmail });
    await mongoose.disconnect();
    console.log('Test completed successfully');
    
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

testTokenExpiration();