/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/__tests__'],
  testMatch: ['**/*.test.ts'],
  globalSetup: '<rootDir>/src/__tests__/setup.global.ts',
  globalTeardown: '<rootDir>/src/__tests__/teardown.global.ts',
  // Runs after jest-circus is installed in each worker, before tests
  setupFilesAfterFramework: ['<rootDir>/src/__tests__/setup.ts'],
  clearMocks: true,
  collectCoverageFrom: [
    'src/modules/**/*.ts',
    'src/models/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageReporters: ['text', 'lcov'],
  testTimeout: 30000,
};
