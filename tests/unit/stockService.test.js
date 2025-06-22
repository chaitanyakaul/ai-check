const stockService = require('../../services/stockService');
const nock = require('nock');

// Correctly mock yahoo-finance2 as an object with methods
jest.mock('yahoo-finance2', () => ({
  __esModule: true,
  default: {
    quote: jest.fn(),
    historical: jest.fn(),
    search: jest.fn(),
  }
}));

const yahooFinance = require('yahoo-finance2').default;

describe('StockService', () => {
  beforeEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('calculateSMA', () => {
    it('should calculate Simple Moving Average correctly', () => {
      const mockData = [
        { date: '2024-01-01', '4. close': '100' },
        { date: '2024-01-02', '4. close': '102' },
        { date: '2024-01-03', '4. close': '104' },
        { date: '2024-01-04', '4. close': '106' },
        { date: '2024-01-05', '4. close': '108' }
      ];
      const smaResult = stockService.calculateSMA(mockData, 3);
      expect(smaResult).toHaveLength(3);
      expect(smaResult[0].value).toBe('102.00'); // (100+102+104)/3
      expect(smaResult[1].value).toBe('104.00'); // (102+104+106)/3
      expect(smaResult[2].value).toBe('106.00'); // (104+106+108)/3
    });
    it('should return empty array for insufficient data', () => {
      const mockData = [
        { date: '2024-01-01', '4. close': '100' },
        { date: '2024-01-02', '4. close': '102' }
      ];
      const smaResult = stockService.calculateSMA(mockData, 5);
      expect(smaResult).toEqual([]);
    });
  });

  describe('calculateEMA', () => {
    it('should calculate Exponential Moving Average correctly', () => {
      const mockData = [
        { date: '2024-01-01', '4. close': '100' },
        { date: '2024-01-02', '4. close': '102' },
        { date: '2024-01-03', '4. close': '104' },
        { date: '2024-01-04', '4. close': '106' },
        { date: '2024-01-05', '4. close': '108' }
      ];
      // For period=3, should return 3 results (starting from index 2)
      const emaResult = stockService.calculateEMA(mockData, 3);
      expect(emaResult).toHaveLength(3);
      expect(emaResult[0].value).toBe('102.00'); // First EMA is SMA of first 3
      expect(parseFloat(emaResult[2].value)).toBeGreaterThan(100); // Last EMA should be > 100
    });
  });

  // Mock Yahoo Finance for API-dependent methods
  describe('getQuote', () => {
    it('should fetch stock quote successfully', async () => {
      yahooFinance.quote.mockResolvedValue({
        symbol: 'AAPL',
        regularMarketPrice: 150.00,
        regularMarketVolume: 1000000,
        regularMarketChange: 2.50,
        regularMarketChangePercent: 1.67,
        regularMarketPreviousClose: 147.50
      });
      const result = await stockService.getQuote('AAPL');
      expect(result['01. symbol']).toBe('AAPL');
      expect(result['05. price']).toBe('150');
    });
    it('should handle API errors gracefully', async () => {
      yahooFinance.quote.mockRejectedValue(new Error('Symbol not found'));
      await expect(stockService.getQuote('INVALID')).rejects.toThrow('Failed to getQuote: Symbol not found');
    });
  });

  describe('getCompanyOverview', () => {
    it('should fetch company overview successfully', async () => {
      yahooFinance.quote.mockResolvedValue({
        symbol: 'AAPL',
        longName: 'Apple Inc.',
        sector: 'Technology',
        industry: 'Consumer Electronics',
        marketCap: 2500000000000
      });
      const result = await stockService.getCompanyOverview('AAPL');
      expect(result.Name).toBe('Apple Inc.');
      expect(result.Sector).toBe('Technology');
    });
  });

  describe('getHistoricalData', () => {
    it('should fetch historical data successfully', async () => {
      yahooFinance.historical.mockResolvedValue([
        {
          date: new Date('2024-01-01'),
          open: 150.00,
          high: 155.00,
          low: 149.00,
          close: 152.00,
          volume: 1000000
        }
      ]);
      const result = await stockService.getHistoricalData('AAPL', 'compact');
      expect(result).toBeDefined();
      expect(result['2024-01-01']).toBeDefined();
    });
  });

  describe('getMovingAverages', () => {
    it('should calculate moving averages for multiple periods', async () => {
      // Mock getHistoricalData to return sample data
      const mockHistoricalData = {
        '2024-01-01': { '4. close': '100' },
        '2024-01-02': { '4. close': '102' },
        '2024-01-03': { '4. close': '104' },
        '2024-01-04': { '4. close': '106' },
        '2024-01-05': { '4. close': '108' }
      };
      jest.spyOn(stockService, 'getHistoricalData').mockResolvedValue({
        success: true,
        data: mockHistoricalData
      });
      const result = await stockService.getMovingAverages('AAPL', [3, 5]);
      expect(result.sma).toBeDefined();
      expect(result.ema).toBeDefined();
      expect(result.sma['3']).toBeDefined();
      expect(result.sma['5']).toBeDefined();
    });
  });
}); 