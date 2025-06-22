const request = require('supertest');
const app = require('../../app');

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
        '10. change percent': '1.67%'
      };

      // Mock the service method
      jest.spyOn(stockService, 'getQuote').mockResolvedValue(mockQuoteData);

      const response = await request(app)
        .get('/api/v1/stocks/quote/AAPL');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data['01. symbol']).toBe('AAPL');
      expect(response.body.data['05. price']).toBe('150.00');
    });

    it('should handle invalid symbol gracefully', async () => {
      // Mock the service method to throw an error
      jest.spyOn(stockService, 'getQuote').mockRejectedValue(new Error('Symbol not found'));

      const response = await request(app)
        .get('/api/v1/stocks/quote/INVALID');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/stocks/overview/:symbol', () => {
    it('should return company overview successfully', async () => {
      const mockOverviewData = {
        Name: 'Apple Inc.',
        Sector: 'Technology',
        Industry: 'Consumer Electronics',
        MarketCapitalization: '2500000000000'
      };

      // Mock the service method
      jest.spyOn(stockService, 'getCompanyOverview').mockResolvedValue(mockOverviewData);

      const response = await request(app)
        .get('/api/v1/stocks/overview/AAPL');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockOverviewData);
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
        }
      };

      // Mock the service method
      jest.spyOn(stockService, 'getHistoricalData').mockResolvedValue(mockHistoricalData);

      const response = await request(app)
        .get('/api/v1/stocks/historical/AAPL')
        .query({ outputsize: 'compact' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
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

      // Mock the service method
      jest.spyOn(stockService, 'getHistoricalData').mockResolvedValue(mockHistoricalData);

      const response = await request(app)
        .get('/api/v1/stocks/historical/AAPL')
        .query({ outputsize: 'full' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
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

      // Mock the service method
      jest.spyOn(stockService, 'getMovingAverages').mockResolvedValue(mockMovingAverages);

      const response = await request(app)
        .get('/api/v1/stocks/moving-averages/AAPL')
        .query({ periods: '20,50' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.sma).toBeDefined();
      expect(response.body.data.ema).toBeDefined();
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

      // Mock the service method
      jest.spyOn(stockService, 'getMovingAverages').mockResolvedValue(mockMovingAverages);

      const response = await request(app)
        .get('/api/v1/stocks/moving-averages/AAPL');

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
            beat: true
          }
        ]
      };

      // Mock the service method
      jest.spyOn(stockService, 'getEarningsData').mockResolvedValue(mockEarningsData);

      const response = await request(app)
        .get('/api/v1/stocks/earnings/AAPL');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.earnings).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/v1/stocks/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Not Found');
    });

    it('should handle server errors gracefully', async () => {
      // Mock the service method to throw an error
      jest.spyOn(stockService, 'getQuote').mockRejectedValue(new Error('Internal server error'));

      const response = await request(app)
        .get('/api/v1/stocks/quote/AAPL');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
}); 