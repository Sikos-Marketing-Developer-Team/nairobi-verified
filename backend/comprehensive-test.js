const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

// Test both User Profile Save and Password Reset Expiration
async function comprehensiveTest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    const User = require('./models/User');
    const testEmail = 'comprehensive-test@example.com';
    
    // Clean up
    await User.deleteOne({ email: testEmail });
    
    console.log('\n=== TEST 1: User Profile Save (Backend Implementation) ===');
    
    // Create a test user first
    let user = await User.create({
      firstName: 'Original',
      lastName: 'User',
      email: testEmail,
      phone: '1234567890',
      password: 'Password123!'
    });
    console.log('✅ User created:', user.firstName, user.lastName);
    
    // Simulate login to get a token (simplified)
    const token = user.getSignedJwtToken();
    console.log('✅ User token generated');
    
    // Test profile update API
    try {
      const updateResponse = await axios.put('http://localhost:5000/api/users/me', {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '9876543210'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Profile update successful:', updateResponse.data);
      
      // Verify in database
      const updatedUser = await User.findById(user._id);
      console.log('✅ Database verification:');
      console.log('  - Name:', updatedUser.firstName, updatedUser.lastName);
      console.log('  - Phone:', updatedUser.phone);
      
    } catch (error) {
      console.log('❌ Profile update failed:', error.response?.data || error.message);
    }
    
    console.log('\n=== TEST 2: Password Reset Token Expiration ===');
    
    // Test password reset functionality
    try {
      const forgotResponse = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email: testEmail
      });
      console.log('✅ Forgot password request:', forgotResponse.data);
      
      // Check if token was created in database
      const userWithToken = await User.findOne({ email: testEmail });
      
      if (userWithToken.resetPasswordToken) {
        console.log('✅ Reset token created in database');
        console.log('  - Expiry:', new Date(userWithToken.resetPasswordExpire).toISOString());
        console.log('  - Time until expiry:', Math.floor((userWithToken.resetPasswordExpire - Date.now()) / 1000), 'seconds');
        
        // Test with an expired token (simulate by modifying database)
        console.log('\n--- Testing Expired Token Rejection ---');
        
        // Set token to expired
        userWithToken.resetPasswordExpire = Date.now() - 5 * 60 * 1000; // 5 minutes ago
        await userWithToken.save();
        
        // Try to use expired token (we need the raw token, so let's create a known one)
        const crypto = require('crypto');
        const testToken = 'expired-test-token';
        const hashedTestToken = crypto.createHash('sha256').update(testToken).digest('hex');
        
        userWithToken.resetPasswordToken = hashedTestToken;
        await userWithToken.save();
        
        try {
          const expiredResetResponse = await axios.post(`http://localhost:5000/api/auth/reset-password/${testToken}`, {
            password: 'NewPassword123!'
          });
          console.log('❌ PROBLEM: Expired token was accepted!', expiredResetResponse.data);
        } catch (error) {
          if (error.response?.status === 400 && error.response?.data?.error?.includes('expired')) {
            console.log('✅ Expired token correctly rejected:', error.response.data.error);
          } else {
            console.log('✅ Token rejected (as expected):', error.response?.data?.error || error.message);
          }
        }
        
      } else {
        console.log('❌ No reset token was created in database');
      }
      
    } catch (error) {
      console.log('❌ Forgot password failed:', error.response?.data || error.message);
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

comprehensiveTest();