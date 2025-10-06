const crypto = require('crypto');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

async function fullPasswordResetTest() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nairobi-verified');
    console.log('✅ Connected to database');
    
    const User = require('./models/User');
    
    // Clean up any existing test users
    await User.deleteMany({ email: { $regex: /^test-.*@example\.com$/ } });
    
    // Create a test user
    const testEmail = 'test-reset@example.com';
    const user = await User.create({
      firstName: 'Test',
      lastName: 'Reset',
      email: testEmail,
      phone: '1234567890',
      password: 'Password123!'
    });
    
    console.log('✅ Created test user:', testEmail);
    
    // Test 1: Test forgot password API
    console.log('\n=== TEST 1: Forgot Password API ===');
    try {
      const forgotResponse = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email: testEmail
      });
      console.log('✅ Forgot password API response:', forgotResponse.data);
      
      // Wait for the database to be updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if token was created
      const updatedUser = await User.findOne({ email: testEmail });
      
      if (updatedUser.resetPasswordToken && updatedUser.resetPasswordExpire) {
        console.log('✅ Reset token created in database');
        console.log('- Token exists:', !!updatedUser.resetPasswordToken);
        console.log('- Expiry time:', new Date(updatedUser.resetPasswordExpire).toISOString());
        console.log('- Time until expiry:', Math.floor((updatedUser.resetPasswordExpire - Date.now()) / 1000), 'seconds');
        
        // Note: In a real scenario, we'd get the token from the email
        // For testing, we'll create our own token
        console.log('\n📧 In a real scenario, the unhashed token would be sent via email');
        
      } else {
        console.log('❌ No reset token was created in database');
      }
      
    } catch (error) {
      console.log('❌ Forgot password API error:', error.response?.data || error.message);
    }
    
    // Test 2: Test with a manually created valid token
    console.log('\n=== TEST 2: Manual Valid Token Test ===');
    const validToken = crypto.randomBytes(20).toString('hex');
    const hashedValidToken = crypto.createHash('sha256').update(validToken).digest('hex');
    
    user.resetPasswordToken = hashedValidToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    await user.save();
    
    console.log('Created manual valid token:');
    console.log('- Raw token:', validToken);
    console.log('- Expiry:', new Date(user.resetPasswordExpire).toISOString());
    
    try {
      const resetResponse = await axios.post(`http://localhost:5000/api/auth/reset-password/${validToken}`, {
        password: 'NewValidPassword123!'
      });
      console.log('✅ Valid token reset successful:', resetResponse.data);
    } catch (error) {
      console.log('❌ Valid token reset failed:', error.response?.data || error.message);
    }
    
    // Test 3: Test with an expired token
    console.log('\n=== TEST 3: Expired Token Test ===');
    const expiredToken = crypto.randomBytes(20).toString('hex');
    const hashedExpiredToken = crypto.createHash('sha256').update(expiredToken).digest('hex');
    
    user.resetPasswordToken = hashedExpiredToken;
    user.resetPasswordExpire = Date.now() - 5 * 60 * 1000; // 5 minutes ago (expired)
    await user.save();
    
    console.log('Created expired token:');
    console.log('- Raw token:', expiredToken);
    console.log('- Expiry:', new Date(user.resetPasswordExpire).toISOString());
    console.log('- Expired by:', Math.floor((Date.now() - user.resetPasswordExpire) / 1000), 'seconds');
    
    try {
      const resetResponse = await axios.post(`http://localhost:5000/api/auth/reset-password/${expiredToken}`, {
        password: 'ExpiredTokenPassword123!'
      });
      console.log('❌ PROBLEM: Expired token was accepted!', resetResponse.data);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Expired token correctly rejected:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    
    // Test 4: Test with completely invalid token
    console.log('\n=== TEST 4: Invalid Token Test ===');
    const invalidToken = 'completely-invalid-token-12345';
    
    try {
      const resetResponse = await axios.post(`http://localhost:5000/api/auth/reset-password/${invalidToken}`, {
        password: 'InvalidTokenPassword123!'
      });
      console.log('❌ PROBLEM: Invalid token was accepted!', resetResponse.data);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid token correctly rejected:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    
    // Clean up
    await User.deleteOne({ email: testEmail });
    await mongoose.disconnect();
    console.log('\n✅ All tests completed and cleaned up');
    
  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
}

fullPasswordResetTest();