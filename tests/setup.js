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
  quote: jest.fn().mockResolvedValue({
    '01. symbol': 'AAPL',
    '02. open': '150.00',
    '03. high': '155.00',
    '04. low': '149.00',
    '05. price': '152.00',
    '06. volume': '1000000',
    '07. latest trading day': '2024-01-01',
    '08. previous close': '148.00',
    '09. change': '4.00',
    '10. change percent': '2.70%',
    '11. price source': 'regular',
    '12. aftermarket price': null,
    '13. premarket price': null,
    '14. market status': 'open',
    '15. last updated': '2024-01-01T16:00:00Z'
  }),
  
  historical: jest.fn().mockResolvedValue({
    '2024-01-01': {
      '1. open': '150.00',
      '2. high': '155.00',
      '3. low': '149.00',
      '4. close': '152.00',
      '5. volume': '1000000'
    },
    '2023-12-31': {
      '1. open': '148.00',
      '2. high': '151.00',
      '3. low': '147.00',
      '4. close': '148.00',
      '5. volume': '950000'
    }
  }),
  
  companyProfile: jest.fn().mockResolvedValue({
    Name: 'Apple Inc.',
    Symbol: 'AAPL',
    Sector: 'Technology',
    Industry: 'Consumer Electronics',
    MarketCapitalization: '2500000000000',
    Description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables and accessories worldwide.'
  }),

  quoteSummary: jest.fn().mockResolvedValue({
    assetProfile: {
      longBusinessSummary: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables and accessories worldwide.',
      sector: 'Technology',
      industry: 'Consumer Electronics'
    },
    summaryDetail: {
      marketCap: 2500000000000,
      trailingPE: 25.5
    },
    price: {
      symbol: 'AAPL',
      longName: 'Apple Inc.',
      shortName: 'Apple Inc.'
    }
  })
}));

// Mock Polygon.io module
jest.mock('@polygon.io/client-js', () => ({
  rest: {
    stocks: {
      earnings: {
        get: jest.fn().mockResolvedValue({
          results: [
            {
              date: '2024-01-01',
              estimate: '1.20',
              actual: '1.25',
              beat: true,
              surprise: '4.17%'
            }
          ]
        })
      }
    }
  }
}));

// Mock external HTTP requests
jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({
    data: {
      success: true,
      data: {}
    }
  }),
  post: jest.fn().mockResolvedValue({
    data: {
      success: true,
      data: {}
    }
  })
}));

// Mock file system operations
jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue('mock file content'),
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn()
}));

// Mock path operations
jest.mock('path', () => ({
  join: jest.fn().mockReturnValue('/mock/path'),
  resolve: jest.fn().mockReturnValue('/mock/resolved/path')
}));

// Mock @xenova/transformers
jest.mock('@xenova/transformers', () => ({
  pipeline: jest.fn().mockResolvedValue({
    classify: jest.fn().mockResolvedValue([
      { label: 'positive', score: 0.8 },
      { label: 'negative', score: 0.1 },
      { label: 'neutral', score: 0.1 }
    ])
  })
}));

// Global test helpers
global.createTestData = {
  quote: {
    '01. symbol': 'AAPL',
    '05. price': '150.00',
    '06. volume': '1000000',
    '09. change': '2.50',
    '10. change percent': '1.67%',
    '11. price source': 'regular',
    '14. market status': 'open'
  },
  
  overview: {
    Name: 'Apple Inc.',
    Symbol: 'AAPL',
    Sector: 'Technology',
    Industry: 'Consumer Electronics',
    MarketCapitalization: '2500000000000'
  },
  
  historical: {
    '2024-01-01': {
      '1. open': '150.00',
      '2. high': '155.00',
      '3. low': '149.00',
      '4. close': '152.00',
      '5. volume': '1000000'
    }
  },
  
  movingAverages: {
    symbol: 'AAPL',
    sma: {
      '20': [{ date: '2024-01-01', value: '150.00', timestamp: 1704067200 }],
      '50': [{ date: '2024-01-01', value: '148.00', timestamp: 1704067200 }]
    },
    ema: {
      '20': [{ date: '2024-01-01', value: '151.00', timestamp: 1704067200 }],
      '50': [{ date: '2024-01-01', value: '149.00', timestamp: 1704067200 }]
    }
  },
  
  earnings: {
    symbol: 'AAPL',
    earnings: [
      {
        date: '2024-01-01',
        estimate: '1.20',
        actual: '1.25',
        beat: true,
        surprise: '4.17%'
      }
    ]
  },
  
  riskRadar: {
    symbol: 'AAPL',
    volatility: {
      current: 0.25,
      historical: 0.20,
      percentile: 75
    },
    beta: 1.15,
    sharpeRatio: 1.8,
    maxDrawdown: -0.15,
    riskScore: 65
  }
};

// Cleanup function for tests
global.cleanupTestData = () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
};

// Setup before each test
beforeEach(() => {
  cleanupTestData();
});

// Teardown after each test
afterEach(() => {
  cleanupTestData();
}); 