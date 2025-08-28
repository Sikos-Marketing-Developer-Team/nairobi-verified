#!/usr/bin/env node

/**
 * Admin Panel Functionality Test Script
 * Tests all admin endpoints and functionality
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const ADMIN_CREDENTIALS = {
  email: 'admin@nairobiverified.com',
  password: 'SuperAdmin123!'
};

let adminToken = null;

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(testName, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${testName}${message ? ' - ' + message : ''}`);
  
  testResults.tests.push({
    name: testName,
    passed,
    message
  });
  
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

async function testAdminLogin() {
  try {
    const response = await axios.post(`${API_BASE}/auth/admin/login`, ADMIN_CREDENTIALS);
    
    if (response.data.success && response.data.token) {
      adminToken = response.data.token;
      logTest('Admin Login', true, 'Token received');
      return true;
    } else {
      logTest('Admin Login', false, 'No token in response');
      return false;
    }
  } catch (error) {
    logTest('Admin Login', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testAdminAuth() {
  try {
    const response = await axios.get(`${API_BASE}/auth/admin/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.success && response.data.admin) {
      logTest('Admin Authentication Check', true, `Logged in as ${response.data.admin.name}`);
      return true;
    } else {
      logTest('Admin Authentication Check', false, 'Invalid auth response');
      return false;
    }
  } catch (error) {
    logTest('Admin Authentication Check', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testDashboardStats() {
  try {
    const response = await axios.get(`${API_BASE}/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.success && response.data.data) {
      const stats = response.data.data;
      logTest('Dashboard Statistics', true, `Users: ${stats.totalUsers}, Merchants: ${stats.totalMerchants}`);
      return true;
    } else {
      logTest('Dashboard Statistics', false, 'Invalid stats response');
      return false;
    }
  } catch (error) {
    logTest('Dashboard Statistics', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testUserManagement() {
  try {
    const response = await axios.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.success) {
      logTest('User Management API', true, `Found ${response.data.data?.length || 0} users`);
      return true;
    } else {
      logTest('User Management API', false, 'Invalid users response');
      return false;
    }
  } catch (error) {
    logTest('User Management API', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testMerchantManagement() {
  try {
    const response = await axios.get(`${API_BASE}/admin/merchants`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.success) {
      logTest('Merchant Management API', true, `Found ${response.data.data?.length || 0} merchants`);
      return true;
    } else {
      logTest('Merchant Management API', false, 'Invalid merchants response');
      return false;
    }
  } catch (error) {
    logTest('Merchant Management API', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testPendingVerifications() {
  try {
    const response = await axios.get(`${API_BASE}/admin/verifications/pending`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.success) {
      logTest('Pending Verifications API', true, `Found ${response.data.data?.length || 0} pending verifications`);
      return true;
    } else {
      logTest('Pending Verifications API', false, 'Invalid verifications response');
      return false;
    }
  } catch (error) {
    logTest('Pending Verifications API', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testAdminLogout() {
  try {
    const response = await axios.post(`${API_BASE}/auth/admin/logout`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.success) {
      logTest('Admin Logout', true, 'Successfully logged out');
      return true;
    } else {
      logTest('Admin Logout', false, 'Invalid logout response');
      return false;
    }
  } catch (error) {
    logTest('Admin Logout', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Admin Panel Functionality Tests...\n');
  
  // Test admin login
  const loginSuccess = await testAdminLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without admin login. Exiting tests.');
    return;
  }
  
  // Test authentication
  await testAdminAuth();
  
  // Test dashboard endpoints
  await testDashboardStats();
  
  // Test management endpoints
  await testUserManagement();
  await testMerchantManagement();
  await testPendingVerifications();
  
  // Test logout
  await testAdminLogout();
  
  // Print summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => console.log(`   - ${test.name}: ${test.message}`));
  }
  
  console.log('\n🎯 Admin Panel Test Complete!');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Test interrupted by user');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test execution failed:', error.message);
  process.exit(1);
});