const request = require('supertest');
const mongoose = require('mongoose');
const Merchant = require('../models/Merchant');
const Product = require('../models/Product');

let app;
let agent;
let merchantId;

async function setup() {
  console.log('\n🔧 Setting up test...\n');
  
  // Set environment first
  process.env.NODE_ENV = 'test';
  process.env.SKIP_SESSION = 'false';
  
  // Connect to DB
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(
      process.env.MONGODB_URI,
      {
        serverSelectionTimeoutMS: 5000
      }
    );
  }
  
  console.log('✅ Connected to database');
  
  // Import app after DB connection
  app = require('../server');
  
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
  
  if (loginRes.status !== 200) {
    throw new Error('Login failed');
  }
  
  const cookies = loginRes.headers['set-cookie'];
  const sessionCookie = cookies?.find(c => c.includes('nairobi_verified_session'));
  
  if (!sessionCookie) {
    throw new Error('Session cookie not set');
  }
  
  console.log('✅ Login successful\n');
}

async function testAuthCheck() {
  console.log('TEST 1: Auth Check');
  const res = await agent.get('/api/auth/me');
  console.log('Status:', res.status);
  
  if (res.status !== 200) {
    throw new Error('Auth check failed');
  }
  
  console.log('✅ PASSED\n');
}

async function testDashboardOverview() {
  console.log('TEST 2: Dashboard Overview');
  const res = await agent.get('/api/merchants/dashboard/overview');
  console.log('Status:', res.status);
  
  if (res.status !== 200) {
    throw new Error('Dashboard overview failed');
  }
  
  console.log('✅ PASSED\n');
}

async function testGetProducts() {
  console.log('TEST 3: Get Products');
  const res = await agent.get('/api/merchants/dashboard/products');
  console.log('Status:', res.status);
  
  if (res.status !== 200) {
    throw new Error('Get products failed');
  }
  
  console.log('✅ PASSED\n');
}

async function testCreateProduct() {
  console.log('TEST 4: Create Product');
  
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
  
  const res = await agent
    .post('/api/merchants/dashboard/products')
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .send(productData);
  
  console.log('Status:', res.status);
  console.log('Body:', res.body);
  
  if (res.status !== 201) {
    throw new Error(`Expected 201, got ${res.status}`);
  }
  
  if (!res.body.success) {
    throw new Error('Success should be true');
  }
  
  if (!res.body.data || !res.body.data._id) {
    throw new Error('Product ID should exist');
  }
  
  console.log('✅ PASSED - Product created:', res.body.data._id, '\n');
}

async function cleanup() {
  console.log('🧹 Cleaning up...');
  await Merchant.deleteMany({ email: 'test@merchant.com' });
  await Product.deleteMany({ merchantName: 'Test Merchant' });
  await mongoose.connection.close();
  console.log('✅ Cleanup complete\n');
}

describe('Simple Product Tests', () => {
  beforeAll(async () => {
    await setup();
  });

  afterAll(async () => {
    await cleanup();
  });

  test('Auth Check', async () => {
    await testAuthCheck();
  });

  test('Dashboard Overview', async () => {
    await testDashboardOverview();
  });

  test('Get Products', async () => {
    await testGetProducts();
  });

  test('Create Product', async () => {
    await testCreateProduct();
  });
});