require('./setup');
const request = require('supertest');
const app = require('../../app');

// Patch Yahoo Finance and fetch mocks for error/timeout/missing data
jest.mock('../../services/stockService', () => {
  const original = jest.requireActual('../../services/stockService');
  return {
    ...original,
    getQuote: jest.fn((symbol) => {
      if (symbol === 'TIMEOUT') throw new Error('timeout');
      if (symbol === 'INVALID') throw new Error('Invalid symbol');
      if (symbol === 'AAPL') return Promise.resolve({ price: 123 });
      return Promise.resolve(null);
    }),
    getCompanyOverview: jest.fn((symbol) => {
      if (symbol === 'NONEXISTENT') throw new Error('Company not found');
      if (symbol === 'AAPL') return Promise.resolve({ name: 'Apple' });
      return Promise.resolve(null);
    }),
    // ...other service mocks as needed
  };
});

describe('Stock Controller Integration Tests', () => {
  let stockService;

  beforeEach(() => {
    // Get the actual service instance
    stockService = require('../../services/stockService');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/v1/stocks/quote/:symbol', () => {
    it('should return stock quote successfully', async () => {
      const mockQuoteData = {
        '01. symbol': 'AAPL',
        '05. price': '150.00',
        '06. volume': '1000000',
        '09. change': '2.50',
        '10. change percent': '1.67%',
        '11. price source': 'regular',
        '14. market status': 'open'
      };

      jest.spyOn(stockService.StockService, 'getQuote').mockResolvedValue(mockQuoteData);

      const response = await request(app)
        .get('/api/v1/stocks/quote/AAPL');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data['01. symbol']).toBe('AAPL');
      expect(response.body.data['05. price']).toBe('150.00');
      expect(response.body.data['11. price source']).toBe('regular');
    });

    it('should handle invalid symbol gracefully', async () => {
      jest.spyOn(stockService.StockService, 'getQuote').mockRejectedValue(new Error('Symbol not found'));

      const response = await request(app)
        .get('/api/v1/stocks/quote/INVALID');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should handle empty symbol parameter', async () => {
      const response = await request(app)
        .get('/api/v1/stocks/quote/');

      expect(response.status).toBe(404);
    });

    it('should handle special characters in symbol', async () => {
      const mockQuoteData = {
        '01. symbol': 'BRK-B',
        '05. price': '350.00'
      };

      jest.spyOn(stockService.StockService, 'getQuote').mockResolvedValue(mockQuoteData);

      const response = await request(app)
        .get('/api/v1/stocks/quote/BRK-B');

      expect(response.status).toBe(200);
      expect(response.body.data['01. symbol']).toBe('BRK-B');
    });

    it('should handle service timeout', async () => {
      jest.spyOn(stockService.StockService, 'getQuote').mockRejectedValue(new Error('Request timeout'));

      const response = await request(app)
        .get('/api/v1/stocks/quote/AAPL');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Request timeout');
    });
  });

  describe('GET /api/v1/stocks/overview/:symbol', () => {
    it('should return company overview successfully', async () => {
      const mockOverviewData = {
        Name: 'Apple Inc.',
        Symbol: 'AAPL',
        Sector: 'Technology',
        Industry: 'Consumer Electronics',
        MarketCapitalization: '2500000000000',
        Description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables and accessories worldwide.'
      };

      jest.spyOn(stockService.StockService, 'getCompanyOverview').mockResolvedValue(mockOverviewData);

      const response = await request(app)
        .get('/api/v1/stocks/overview/AAPL');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockOverviewData);
      expect(response.body.data.Name).toBe('Apple Inc.');
    });

    it('should handle partial company data', async () => {
      const mockPartialData = {
        Name: 'Test Company',
        Symbol: 'TEST'
        // Missing other fields
      };

      jest.spyOn(stockService.StockService, 'getCompanyOverview').mockResolvedValue(mockPartialData);

      const response = await request(app)
        .get('/api/v1/stocks/overview/TEST');

      expect(response.status).toBe(200);
      expect(response.body.data.Name).toBe('Test Company');
    });
  });

  describe('GET /api/v1/stocks/historical/:symbol', () => {
    it('should return historical data successfully', async () => {
      const mockHistoricalData = {
        '2024-01-01': {
          '1. open': '150.00',
          '2. high': '155.00',
          '3. low': '149.00',
          '4. close': '152.00',
          '5. volume': '1000000'
        },
        '2024-01-02': {
          '1. open': '152.00',
          '2. high': '158.00',
          '3. low': '151.00',
          '4. close': '156.00',
          '5. volume': '1200000'
        }
      };

      jest.spyOn(stockService.StockService, 'getHistoricalData').mockResolvedValue(mockHistoricalData);

      const response = await request(app)
        .get('/api/v1/stocks/historical/AAPL')
        .query({ outputsize: 'compact' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Object.keys(response.body.data)).toHaveLength(2);
    });

    it('should handle different output sizes', async () => {
      const mockHistoricalData = {
        '2024-01-01': {
          '1. open': '150.00',
          '2. high': '155.00',
          '3. low': '149.00',
          '4. close': '152.00',
          '5. volume': '1000000'
        }
      };

      jest.spyOn(stockService.StockService, 'getHistoricalData').mockResolvedValue(mockHistoricalData);

      const response = await request(app)
        .get('/api/v1/stocks/historical/AAPL')
        .query({ outputsize: 'full' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should use default outputsize when not provided', async () => {
      const mockHistoricalData = {
        '2024-01-01': {
          '1. open': '150.00',
          '2. high': '155.00',
          '3. low': '149.00',
          '4. close': '152.00',
          '5. volume': '1000000'
        }
      };

      jest.spyOn(stockService.StockService, 'getHistoricalData').mockResolvedValue(mockHistoricalData);

      const response = await request(app)
        .get('/api/v1/stocks/historical/AAPL');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle invalid outputsize parameter', async () => {
      const response = await request(app)
        .get('/api/v1/stocks/historical/AAPL')
        .query({ outputsize: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle empty historical data', async () => {
      jest.spyOn(stockService.StockService, 'getHistoricalData').mockResolvedValue({});

      const response = await request(app)
        .get('/api/v1/stocks/historical/AAPL');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({});
    });
  });

  describe('GET /api/v1/stocks/moving-averages/:symbol', () => {
    it('should return moving averages successfully', async () => {
      const mockMovingAverages = {
        symbol: 'AAPL',
        sma: {
          '20': [{ date: '2024-01-01', value: '150.00', timestamp: 1704067200 }],
          '50': [{ date: '2024-01-01', value: '148.00', timestamp: 1704067200 }]
        },
        ema: {
          '20': [{ date: '2024-01-01', value: '151.00', timestamp: 1704067200 }],
          '50': [{ date: '2024-01-01', value: '149.00', timestamp: 1704067200 }]
        }
      };

      jest.spyOn(stockService.StockService, 'getMovingAverages').mockResolvedValue(mockMovingAverages);

      const response = await request(app)
        .get('/api/v1/stocks/moving-averages/AAPL')
        .query({ periods: '20,50' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.sma).toBeDefined();
      expect(response.body.data.ema).toBeDefined();
      expect(response.body.data.symbol).toBe('AAPL');
    });

    it('should handle default periods when none provided', async () => {
      const mockMovingAverages = {
        symbol: 'AAPL',
        sma: {
          '20': [{ date: '2024-01-01', value: '150.00', timestamp: 1704067200 }],
          '50': [{ date: '2024-01-01', value: '148.00', timestamp: 1704067200 }],
          '200': [{ date: '2024-01-01', value: '145.00', timestamp: 1704067200 }]
        },
        ema: {
          '20': [{ date: '2024-01-01', value: '151.00', timestamp: 1704067200 }],
          '50': [{ date: '2024-01-01', value: '149.00', timestamp: 1704067200 }],
          '200': [{ date: '2024-01-01', value: '146.00', timestamp: 1704067200 }]
        }
      };

      jest.spyOn(stockService.StockService, 'getMovingAverages').mockResolvedValue(mockMovingAverages);

      const response = await request(app)
        .get('/api/v1/stocks/moving-averages/AAPL');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle invalid periods parameter', async () => {
      const response = await request(app)
        .get('/api/v1/stocks/moving-averages/AAPL')
        .query({ periods: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle single period', async () => {
      const mockMovingAverages = {
        symbol: 'AAPL',
        sma: {
          '20': [{ date: '2024-01-01', value: '150.00', timestamp: 1704067200 }]
        },
        ema: {
          '20': [{ date: '2024-01-01', value: '151.00', timestamp: 1704067200 }]
        }
      };

      jest.spyOn(stockService.StockService, 'getMovingAverages').mockResolvedValue(mockMovingAverages);

      const response = await request(app)
        .get('/api/v1/stocks/moving-averages/AAPL')
        .query({ periods: '20' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/stocks/earnings/:symbol', () => {
    it('should return earnings data successfully', async () => {
      const mockEarningsData = {
        symbol: 'AAPL',
        earnings: [
          {
            date: '2024-01-01',
            estimate: '1.20',
            actual: '1.25',
            beat: true,
            surprise: '4.17%'
          },
          {
            date: '2023-10-01',
            estimate: '1.15',
            actual: '1.12',
            beat: false,
            surprise: '-2.61%'
          }
        ]
      };

      jest.spyOn(stockService.StockService, 'getEarningsData').mockResolvedValue(mockEarningsData);

      const response = await request(app)
        .get('/api/v1/stocks/earnings/AAPL');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.earnings).toBeDefined();
      expect(response.body.data.earnings).toHaveLength(2);
      expect(response.body.data.symbol).toBe('AAPL');
    });

    it('should handle no earnings data', async () => {
      const mockEarningsData = {
        symbol: 'NEWSTOCK',
        earnings: []
      };

      jest.spyOn(stockService.StockService, 'getEarningsData').mockResolvedValue(mockEarningsData);

      const response = await request(app)
        .get('/api/v1/stocks/earnings/NEWSTOCK');

      expect(response.status).toBe(200);
      expect(response.body.data.earnings).toEqual([]);
    });

    it('should handle earnings service error', async () => {
      jest.spyOn(stockService.StockService, 'getEarningsData').mockRejectedValue(new Error('Earnings data unavailable'));

      const response = await request(app)
        .get('/api/v1/stocks/earnings/AAPL');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/stocks/risk-radar/:symbol', () => {
    it('should return risk radar data successfully', async () => {
      const mockRiskData = {
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
      };

      jest.spyOn(stockService.StockService, 'getRiskRadarData').mockResolvedValue(mockRiskData);

      const response = await request(app)
        .get('/api/v1/stocks/risk-radar/AAPL');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.volatility).toBeDefined();
      expect(response.body.data.beta).toBe(1.15);
      expect(response.body.data.riskScore).toBe(65);
    });

    it('should handle risk data calculation error', async () => {
      jest.spyOn(stockService.StockService, 'getRiskRadarData').mockRejectedValue(new Error('Insufficient data for risk calculation'));

      const response = await request(app)
        .get('/api/v1/stocks/risk-radar/NEWSTOCK');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle malformed requests', async () => {
      const response = await request(app)
        .get('/api/v1/stocks/quote/');

      expect(response.status).toBe(404);
    });

    it('should handle very long symbol names', async () => {
      const longSymbol = 'A'.repeat(100);
      
      const response = await request(app)
        .get(`/api/v1/stocks/quote/${longSymbol}`);

      expect(response.status).toBe(400);
    });

    it('should handle special characters in symbol', async () => {
      const response = await request(app)
        .get('/api/v1/stocks/quote/AAPL%20');

      expect(response.status).toBe(400);
    });

    it('should handle concurrent requests', async () => {
      const mockQuoteData = {
        '01. symbol': 'AAPL',
        '05. price': '150.00'
      };

      jest.spyOn(stockService.StockService, 'getQuote').mockResolvedValue(mockQuoteData);

      const promises = Array(5).fill().map(() => 
        request(app).get('/api/v1/stocks/quote/AAPL')
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });
}); 