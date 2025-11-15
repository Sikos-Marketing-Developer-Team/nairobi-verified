require('dotenv').config();

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