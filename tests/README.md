# Testing Guide

This project uses a comprehensive testing setup with Jest, Supertest, and Nock for unit and integration testing.

## 🧪 Testing Stack

- **Jest**: Primary testing framework for unit tests and test runner
- **Supertest**: HTTP assertion library for API integration testing
- **Nock**: HTTP mocking library for external API calls

## 📁 Test Structure

```
tests/
├── setup.js                 # Global test configuration
├── unit/                    # Unit tests
│   └── stockService.test.js # Service layer tests
├── integration/             # Integration tests
│   └── stockController.test.js # API endpoint tests
└── README.md               # This file
```

## 🚀 Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

## 📊 Coverage Requirements

The project enforces minimum coverage thresholds:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## 🧩 Test Types

### Unit Tests (`tests/unit/`)
- Test individual functions and methods
- Mock external dependencies
- Focus on business logic
- Fast execution

**Example**: Testing `StockService.calculateSMA()` method

### Integration Tests (`tests/integration/`)
- Test API endpoints end-to-end
- Mock external API calls
- Test request/response flow
- Verify error handling

**Example**: Testing `GET /api/v1/stocks/quote/:symbol` endpoint

## 🔧 Test Utilities

### Global Mocks
- `createMockRequest()`: Create mock Express request objects
- `createMockResponse()`: Create mock Express response objects
- `createMockNext()`: Create mock Express next function

### HTTP Mocking
```javascript
// Mock Yahoo Finance API
nock('https://query1.finance.yahoo.com')
  .get('/v8/finance/chart/AAPL')
  .query(true)
  .reply(200, mockData);
```

## 📝 Writing Tests

### Unit Test Example
```javascript
describe('StockService', () => {
  let stockService;

  beforeEach(() => {
    stockService = new StockService();
  });

  it('should calculate SMA correctly', () => {
    const data = [
      { '4. close': '100' },
      { '4. close': '102' },
      { '4. close': '104' }
    ];
    
    const result = stockService.calculateSMA(data, 3);
    expect(result[0].value).toBe('102.00');
  });
});
```

### Integration Test Example
```javascript
describe('Stock API', () => {
  it('should return stock quote', async () => {
    // Mock external API
    nock('https://query1.finance.yahoo.com')
      .get('/v8/finance/chart/AAPL')
      .reply(200, mockResponse);

    // Test endpoint
    const response = await request(app)
      .get('/api/v1/stocks/quote/AAPL')
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});
```

## 🎯 Best Practices

1. **Test Isolation**: Each test should be independent
2. **Mock External APIs**: Never make real API calls in tests
3. **Clear Test Names**: Use descriptive test names
4. **Arrange-Act-Assert**: Structure tests clearly
5. **Coverage**: Aim for high test coverage
6. **Error Cases**: Test both success and error scenarios

## 🔍 Debugging Tests

### Verbose Output
```bash
npm test -- --verbose
```

### Single Test File
```bash
npm test -- stockService.test.js
```

### Watch Mode with Coverage
```bash
npm run test:watch -- --coverage
```

## 📈 Continuous Integration

Tests are automatically run in CI/CD pipelines:
- Unit tests must pass
- Integration tests must pass
- Coverage thresholds must be met
- No linting errors

## 🚨 Common Issues

### Timeout Errors
- Increase `testTimeout` in `jest.config.js`
- Check for hanging promises

### Mock Issues
- Ensure `nock.cleanAll()` in `afterEach`
- Verify mock URLs match exactly

### Coverage Issues
- Add tests for uncovered branches
- Mock external dependencies properly 