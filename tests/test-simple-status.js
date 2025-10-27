#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const adminCredentials = {
  email: 'admin@nairobiverified.com',
  password: 'SuperAdmin123!'
};

async function testUserStatusSimple() {
  console.log('🧪 Simple User Status Test\n');
  
  try {
    // Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/admin/login`, adminCredentials);
    const headers = { 'Authorization': `Bearer ${loginResponse.data.token}` };
    console.log('✅ Logged in successfully');
    
    // Create user
    console.log('\n2️⃣ Creating user...');
    const testUser = {
      firstName: 'Simple',
      lastName: 'Test',
      email: `simpletest${Date.now()}@example.com`,
      phone: '+254712345678',
      role: 'user'
    };
    
    const userResponse = await axios.post(`${BASE_URL}/admin/dashboard/users`, testUser, { headers });
    const userId = userResponse.data.user.id;
    console.log('✅ User created');
    console.log('Full user object:', JSON.stringify(userResponse.data.user, null, 2));
    
    // Test status update endpoint directly
    console.log('\n3️⃣ Testing status endpoint...');
    const statusResponse = await axios.put(`${BASE_URL}/admin/dashboard/users/${userId}/status`, {
      isActive: false
    }, { headers });
    
    console.log('✅ Status update response:');
    console.log(JSON.stringify(statusResponse.data, null, 2));
    
    // Cleanup
    await axios.delete(`${BASE_URL}/admin/dashboard/users/${userId}`, { headers });
    console.log('\n🗑️ User deleted');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testUserStatusSimple();