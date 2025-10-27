const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config();

async function testActualAPI() {
  try {
    const BASE_URL = 'http://localhost:5000/api';
    
    // First, let's create a reset token through the API
    console.log('=== TESTING ACTUAL API ENDPOINTS ===');
    
    // Step 1: Request password reset
    console.log('\n1. Requesting password reset...');
    const email = 'business@jnmcosmetics.com'; // Use existing email
    
    const forgotResponse = await axios.post(`${BASE_URL}/auth/forgot-password`, {
      email: email
    });
    
    console.log('Forgot password response:', forgotResponse.data);
    
    // Step 2: Connect to DB and get the reset token
    console.log('\n2. Checking database for reset token...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nairobi-verified');
    
    const User = require('../backend/models/User');
    const Merchant = require('../backend/models/Merchant');
    
    let user = await User.findOne({ email });
    if (!user) {
      user = await Merchant.findOne({ email });
    }
    
    if (!user) {
      console.log('User not found in database');
      return;
    }
    
    console.log('User found with reset token:');
    console.log('- Reset token exists:', !!user.resetPasswordToken);
    console.log('- Token expiry:', new Date(user.resetPasswordExpire).toISOString());
    console.log('- Current time:', new Date().toISOString());
    console.log('- Time until expiry:', Math.floor((user.resetPasswordExpire - Date.now()) / 1000), 'seconds');
    console.log('- Is expired:', user.resetPasswordExpire <= Date.now());
    
    // Step 3: Wait a moment, then try to use the token
    console.log('\n3. Testing token usage immediately (should work)...');
    
    // We need to reverse-engineer the original token from the hashed version
    // Let's simulate this by creating our own token
    const testToken = crypto.randomBytes(20).toString('hex');
    const hashedTestToken = crypto.createHash('sha256').update(testToken).digest('hex');
    
    // Update the user with our test token
    user.resetPasswordToken = hashedTestToken;
    user.resetPasswordExpire = Date.now() + 2 * 60 * 1000; // 2 minutes from now
    await user.save({ validateBeforeSave: false });
    
    console.log('Set test token with 2-minute expiry');
    
    // Try to reset password with valid token
    try {
      const resetResponse = await axios.post(`${BASE_URL}/auth/reset-password/${testToken}`, {
        password: 'NewPassword123!'
      });
      console.log('Reset with valid token - SUCCESS:', resetResponse.data);
    } catch (error) {
      console.log('Reset with valid token - ERROR:', error.response?.data || error.message);
    }
    
    // Step 4: Now set an expired token and test
    console.log('\n4. Testing with expired token...');
    
    const expiredToken = crypto.randomBytes(20).toString('hex');
    const hashedExpiredToken = crypto.createHash('sha256').update(expiredToken).digest('hex');
    
    user.resetPasswordToken = hashedExpiredToken;
    user.resetPasswordExpire = Date.now() - 5 * 60 * 1000; // 5 minutes ago (expired)
    await user.save({ validateBeforeSave: false });
    
    console.log('Set expired token (5 minutes ago)');
    
    try {
      const resetResponse = await axios.post(`${BASE_URL}/auth/reset-password/${expiredToken}`, {
        password: 'NewPassword123!'
      });
      console.log('Reset with expired token - UNEXPECTED SUCCESS:', resetResponse.data);
      console.log('🚨 BUG FOUND: Expired token was accepted!');
    } catch (error) {
      console.log('Reset with expired token - EXPECTED ERROR:', error.response?.data || error.message);
      console.log('✅ Expiration working correctly');
    }
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('API test error:', error.response?.data || error.message);
  }
}

testActualAPI();