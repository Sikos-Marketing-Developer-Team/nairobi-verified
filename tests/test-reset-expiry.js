const crypto = require('crypto');
const mongoose = require('mo    // Test API call for expired token
    try {
      const response = await axios.post(`http://localhost:5000/api/auth/reset-password/${resetToken2}`, {
        password: 'AnotherPassword123!'
      });
      console.log('❌ PROBLEM: Expired token was accepted!', response.data);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('expired')) {
        console.log('✅ Expired token correctly rejected:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }uire('dotenv').config();

async function testPasswordResetExpiration() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nairobi-verified');
    console.log('✅ Connected to database');
    
    const User = require('../backend/models/User');
    
    // Clean up any existing test user
    const testEmail = 'test-expiry@example.com';
    await User.deleteOne({ email: testEmail });
    
    // Create a real test user first
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      phone: '1234567890',
      password: 'Password123!'
    });
    
    console.log('✅ Created test user:', testEmail);
    
    // Test 1: Create a token that should be valid
    console.log('\n=== TEST 1: Valid Token Test ===');
    const resetToken1 = crypto.randomBytes(20).toString('hex');
    const hashedToken1 = crypto.createHash('sha256').update(resetToken1).digest('hex');
    
    user.resetPasswordToken = hashedToken1;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    await user.save();
    
    console.log('Token expiry:', new Date(user.resetPasswordExpire).toISOString());
    console.log('Current time:', new Date().toISOString());
    
    // Test API call for valid token
    const axios = require('axios');
    try {
      const response = await axios.post(`http://localhost:5000/api/auth/reset-password/${resetToken1}`, {
        password: 'NewPassword123!'
      });
      console.log('✅ Valid token API response:', response.data);
    } catch (error) {
      console.log('❌ Valid token API error:', error.response?.data || error.message);
    }
    
    // Test 2: Create a token that should be expired
    console.log('\n=== TEST 2: Expired Token Test ===');
    const resetToken2 = crypto.randomBytes(20).toString('hex');
    const hashedToken2 = crypto.createHash('sha256').update(resetToken2).digest('hex');
    
    user.resetPasswordToken = hashedToken2;
    user.resetPasswordExpire = Date.now() - 5 * 60 * 1000; // 5 minutes ago (expired)
    await user.save();
    
    console.log('Token expiry:', new Date(user.resetPasswordExpire).toISOString());
    console.log('Current time:', new Date().toISOString());
    console.log('Is expired:', user.resetPasswordExpire < Date.now());
    
    // Test API call for expired token
    try {
      const response = await axios.post(`http://localhost:5000/api/auth/reset-password/${resetToken2}`, {
        password: 'newpassword123'
      });
      console.log('❌ PROBLEM: Expired token was accepted!', response.data);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('expired')) {
        console.log('✅ Expired token correctly rejected:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    
    // Test 3: Direct database query test
    console.log('\n=== TEST 3: Database Query Test ===');
    const currentTime = Date.now();
    
    const validUser = await User.findOne({
      resetPasswordToken: hashedToken2,
      resetPasswordExpire: { $gt: currentTime }
    });
    
    console.log('Found user with valid token (should be null):', validUser ? 'FOUND' : 'NULL');
    
    const expiredUser = await User.findOne({
      resetPasswordToken: hashedToken2
    });
    
    console.log('Found user without expiry check (should find user):', expiredUser ? 'FOUND' : 'NULL');
    
    // Clean up
    await User.deleteOne({ email: testEmail });
    await mongoose.disconnect();
    console.log('\n✅ Test completed and cleaned up');
    
  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
}

testPasswordResetExpiration();