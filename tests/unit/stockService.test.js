const { StockService } = require('../../services/stockService');
const config = require('../../config');
const nock = require('nock');

// --- Definitive Mock for @xenova/transformers ---
const mockClassifier = jest.fn(async (text, labels) => {
  let topLabel = labels[0];
  if (text.includes('products')) topLabel = 'New Product Launch';
  if (text.includes('regulations')) topLabel = 'Legal & Regulatory Issues';
  return {
    sequence: text,
    labels: [topLabel, ...labels.slice(1)],
    scores: [0.9, ...labels.slice(1).map(() => 0.1)],
  };
});

jest.mock('@xenova/transformers', () => ({
  pipeline: jest.fn().mockImplementation(() => Promise.resolve(mockClassifier)),
}));
// --- End Mock ---

// Correctly mock yahoo-finance2 as an object with methods
jest.mock('yahoo-finance2', () => ({
  __esModule: true,
  default: {
    quote: jest.fn(),
    historical: jest.fn(),
    search: jest.fn(),
    quoteSummary: jest.fn(),
  },
}));

const yahooFinance = require('yahoo-finance2').default;
const stockServiceInstance = StockService; // Use the singleton instance

describe('StockService', () => {
  beforeEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
    mockClassifier.mockClear(); // Clear the underlying classifier mock
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('calculateSMA', () => {
    it('should calculate Simple Moving Average correctly', () => {
      const mockData = [
        { date: new Date('2024-01-01'), close: 100 },
        { date: new Date('2024-01-02'), close: 102 },
        { date: new Date('2024-01-03'), close: 104 },
        { date: new Date('2024-01-04'), close: 106 },
        { date: new Date('2024-01-05'), close: 108 }
      ];
      const smaResult = stockServiceInstance.calculateSMA(mockData, 3);
      expect(smaResult).toHaveLength(3);
      expect(smaResult[0].value).toBe('102.00'); // (100+102+104)/3
      expect(smaResult[1].value).toBe('104.00');
      expect(smaResult[2].value).toBe('106.00');
    });
    it('should return empty array for insufficient data', () => {
      const mockData = [
        { date: '2024-01-01', '4. close': '100' },
        { date: '2024-01-02', '4. close': '102' }
      ];
      const smaResult = stockServiceInstance.calculateSMA(mockData, 5);
      expect(smaResult).toEqual([]);
    });
  });

  describe('calculateEMA', () => {
    it('should calculate Exponential Moving Average correctly', () => {
      const mockData = [
        { date: new Date('2024-01-01'), close: 100 },
        { date: new Date('2024-01-02'), close: 102 },
        { date: new Date('2024-01-03'), close: 104 },
        { date: new Date('2024-01-04'), close: 106 },
        { date: new Date('2024-01-05'), close: 108 }
      ];
      const emaResult = stockServiceInstance.calculateEMA(mockData, 3);
      expect(emaResult).toHaveLength(3);
      expect(emaResult[0].value).toBe('102.00');
      expect(parseFloat(emaResult[2].value)).toBeCloseTo(106.00, 2);
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
      const result = await stockServiceInstance.getQuote('AAPL');
      expect(result['01. symbol']).toBe('AAPL');
      expect(result['05. price']).toBe('150');
    });
    it('should handle API errors gracefully', async () => {
      yahooFinance.quote.mockRejectedValue(new Error('Symbol not found'));
      await expect(stockServiceInstance.getQuote('INVALID')).rejects.toThrow('Failed to fetch quote for INVALID: Symbol not found');
    });
  });

  describe('getCompanyOverview', () => {
    it('should fetch company overview successfully', async () => {
      yahooFinance.quoteSummary.mockResolvedValue({
        assetProfile: { sector: 'Technology', longBusinessSummary: 'A great company' },
        summaryDetail: { marketCap: 2.5e12, trailingPE: 30 },
        price: { symbol: 'AAPL', longName: 'Apple Inc.', industry: 'Consumer Electronics' }
      });
      const result = await stockServiceInstance.getCompanyOverview('AAPL');
      expect(result.Name).toBe('Apple Inc.');
      expect(result.Sector).toBe('Technology');
    });
  });

  describe('getHistoricalData', () => {
    it('should fetch historical data successfully', async () => {
      const mockResponse = [{ date: new Date('2024-01-01'), close: 152.00 }];
      yahooFinance.historical.mockResolvedValue(mockResponse);
      const result = await stockServiceInstance.getHistoricalData('AAPL', 'compact');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getMovingAverages', () => {
    it('should calculate moving averages for multiple periods', async () => {
      const mockHistoricalData = [
        { date: new Date('2024-01-01'), close: 100 }, { date: new Date('2024-01-02'), close: 102 },
        { date: new Date('2024-01-03'), close: 104 }, { date: new Date('2024-01-04'), close: 106 },
        { date: new Date('2024-01-05'), close: 108 }
      ];
      // Mock getHistoricalData directly on the instance
      jest.spyOn(stockServiceInstance, 'getHistoricalData').mockResolvedValue(mockHistoricalData);
      
      const result = await stockServiceInstance.getMovingAverages('AAPL', [3, 5]);
      expect(result.sma).toBeDefined();
      expect(result.ema).toBeDefined();
      expect(result.sma['3']).toHaveLength(3);
      expect(result.sma['5']).toHaveLength(1);
    });
  });

  describe('getRiskRadarData', () => {
    // Note: The main success case for this function is difficult to test in a pure
    // unit test environment due to complexities with mocking the dynamic import
    // of the transformers library in Jest. The successful path is instead covered
    // by the integration test for the GET /risk-radar/:symbol endpoint.

    it('should return an error object if NewsAPI key is not configured', async () => {
      config.newsApi.apiKey = ''; // Temporarily unset key
      const result = await stockServiceInstance.getRiskRadarData('AAPL');
      expect(result).toEqual({ error: 'NewsAPI key is not configured. Please set NEWS_API_KEY environment variable.' });
      config.newsApi.apiKey = 'test-key'; // Restore key
    });

    it('should throw an error if the NewsAPI request fails', async () => {
      nock('https://newsapi.org')
        .get(/v2\/everything/)
        .reply(500, { message: 'Internal Server Error' });
      
      config.newsApi.apiKey = 'test-key';

      await expect(stockServiceInstance.getRiskRadarData('AAPL')).rejects.toThrow('Failed to fetch news for risk analysis.');
    });

    it('should return an empty object if no articles are found', async () => {
      nock('https://newsapi.org')
        .get(/v2\/everything/)
        .reply(200, { articles: [] });

      config.newsApi.apiKey = 'test-key';

      const result = await stockServiceInstance.getRiskRadarData('AAPL');
      expect(result).toEqual({});
    });
  });
}); 