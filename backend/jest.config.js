/**
 * Jest Configuration for Nairobi Verified Backend
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false, // Set to true when you want coverage reports

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/tests/",
    "/coverage/"
  ],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  // The test environment that will be used for testing
  testEnvironment: "node",

  // The glob patterns Jest uses to detect test files
  testMatch: [
    "**/tests/**/*.js",
    "**/?(*.)+(spec|test).js"
  ],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
    "/node_modules/",
    "/coverage/"
  ],

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // Automatically detect open handles (useful for finding why tests hang)
  detectOpenHandles: true,

  // Force exit after all tests complete (useful for cleanup issues)
  forceExit: true,

  // The maximum amount of time a test can run before being considered slow
  testTimeout: 30000, // 30 seconds

  // Setup files to run before tests
  setupFilesAfterEnv: [],

  // Transform files (if needed for ES6/TypeScript)
  transform: {},

  // Module directories to search
  moduleDirectories: [
    "node_modules",
    "."
  ],

  // Global setup/teardown (if needed)
  // globalSetup: undefined,
  // globalTeardown: undefined,

  // Ignore patterns for watch mode
  watchPathIgnorePatterns: [
    "/node_modules/",
    "/coverage/",
    "/.git/"
  ]
};

module.exports = config;