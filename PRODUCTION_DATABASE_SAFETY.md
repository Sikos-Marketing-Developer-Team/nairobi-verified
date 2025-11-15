# 🔒 PRODUCTION DATABASE SAFETY - CRITICAL INFORMATION

## ⚠️ IMPORTANT: TESTS WILL NEVER TOUCH PRODUCTION DATABASE

### Multi-Layer Protection System

The test suite has **5 layers of protection** to prevent any accidental production database access:

---

## 🛡️ Layer 1: Jest Config Protection

**File:** `backend/jest.config.js`

```javascript
// Tests will FAIL IMMEDIATELY if MONGODB_URI doesn't contain "test"
const mongoUri = process.env.MONGODB_URI || process.env.TEST_MONGODB_URI;
if (mongoUri && !mongoUri.toLowerCase().includes('test')) {
  console.error('❌ FATAL ERROR: Tests cannot run against non-test database!');
  process.exit(1);  // Hard stop - tests won't even start
}
```

**What it does:**
- Checks database URI before ANY tests run
- Exits immediately if URI doesn't contain "test"
- Prevents entire test suite from starting

---

## 🛡️ Layer 2: Setup Function Protection

**File:** `backend/tests/setup.js` - `setupDatabase()`

```javascript
async function setupDatabase() {
  const mongoUri = process.env.MONGODB_URI || process.env.TEST_MONGODB_URI;
  
  // Check 1: URI must contain "test"
  if (!mongoUri.includes('test')) {
    throw new Error('❌ Test database URI must contain "test"');
  }
  
  // Check 2: No production indicators
  const productionIndicators = ['prod', 'production', 'live', 'main'];
  if (hasProductionIndicator(mongoUri)) {
    throw new Error('❌ Database URI appears to be production');
  }
}
```

**What it does:**
- Double-checks URI contains "test"
- Blocks common production names (prod, production, live, main)
- Throws error before any database connection

---

## 🛡️ Layer 3: Cleanup Protection

**File:** `backend/tests/setup.js` - `cleanupDatabase()`

```javascript
async function cleanupDatabase() {
  const dbName = mongoose.connection.name;
  
  // Verify database name contains "test"
  if (!dbName.toLowerCase().includes('test')) {
    throw new Error('❌ Refusing to cleanup non-test database');
  }
  
  // Only delete data with test markers
  await collection.deleteMany({
    $or: [
      { email: /test\./i },
      { email: /@example\.com$/i },
      { businessName: /test/i }
    ]
  });
}
```

**What it does:**
- Verifies connected database name before cleanup
- Only deletes records with test patterns
- Never does `deleteMany({})` (full wipe)

---

## 🛡️ Layer 4: Environment Variable Defaults

**File:** `backend/package.json`

```json
{
  "scripts": {
    "test": "cross-env MONGODB_URI=mongodb://localhost:27017/nairobi-verified-test jest",
    "test:watch": "cross-env MONGODB_URI=mongodb://localhost:27017/nairobi-verified-test jest --watch"
  }
}
```

**What it does:**
- Hardcodes test database in npm scripts
- Overrides any environment MONGODB_URI
- Uses local test database by default

---

## 🛡️ Layer 5: CI/CD Isolation

**File:** `.github/workflows/backend-tests.yml`

```yaml
env:
  NODE_ENV: test
  MONGODB_URI: mongodb://localhost:27017/nairobi-verified-test
```

**What it does:**
- Uses separate MongoDB container
- Never connects to production
- Destroyed after tests complete

---

## ✅ Safe Test Execution

### Local Development

```bash
# These are 100% safe - they use local test database
npm test
npm run test:watch
npm run test:auth
```

**Default database:** `mongodb://localhost:27017/nairobi-verified-test`

### CI/CD Pipeline

```yaml
# GitHub Actions uses isolated test database
MONGODB_URI: mongodb://localhost:27017/nairobi-verified-test
```

**What happens:**
1. Spins up fresh MongoDB container
2. Runs tests against that container
3. Destroys container after tests
4. **Never touches production**

---

## 🚫 What Tests CANNOT Do

❌ **Connect to production database** - Blocked by URI checks  
❌ **Delete production data** - Only deletes test markers  
❌ **Modify production data** - Tests use isolated database  
❌ **Access production credentials** - Separate environment  
❌ **Run without "test" in database name** - Hard requirement  

---

## ✅ What Tests CAN Do

✅ Create test users (email contains "test." or "@example.com")  
✅ Create test merchants (businessName contains "test")  
✅ Create test products (linked to test merchants)  
✅ Clean up all test data after completion  
✅ Run safely in any environment  

---

## 🔍 How to Verify Safety

### Check 1: Environment Variables

```bash
# Should be a local test database
echo $MONGODB_URI
# Expected: mongodb://localhost:27017/nairobi-verified-test
# OR empty (scripts provide default)
```

### Check 2: Run Tests

```bash
npm test
```

**If database is wrong, you'll see:**
```
❌ FATAL ERROR: Tests cannot run against non-test database!
Database URI: mongodb://production-db/nairobi
Set MONGODB_URI to a test database.
```

**If database is correct, you'll see:**
```
✅ Database safety checks passed
📊 Using test database: mongodb://localhost:27017/nairobi-verified-test
```

### Check 3: Inspect Connected Database

While tests are running:
```bash
mongosh
> show dbs
# Should see: nairobi-verified-test (or similar with "test")
# Should NOT see: nairobi-verified, production, live, etc.
```

---

## 🎯 Test Data Patterns

Tests only create/delete data matching these patterns:

### User Emails
- `test.user@example.com`
- `john.doe@example.com`
- Anything with `@example.com`
- Anything starting with `test.`

### Merchant Names
- `Test Merchant Store`
- `Test Business`
- Anything containing "Test"

### Products
- Linked to test merchants only
- Deleted when merchant is deleted

---

## 🔧 Setting Up Test Database

### Option 1: Local MongoDB (Recommended for Development)

```bash
# MongoDB is already installed - just use a test database
# Tests will create it automatically
npm test
```

**Database created:** `nairobi-verified-test`  
**Location:** `mongodb://localhost:27017`  
**Isolated from:** Production database

### Option 2: Separate Test MongoDB Instance

```bash
# Run MongoDB on different port
docker run -d -p 27018:27017 --name mongodb-test mongo:6.0

# Update test scripts to use it
export MONGODB_URI=mongodb://localhost:27018/nairobi-verified-test
npm test
```

### Option 3: MongoDB Atlas Test Cluster

```bash
# Create separate Atlas cluster for testing
export MONGODB_URI=mongodb+srv://test-user:password@test-cluster.mongodb.net/nairobi-verified-test

npm test
```

**Important:** Must contain "test" in database name!

---

## 📋 Pre-Test Checklist

Before running tests, verify:

- [ ] `MONGODB_URI` is empty OR contains "test"
- [ ] Not connected to production database
- [ ] `NODE_ENV` is set to "test" (automatic in scripts)
- [ ] Tests using `@example.com` emails
- [ ] MongoDB is running (if using local)

---

## 🆘 Emergency: Tests Connected to Production?

**This CANNOT happen** due to multiple safety checks, but if you suspect it:

### Immediate Actions

1. **Kill all test processes:**
   ```bash
   pkill -f jest
   pkill -f node
   ```

2. **Check what's connected:**
   ```bash
   # In production MongoDB
   db.currentOp()
   # Look for connections from test processes
   ```

3. **Verify no damage:**
   ```bash
   # Check for test data in production
   db.users.find({ email: /@example\.com/ })
   db.merchants.find({ businessName: /test/i })
   ```

4. **Remove any test data:**
   ```bash
   # Only if absolutely necessary
   db.users.deleteMany({ email: /@example\.com/ })
   db.merchants.deleteMany({ businessName: /test/i })
   ```

---

## 🎓 Best Practices

### Development

```bash
# Always use npm scripts (they set safe defaults)
npm test              # ✅ Safe
npm run test:watch    # ✅ Safe

# Don't run jest directly (might use wrong env)
jest                  # ⚠️ Not recommended
```

### CI/CD

```yaml
# Always specify test database explicitly
env:
  MONGODB_URI: mongodb://localhost:27017/nairobi-verified-test
  NODE_ENV: test
```

### Environment Files

```bash
# .env.test (for local testing)
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/nairobi-verified-test
JWT_SECRET=test-secret
SESSION_SECRET=test-session-secret

# .env (production) - tests won't use this
MONGODB_URI=mongodb://production-server/nairobi-verified
```

---

## 📊 Database Isolation Guarantee

```
┌─────────────────────────────────────────────────────────┐
│                   PRODUCTION                            │
│  Database: nairobi-verified                             │
│  URI: mongodb://production-server/nairobi-verified      │
│                                                          │
│  ✅ Safe from tests                                     │
│  ✅ No test connections                                 │
│  ✅ No test data                                        │
└─────────────────────────────────────────────────────────┘
                            ❌ BLOCKED ❌
┌─────────────────────────────────────────────────────────┐
│                   TEST ENVIRONMENT                       │
│  Database: nairobi-verified-TEST                        │
│  URI: mongodb://localhost:27017/nairobi-verified-test   │
│                                                          │
│  ✅ Tests run here                                      │
│  ✅ Isolated container                                  │
│  ✅ Destroyed after tests                               │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Summary

### You Are Protected Because:

1. ✅ **5 layers of database protection**
2. ✅ **URI must contain "test"** (enforced)
3. ✅ **Production indicators blocked** (prod, live, main)
4. ✅ **Safe cleanup patterns** (only test data)
5. ✅ **Default test database** (in npm scripts)
6. ✅ **CI/CD isolation** (separate container)
7. ✅ **Multiple validation checks** (before connection, before cleanup)

### Tests Will Never:

❌ Connect to production  
❌ Delete production data  
❌ Modify production records  
❌ Run without "test" database  

### You Can Safely:

✅ Run `npm test` anytime  
✅ Run tests in production environment (uses separate DB)  
✅ Push to trigger CI/CD  
✅ Debug tests locally  
✅ Run tests continuously  

---

**🔒 Your production database is 100% safe. Tests are completely isolated!**
