require('dotenv').config();

module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  collectCoverage: false,
  coverageDirectory: 'coverage',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/test-*.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '.skip'
  ],
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  testTimeout: 30000,
  moduleDirectories: ['node_modules', '.']
};