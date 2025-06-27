jest.mock('yahoo-finance2', () => ({
  __esModule: true,
  default: {
    quote: jest.fn().mockResolvedValue({
      symbol: 'AAPL',
      regularMarketPrice: 150.00,
      regularMarketVolume: 1000000,
      regularMarketChange: 2.50,
      regularMarketChangePercent: 1.67,
      regularMarketPreviousClose: 147.50,
      regularMarketOpen: 148.00,
      regularMarketDayHigh: 151.00,
      regularMarketDayLow: 147.00,
      postMarketPrice: 151.50,
      postMarketTime: 1700000000,
      preMarketPrice: 149.00,
      preMarketTime: 1699990000,
      regularMarketTime: 1700000000
    }),
    historical: jest.fn().mockResolvedValue([
      { date: new Date('2024-01-01'), close: 150 },
      { date: new Date('2024-01-02'), close: 152 },
      { date: new Date('2024-01-03'), close: 154 },
      { date: new Date('2024-01-04'), close: 156 },
      { date: new Date('2024-01-05'), close: 158 }
    ]),
    earnings: jest.fn((symbol) => {
      if (symbol === 'NEWSTOCK') return Promise.resolve([]);
      return Promise.resolve([
        { date: '2024-01-01', estimate: '2.30', actual: '2.50', surprise: 0.2 },
        { date: '2024-04-01', estimate: '2.60', actual: '2.70', surprise: 0.1 }
      ]);
    }),
    search: jest.fn().mockResolvedValue([]),
    quoteSummary: jest.fn().mockResolvedValue({
      assetProfile: { sector: 'Technology', longBusinessSummary: 'A great company' },
      summaryDetail: { marketCap: 2.5e12, trailingPE: 30 },
      price: { symbol: 'AAPL', longName: 'Apple Inc.', industry: 'Consumer Electronics' }
    }),
    movingAverages: jest.fn((symbol, periods) => {
      const result = { symbol: symbol.toUpperCase(), sma: {}, ema: {} };
      (periods || [20, 50, 200]).forEach((p, i) => {
        result.sma[p] = [{ value: (150 + i * 2).toFixed(2) }];
        result.ema[p] = [{ value: (151 + i * 2).toFixed(2) }];
      });
      return Promise.resolve(result);
    })
  },
}));

// Patch global.fetch for Polygon earnings and NewsAPI
const originalFetch = global.fetch;
global.fetch = (url) => {
  if (url && url.includes('polygon.io')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        results: [
          {
            start_date: '2024-01-01',
            financials: { income_statement: { basic_earnings_per_share: { value: 2.5 } } }
          },
          {
            start_date: '2024-04-01',
            financials: { income_statement: { basic_earnings_per_share: { value: 2.7 } } }
          }
        ]
      })
    });
  }
  // fallback for NewsAPI
  return Promise.resolve({ ok: true, json: () => Promise.resolve({ articles: [] }) });
}; 