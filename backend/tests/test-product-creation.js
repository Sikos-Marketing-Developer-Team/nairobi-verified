const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Merchant = require('../models/Merchant');
const Product = require('../models/Product');
const User = require('../models/User');

describe('Product Creation Endpoint Tests', () => {
  let merchantSession;
  let merchantId;
  let agent;

  // Setup: Create a test merchant and authenticate
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nairobi-verified-test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    // Create agent to persist cookies
    agent = request.agent(app);

    // Clean up test data
    await Merchant.deleteMany({ email: 'test@merchant.com' });
    await Product.deleteMany({ merchantName: 'Test Merchant' });

    // Create test merchant
    const merchant = await Merchant.create({
      businessName: 'Test Merchant',
      email: 'test@merchant.com',
      phone: '+254712345678',
      password: 'TestPassword123!',
      businessType: 'Retail',
      description: 'Test merchant for unit testing',
      address: '123 Test Street',
      location: 'Nairobi',
      verified: true,
      isActive: true
    });

    merchantId = merchant._id;
    console.log('✅ Test merchant created:', merchantId);

    // Login to get session
    const loginResponse = await agent
      .post('/api/auth/login/merchant')
      .send({
        email: 'test@merchant.com',
        password: 'TestPassword123!'
      });

    console.log('Login response status:', loginResponse.status);
    console.log('Login response body:', loginResponse.body);
    console.log('Login cookies:', loginResponse.headers['set-cookie']);

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);

    // Check if session cookie was set
    const cookies = loginResponse.headers['set-cookie'];
    const sessionCookie = cookies?.find(c => c.includes('nairobi_verified_session'));
    
    console.log('Session cookie found:', !!sessionCookie);
    
    if (!sessionCookie) {
      console.error('❌ NO SESSION COOKIE SET!');
      throw new Error('Session cookie not set after login');
    }
  });

  afterAll(async () => {
    // Cleanup
    await Merchant.deleteMany({ email: 'test@merchant.com' });
    await Product.deleteMany({ merchantName: 'Test Merchant' });
    await mongoose.connection.close();
  });

  test('1. Session Cookie Should Exist After Login', async () => {
    const response = await agent.get('/api/auth/me');
    
    console.log('Auth check status:', response.status);
    console.log('Auth check body:', response.body);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.email).toBe('test@merchant.com');
  });

  test('2. Dashboard Overview Should Work', async () => {
    const response = await agent
      .get('/api/merchants/dashboard/overview')
      .set('Accept', 'application/json');

    console.log('Dashboard overview status:', response.status);
    console.log('Dashboard overview body:', response.body);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('3. Get Products Should Work (Empty Initially)', async () => {
    const response = await agent
      .get('/api/merchants/dashboard/products')
      .set('Accept', 'application/json');

    console.log('Get products status:', response.status);
    console.log('Get products body:', response.body);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('4. Create Product Should Work With Valid Data', async () => {
    const productData = {
      name: 'Test Product',
      description: 'This is a test product for unit testing',
      category: 'Electronics',
      price: 1000,
      available: true,
      featured: false,
      images: ['https://example.com/image1.jpg'],
      subcategory: 'Mobile Phones'
    };

    console.log('Sending product data:', productData);

    const response = await agent
      .post('/api/merchants/dashboard/products')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send(productData);

    console.log('Create product status:', response.status);
    console.log('Create product headers:', response.headers);
    console.log('Create product body:', response.body);
    console.log('Response text:', response.text);

    // These are the critical assertions
    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    expect(response.body).not.toBe('');
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data._id).toBeDefined();
    expect(response.body.data.name).toBe('Test Product');
  });

  test('5. Create Product Should Fail Without Required Fields', async () => {
    const invalidData = {
      name: 'Test Product'
      // Missing description and category
    };

    const response = await agent
      .post('/api/merchants/dashboard/products')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send(invalidData);

    console.log('Invalid product status:', response.status);
    console.log('Invalid product body:', response.body);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBeDefined();
  });

  test('6. Create Product Should Return Proper Response Structure', async () => {
    const productData = {
      name: 'Test Product 2',
      description: 'Another test product',
      category: 'Fashion',
      price: 2000,
      available: true,
      featured: false,
      images: ['https://example.com/image2.jpg'],
      subcategory: 'Clothing'
    };

    const response = await agent
      .post('/api/merchants/dashboard/products')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send(productData);

    console.log('Response structure test status:', response.status);
    console.log('Response structure test body:', response.body);

    // Verify response structure matches what frontend expects
    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('_id');
    expect(response.body.data).toHaveProperty('name');
    expect(response.body.data).toHaveProperty('description');
    expect(response.body.data).toHaveProperty('merchant');
    expect(response.body.data.merchant).toEqual(merchantId);
  });

  test('7. Unauthenticated Request Should Fail', async () => {
    // Create a new agent without authentication
    const unauthAgent = request.agent(app);

    const productData = {
      name: 'Unauthorized Product',
      description: 'Should fail',
      category: 'Electronics',
      price: 1000
    };

    const response = await unauthAgent
      .post('/api/merchants/dashboard/products')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send(productData);

    console.log('Unauth status:', response.status);
    console.log('Unauth body:', response.body);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('8. Regular User (Not Merchant) Should Not Access Endpoint', async () => {
    // Create a regular user
    await User.deleteMany({ email: 'user@test.com' });
    
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'user@test.com',
      password: 'UserPassword123!',
      phone: '+254712345679',
      isVerified: true
    });

    // Login as regular user
    const userAgent = request.agent(app);
    const loginResponse = await userAgent
      .post('/api/auth/login')
      .send({
        email: 'user@test.com',
        password: 'UserPassword123!'
      });

    expect(loginResponse.status).toBe(200);

    // Try to create product as regular user
    const productData = {
      name: 'User Product',
      description: 'Should fail',
      category: 'Electronics',
      price: 1000
    };

    const response = await userAgent
      .post('/api/merchants/dashboard/products')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send(productData);

    console.log('User access status:', response.status);
    console.log('User access body:', response.body);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);

    // Cleanup
    await User.deleteMany({ email: 'user@test.com' });
  });
});


// added extra comment to test pipeline.

