#!/usr/bin/env node
require('dotenv').config();
const { emailService } = require('./utils/emailService');

async function testEmail() {
  try {
    console.log('Testing email service...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Test password reset email
    const result = await emailService.sendPasswordReset(
      'test@example.com',
      'http://localhost:3000/reset-password/test-token',
      'user'
    );
    
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Email test failed:', error);
  }
}

testEmail();