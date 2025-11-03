#!/usr/bin/env node

/**
 * Test Script: Create Merchant with Products
 * Tests the new admin endpoint for creating merchants with products and images
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

// Test admin credentials (replace with your test admin)
const ADMIN_EMAIL = 'admin@nairobiverified.com';
const ADMIN_PASSWORD = 'SuperAdmin123!';

let adminToken = '';
let cookies = ''; // Store cookies for authentication

// Create axios instance with cookie jar
const axiosInstance = axios.create({
  withCredentials: true,
  validateStatus: false // Don't throw on any status
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Step 1: Login as Admin
 */
async function loginAdmin() {
  try {
    log('\n📝 Step 1: Logging in as Admin...', 'cyan');
    
    const response = await axiosInstance.post(`${BASE_URL}/auth/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    // Store cookies from response
    if (response.headers['set-cookie']) {
      cookies = response.headers['set-cookie']
        .map(cookie => cookie.split(';')[0])
        .join('; ');
    }

    if (response.data.success && response.data.token) {
      adminToken = response.data.token;
      log('✅ Admin login successful!', 'green');
      log(`   Token: ${adminToken.substring(0, 20)}...`, 'blue');
      log(`   Cookies stored: ${cookies ? 'Yes' : 'No'}`, 'blue');
      return true;
    } else {
      log('❌ Login failed: No token received', 'red');
      log(`   Response: ${JSON.stringify(response.data)}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Login error: ${error.response?.data?.error || error.message}`, 'red');
    return false;
  }
}

/**
 * Step 2: Create sample product images (mock files)
 */
function createMockImage(filename) {
  // Create a simple test image buffer (1x1 pixel PNG)
  const mockImageBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  return mockImageBuffer;
}

/**
 * Step 3: Create Merchant with Products
 */
async function createMerchantWithProducts() {
  try {
    log('\n📦 Step 2: Creating merchant with products...', 'cyan');

    const formData = new FormData();

    // Merchant data
    const timestamp = Date.now();
    formData.append('businessName', `Test Coffee Shop ${timestamp}`);
    formData.append('email', `testshop${timestamp}@example.com`);
    formData.append('phone', '+254712345678');
    formData.append('businessType', 'Restaurant');
    formData.append('description', 'A premium coffee shop serving artisan coffee and fresh pastries in Nairobi CBD');
    formData.append('address', '123 Test Street, Nairobi CBD');
    formData.append('location', 'Nairobi CBD');
    formData.append('website', 'https://testcoffee.com');
    formData.append('yearEstablished', '2024');
    formData.append('autoVerify', 'true');

    // Products data
    const products = [
      {
        name: 'Espresso',
        description: 'Rich and bold espresso made from premium Ethiopian beans',
        category: 'Food & Beverages',
        price: 250,
        originalPrice: 300,
        stockQuantity: 100,
        imageCount: 2
      },
      {
        name: 'Croissant',
        description: 'Freshly baked butter croissant',
        category: 'Food & Beverages',
        price: 150,
        originalPrice: 180,
        stockQuantity: 50,
        imageCount: 3
      },
      {
        name: 'Cappuccino',
        description: 'Creamy cappuccino with perfect foam',
        category: 'Food & Beverages',
        price: 300,
        stockQuantity: 100,
        imageCount: 1
      }
    ];

    formData.append('products', JSON.stringify(products));

    // Add mock images for each product
    products.forEach((product, productIndex) => {
      for (let imageIndex = 0; imageIndex < product.imageCount; imageIndex++) {
        const mockImage = createMockImage(`product_${productIndex}_image_${imageIndex}.png`);
        formData.append(
          `product_${productIndex}_image_${imageIndex}`,
          mockImage,
          {
            filename: `product_${productIndex}_image_${imageIndex}.png`,
            contentType: 'image/png'
          }
        );
      }
    });

    log(`   Creating merchant with ${products.length} products...`, 'blue');
    log(`   Total images: ${products.reduce((sum, p) => sum + p.imageCount, 0)}`, 'blue');

    const response = await axiosInstance.post(
      `${BASE_URL}/merchants/admin/create-with-products`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Cookie': cookies,
          'Authorization': `Bearer ${adminToken}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    if (response.data.success) {
      log('✅ Merchant with products created successfully!', 'green');
      log(`   Merchant ID: ${response.data.data._id}`, 'blue');
      log(`   Business Name: ${response.data.data.businessName}`, 'blue');
      log(`   Email: ${response.data.data.email}`, 'blue');
      log(`   Products Created: ${response.data.productsCreated}`, 'blue');
      
      if (response.data.products && response.data.products.length > 0) {
        log('\n   📦 Products:', 'cyan');
        response.data.products.forEach((product, index) => {
          log(`   ${index + 1}. ${product.name}`, 'blue');
          log(`      - Price: KES ${product.price}`, 'blue');
          log(`      - Images: ${product.images.length}`, 'blue');
          log(`      - Category: ${product.category}`, 'blue');
        });
      }

      if (response.data.credentials) {
        log('\n   🔑 Login Credentials:', 'yellow');
        log(`   Email: ${response.data.data.email}`, 'yellow');
        log(`   Temp Password: ${response.data.credentials.tempPassword}`, 'yellow');
        log(`   Login URL: ${response.data.credentials.loginUrl}`, 'yellow');
      }

      return true;
    } else {
      log('❌ Failed to create merchant with products', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error creating merchant with products:`, 'red');
    log(`   ${error.response?.data?.error || error.message}`, 'red');
    if (error.response?.data?.details) {
      log(`   Details: ${JSON.stringify(error.response.data.details)}`, 'red');
    }
    return false;
  }
}

/**
 * Step 4: Test without products (should still work)
 */
async function createMerchantWithoutProducts() {
  try {
    log('\n📝 Step 3: Testing merchant creation WITHOUT products...', 'cyan');

    const timestamp = Date.now();
    const merchantData = {
      businessName: `Test Basic Shop ${timestamp}`,
      email: `basicshop${timestamp}@example.com`,
      phone: '+254722345678',
      businessType: 'Retail Store',
      description: 'A simple retail store for testing basic merchant creation',
      address: '456 Test Avenue, Nairobi',
      location: 'Westlands',
      autoVerify: true
    };

    const response = await axiosInstance.post(
      `${BASE_URL}/merchants/admin/create`,
      merchantData,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Cookie': cookies,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      log('✅ Basic merchant created successfully (backward compatibility confirmed)!', 'green');
      log(`   Merchant ID: ${response.data.data._id}`, 'blue');
      log(`   Business Name: ${response.data.data.businessName}`, 'blue');
      return true;
    } else {
      log('❌ Failed to create basic merchant', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error creating basic merchant:`, 'red');
    log(`   ${error.response?.data?.error || error.message}`, 'red');
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log('  Test: Create Merchant with Products Feature', 'cyan');
  log('═══════════════════════════════════════════════════════════', 'cyan');

  const results = {
    total: 3,
    passed: 0,
    failed: 0
  };

  // Test 1: Login
  const loginSuccess = await loginAdmin();
  if (loginSuccess) results.passed++;
  else results.failed++;

  if (!loginSuccess) {
    log('\n❌ Cannot continue without admin authentication', 'red');
    process.exit(1);
  }

  // Test 2: Create merchant with products
  const withProductsSuccess = await createMerchantWithProducts();
  if (withProductsSuccess) results.passed++;
  else results.failed++;

  // Test 3: Create merchant without products (backward compatibility)
  const withoutProductsSuccess = await createMerchantWithoutProducts();
  if (withoutProductsSuccess) results.passed++;
  else results.failed++;

  // Summary
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('  Test Summary', 'cyan');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log(`Total Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${Math.round((results.passed / results.total) * 100)}%`, 
      results.failed > 0 ? 'yellow' : 'green');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});
