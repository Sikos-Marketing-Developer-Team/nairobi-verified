/**
 * Jest Configuration for Nairobi Verified Backend
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  // Test environment
  testEnvironment: "node",

  // Automatically clear mock calls
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Coverage settings
  collectCoverage: false,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/tests/",
    "/coverage/"
  ],
  coverageProvider: "v8",

  // Test file patterns
  testMatch: [
    "**/tests/**/*.js",
    "**/?(*.)+(spec|test).js"
  ],

  testPathIgnorePatterns: [
    "/node_modules/",
    "/coverage/"
  ],

  // Verbose output
  verbose: true,

  // Handle detection and timeouts
  detectOpenHandles: true,
  forceExit: true,
  testTimeout: 30000,

  // Module resolution
  moduleDirectories: [
    "node_modules",
    "."
  ],

  // Ignore watch patterns
  watchPathIgnorePatterns: [
    "/node_modules/",
    "/coverage/",
    "/.git/"
  ],

  // Explicitly set the test environment options
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  }
};

module.exports = config;