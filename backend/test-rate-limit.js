// test-rate-limit.js
// Run this to test your rate limiting: node test-rate-limit.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

async function testRateLimit() {
  console.log('Testing Rate Limiting on Login Endpoint\n');
  console.log('Expected behavior: First 5 attempts should fail with 401, 6th should fail with 429\n');
  
  const testData = {
    email: 'nonexistent@test.com',
    password: 'wrongpassword123'
  };

  for (let i = 1; i <= 8; i++) {
    const startTime = Date.now();
    
    try {
      console.log(`\nAttempt ${i}: Sending login request...`);
      
      const response = await axios.post(`${BASE_URL}/login`, testData, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Rate-Limit-Test-Client'
        },
        timeout: 10000
      });
      
      const elapsed = Date.now() - startTime;
      console.log(`   Status: ${response.status} (${elapsed}ms)`);
      console.log(`   Response:`, response.data);
      
    } catch (error) {
      const elapsed = Date.now() - startTime;
      
      if (error.response) {
        console.log(`   Status: ${error.response.status} (${elapsed}ms)`);
        console.log(`   Error:`, error.response.data);
        
        // Check rate limit headers
        const headers = error.response.headers;
        console.log(`   Rate Limit Headers:`);
        console.log(`      - RateLimit-Limit: ${headers['ratelimit-limit'] || 'Not present'}`);
        console.log(`      - RateLimit-Remaining: ${headers['ratelimit-remaining'] || 'Not present'}`);
        console.log(`      - RateLimit-Reset: ${headers['ratelimit-reset'] || 'Not present'}`);
        console.log(`      - Retry-After: ${headers['retry-after'] || 'Not present'}`);
        
        if (error.response.status === 429) {
          console.log('\nSUCCESS! Rate limit is working correctly!');
          console.log(`   The endpoint was blocked at attempt ${i} (after ${i-1} requests).\n`);
          
          if (i > 6) {
            console.log('Note: Rate limit triggered later than expected (should be at attempt 6)');
          }
          return;
        }
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`   Connection error: Server is not running at ${BASE_URL}`);
        console.log('   Make sure your backend server is running on port 5000\n');
        return;
      } else {
        console.log(`   Network error:`, error.message);
      }
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\nFAILURE: Rate limit did NOT trigger after 8 attempts!');
  console.log('   This indicates the rate limiter is not working correctly.');
  console.log('\nDebugging steps:');
  console.log('   1. Check server logs for IP address being used');
  console.log('   2. Verify trust proxy is set: app.set("trust proxy", 1)');
  console.log('   3. Check if rate limiter middleware is actually being applied');
  console.log('   4. Verify no other middleware is interfering\n');
}

// Run the test
console.log('Starting rate limit test in 2 seconds...\n');
setTimeout(() => {
  testRateLimit().catch(error => {
    console.error('Test failed with error:', error.message);
  });
}, 2000);