/**
 * Test Setup and Utilities
 * Provides common setup, teardown, and helper functions for all tests
 */

const mongoose = require('mongoose');
const request = require('supertest');
const User = require('../models/User');
const Merchant = require('../models/Merchant');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');

// Test data generators
const testData = {
  user: {
    firstName: 'Test',
    lastName: 'User',
    email: 'test.user@example.com',
    password: 'TestPassword123!',
    phone: '+254712345678'
  },
  
  merchant: {
    businessName: 'Test Merchant Store',
    email: 'test.merchant@example.com',
    password: 'MerchantPass123!',
    phone: '+254723456789',
    businessType: 'Retail',
    description: 'A test merchant store for unit testing',
    address: '123 Test Street, Nairobi',
    location: 'Nairobi',
    verified: true,
    isActive: true
  },
  
  product: {
    name: 'Test Product',
    description: 'High-quality test product for automated testing',
    category: 'Electronics',
    subcategory: 'Mobile Phones',
    price: 29999,
    compareAtPrice: 34999,
    inventory: 50,
    available: true,
    featured: false,
    images: ['https://res.cloudinary.com/test/image1.jpg']
  },
  
  review: {
    rating: 5,
    content: 'Excellent product and service!',
    images: []
  }
};

// Database setup and teardown
async function setupDatabase() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
  }
}

async function cleanupDatabase() {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({
      $or: [
        { email: /test\./i },
        { email: /@example\.com$/i },
        { businessName: /test/i }
      ]
    });
  }
}

async function closeDatabase() {
  await mongoose.connection.close();
}

// Authentication helpers
async function createAuthenticatedAgent(app, type = 'user') {
  const agent = request.agent(app);
  
  if (type === 'user') {
    // Clean up existing test user
    await User.deleteMany({ email: testData.user.email });
    
    // Create user
    await User.create(testData.user);
    
    // Login
    const response = await agent
      .post('/api/auth/login')
      .send({
        email: testData.user.email,
        password: testData.user.password
      });
    
    if (response.status !== 200) {
      throw new Error(`User login failed: ${response.status}`);
    }
    
    return { agent, userId: response.body.data._id };
  }
  
  if (type === 'merchant') {
    // Clean up existing test merchant
    await Merchant.deleteMany({ email: testData.merchant.email });
    
    // Create merchant
    const merchant = await Merchant.create(testData.merchant);
    
    // Login
    const response = await agent
      .post('/api/auth/login/merchant')
      .send({
        email: testData.merchant.email,
        password: testData.merchant.password
      });
    
    if (response.status !== 200) {
      throw new Error(`Merchant login failed: ${response.status}`);
    }
    
    return { agent, merchantId: merchant._id };
  }
  
  throw new Error(`Unknown auth type: ${type}`);
}

// Admin helper
async function createAdminUser() {
  await User.deleteMany({ email: 'admin@example.com' });
  
  const admin = await User.create({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'AdminPass123!',
    role: 'admin',
    isActive: true
  });
  
  return admin;
}

// Data creation helpers
async function createTestProduct(merchantId, overrides = {}) {
  const product = await Product.create({
    ...testData.product,
    merchant: merchantId,
    ...overrides
  });
  
  return product;
}

async function createTestReview(merchantId, userId, overrides = {}) {
  const review = await Review.create({
    ...testData.review,
    merchant: merchantId,
    user: userId,
    ...overrides
  });
  
  return review;
}

// Validation helpers
function expectSuccessResponse(response, statusCode = 200) {
  expect(response.status).toBe(statusCode);
  expect(response.body).toBeDefined();
  expect(response.body.success).toBe(true);
  expect(response.body.data).toBeDefined();
}

function expectErrorResponse(response, statusCode = 400) {
  expect(response.status).toBe(statusCode);
  expect(response.body).toBeDefined();
  expect(response.body.success).toBe(false);
  expect(response.body.error).toBeDefined();
}

function expectAuthenticationRequired(response) {
  expect(response.status).toBe(401);
  expect(response.body.success).toBe(false);
}

// Export all utilities
module.exports = {
  testData,
  setupDatabase,
  cleanupDatabase,
  closeDatabase,
  createAuthenticatedAgent,
  createAdminUser,
  createTestProduct,
  createTestReview,
  expectSuccessResponse,
  expectErrorResponse,
  expectAuthenticationRequired
};
