#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test admin credentials
const adminCredentials = {
  email: 'admin@nairobiverified.com',
  password: 'SuperAdmin123!'
};

async function testAdminManagement() {
  console.log('🧪 Testing Admin User & Merchant Management\n');
  
  try {
    // Step 1: Admin login
    console.log('1️⃣ Testing admin login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/admin/login`, adminCredentials);
    
    if (loginResponse.data.success) {
      console.log('✅ Admin login successful');
      const adminToken = loginResponse.data.token;
      const headers = { 'Authorization': `Bearer ${adminToken}` };
      
      let testUserId = null;
      let testMerchantId = null;
      
      // Step 2: Create test user
      console.log('\n2️⃣ Creating test user...');
      const testUser = {
        firstName: 'Management',
        lastName: 'Test',
        email: `mgmttest${Date.now()}@example.com`,
        phone: '+254712345678',
        role: 'user'
      };
      
      try {
        const userResponse = await axios.post(`${BASE_URL}/admin/dashboard/users`, testUser, { headers });
        if (userResponse.data.success) {
          testUserId = userResponse.data.user.id;
          console.log('✅ User created successfully');
          console.log(`   User ID: ${testUserId}`);
          console.log(`   Name: ${userResponse.data.user.firstName} ${userResponse.data.user.lastName}`);
        }
      } catch (error) {
        console.log('❌ User creation failed:', error.response?.data?.message || error.message);
      }
      
      // Step 3: Create test merchant
      console.log('\n3️⃣ Creating test merchant...');
      const testMerchant = {
        businessName: `Management Test Business ${Date.now()}`,
        email: `mgmtbiz${Date.now()}@example.com`,
        phone: '+254712345679',
        businessType: 'retail',
        description: 'A test business for management testing',
        address: '456 Management Test Street, Nairobi',
        location: 'Nairobi CBD, Kenya',
        autoVerify: false
      };
      
      try {
        const merchantResponse = await axios.post(`${BASE_URL}/admin/dashboard/merchants`, testMerchant, { headers });
        if (merchantResponse.data.success) {
          testMerchantId = merchantResponse.data.merchant.id;
          console.log('✅ Merchant created successfully');
          console.log(`   Merchant ID: ${testMerchantId}`);
          console.log(`   Business: ${merchantResponse.data.merchant.businessName}`);
        }
      } catch (error) {
        console.log('❌ Merchant creation failed:', error.response?.data?.message || error.message);
      }
      
      // Step 4: Test user status update
      if (testUserId) {
        console.log('\n4️⃣ Testing user status update...');
        try {
          const statusResponse = await axios.put(`${BASE_URL}/admin/dashboard/users/${testUserId}/status`, {
            isActive: false
          }, { headers });
          
          if (statusResponse.data.success) {
            console.log('✅ User status updated successfully');
            console.log(`   User deactivated: ${statusResponse.data.user.firstName} ${statusResponse.data.user.lastName}`);
            console.log(`   Active status: ${statusResponse.data.user.isActive}`);
          }
        } catch (error) {
          console.log('❌ User status update failed:', error.response?.data?.message || error.message);
        }
        
        // Step 5: Reactivate user
        console.log('\n5️⃣ Reactivating user...');
        try {
          const reactivateResponse = await axios.put(`${BASE_URL}/admin/dashboard/users/${testUserId}/status`, {
            isActive: true
          }, { headers });
          
          if (reactivateResponse.data.success) {
            console.log('✅ User reactivated successfully');
            console.log(`   Active status: ${reactivateResponse.data.user.isActive}`);
          }
        } catch (error) {
          console.log('❌ User reactivation failed:', error.response?.data?.message || error.message);
        }
      }
      
      // Step 6: Test merchant deletion
      if (testMerchantId) {
        console.log('\n6️⃣ Testing merchant deletion...');
        try {
          const deleteResponse = await axios.delete(`${BASE_URL}/admin/dashboard/merchants/${testMerchantId}`, { headers });
          
          if (deleteResponse.data.success) {
            console.log('✅ Merchant deleted successfully');
            console.log(`   Message: ${deleteResponse.data.message}`);
          }
        } catch (error) {
          console.log('❌ Merchant deletion failed:', error.response?.data?.message || error.message);
        }
      }
      
      // Step 7: Test user deletion
      if (testUserId) {
        console.log('\n7️⃣ Testing user deletion...');
        try {
          const deleteResponse = await axios.delete(`${BASE_URL}/admin/dashboard/users/${testUserId}`, { headers });
          
          if (deleteResponse.data.success) {
            console.log('✅ User deleted successfully');
            console.log(`   Message: ${deleteResponse.data.message}`);
          }
        } catch (error) {
          console.log('❌ User deletion failed:', error.response?.data?.message || error.message);
        }
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
  
  console.log('\n🏁 Admin Management Test Complete');
}

// Run the test
if (require.main === module) {
  testAdminManagement();
}

module.exports = { testAdminManagement };