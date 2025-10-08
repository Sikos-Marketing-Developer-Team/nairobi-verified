const crypto = require('crypto');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

async function testActualAPI() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nairobi-verified');
    console.log('✅ Connected to database');
    
    const User = require('./models/User');
    
    // Clean up any existing test user
    const testEmail = 'api-test@example.com';
    await User.deleteOne({ email: testEmail });
    
    // Create a test user
    const user = await User.create({
      firstName: 'API',
      lastName: 'Test',
      email: testEmail,
      phone: '1234567890',
      password: 'Password123!'
    });
    
    console.log('✅ Created test user:', testEmail);
    
    // Step 1: Call forgot password API
    console.log('\n=== STEP 1: Calling forgot password API ===');
    try {
      const forgotResponse = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email: testEmail
      });
      console.log('Forgot password response:', forgotResponse.data);
      
      // Wait a moment for the email to be processed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check what token was generated in the database
      const updatedUser = await User.findOne({ email: testEmail });
      console.log('User after forgot password:');
      console.log('- Has reset token:', !!updatedUser.resetPasswordToken);
      console.log('- Token expiry:', new Date(updatedUser.resetPasswordExpire).toISOString());
      console.log('- Current time:', new Date().toISOString());
      console.log('- Time until expiry:', Math.floor((updatedUser.resetPasswordExpire - Date.now()) / 1000), 'seconds');
      
      // The token in the database is hashed, but we need the unhashed version for the URL
      // In a real scenario, this would be sent via email
      // For testing, let's manually create a valid token that would work
      
      console.log('\n=== STEP 2: Trying to reverse engineer the token ===');
      console.log('Unfortunately, we cannot reverse the hash to get the original token.');
      console.log('In a real scenario, the token would be sent via email.');
      console.log('Let me create a fresh test with a known token...');
      
    } catch (error) {
      console.error('Forgot password API error:', error.response?.data || error.message);
    }
    
    // Step 3: Create a manual token that we know
    console.log('\n=== STEP 3: Creating manual token for testing ===');
    const testToken = 'test-token-123';
    const hashedTestToken = crypto.createHash('sha256').update(testToken).digest('hex');
    
    user.resetPasswordToken = hashedTestToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    await user.save();
    
    console.log('Manual token created:');
    console.log('- Raw token:', testToken);
    console.log('- Hashed token:', hashedTestToken);
    console.log('- Expiry:', new Date(user.resetPasswordExpire).toISOString());
    
    // Step 4: Test the reset password API with our known token
    console.log('\n=== STEP 4: Testing reset password API ===');
    try {
      const resetResponse = await axios.post(`http://localhost:5000/api/auth/reset-password/${testToken}`, {
        password: 'NewPassword123!'
      });
      console.log('✅ Reset password successful:', resetResponse.data);
    } catch (error) {
      console.log('❌ Reset password failed:', error.response?.data || error.message);
      
      // Let's check if the token still exists after the API call
      const userAfterReset = await User.findOne({ email: testEmail });
      console.log('User after reset attempt:');
      console.log('- Still has reset token:', !!userAfterReset.resetPasswordToken);
      console.log('- Token expiry still there:', !!userAfterReset.resetPasswordExpire);
      if (userAfterReset.resetPasswordExpire) {
        console.log('- Expiry time:', new Date(userAfterReset.resetPasswordExpire).toISOString());
        console.log('- Is still valid:', userAfterReset.resetPasswordExpire > Date.now());
      }
    }
    
    // Clean up
    await User.deleteOne({ email: testEmail });
    await mongoose.disconnect();
    console.log('\n✅ API test completed and cleaned up');
    
  } catch (error) {
    console.error('❌ API test error:', error);
    process.exit(1);
  }
}

testActualAPI();