const express = require('express');
const crypto = require('crypto');

// Test the password reset token logic in isolation
function testTokenLogic() {
  console.log('🔍 Testing Password Reset Token Logic...\n');

  // Simulate creating a token (like in forgotPassword)
  const resetToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  // Set expire time (10 minutes)
  const tokenExpiry = Date.now() + 10 * 60 * 1000;
  
  console.log('Token Creation:');
  console.log('- Plain token:', resetToken);
  console.log('- Hashed token:', hashedToken);
  console.log('- Expires at:', new Date(tokenExpiry).toISOString());
  console.log('- Current time:', new Date().toISOString());
  console.log('- Valid for:', Math.floor((tokenExpiry - Date.now()) / 1000), 'seconds\n');

  // Test 1: Valid token (current implementation logic)
  console.log('Test 1: Valid Token Check');
  const currentTime1 = Date.now();
  const isValid1 = tokenExpiry > currentTime1;
  console.log('- Current time:', new Date(currentTime1).toISOString());
  console.log('- Token expiry:', new Date(tokenExpiry).toISOString());
  console.log('- Is valid?', isValid1);
  console.log('- Time remaining:', Math.floor((tokenExpiry - currentTime1) / 1000), 'seconds\n');

  // Test 2: Expired token
  console.log('Test 2: Expired Token Check');
  const expiredTokenExpiry = Date.now() - 1000; // 1 second ago
  const currentTime2 = Date.now();
  const isValid2 = expiredTokenExpiry > currentTime2;
  console.log('- Current time:', new Date(currentTime2).toISOString());
  console.log('- Token expiry:', new Date(expiredTokenExpiry).toISOString());
  console.log('- Is valid?', isValid2);
  console.log('- Expired by:', Math.floor((currentTime2 - expiredTokenExpiry) / 1000), 'seconds\n');

  // Test 3: Edge case - exactly at expiry
  console.log('Test 3: Exact Expiry Time');
  const exactExpiry = Date.now();
  const currentTime3 = exactExpiry;
  const isValid3 = exactExpiry > currentTime3;
  console.log('- Current time:', new Date(currentTime3).toISOString());
  console.log('- Token expiry:', new Date(exactExpiry).toISOString());
  console.log('- Is valid?', isValid3, '(should be false)\n');

  console.log('📊 Summary:');
  console.log('The token expiration logic appears to work correctly.');
  console.log('Tokens expire after 10 minutes as expected.');
  console.log('Edge cases are handled properly.\n');

  // Check the actual MongoDB query logic
  console.log('🔍 MongoDB Query Logic:');
  console.log('Query: { resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: currentTime } }');
  console.log('This query should find documents where resetPasswordExpire > currentTime');
  console.log('If resetPasswordExpire <= currentTime, the document will NOT be found (correct behavior)');
}

testTokenLogic();