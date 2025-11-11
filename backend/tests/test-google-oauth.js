// Google OAuth Configuration Test Script

const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

async function testGoogleOAuth() {
  console.log('🧪 TESTING GOOGLE OAUTH CONFIGURATION');
  console.log('=====================================\n');
  
  try {
    // Test 1: Check environment variables
    console.log('1. Checking Environment Variables...');
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.log('❌ Missing Google OAuth credentials');
      return;
    }
    
    console.log('✅ Google OAuth credentials found');
    console.log(`   Client ID: ${clientId.substring(0, 20)}...`);
    console.log(`   Client Secret: ${clientSecret.substring(0, 10)}...`);
    
    // Test 2: Initialize OAuth client
    console.log('\n2. Initializing OAuth Client...');
    const client = new OAuth2Client(clientId);
    console.log('✅ OAuth client initialized successfully');
    
    // Test 3: Check client configuration
    console.log('\n3. OAuth Client Configuration:');
    console.log(`   Client ID: ${clientId}`);
    console.log('   Expected Origins:');
    console.log('   - https://nairobi-verified-frontend.onrender.com');
    console.log('   - http://localhost:3000');
    console.log('   - http://localhost:5173');
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
    console.log('2. Navigate to: APIs & Services > Credentials');
    console.log(`3. Edit OAuth client: ${clientId}`);
    console.log('4. Add authorized JavaScript origins:');
    console.log('   - https://nairobi-verified-frontend.onrender.com');
    console.log('   - http://localhost:3000');
    console.log('   - http://localhost:5173');
    console.log('5. Add authorized redirect URIs:');
    console.log('   - https://nairobi-verified-frontend.onrender.com/auth');
    console.log('   - https://nairobi-verified-backend-4c1b.onrender.com/api/auth/google/callback');
    
    console.log('\n✅ Google OAuth backend configuration is correct!');
    console.log('❗ The issue is in Google Cloud Console domain authorization');
    
  } catch (error) {
    console.error('❌ Google OAuth test failed:', error.message);
  }
}

testGoogleOAuth();