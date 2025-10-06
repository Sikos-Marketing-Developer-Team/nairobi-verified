const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config();

async function debugTokenIssue() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nairobi-verified');
    console.log('✅ Connected to database');
    
    const User = require('./models/User');
    
    // Clean up any existing test user
    const testEmail = 'debug-token@example.com';
    await User.deleteOne({ email: testEmail });
    
    // Create a test user
    const user = await User.create({
      firstName: 'Debug',
      lastName: 'User',
      email: testEmail,
      phone: '1234567890',
      password: 'Password123!'
    });
    
    console.log('✅ Created test user:', testEmail);
    
    // Simulate the exact same process as the forgot password endpoint
    console.log('\n=== SIMULATING FORGOT PASSWORD PROCESS ===');
    
    const resetToken = crypto.randomBytes(20).toString('hex');
    console.log('Generated resetToken:', resetToken);
    
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log('Hashed token:', hashedToken);
    
    // Set token with 10 minutes expiry (same as in forgotPassword)
    const expireTime = Date.now() + 10 * 60 * 1000;
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = expireTime;
    await user.save();
    
    console.log('Token set in database:');
    console.log('- resetPasswordToken:', user.resetPasswordToken);
    console.log('- resetPasswordExpire:', user.resetPasswordExpire);
    console.log('- Expiry date:', new Date(user.resetPasswordExpire).toISOString());
    console.log('- Current time:', new Date().toISOString());
    console.log('- Time until expiry:', Math.floor((user.resetPasswordExpire - Date.now()) / 1000), 'seconds');
    
    // Now simulate the reset password process
    console.log('\n=== SIMULATING RESET PASSWORD PROCESS ===');
    
    // Hash the token from params (same as in resetPassword)
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    console.log('Token from URL (hashed):', resetPasswordToken);
    console.log('Token in database:', user.resetPasswordToken);
    console.log('Tokens match:', resetPasswordToken === user.resetPasswordToken);
    
    const currentTime = Date.now();
    console.log('Current time for comparison:', currentTime);
    console.log('Token expiry time:', user.resetPasswordExpire);
    console.log('Is token still valid:', user.resetPasswordExpire > currentTime);
    
    // Check what the database query would find
    const foundUser = await User.findOne({
      resetPasswordToken: resetPasswordToken,
      resetPasswordExpire: { $gt: currentTime }
    });
    
    console.log('Database query result:', foundUser ? 'FOUND USER' : 'NO USER FOUND');
    
    if (!foundUser) {
      // Check if user exists without expiry check
      const userWithoutExpiry = await User.findOne({
        resetPasswordToken: resetPasswordToken
      });
      console.log('User exists without expiry check:', userWithoutExpiry ? 'YES' : 'NO');
      
      if (userWithoutExpiry) {
        console.log('User token expiry:', userWithoutExpiry.resetPasswordExpire);
        console.log('Current time:', currentTime);
        console.log('Expired by milliseconds:', currentTime - userWithoutExpiry.resetPasswordExpire);
      }
    }
    
    // Clean up
    await User.deleteOne({ email: testEmail });
    await mongoose.disconnect();
    console.log('\n✅ Debug completed and cleaned up');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    process.exit(1);
  }
}

debugTokenIssue();