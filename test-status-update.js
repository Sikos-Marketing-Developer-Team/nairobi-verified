#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const adminCredentials = {
  email: 'admin@nairobiverified.com',
  password: 'SuperAdmin123!'
};

async function quickStatusTest() {
  console.log('🔄 Quick Status Update Test\n');
  
  try {
    // Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/admin/login`, adminCredentials);
    const headers = { 'Authorization': `Bearer ${loginResponse.data.token}` };
    
    // Create user
    const testUser = {
      firstName: 'Status',
      lastName: 'Test',
      email: `statustest${Date.now()}@example.com`,
      phone: '+254712345678',
      role: 'user'
    };
    
    const userResponse = await axios.post(`${BASE_URL}/admin/dashboard/users`, testUser, { headers });
    const userId = userResponse.data.user.id;
    
    console.log(`✅ Created user: ${userResponse.data.user.firstName} ${userResponse.data.user.lastName}`);
    console.log(`   Initial active status: ${userResponse.data.user.isActive}`);
    
    // Deactivate
    const deactivateResponse = await axios.put(`${BASE_URL}/admin/dashboard/users/${userId}/status`, {
      isActive: false
    }, { headers });
    
    console.log(`\n🔴 Deactivated user`);
    console.log(`   Active status: ${deactivateResponse.data.user.isActive}`);
    
    // Reactivate  
    const reactivateResponse = await axios.put(`${BASE_URL}/admin/dashboard/users/${userId}/status`, {
      isActive: true
    }, { headers });
    
    console.log(`\n🟢 Reactivated user`);
    console.log(`   Active status: ${reactivateResponse.data.user.isActive}`);
    
    // Cleanup
    await axios.delete(`${BASE_URL}/admin/dashboard/users/${userId}`, { headers });
    console.log(`\n🗑️ User deleted`);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

quickStatusTest();