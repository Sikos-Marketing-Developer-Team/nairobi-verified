# Test Suite Documentation

## Overview

This test suite provides comprehensive coverage of the Nairobi Verified backend features. Tests are organized by feature area with professional patterns and best practices.

## Test Structure

```
backend/tests/
├── setup.js              # Test utilities and helpers
├── auth.test.js          # Authentication features
├── products.test.js      # Product management
├── reviews.test.js       # Review system with images
└── merchants.test.js     # Merchant features and verification
```

## Test Features

### 1. Authentication Tests (`auth.test.js`)
**Coverage:**
- ✅ User registration with validation
- ✅ Merchant registration
- ✅ Login/logout flows
- ✅ Session management
- ✅ Password validation
- ✅ Duplicate email prevention

**Key Scenarios:**
- Valid and invalid registration attempts
- Weak password rejection
- Email format validation
- Session persistence across requests
- Inactive merchant handling

### 2. Product Management Tests (`products.test.js`)
**Coverage:**
- ✅ Product CRUD operations
- ✅ Category synchronization (16 categories)
- ✅ Product filtering and search
- ✅ Inventory management
- ✅ Authorization checks
- ✅ Price validation

**Key Scenarios:**
- Creating products in all 16 valid categories
- Filtering by category
- Search functionality
- Preventing cross-merchant product modification
- Negative price rejection

### 3. Review System Tests (`reviews.test.js`)
**Coverage:**
- ✅ Review submission
- ✅ Image upload with reviews (up to 5 images)
- ✅ Review listing and filtering
- ✅ Merchant replies
- ✅ Helpful marking
- ✅ Rating validation

**Key Scenarios:**
- Creating reviews with and without images
- Image limit enforcement (5 max)
- Rating validation (1-5 only)
- Merchant reply management
- Review pagination

### 4. Merchant Features Tests (`merchants.test.js`)
**Coverage:**
- ✅ Featured merchant sorting
- ✅ Merchant verification workflow
- ✅ Dashboard analytics
- ✅ File uploads (logo, banner, gallery)
- ✅ Business information updates
- ✅ Admin management features

**Key Scenarios:**
- Featured merchants appearing first
- Bulk featured status updates
- Multiple image format support
- Verification document uploads
- Admin verification approval

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Feature Tests
```bash
npm run test:auth        # Authentication tests only
npm run test:products    # Product management tests
npm run test:reviews     # Review system tests
npm run test:merchants   # Merchant features tests
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### CI/CD Pipeline
```bash
npm run test:ci
```

### Coverage Report
```bash
npm run test:coverage
```

## Coverage Thresholds

Current coverage requirements:
- **Branches:** 60%
- **Functions:** 60%
- **Lines:** 60%
- **Statements:** 60%

Coverage reports are generated in:
- `coverage/lcov-report/index.html` (HTML report)
- `coverage/coverage-final.json` (JSON report)
- Console output (text summary)

## Test Utilities

### Helper Functions (setup.js)

**Database Management:**
- `setupDatabase()` - Initialize test database connection
- `cleanupDatabase()` - Remove test data
- `closeDatabase()` - Close connection

**Authentication:**
- `createAuthenticatedAgent(app, 'user')` - Create logged-in user agent
- `createAuthenticatedAgent(app, 'merchant')` - Create logged-in merchant agent
- `createAdminUser()` - Create admin user

**Data Creation:**
- `createTestProduct(merchantId, overrides)` - Create test product
- `createTestReview(merchantId, userId, overrides)` - Create test review

**Assertions:**
- `expectSuccessResponse(response, statusCode)` - Assert successful API response
- `expectErrorResponse(response, statusCode)` - Assert error response
- `expectAuthenticationRequired(response)` - Assert 401 unauthorized

### Test Data Templates

Access pre-configured test data:
```javascript
const { testData } = require('./setup');

testData.user       // User registration data
testData.merchant   // Merchant registration data
testData.product    // Product creation data
testData.review     // Review submission data
```

## Best Practices

### 1. Test Isolation
- Each test suite cleans up its data
- Tests don't depend on execution order
- Use `beforeAll` for setup, `afterAll` for cleanup

### 2. Descriptive Test Names
```javascript
test('should create product with valid data', ...)
test('should reject product with negative price', ...)
```

### 3. Arrange-Act-Assert Pattern
```javascript
test('example test', async () => {
  // Arrange: Set up test data
  const productData = { name: 'Test', price: 100 };
  
  // Act: Perform the action
  const response = await agent.post('/api/products').send(productData);
  
  // Assert: Verify the result
  expectSuccessResponse(response, 201);
  expect(response.body.data.name).toBe('Test');
});
```

### 4. Session Persistence
Use `request.agent()` to maintain cookies:
```javascript
const agent = request.agent(app);
await agent.post('/api/auth/login').send(credentials);
await agent.get('/api/auth/me'); // Session persists
```

### 5. Test Coverage
Focus on:
- Happy paths (valid data)
- Error handling (invalid data)
- Edge cases (boundary conditions)
- Authorization (who can access what)

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Tests
  run: npm run test:ci
  env:
    MONGODB_URI: ${{ secrets.TEST_MONGODB_URI }}
    NODE_ENV: test
```

### Expected Output
```
Test Suites: 4 passed, 4 total
Tests:       45 passed, 45 total
Coverage:    Functions 65%, Lines 68%, Branches 62%
Time:        25.4s
```

## Troubleshooting

### Common Issues

**1. Database Connection Errors**
- Ensure `MONGODB_URI` is set in `.env`
- Check MongoDB is running
- Verify network connectivity

**2. Session/Authentication Failures**
- Use `request.agent()` not `request(app)`
- Check cookies are being sent
- Verify `SKIP_SESSION` is 'false'

**3. Timeout Errors**
- Increase timeout in `jest.config.js`
- Check for hanging database connections
- Use `--detectOpenHandles` to find leaks

**4. Coverage Not Generating**
- Run with `--coverage` flag
- Check `collectCoverageFrom` paths
- Ensure source files aren't in ignore list

## Future Enhancements

### Planned Test Additions
- [ ] Order management tests
- [ ] Cart functionality tests
- [ ] Flash sales tests
- [ ] Payment integration tests
- [ ] Email notification tests
- [ ] Real file upload tests with Cloudinary

### Performance Testing
- [ ] Load testing with Artillery
- [ ] Database query optimization tests
- [ ] API response time benchmarks

## Contributing

When adding new tests:

1. **Follow naming convention:** `feature.test.js`
2. **Use setup utilities:** Import from `setup.js`
3. **Group related tests:** Use `describe` blocks
4. **Clean up data:** Remove test data in `afterAll`
5. **Document coverage:** Update this README
6. **Maintain thresholds:** Don't lower coverage requirements

## Test Data Cleanup

All tests clean up after themselves:
- User emails matching `/test\./i` or `/@example\.com$/`
- Business names matching `/test/i`
- Created products, reviews, and orders

Production data is never affected when `NODE_ENV=test`.
