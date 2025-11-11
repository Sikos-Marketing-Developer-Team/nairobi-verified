/**
 * Comprehensive test script for Merchant Product Management
 * Tests all CRUD operations for merchant products including image uploads
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:5001';
const MERCHANT_EMAIL = 'merchant@test.com'; // Update with valid merchant credentials
const MERCHANT_PASSWORD = 'Test123!'; // Update with valid merchant password

// Test state
let authToken = null;
let merchantId = null;
let createdProductIds = [];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper functions
const log = (message, color = colors.reset) => console.log(`${color}${message}${colors.reset}`);
const success = (message) => log(`✅ ${message}`, colors.green);
const error = (message) => log(`❌ ${message}`, colors.red);
const info = (message) => log(`ℹ️  ${message}`, colors.blue);
const section = (message) => log(`\n${'='.repeat(60)}\n${message}\n${'='.repeat(60)}`, colors.cyan);

// Create a test image file
const createTestImage = () => {
  const testImagePath = path.join(__dirname, 'test-product.jpg');
  
  // If test image doesn't exist, create a simple one
  if (!fs.existsSync(testImagePath)) {
    // Create a minimal valid JPEG file (1x1 pixel)
    const buffer = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x03, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00,
      0x7F, 0x80, 0xFF, 0xD9
    ]);
    fs.writeFileSync(testImagePath, buffer);
  }
  
  return testImagePath;
};

// Test 1: Merchant Authentication
async function testMerchantAuth() {
  section('TEST 1: Merchant Authentication');
  
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: MERCHANT_EMAIL,
      password: MERCHANT_PASSWORD
    });

    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      merchantId = response.data.user._id || response.data.user.id;
      
      success(`Authenticated as: ${response.data.user.email}`);
      success(`Merchant ID: ${merchantId}`);
      success(`Token received: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      error('Login failed: No token received');
      return false;
    }
  } catch (err) {
    error(`Authentication failed: ${err.response?.data?.error || err.message}`);
    info('Please ensure merchant credentials are correct and merchant exists in database');
    return false;
  }
}

// Test 2: Fetch existing products
async function testFetchProducts() {
  section('TEST 2: Fetch Merchant Products');
  
  try {
    const response = await axios.get(`${API_URL}/api/merchants/dashboard/products`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.data.success) {
      const products = response.data.data || [];
      success(`Fetched ${products.length} product(s)`);
      
      if (products.length > 0) {
        info('Sample product:');
        const sample = products[0];
        console.log({
          id: sample._id,
          name: sample.name,
          category: sample.category,
          price: sample.price,
          images: sample.images?.length || 0,
          available: sample.available || sample.isActive
        });
      }
      return true;
    }
  } catch (err) {
    error(`Failed to fetch products: ${err.response?.data?.error || err.message}`);
    return false;
  }
}

// Test 3: Create product without images
async function testCreateProductWithoutImages() {
  section('TEST 3: Create Product Without Images');
  
  try {
    const productData = {
      name: `Test Product ${Date.now()}`,
      description: 'This is a test product created by automated testing script',
      category: 'Beauty & Personal Care',
      price: 1500,
      available: true,
      featured: false,
      images: []
    };

    info('Creating product with data:');
    console.log(productData);

    const response = await axios.post(
      `${API_URL}/api/merchants/dashboard/products`,
      productData,
      {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success && response.data.data) {
      const product = response.data.data;
      createdProductIds.push(product._id);
      
      success(`Product created successfully!`);
      success(`Product ID: ${product._id}`);
      success(`Product Name: ${product.name}`);
      info(`Available: ${product.available || product.isActive}`);
      return true;
    } else {
      error('Product creation failed: No product data in response');
      return false;
    }
  } catch (err) {
    error(`Failed to create product: ${err.response?.data?.error || err.message}`);
    if (err.response?.data) {
      console.log('Response data:', err.response.data);
    }
    return false;
  }
}

// Test 4: Upload product images
async function testUploadProductImages() {
  section('TEST 4: Upload Product Images');
  
  if (createdProductIds.length === 0) {
    error('No products available to upload images to. Skipping test.');
    return false;
  }

  try {
    const productId = createdProductIds[0];
    const testImagePath = createTestImage();
    
    const formData = new FormData();
    formData.append('images', fs.createReadStream(testImagePath), {
      filename: 'test-product.jpg',
      contentType: 'image/jpeg'
    });

    info(`Uploading image to product: ${productId}`);

    const response = await axios.post(
      `${API_URL}/api/uploads/products`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    if (response.data.success || response.data.files) {
      const uploadedUrls = response.data.files || response.data.data || [];
      success(`Image(s) uploaded successfully!`);
      success(`Uploaded ${uploadedUrls.length} image(s)`);
      
      if (uploadedUrls.length > 0) {
        info('Image URLs:');
        uploadedUrls.forEach((url, idx) => {
          console.log(`  ${idx + 1}. ${url}`);
        });
      }
      return uploadedUrls;
    } else {
      error('Image upload failed: No files in response');
      return false;
    }
  } catch (err) {
    error(`Failed to upload images: ${err.response?.data?.error || err.message}`);
    if (err.response?.data) {
      console.log('Response data:', err.response.data);
    }
    return false;
  }
}

// Test 5: Create product with images
async function testCreateProductWithImages() {
  section('TEST 5: Create Product With Images');
  
  try {
    // First upload images
    const uploadedImages = await testUploadProductImages();
    
    if (!uploadedImages || uploadedImages.length === 0) {
      error('Failed to upload images first');
      return false;
    }

    const productData = {
      name: `Test Product with Images ${Date.now()}`,
      description: 'This product has uploaded images',
      category: 'Fashion & Accessories',
      price: 2500,
      available: true,
      featured: true,
      images: uploadedImages
    };

    info('Creating product with uploaded images...');

    const response = await axios.post(
      `${API_URL}/api/merchants/dashboard/products`,
      productData,
      {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success && response.data.data) {
      const product = response.data.data;
      createdProductIds.push(product._id);
      
      success(`Product with images created successfully!`);
      success(`Product ID: ${product._id}`);
      success(`Product Name: ${product.name}`);
      success(`Images attached: ${product.images?.length || 0}`);
      return true;
    }
  } catch (err) {
    error(`Failed to create product with images: ${err.response?.data?.error || err.message}`);
    return false;
  }
}

// Test 6: Update product
async function testUpdateProduct() {
  section('TEST 6: Update Product');
  
  if (createdProductIds.length === 0) {
    error('No products available to update. Skipping test.');
    return false;
  }

  try {
    const productId = createdProductIds[0];
    const updateData = {
      name: 'Updated Product Name',
      description: 'This product has been updated by the test script',
      price: 2000,
      available: true,
      featured: true
    };

    info(`Updating product: ${productId}`);
    console.log('Update data:', updateData);

    const response = await axios.put(
      `${API_URL}/api/merchants/dashboard/products/${productId}`,
      updateData,
      {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success && response.data.data) {
      success('Product updated successfully!');
      success(`Updated name: ${response.data.data.name}`);
      success(`Updated price: ${response.data.data.price}`);
      return true;
    }
  } catch (err) {
    error(`Failed to update product: ${err.response?.data?.error || err.message}`);
    return false;
  }
}

// Test 7: Toggle product availability
async function testToggleAvailability() {
  section('TEST 7: Toggle Product Availability');
  
  if (createdProductIds.length === 0) {
    error('No products available to toggle. Skipping test.');
    return false;
  }

  try {
    const productId = createdProductIds[0];

    // Toggle to unavailable
    info('Setting product to unavailable...');
    let response = await axios.patch(
      `${API_URL}/api/merchants/dashboard/products/${productId}/availability`,
      { available: false },
      {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      success('Product set to unavailable');
    }

    // Toggle back to available
    info('Setting product back to available...');
    response = await axios.patch(
      `${API_URL}/api/merchants/dashboard/products/${productId}/availability`,
      { available: true },
      {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      success('Product set to available');
      return true;
    }
  } catch (err) {
    error(`Failed to toggle availability: ${err.response?.data?.error || err.message}`);
    return false;
  }
}

// Test 8: Delete product
async function testDeleteProduct() {
  section('TEST 8: Delete Product');
  
  if (createdProductIds.length === 0) {
    error('No products available to delete. Skipping test.');
    return false;
  }

  try {
    const productId = createdProductIds[0];
    
    info(`Deleting product: ${productId}`);

    const response = await axios.delete(
      `${API_URL}/api/merchants/dashboard/products/${productId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    if (response.data.success) {
      success('Product deleted successfully!');
      createdProductIds = createdProductIds.filter(id => id !== productId);
      return true;
    }
  } catch (err) {
    error(`Failed to delete product: ${err.response?.data?.error || err.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n' + '═'.repeat(60), colors.magenta);
  log('  MERCHANT PRODUCT MANAGEMENT - COMPREHENSIVE TEST SUITE', colors.magenta);
  log('═'.repeat(60) + '\n', colors.magenta);

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0
  };

  const tests = [
    { name: 'Merchant Authentication', fn: testMerchantAuth, critical: true },
    { name: 'Fetch Products', fn: testFetchProducts },
    { name: 'Create Product (No Images)', fn: testCreateProductWithoutImages },
    { name: 'Upload Product Images', fn: testUploadProductImages },
    { name: 'Create Product (With Images)', fn: testCreateProductWithImages },
    { name: 'Update Product', fn: testUpdateProduct },
    { name: 'Toggle Availability', fn: testToggleAvailability },
    { name: 'Delete Product', fn: testDeleteProduct }
  ];

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result === true) {
        results.passed++;
      } else if (result === false) {
        results.failed++;
        if (test.critical) {
          error(`Critical test failed: ${test.name}. Stopping tests.`);
          break;
        }
      } else {
        results.skipped++;
      }
    } catch (err) {
      results.failed++;
      error(`Test "${test.name}" threw an error: ${err.message}`);
      if (test.critical) {
        error('Critical test failed. Stopping tests.');
        break;
      }
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Cleanup: Delete any remaining test products
  section('CLEANUP: Deleting Test Products');
  for (const productId of createdProductIds) {
    try {
      await axios.delete(
        `${API_URL}/api/merchants/dashboard/products/${productId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      info(`Cleaned up product: ${productId}`);
    } catch (err) {
      // Ignore cleanup errors
    }
  }

  // Print summary
  log('\n' + '═'.repeat(60), colors.magenta);
  log('  TEST SUMMARY', colors.magenta);
  log('═'.repeat(60), colors.magenta);
  
  log(`\n✅ Passed: ${results.passed}`, colors.green);
  log(`❌ Failed: ${results.failed}`, colors.red);
  log(`⏭️  Skipped: ${results.skipped}`, colors.yellow);
  
  const total = results.passed + results.failed + results.skipped;
  const percentage = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
  
  log(`\n📊 Success Rate: ${percentage}%\n`, 
    percentage >= 80 ? colors.green : percentage >= 50 ? colors.yellow : colors.red);

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Handle errors
process.on('unhandledRejection', (err) => {
  error(`Unhandled error: ${err.message}`);
  console.error(err);
  process.exit(1);
});

// Run tests
runAllTests().catch(err => {
  error(`Test suite failed: ${err.message}`);
  console.error(err);
  process.exit(1);
});
