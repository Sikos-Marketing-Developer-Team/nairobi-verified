// Simple test without Jest - just uses Node.js assert
const request = require('supertest');
const mongoose = require('mongoose');
const assert = require('assert');

// Load environment
require('dotenv').config();

const app = require('../server');
const Merchant = require('../models/Merchant');
const Product = require('../models/Product');

let agent;
let merchantId;

async function setup() {
  console.log('\n🔧 Setting up test...\n');
  
  // Wait for DB connection
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  
  console.log('✅ Connected to database');
  
  // Create agent
  agent = request.agent(app);
  
  // Clean up
  await Merchant.deleteMany({ email: 'test@merchant.com' });
  await Product.deleteMany({ merchantName: 'Test Merchant' });
  console.log('✅ Cleaned up test data');
  
  // Create merchant
  const merchant = await Merchant.create({
    businessName: 'Test Merchant',
    email: 'test@merchant.com',
    phone: '+254712345678',
    password: 'TestPassword123!',
    businessType: 'Retail',
    description: 'Test merchant',
    address: '123 Test St',
    location: 'Nairobi',
    verified: true,
    isActive: true
  });
  
  merchantId = merchant._id;
  console.log('✅ Created test merchant:', merchantId);
  
  // Login
  const loginRes = await agent
    .post('/api/auth/login/merchant')
    .send({
      email: 'test@merchant.com',
      password: 'TestPassword123!'
    });
  
  console.log('Login Status:', loginRes.status);
  console.log('Login Body:', loginRes.body);
  
  const cookies = loginRes.headers['set-cookie'];
  const sessionCookie = cookies?.find(c => c.includes('nairobi_verified_session'));
  
  console.log('Session Cookie Set:', !!sessionCookie);
  
  assert.strictEqual(loginRes.status, 200, 'Login should succeed');
  assert.ok(sessionCookie, 'Session cookie should be set');
  
  console.log('✅ Login successful\n');
}

async function testAuthCheck() {
  console.log('TEST 1: Auth Check');
  const res = await agent.get('/api/auth/me');
  console.log('Status:', res.status);
  console.log('Body:', res.body);
  assert.strictEqual(res.status, 200, 'Auth check should succeed');
  console.log('✅ PASSED\n');
}

async function testDashboardOverview() {
  console.log('TEST 2: Dashboard Overview');
  const res = await agent.get('/api/merchants/dashboard/overview');
  console.log('Status:', res.status);
  console.log('Body:', JSON.stringify(res.body, null, 2).substring(0, 200));
  assert.strictEqual(res.status, 200, 'Dashboard should work');
  console.log('✅ PASSED\n');
}

async function testGetProducts() {
  console.log('TEST 3: Get Products');
  const res = await agent.get('/api/merchants/dashboard/products');
  console.log('Status:', res.status);
  console.log('Body:', res.body);
  assert.strictEqual(res.status, 200, 'Get products should work');
  console.log('✅ PASSED\n');
}

async function testCreateProduct() {
  console.log('TEST 4: Create Product (THE CRITICAL ONE)');
  
  const productData = {
    name: 'Test Product',
    description: 'Test description',
    category: 'Electronics',
    price: 1000,
    available: true,
    featured: false,
    images: ['https://example.com/test.jpg'],
    subcategory: 'Mobile'
  };
  
  console.log('Sending:', productData);
  
  const res = await agent
    .post('/api/merchants/dashboard/products')
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .send(productData);
  
  console.log('Status:', res.status);
  console.log('Headers:', res.headers);
  console.log('Body:', res.body);
  console.log('Text:', res.text);
  console.log('Response type:', typeof res.body);
  console.log('Response is empty?:', !res.text || res.text === '');
  
  // Critical assertions
  assert.ok(res.text, 'Response should not be empty');
  assert.strictEqual(res.status, 201, 'Status should be 201');
  assert.ok(res.body, 'Response body should exist');
  assert.strictEqual(res.body.success, true, 'Success should be true');
  assert.ok(res.body.data, 'Data should exist');
  assert.ok(res.body.data._id, 'Product ID should exist');
  
  console.log('✅ PASSED - Product created:', res.body.data._id, '\n');
}

async function cleanup() {
  console.log('🧹 Cleaning up...');
  await Merchant.deleteMany({ email: 'test@merchant.com' });
  await Product.deleteMany({ merchantName: 'Test Merchant' });
  await mongoose.connection.close();
  console.log('✅ Cleanup complete\n');
}

async function runTests() {
  try {
    await setup();
    await testAuthCheck();
    await testDashboardOverview();
    await testGetProducts();
    await testCreateProduct();
    
    console.log('✅✅✅ ALL TESTS PASSED ✅✅✅\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌❌❌ TEST FAILED ❌❌❌');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await cleanup();
  }
}

// Run tests
runTests();

// Test ci workflow