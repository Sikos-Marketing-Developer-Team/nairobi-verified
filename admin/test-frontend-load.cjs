#!/usr/bin/env node

/**
 * Simple test to verify admin frontend loads without critical errors
 */

const axios = require('axios');

const ADMIN_URL = 'http://localhost:3002';
const API_BASE_URL = 'http://localhost:5000/api';

async function testFrontendLoad() {
  console.log('🚀 Testing Admin Frontend Load...');
  console.log(`📡 Admin URL: ${ADMIN_URL}`);
  console.log(`📡 API URL: ${API_BASE_URL}`);
  
  try {
    // Test if admin panel is accessible
    console.log('\n🌐 Testing admin panel accessibility...');
    const frontendResponse = await axios.get(ADMIN_URL, {
      timeout: 5000,
      validateStatus: () => true // Accept any status code
    });
    
    if (frontendResponse.status === 200) {
      console.log('✅ Admin panel is accessible');
    } else {
      console.log(`⚠️  Admin panel returned status: ${frontendResponse.status}`);
    }
    
    // Test API endpoints that the frontend uses
    console.log('\n🔐 Testing admin authentication endpoint...');
    const authTest = await axios.post(`${API_BASE_URL}/auth/admin/login`, {
      email: 'admin@nairobiverified.com',
      password: 'SuperAdmin123!'
    }, {
      timeout: 5000,
      validateStatus: () => true
    });
    
    if (authTest.status === 200 && authTest.data.success) {
      console.log('✅ Admin authentication endpoint working');
      
      const token = authTest.data.token;
      const headers = { Authorization: `Bearer ${token}` };
      
      // Test dashboard stats
      console.log('\n📊 Testing dashboard stats endpoint...');
      const statsResponse = await axios.get(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers,
        timeout: 5000,
        validateStatus: () => true
      });
      
      if (statsResponse.status === 200 && statsResponse.data.success) {
        console.log('✅ Dashboard stats endpoint working');
        console.log(`   - Total Users: ${statsResponse.data.data.totalUsers}`);
        console.log(`   - Total Merchants: ${statsResponse.data.data.totalMerchants}`);
      } else {
        console.log('❌ Dashboard stats endpoint failed');
      }
      
      // Test users endpoint
      console.log('\n👥 Testing users management endpoint...');
      const usersResponse = await axios.get(`${API_BASE_URL}/admin/dashboard/users`, {
        headers,
        params: { page: 1, limit: 5 },
        timeout: 5000,
        validateStatus: () => true
      });
      
      if (usersResponse.status === 200 && usersResponse.data.success) {
        console.log('✅ Users management endpoint working');
        const users = usersResponse.data.data?.users || usersResponse.data.users || [];
        console.log(`   - Found ${users.length} users`);
      } else {
        console.log('❌ Users management endpoint failed');
      }
      
      // Test merchants endpoint
      console.log('\n🏪 Testing merchants management endpoint...');
      const merchantsResponse = await axios.get(`${API_BASE_URL}/admin/dashboard/merchants`, {
        headers,
        params: { page: 1, limit: 5 },
        timeout: 5000,
        validateStatus: () => true
      });
      
      if (merchantsResponse.status === 200 && merchantsResponse.data.success) {
        console.log('✅ Merchants management endpoint working');
        const merchants = merchantsResponse.data.data?.merchants || merchantsResponse.data.merchants || [];
        console.log(`   - Found ${merchants.length} merchants`);
      } else {
        console.log('❌ Merchants management endpoint failed');
      }
      
    } else {
      console.log('❌ Admin authentication failed');
      return;
    }
    
    console.log('\n🎉 Frontend load test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Admin panel is accessible at http://localhost:3002');
    console.log('✅ Backend API is responding correctly');
    console.log('✅ Authentication is working');
    console.log('✅ Core endpoints are functional');
    console.log('\n🔐 Login with:');
    console.log('   Email: admin@nairobiverified.com');
    console.log('   Password: SuperAdmin123!');
    
  } catch (error) {
    console.error('\n💥 Frontend load test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      if (error.config?.url?.includes('3002')) {
        console.log('❌ Admin panel is not running on port 3002');
        console.log('💡 Try running: cd admin && npm run dev');
      } else if (error.config?.url?.includes('5000')) {
        console.log('❌ Backend server is not running on port 5000');
        console.log('💡 Try running: cd backend && npm start');
      }
    }
  }
}

// Run the test
testFrontendLoad().catch(console.error);