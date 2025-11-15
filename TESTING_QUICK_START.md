# Test Suite - Quick Start Guide

## 🔒 PRODUCTION DATABASE SAFETY FIRST

**⚠️ CRITICAL: Your production database is 100% SAFE**

The test suite has **5 layers of protection** that prevent any access to production:

1. ✅ **Jest config blocks** non-test databases before tests start
2. ✅ **Setup checks** require "test" in database name
3. ✅ **Cleanup protection** only removes test data patterns
4. ✅ **npm scripts hardcode** test database URI
5. ✅ **CI/CD isolation** uses separate containers

**Tests will FAIL immediately** if:
- Database URI doesn't contain "test"
- URI contains production indicators (prod, live, main)
- Connected database name doesn't include "test"

**See:** `PRODUCTION_DATABASE_SAFETY.md` and `DATABASE_SAFETY_QUICK_REF.md`

---

## 🚀 Quick Start

### Install Dependencies
```bash
cd backend
npm install
```

### Run All Tests
```bash
npm test
```

### Run Specific Tests
```bash
npm run test:auth        # Authentication only
npm run test:products    # Products only
npm run test:reviews     # Reviews only
npm run test:merchants   # Merchants only
```

### Watch Mode (Development)
```bash
npm run test:watch
```

## 📊 Test Coverage

### View Coverage Report
```bash
npm test
# Then open: backend/coverage/lcov-report/index.html
```

### Coverage Thresholds
- **Minimum:** 60% across all metrics
- **Target:** Functions, Lines, Branches, Statements

## 🧪 Test Suites

### 1. Authentication Tests (20 tests)
**File:** `tests/auth.test.js`

**What's Tested:**
- ✅ User registration with validation
- ✅ Merchant registration
- ✅ Login flows (user & merchant)
- ✅ Session management
- ✅ Logout functionality
- ✅ Password validation
- ✅ Email format validation
- ✅ Duplicate email prevention

**Run:** `npm run test:auth`

---

### 2. Product Management Tests (25 tests)
**File:** `tests/products.test.js`

**What's Tested:**
- ✅ Product CRUD operations
- ✅ All 16 category validation
- ✅ Product filtering by category
- ✅ Product search
- ✅ Inventory updates
- ✅ Price validation
- ✅ Authorization (prevent cross-merchant edits)
- ✅ Bulk operations

**Run:** `npm run test:products`

---

### 3. Review System Tests (18 tests)
**File:** `tests/reviews.test.js`

**What's Tested:**
- ✅ Review submission
- ✅ Review with image uploads (up to 5)
- ✅ Image limit enforcement
- ✅ Rating validation (1-5)
- ✅ Review listing & pagination
- ✅ Merchant replies
- ✅ Review helpful marking
- ✅ Image display in reviews

**Run:** `npm run test:reviews`

---

### 4. Merchant Features Tests (22 tests)
**File:** `tests/merchants.test.js`

**What's Tested:**
- ✅ Featured merchant sorting
- ✅ Featured merchants appear first
- ✅ Merchant verification workflow
- ✅ Dashboard analytics
- ✅ File uploads (logo, banner, gallery)
- ✅ Multiple image format support
- ✅ Business hours updates
- ✅ Social links management
- ✅ Admin verification approval
- ✅ Bulk featured status updates

**Run:** `npm run test:merchants`

## 📁 File Structure

```
backend/
├── tests/
│   ├── setup.js              # Test utilities & helpers
│   ├── auth.test.js          # Authentication tests
│   ├── products.test.js      # Product management tests
│   ├── reviews.test.js       # Review system tests
│   ├── merchants.test.js     # Merchant features tests
│   └── README.md             # Detailed documentation
├── jest.config.js            # Jest configuration
└── package.json              # Test scripts
```

## 🔧 Environment Setup

### Required Environment Variables
```env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/nairobi-verified-test
JWT_SECRET=your-test-jwt-secret
SESSION_SECRET=your-test-session-secret
SKIP_SESSION=false
```

### Database
- Tests use a separate test database
- Automatic cleanup after tests
- No production data affected

## 🎯 Test Patterns

### Helper Functions

**Authentication:**
```javascript
const { createAuthenticatedAgent } = require('./setup');

// Create logged-in user
const { agent, userId } = await createAuthenticatedAgent(app, 'user');

// Create logged-in merchant
const { agent, merchantId } = await createAuthenticatedAgent(app, 'merchant');
```

**Assertions:**
```javascript
const { expectSuccessResponse, expectErrorResponse } = require('./setup');

expectSuccessResponse(response, 201);  // Assert success
expectErrorResponse(response, 400);    // Assert error
```

**Test Data:**
```javascript
const { testData } = require('./setup');

testData.user       // User data
testData.merchant   // Merchant data
testData.product    // Product data
testData.review     // Review data
```

## ✅ Pre-Pipeline Checklist

Before running the CI/CD pipeline:

1. **Environment Variables Set**
   - [ ] MONGODB_URI configured
   - [ ] JWT_SECRET set
   - [ ] SESSION_SECRET set

2. **Dependencies Installed**
   - [ ] `npm install` completed
   - [ ] No package errors

3. **Database Running**
   - [ ] MongoDB accessible
   - [ ] Connection successful

4. **Run Tests Locally**
   - [ ] `npm test` passes
   - [ ] Coverage meets 60% threshold
   - [ ] No failing tests

## 🔄 CI/CD Integration

### GitHub Actions
The test suite runs automatically on:
- Push to `main`, `develop`, `Feature-Addition`
- Pull requests to `main`, `develop`

### What Runs:
1. Install dependencies
2. Start MongoDB service
3. Run all tests with coverage
4. Generate coverage reports
5. Upload artifacts
6. Check coverage thresholds

### View Results:
- GitHub Actions tab
- PR coverage comments
- Artifact downloads

## 🐛 Troubleshooting

### Tests Failing?

**1. Database Connection Error**
```bash
# Check MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Verify MONGODB_URI in .env
echo $MONGODB_URI
```

**2. Session/Auth Errors**
```javascript
// Make sure you're using agent, not request
const agent = request.agent(app);  // ✅ Correct
const response = request(app);      // ❌ Won't persist session
```

**3. Timeout Errors**
```javascript
// Increase timeout in jest.config.js
testTimeout: 30000  // 30 seconds
```

**4. Port Already in Use**
```bash
# Kill process on port
lsof -ti:5000 | xargs kill -9
```

### Still Having Issues?

1. Check `tests/README.md` for detailed docs
2. Review test output for specific errors
3. Run with `--verbose` flag for more details
4. Check environment variables

## 📈 Coverage Goals

### Current Minimum: 60%
- Branches: 60%
- Functions: 60%
- Lines: 60%
- Statements: 60%

### Target: 80%+ for critical paths
- Authentication flows
- Payment processing
- Data validation
- Authorization checks

## 🎓 Best Practices

### Writing New Tests

1. **Use descriptive names**
   ```javascript
   test('should reject product with negative price', ...)
   ```

2. **Follow Arrange-Act-Assert**
   ```javascript
   // Arrange
   const data = { price: -100 };
   
   // Act
   const response = await agent.post('/api/products').send(data);
   
   // Assert
   expectErrorResponse(response, 400);
   ```

3. **Clean up after yourself**
   ```javascript
   afterAll(async () => {
     await cleanupDatabase();
     await closeDatabase();
   });
   ```

4. **Test both success and failure**
   - Valid data → Success
   - Invalid data → Error
   - Missing auth → 401
   - Wrong permissions → 403

## 📚 Additional Resources

- **Detailed Docs:** `tests/README.md`
- **Implementation Summary:** `TEST_SUITE_IMPLEMENTATION.md`
- **Jest Docs:** https://jestjs.io/
- **Supertest Docs:** https://github.com/visionmedia/supertest

## 🎉 Summary

**Total Tests:** 85+ comprehensive tests
**Coverage:** 60%+ across all metrics
**Features Tested:** Authentication, Products, Reviews, Merchants
**CI/CD Ready:** GitHub Actions configured
**Documentation:** Complete guides included

---

**Ready to test?**
```bash
cd backend && npm test
```
