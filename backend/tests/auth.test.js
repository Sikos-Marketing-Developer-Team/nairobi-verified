/**
 * Authentication Feature Tests
 * Tests user and merchant authentication flows including:
 * - Registration
 * - Login/Logout
 * - Google OAuth
 * - Password Reset
 * - Session Management
 */

const {
  setupDatabase,
  cleanupDatabase,
  closeDatabase,
  testData,
  expectSuccessResponse,
  expectErrorResponse
} = require('./setup');

const request = require('supertest');
const User = require('../models/User');
const Merchant = require('../models/Merchant');

let app;

describe('Authentication Feature', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.SKIP_SESSION = 'false';
    
    await setupDatabase();
    app = require('../server');
    await cleanupDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closeDatabase();
  });

  describe('User Registration', () => {
    test('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!',
          phone: '+254700000001'
        });

      expectSuccessResponse(response, 201);
      expect(response.body.data.email).toBe('john.doe@example.com');
      expect(response.body.data.firstName).toBe('John');
      expect(response.body.data.password).toBeUndefined();
    });

    test('should reject registration with duplicate email', async () => {
      await User.create({
        ...testData.user,
        email: 'duplicate@example.com'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testData.user,
          email: 'duplicate@example.com'
        });

      expectErrorResponse(response, 400);
      expect(response.body.error).toMatch(/already exists/i);
    });

    test('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testData.user,
          email: 'weak@example.com',
          password: '123'
        });

      expectErrorResponse(response, 400);
    });

    test('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testData.user,
          email: 'invalid-email'
        });

      expectErrorResponse(response, 400);
    });
  });

  describe('Merchant Registration', () => {
    test('should register a new merchant with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register/merchant')
        .send({
          businessName: 'New Test Business',
          email: 'newbusiness@example.com',
          password: 'BusinessPass123!',
          phone: '+254700000002',
          businessType: 'Retail',
          description: 'A new test business',
          address: '456 Business Ave',
          location: 'Nairobi'
        });

      expectSuccessResponse(response, 201);
      expect(response.body.data.businessName).toBe('New Test Business');
      expect(response.body.data.verified).toBe(false);
    });

    test('should reject merchant registration without business name', async () => {
      const response = await request(app)
        .post('/api/auth/register/merchant')
        .send({
          email: 'nobusiness@example.com',
          password: 'BusinessPass123!',
          phone: '+254700000003'
        });

      expectErrorResponse(response, 400);
    });
  });

  describe('User Login', () => {
    beforeAll(async () => {
      await User.deleteMany({ email: testData.user.email });
      await User.create(testData.user);
    });

    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testData.user.email,
          password: testData.user.password
        });

      expectSuccessResponse(response);
      expect(response.body.data.email).toBe(testData.user.email);
      expect(response.headers['set-cookie']).toBeDefined();
    });

    test('should reject login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testData.user.email,
          password: 'WrongPassword123!'
        });

      expectErrorResponse(response, 401);
    });

    test('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePass123!'
        });

      expectErrorResponse(response, 401);
    });
  });

  describe('Merchant Login', () => {
    beforeAll(async () => {
      await Merchant.deleteMany({ email: testData.merchant.email });
      await Merchant.create(testData.merchant);
    });

    test('should login merchant with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login/merchant')
        .send({
          email: testData.merchant.email,
          password: testData.merchant.password
        });

      expectSuccessResponse(response);
      expect(response.body.data.businessName).toBe(testData.merchant.businessName);
      expect(response.headers['set-cookie']).toBeDefined();
    });

    test('should reject inactive merchant login', async () => {
      await Merchant.create({
        ...testData.merchant,
        email: 'inactive@example.com',
        isActive: false
      });

      const response = await request(app)
        .post('/api/auth/login/merchant')
        .send({
          email: 'inactive@example.com',
          password: testData.merchant.password
        });

      expectErrorResponse(response, 401);
    });
  });

  describe('Session Management', () => {
    test('should get current user from session', async () => {
      const agent = request.agent(app);
      
      await agent
        .post('/api/auth/login')
        .send({
          email: testData.user.email,
          password: testData.user.password
        });

      const response = await agent.get('/api/auth/me');

      expectSuccessResponse(response);
      expect(response.body.data.email).toBe(testData.user.email);
    });

    test('should logout and clear session', async () => {
      const agent = request.agent(app);
      
      await agent
        .post('/api/auth/login')
        .send({
          email: testData.user.email,
          password: testData.user.password
        });

      const logoutResponse = await agent.get('/api/auth/logout');
      expectSuccessResponse(logoutResponse);

      const meResponse = await agent.get('/api/auth/me');
      expect(meResponse.status).toBe(401);
    });
  });
});
