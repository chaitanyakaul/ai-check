// Test setup file
require('dotenv').config();

// Global test configuration
global.testTimeout = 10000;

// Setup environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001'; // Use different port for testing

// Global test utilities
global.createMockRequest = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query,
  headers: {},
  get: jest.fn(),
});

global.createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

global.createMockNext = () => jest.fn();

// Mock console methods to keep test output clean
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock Yahoo Finance module
jest.mock('yahoo-finance2', () => ({
// ... existing code ...

})); 