require('dotenv').config();

// CRITICAL: Production database protection
const mongoUri = process.env.MONGODB_URI || process.env.TEST_MONGODB_URI;
if (mongoUri && !mongoUri.toLowerCase().includes('test')) {
  console.error('\n❌ FATAL ERROR: Tests cannot run against non-test database!');
  console.error(`Database URI: ${mongoUri}`);
  console.error('Set MONGODB_URI or TEST_MONGODB_URI to a test database.');
  console.error('Example: mongodb://localhost:27017/nairobi-verified-test\n');
  process.exit(1);
}

module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    'middleware/**/*.js',
    'services/**/*.js',
    'utils/**/*.js',
    '!**/*.test.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**'
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  
  // Test matching
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/uploads/',
    '.skip.js'
  ],
  
  // Execution settings
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  testTimeout: 30000,
  maxWorkers: 1, // Run tests sequentially to avoid DB conflicts
  
  // Module resolution
  moduleDirectories: ['node_modules', '.'],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};