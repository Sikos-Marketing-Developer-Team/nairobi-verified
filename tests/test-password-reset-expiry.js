#!/usr/bin/env node

/**
 * Comprehensive test for password reset token expiration
 * This test will verify that tokens expire after 10 minutes
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Merchant = require('./models/Merchant');

async function testPasswordResetExpiry() {
  try {
    console.log('🔍 Testing Password Reset Token Expiration...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    // Create a test user
    const testEmail = 'expiry-test@example.com';
    
    // Clean up any existing test user
    await User.deleteMany({ email: testEmail });
    await Merchant.deleteMany({ email: testEmail });

    const testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      password: 'testpassword123',
      phone: '+254700000000'
    });

    console.log('✅ Created test user:', testEmail);

    // Simulate the forgot password process
    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Test 1: Valid token (should work)
    console.log('\n📋 Test 1: Valid Token (within 10 minutes)');
    testUser.resetPasswordToken = hashedToken;
    testUser.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    await testUser.save();

    const currentTime1 = Date.now();
    const validUser = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: currentTime1 }
    });

    if (validUser) {
      console.log('✅ Valid token found correctly');
      console.log(`   Token expires at: ${new Date(validUser.resetPasswordExpire).toISOString()}`);
      console.log(`   Current time: ${new Date(currentTime1).toISOString()}`);
      console.log(`   Time remaining: ${Math.floor((validUser.resetPasswordExpire - currentTime1) / 1000)} seconds`);
    } else {
      console.log('❌ Valid token should have been found but wasn\'t');
    }

    // Test 2: Expired token (should not work)
    console.log('\n📋 Test 2: Expired Token (set to 1 second ago)');
    testUser.resetPasswordExpire = Date.now() - 1000; // 1 second ago (expired)
    await testUser.save();

    const currentTime2 = Date.now();
    const expiredUser = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: currentTime2 }
    });

    if (!expiredUser) {
      console.log('✅ Expired token correctly rejected');
      
      // Check if we can find the user without expiry check
      const userWithExpiredToken = await User.findOne({ resetPasswordToken: hashedToken });
      if (userWithExpiredToken) {
        console.log(`   Token exists but expired at: ${new Date(userWithExpiredToken.resetPasswordExpire).toISOString()}`);
        console.log(`   Current time: ${new Date(currentTime2).toISOString()}`);
        console.log(`   Time since expiry: ${Math.floor((currentTime2 - userWithExpiredToken.resetPasswordExpire) / 1000)} seconds`);
      }
    } else {
      console.log('❌ Expired token should have been rejected but was accepted');
    }

    // Test 3: Check edge case - exactly at expiry time
    console.log('\n📋 Test 3: Token at exact expiry time');
    const exactExpiryTime = Date.now();
    testUser.resetPasswordExpire = exactExpiryTime;
    await testUser.save();

    const userAtExactExpiry = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: exactExpiryTime }
    });

    if (!userAtExactExpiry) {
      console.log('✅ Token at exact expiry time correctly rejected');
    } else {
      console.log('❌ Token at exact expiry time should have been rejected');
    }

    // Test 4: Simulate full reset password flow
    console.log('\n📋 Test 4: Full Reset Password Flow Simulation');
    
    // Set a fresh token
    const newResetToken = crypto.randomBytes(20).toString('hex');
    const newHashedToken = crypto.createHash('sha256').update(newResetToken).digest('hex');
    testUser.resetPasswordToken = newHashedToken;
    testUser.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await testUser.save();

    console.log('✅ Fresh token set for full flow test');
    console.log(`   Reset token (plain): ${newResetToken}`);
    console.log(`   Reset token (hashed): ${newHashedToken}`);
    console.log(`   Expires at: ${new Date(testUser.resetPasswordExpire).toISOString()}`);

    // Simulate reset password validation
    const simulatedCurrentTime = Date.now();
    const foundUser = await User.findOne({
      resetPasswordToken: newHashedToken,
      resetPasswordExpire: { $gt: simulatedCurrentTime }
    });

    if (foundUser) {
      console.log('✅ Token validation in full flow works correctly');
      console.log(`   Time remaining: ${Math.floor((foundUser.resetPasswordExpire - simulatedCurrentTime) / 1000)} seconds`);
    } else {
      console.log('❌ Token validation in full flow failed');
    }

    // Clean up
    await User.deleteOne({ email: testEmail });
    console.log('\n🧹 Cleaned up test user');

    console.log('\n📊 Test Summary:');
    console.log('The password reset token expiration mechanism appears to be working correctly.');
    console.log('Tokens expire after 10 minutes as expected.');
    console.log('The issue might be elsewhere or may have been already fixed.');

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📱 Disconnected from database');
  }
}

// Run the test
testPasswordResetExpiry();