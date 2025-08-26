#!/usr/bin/env node

/**
 * Admin Panel Functionality Test Script
 * This script tests the key admin panel functionalities
 */

import axios from 'axios';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@nairobiverified.com';
const ADMIN_PASSWORD = 'SuperAdmin123!';

let adminToken = '';

// Test configuration
const tests = {
  auth: true,
  dashboard: true,
  merchants: true,
  users: true,
  products: true,
  flashSales: true
};

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
};

// Test functions
const testAdminAuth = async () => {
  console.log('\n🔐 Testing Admin Authentication...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (response.data.success && response.data.token) {
      adminToken = response.data.token;
      console.log('✅ Admin login successful');
      return true;
    } else {
      console.log('❌ Admin login failed - no token received');
      return false;
    }
  } catch (error) {
    console.log(`❌ Admin login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
};

const testDashboardStats = async () => {
  console.log('\n📊 Testing Dashboard Statistics...');
  
  const result = await makeRequest('GET', '/admin/dashboard/stats');
  
  if (result.success) {
    console.log('✅ Dashboard stats loaded successfully');
    console.log(`   - Total Merchants: ${result.data.data.totalMerchants}`);
    console.log(`   - Total Users: ${result.data.data.totalUsers}`);
    console.log(`   - Total Products: ${result.data.data.totalProducts}`);
    console.log(`   - Verified Merchants: ${result.data.data.verifiedMerchants}`);
    return true;
  } else {
    console.log(`❌ Dashboard stats failed: ${result.error}`);
    return false;
  }
};

const testMerchantManagement = async () => {
  console.log('\n🏪 Testing Merchant Management...');
  
  const result = await makeRequest('GET', '/admin/dashboard/merchants?page=1&limit=5');
  
  if (result.success) {
    console.log('✅ Merchants loaded successfully');
    const merchants = result.data.data?.merchants || result.data.merchants || [];
    const total = result.data.data?.total || result.data.total || merchants.length;
    console.log(`   - Found ${merchants.length} merchants`);
    console.log(`   - Total: ${total}`);
    
    // Test merchant status update if merchants exist
    if (merchants.length > 0) {
      const merchantId = merchants[0]._id;
      const statusResult = await makeRequest('PUT', `/admin/dashboard/merchants/${merchantId}/status`, {
        verified: true
      });
      
      if (statusResult.success) {
        console.log('✅ Merchant status update successful');
      } else {
        console.log(`⚠️  Merchant status update failed: ${statusResult.error}`);
      }
    }
    
    return true;
  } else {
    console.log(`❌ Merchant management failed: ${result.error}`);
    return false;
  }
};

const testUserManagement = async () => {
  console.log('\n👥 Testing User Management...');
  
  const result = await makeRequest('GET', '/admin/dashboard/users?page=1&limit=5');
  
  if (result.success) {
    console.log('✅ Users loaded successfully');
    const users = result.data.data?.users || result.data.users || [];
    const total = result.data.data?.total || result.data.total || users.length;
    console.log(`   - Found ${users.length} users`);
    console.log(`   - Total: ${total}`);
    return true;
  } else {
    console.log(`❌ User management failed: ${result.error}`);
    return false;
  }
};

const testProductManagement = async () => {
  console.log('\n📦 Testing Product Management...');
  
  const result = await makeRequest('GET', '/admin/dashboard/products?page=1&limit=5');
  
  if (result.success) {
    console.log('✅ Products loaded successfully');
    console.log(`   - Found ${result.data.products.length} products`);
    return true;
  } else {
    console.log(`❌ Product management failed: ${result.error}`);
    return false;
  }
};

const testFlashSalesManagement = async () => {
  console.log('\n⚡ Testing Flash Sales Management...');
  
  const result = await makeRequest('GET', '/admin/dashboard/flash-sales');
  
  if (result.success) {
    console.log('✅ Flash sales loaded successfully');
    console.log(`   - Found ${result.data.data.length} flash sales`);
    
    // Test flash sales analytics
    const analyticsResult = await makeRequest('GET', '/admin/dashboard/flash-sales/analytics');
    if (analyticsResult.success) {
      console.log('✅ Flash sales analytics loaded successfully');
    } else {
      console.log(`⚠️  Flash sales analytics failed: ${analyticsResult.error}`);
    }
    
    return true;
  } else {
    console.log(`❌ Flash sales management failed: ${result.error}`);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Admin Panel Functionality Tests...');
  console.log(`📡 API Base URL: ${API_BASE_URL}`);
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Authentication test (required for all others)
  if (tests.auth) {
    results.total++;
    if (await testAdminAuth()) {
      results.passed++;
    } else {
      results.failed++;
      console.log('\n❌ Authentication failed - skipping other tests');
      return results;
    }
  }

  // Dashboard tests
  if (tests.dashboard && adminToken) {
    results.total++;
    if (await testDashboardStats()) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  // Merchant management tests
  if (tests.merchants && adminToken) {
    results.total++;
    if (await testMerchantManagement()) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  // User management tests
  if (tests.users && adminToken) {
    results.total++;
    if (await testUserManagement()) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  // Product management tests
  if (tests.products && adminToken) {
    results.total++;
    if (await testProductManagement()) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  // Flash sales management tests
  if (tests.flashSales && adminToken) {
    results.total++;
    if (await testFlashSalesManagement()) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  return results;
};

// Run the tests
runTests().then(results => {
  console.log('\n📋 Test Results Summary:');
  console.log(`✅ Passed: ${results.passed}/${results.total}`);
  console.log(`❌ Failed: ${results.failed}/${results.total}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! Admin panel is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
  
  process.exit(results.failed === 0 ? 0 : 1);
}).catch(error => {
  console.error('\n💥 Test runner crashed:', error.message);
  process.exit(1);
});