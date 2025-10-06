#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test admin credentials (using the hardcoded admin for testing)
const adminCredentials = {
  email: 'admin@nairobiverified.com',
  password: 'SuperAdmin123!'
};

async function testAdminDashboard() {
  console.log('🧪 Testing Admin Dashboard Functionality\n');
  
  try {
    // Step 1: Admin login
    console.log('1️⃣ Testing admin login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/admin/login`, adminCredentials);
    
    if (loginResponse.data.success) {
      console.log('✅ Admin login successful');
      const adminToken = loginResponse.data.token;
      const headers = { 'Authorization': `Bearer ${adminToken}` };
      
      // Step 2: Test user creation
      console.log('\n2️⃣ Testing user creation...');
      const testUser = {
        firstName: 'Test',
        lastName: 'User',
        email: `testuser${Date.now()}@example.com`,
        phone: '+254712345678',
        role: 'user'
      };
      
      try {
        const userResponse = await axios.post(`${BASE_URL}/admin/dashboard/users`, testUser, { headers });
        if (userResponse.data.success) {
          console.log('✅ User creation successful');
          console.log(`   Created user: ${userResponse.data.user.firstName} ${userResponse.data.user.lastName}`);
          console.log(`   Email: ${userResponse.data.user.email}`);
        }
      } catch (userError) {
        console.log('❌ User creation failed');
        console.log(`   Status: ${userError.response?.status}`);
        console.log(`   Message: ${userError.response?.data?.message || userError.message}`);
        console.log(`   Full Error Response: ${JSON.stringify(userError.response?.data, null, 2)}`);
        if (userError.response?.data?.errors) {
          console.log(`   Validation Errors: ${JSON.stringify(userError.response.data.errors, null, 2)}`);
        }
      }
      
      // Step 3: Test merchant creation
      console.log('\n3️⃣ Testing merchant creation...');
      const testMerchant = {
        businessName: `Test Business ${Date.now()}`,
        email: `testbusiness${Date.now()}@example.com`,
        phone: '+254712345679',
        businessType: 'restaurant',
        description: 'A test restaurant for admin dashboard testing',
        address: '123 Test Street, Nairobi',
        location: {
          type: 'Point',
          coordinates: [36.8219, -1.2921] // Nairobi coordinates
        },
        autoVerify: false
      };
      
      try {
        const merchantResponse = await axios.post(`${BASE_URL}/admin/dashboard/merchants`, testMerchant, { headers });
        if (merchantResponse.data.success) {
          console.log('✅ Merchant creation successful');
          console.log(`   Created merchant: ${merchantResponse.data.merchant.businessName}`);
          console.log(`   Email: ${merchantResponse.data.merchant.email}`);
          console.log(`   Verification Status: ${merchantResponse.data.merchant.verificationStatus}`);
        }
      } catch (merchantError) {
        console.log('❌ Merchant creation failed');
        console.log(`   Status: ${merchantError.response?.status}`);
        console.log(`   Message: ${merchantError.response?.data?.message || merchantError.message}`);
        console.log(`   Full Error Response: ${JSON.stringify(merchantError.response?.data, null, 2)}`);
        if (merchantError.response?.data?.errors) {
          console.log(`   Validation Errors: ${JSON.stringify(merchantError.response.data.errors, null, 2)}`);
        }
      }
      
      // Step 4: Test dashboard stats
      console.log('\n4️⃣ Testing dashboard stats...');
      try {
        const statsResponse = await axios.get(`${BASE_URL}/admin/dashboard/stats`, { headers });
        if (statsResponse.data.success) {
          console.log('✅ Dashboard stats retrieved');
          console.log(`   Total Users: ${statsResponse.data.stats.totalUsers}`);
          console.log(`   Total Merchants: ${statsResponse.data.stats.totalMerchants}`);
          console.log(`   Verified Merchants: ${statsResponse.data.stats.verifiedMerchants}`);
        }
      } catch (statsError) {
        console.log('❌ Dashboard stats failed');
        console.log(`   Status: ${statsError.response?.status}`);
        console.log(`   Message: ${statsError.response?.data?.message || statsError.message}`);
      }
      
    } else {
      console.log('❌ Admin login failed');
      return;
    }
    
  } catch (error) {
    console.log('❌ Test failed');
    console.log(`Error: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
  
  console.log('\n🏁 Admin Dashboard Test Complete');
}

// Run the test
if (require.main === module) {
  testAdminDashboard();
}

module.exports = { testAdminDashboard };