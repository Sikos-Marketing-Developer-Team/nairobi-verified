/**
 * Comprehensive Merchant Dashboard Workflow Test
 * Tests all merchant features step by step
 * 
 * Test Flow:
 * 1. Create merchant account with real email
 * 2. Login with password from email
 * 3. Test dashboard overview
 * 4. Test profile management
 * 5. Test verification process
 * 6. Test product management
 * 7. Test review management
 * 8. Test photo gallery
 * 9. Test customer engagement
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
let TEST_EMAIL = 'njorojoe11173@gmail.com'; // Your real merchant email
let TEST_PASSWORD = 'Sirintai83#'; // Your real merchant password
let merchantId = '';

// Setup axios with cookie storage
let sessionCookie = '';

// Create axios instance
const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Helper functions
const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.magenta}\n▶ ${msg}${colors.reset}`),
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// API Request wrapper with session support
async function apiRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: endpoint,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    // Add session cookie if we have one
    if (sessionCookie) {
      config.headers['Cookie'] = sessionCookie;
    }

    if (data) {
      config.data = data;
    }

    const response = await client(config);
    
    // Store session cookie from response
    const setCookie = response.headers['set-cookie'];
    if (setCookie && Array.isArray(setCookie)) {
      sessionCookie = setCookie.map(cookie => cookie.split(';')[0]).join('; ');
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data?.error || error.message,
      status: error.response?.status
    };
  }
}

// Test Functions

async function step1_createMerchant() {
  log.step('STEP 1: Creating Merchant Account');
  
  const merchantData = {
    email: TEST_EMAIL,
    businessName: 'Joe\'s Test Coffee Shop',
    businessType: 'restaurant',
    description: 'A cozy coffee shop in the heart of Nairobi serving premium coffee and pastries',
    phone: '+254712345678',
    address: '123 Kimathi Street, Nairobi',
    location: { type: 'Point', coordinates: [36.8219, -1.2864] }, // Nairobi coordinates
    password: 'TestMerchant123!' // This will be hashed
  };

  log.info(`Creating merchant account for: ${TEST_EMAIL}`);
  const result = await apiRequest('POST', '/auth/register/merchant', merchantData);

  if (result.success) {
    log.success('Merchant account created successfully!');
    log.info('📧 Registration confirmation sent to: ' + TEST_EMAIL);
    log.info('✓ You can now login with your password');
    console.log('\n' + '='.repeat(60));
    console.log('Email:', TEST_EMAIL);
    console.log('Password: TestMerchant123!');
    console.log('='.repeat(60) + '\n');
    return true;
  } else {
    log.error(`Failed to create merchant: ${result.error}`);
    
    // If merchant already exists, that's okay - we can just login
    if (result.error && result.error.includes('already registered')) {
      log.warning('Merchant already exists - will proceed to login');
      return true;
    }
    return false;
  }
}

async function step2_login(password) {
  log.step('STEP 2: Logging In');
  
  const loginData = {
    email: TEST_EMAIL,
    password: password
  };

  log.info('Attempting to login with session-based auth...');
  const result = await apiRequest('POST', '/auth/login/merchant', loginData);

  if (result.success && result.data.user) {
    merchantId = result.data.user.id;
    log.success('Login successful! Session established.');
    log.info(`Merchant ID: ${merchantId}`);
    log.info(`Business: ${result.data.user.businessName}`);
    
    // Check if session cookie was stored
    if (sessionCookie) {
      log.success(`Session cookie captured: ${sessionCookie.substring(0, 50)}...`);
    } else {
      log.warning('No session cookie received');
    }
    
    return true;
  } else {
    log.error(`Login failed: ${result.error}`);
    return false;
  }
}

async function step3_testDashboardOverview() {
  log.step('STEP 3: Testing Dashboard Overview');
  
  // Test overview endpoint
  log.info('Fetching dashboard overview...');
  const overview = await apiRequest('GET', '/merchants/dashboard/overview');
  
  if (overview.success) {
    log.success('Dashboard overview loaded');
    console.log('Stats:', JSON.stringify(overview.data.stats, null, 2));
  } else {
    log.error(`Failed to load overview: ${overview.error}`);
    return false;
  }

  // Test analytics endpoint
  log.info('Fetching analytics data...');
  const analytics = await apiRequest('GET', '/merchants/dashboard/analytics?period=30d');
  
  if (analytics.success) {
    log.success('Analytics data loaded');
    console.log('Analytics:', JSON.stringify(analytics.data, null, 2));
  } else {
    log.error(`Failed to load analytics: ${analytics.error}`);
  }

  // Test activity feed
  log.info('Fetching recent activity...');
  const activity = await apiRequest('GET', '/merchants/dashboard/activity?limit=10');
  
  if (activity.success) {
    log.success('Activity feed loaded');
    console.log(`Activities: ${activity.data.activities?.length || 0} items`);
  } else {
    log.error(`Failed to load activity: ${activity.error}`);
  }

  // Test notifications
  log.info('Fetching notifications...');
  const notifications = await apiRequest('GET', '/merchants/dashboard/notifications');
  
  if (notifications.success) {
    log.success('Notifications loaded');
    console.log(`Notifications: ${notifications.data.notifications?.length || 0} items`);
  } else {
    log.error(`Failed to load notifications: ${notifications.error}`);
  }

  return true;
}

async function step4_testProfileManagement() {
  log.step('STEP 4: Testing Profile Management');
  
  // Get current profile
  log.info('Fetching current profile...');
  const profile = await apiRequest('GET', '/merchants/dashboard/profile');
  
  if (!profile.success) {
    log.error(`Failed to fetch profile: ${profile.error}`);
    return false;
  }
  
  log.success('Profile loaded');
  console.log('Current profile:', JSON.stringify(profile.data, null, 2));

  // Update profile
  log.info('Updating profile information...');
  const updateData = {
    businessName: 'Joe\'s Premium Coffee Shop',
    description: 'The best coffee experience in Nairobi! Premium beans, expert baristas, and a cozy atmosphere.',
    website: 'https://joescoffee.co.ke',
    whatsapp: '+254712345678',
    yearEstablished: 2020,
    landmark: 'Near KCB Building'
  };

  const updateResult = await apiRequest('PUT', '/merchants/dashboard/profile', updateData);
  
  if (updateResult.success) {
    log.success('Profile updated successfully');
  } else {
    log.error(`Failed to update profile: ${updateResult.error}`);
  }

  // Update business hours
  log.info('Setting business hours...');
  const hoursData = {
    hours: {
      monday: { open: '07:00', close: '20:00', closed: false },
      tuesday: { open: '07:00', close: '20:00', closed: false },
      wednesday: { open: '07:00', close: '20:00', closed: false },
      thursday: { open: '07:00', close: '20:00', closed: false },
      friday: { open: '07:00', close: '22:00', closed: false },
      saturday: { open: '08:00', close: '22:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: false }
    }
  };

  const hoursResult = await apiRequest('PUT', '/merchants/dashboard/profile/hours', hoursData);
  
  if (hoursResult.success) {
    log.success('Business hours updated');
  } else {
    log.error(`Failed to update hours: ${hoursResult.error}`);
  }

  // Update social media
  log.info('Adding social media links...');
  const socialData = {
    social: {
      facebook: 'https://facebook.com/joescoffee',
      instagram: '@joescoffee',
      twitter: '@joescoffee'
    }
  };

  const socialResult = await apiRequest('PUT', '/merchants/dashboard/profile/social', socialData);
  
  if (socialResult.success) {
    log.success('Social media links updated');
  } else {
    log.error(`Failed to update social: ${socialResult.error}`);
  }

  return true;
}

async function step5_testVerificationProcess() {
  log.step('STEP 5: Testing Verification Process');
  
  // Get verification status
  log.info('Checking verification status...');
  const status = await apiRequest('GET', '/merchants/dashboard/verification/status');
  
  if (status.success) {
    log.success('Verification status loaded');
    console.log('Status:', JSON.stringify(status.data, null, 2));
  } else {
    log.error(`Failed to get status: ${status.error}`);
    return false;
  }

  // Get verification history
  log.info('Fetching verification history...');
  const history = await apiRequest('GET', '/merchants/dashboard/verification/history');
  
  if (history.success) {
    log.success('Verification history loaded');
    console.log(`History items: ${history.data.history?.length || 0}`);
  } else {
    log.error(`Failed to get history: ${history.error}`);
  }

  log.warning('Document upload requires actual files - skipping in automated test');
  log.info('You can test document upload manually through the UI');

  return true;
}

async function step6_testProductManagement() {
  log.step('STEP 6: Testing Product Management');
  
  // Get existing products
  log.info('Fetching products...');
  const products = await apiRequest('GET', '/merchants/dashboard/products');
  
  if (products.success) {
    log.success(`Products loaded: ${products.data.products?.length || 0} items`);
  } else {
    log.error(`Failed to fetch products: ${products.error}`);
    return false;
  }

  // Create a test product
  log.info('Creating test product...');
  const productData = {
    name: 'Premium Espresso',
    category: 'food',
    description: 'Rich, bold espresso made from freshly roasted Ethiopian beans',
    price: 250,
    available: true,
    featured: true
  };

  const createResult = await apiRequest('POST', '/merchants/dashboard/products', productData);
  
  if (createResult.success) {
    const productId = createResult.data.product._id;
    log.success(`Product created with ID: ${productId}`);

    // Update the product
    log.info('Updating product...');
    const updateData = {
      price: 280,
      description: 'Premium espresso made from single-origin Ethiopian Yirgacheffe beans'
    };

    const updateResult = await apiRequest('PUT', `/merchants/dashboard/products/${productId}`, updateData);
    
    if (updateResult.success) {
      log.success('Product updated');
    } else {
      log.error(`Failed to update product: ${updateResult.error}`);
    }

    // Toggle availability
    log.info('Toggling product availability...');
    const toggleResult = await apiRequest('PATCH', `/merchants/dashboard/products/${productId}/availability`, {
      available: false
    });
    
    if (toggleResult.success) {
      log.success('Product availability toggled');
    } else {
      log.error(`Failed to toggle availability: ${toggleResult.error}`);
    }

    // Delete the product (cleanup)
    log.info('Cleaning up test product...');
    const deleteResult = await apiRequest('DELETE', `/merchants/dashboard/products/${productId}`);
    
    if (deleteResult.success) {
      log.success('Test product deleted');
    } else {
      log.error(`Failed to delete product: ${deleteResult.error}`);
    }
  } else {
    log.error(`Failed to create product: ${createResult.error}`);
  }

  return true;
}

async function step7_testReviewManagement() {
  log.step('STEP 7: Testing Review Management');
  
  // Get reviews
  log.info('Fetching reviews...');
  const reviews = await apiRequest('GET', '/merchants/dashboard/reviews');
  
  if (reviews.success) {
    log.success(`Reviews loaded: ${reviews.data.reviews?.length || 0} items`);
  } else {
    log.error(`Failed to fetch reviews: ${reviews.error}`);
    return false;
  }

  // Get review stats
  log.info('Fetching review statistics...');
  const stats = await apiRequest('GET', '/merchants/dashboard/reviews/stats');
  
  if (stats.success) {
    log.success('Review stats loaded');
    console.log('Stats:', JSON.stringify(stats.data, null, 2));
  } else {
    log.error(`Failed to fetch stats: ${stats.error}`);
  }

  log.info('Review response/flag testing requires actual reviews - check manually');

  return true;
}

async function step8_testPhotoGallery() {
  log.step('STEP 8: Testing Photo Gallery');
  
  // Get gallery
  log.info('Fetching photo gallery...');
  const gallery = await apiRequest('GET', '/merchants/dashboard/gallery');
  
  if (gallery.success) {
    log.success(`Gallery loaded: ${gallery.data.photos?.length || 0} photos`);
    console.log('Photos:', JSON.stringify(gallery.data.photos, null, 2));
  } else {
    log.error(`Failed to fetch gallery: ${gallery.error}`);
    return false;
  }

  log.warning('Photo upload requires actual image files - test manually through UI');

  return true;
}

async function step9_testCustomerEngagement() {
  log.step('STEP 9: Testing Customer Engagement');
  
  // Get engagement stats
  log.info('Fetching engagement statistics...');
  const stats = await apiRequest('GET', '/merchants/dashboard/engagement/stats?period=30d');
  
  if (stats.success) {
    log.success('Engagement stats loaded');
    console.log('Stats:', JSON.stringify(stats.data, null, 2));
  } else {
    log.error(`Failed to fetch engagement stats: ${stats.error}`);
    return false;
  }

  // Get popular products
  log.info('Fetching popular products...');
  const popular = await apiRequest('GET', '/merchants/dashboard/engagement/popular-products?limit=5');
  
  if (popular.success) {
    log.success('Popular products loaded');
    console.log(`Popular products: ${popular.data.products?.length || 0}`);
  } else {
    log.error(`Failed to fetch popular products: ${popular.error}`);
  }

  return true;
}

// Main test runner
async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 MERCHANT DASHBOARD COMPREHENSIVE WORKFLOW TEST');
  console.log('='.repeat(70) + '\n');

  // Check if we need to create merchant or just login
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise(resolve => rl.question(query, resolve));

  try {
    log.info(`Testing with email: ${TEST_EMAIL}\n`);
    
    const hasAccount = await question('Do you already have a merchant account with this email? (y/n): ');
    
    let password;
    
    if (hasAccount.toLowerCase() === 'n') {
      // Create merchant account
      const created = await step1_createMerchant();
      if (!created) {
        log.error('Failed to create merchant account. Exiting...');
        rl.close();
        return;
      }
      
      // Use the default password
      password = TEST_PASSWORD;
      log.info(`Using password: ${TEST_PASSWORD}`);
    } else {
      // Use existing password
      password = TEST_PASSWORD;
      log.info('Using existing merchant credentials');
    }
    
    console.log('');

    // Login
    const loggedIn = await step2_login(password);
    if (!loggedIn) {
      log.error('Login failed. Exiting...');
      rl.close();
      return;
    }

    // Run all tests
    await step3_testDashboardOverview();
    await delay(1000);

    await step4_testProfileManagement();
    await delay(1000);

    await step5_testVerificationProcess();
    await delay(1000);

    await step6_testProductManagement();
    await delay(1000);

    await step7_testReviewManagement();
    await delay(1000);

    await step8_testPhotoGallery();
    await delay(1000);

    await step9_testCustomerEngagement();

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('✅ ALL TESTS COMPLETED!');
    console.log('='.repeat(70));
    console.log(`\n📧 Test Email: ${TEST_EMAIL}`);
    console.log(`🆔 Merchant ID: ${merchantId}`);
    console.log(`� Session: Active (cookie-based authentication)`);
    console.log('\n✨ You can now test the frontend at: http://localhost:5173/merchant/dashboard');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    log.error(`Test error: ${error.message}`);
  } finally {
    rl.close();
  }
}

// Run the tests
runTests().catch(console.error);
