const stockService = require('../services/stockService');
const { createError } = require('../utils/errorHandler');

// Get real-time stock quote
const getQuote = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return next(createError(400, 'Stock symbol is required'));
    }
    
    const quote = await stockService.getQuote(symbol);
    
    if (!quote || Object.keys(quote).length === 0) {
      return next(createError(404, `No data found for symbol: ${symbol}`));
    }
    
    res.json({
      success: true,
      data: quote,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Get historical stock data
const getHistoricalData = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { outputsize = 'compact' } = req.query;
    
    if (!symbol) {
      return next(createError(400, 'Stock symbol is required'));
    }
    
    const historicalData = await stockService.getHistoricalData(symbol, outputsize);
    
    res.json({
      success: true,
      data: historicalData,
      symbol: symbol.toUpperCase(),
      outputsize,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Get technical indicators
const getTechnicalIndicator = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { indicator = 'SMA', interval = 'daily', timePeriod = 20 } = req.query;
    
    if (!symbol) {
      return next(createError(400, 'Stock symbol is required'));
    }
    
    const technicalData = await stockService.getTechnicalIndicator(symbol, indicator, interval, timePeriod);
    
    res.json({
      success: true,
      data: technicalData,
      symbol: symbol.toUpperCase(),
      indicator,
      interval,
      timePeriod,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Search for stocks
const searchStocks = async (req, res, next) => {
  try {
    const { keywords } = req.query;
    
    if (!keywords) {
      return next(createError(400, 'Search keywords are required'));
    }
    
    const searchResults = await stockService.searchStocks(keywords);
    const results = searchResults || [];
    
    res.json({
      success: true,
      data: results,
      keywords,
      count: results.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Get company overview
const getCompanyOverview = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return next(createError(400, 'Stock symbol is required'));
    }
    
    const overview = await stockService.getCompanyOverview(symbol);
    
    res.json({
      success: true,
      data: overview,
      symbol: symbol.toUpperCase(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Get API rate limit status
const getRateLimitStatus = async (req, res, next) => {
  try {
    const status = stockService.getRateLimitStatus();
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Get multiple stock quotes
const getMultipleQuotes = async (req, res, next) => {
  try {
    const { symbols } = req.query;
    
    if (!symbols) {
      return next(createError(400, 'Stock symbols are required (comma-separated)'));
    }
    
    const symbolArray = symbols.split(',').map(s => s.trim());
    const quotes = {};
    
    for (const symbol of symbolArray) {
      try {
        quotes[symbol] = await stockService.getQuote(symbol);
      } catch (error) {
        quotes[symbol] = { error: error.message };
      }
    }
    
    res.json({
      success: true,
      data: quotes,
      symbols: symbolArray,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Get moving averages
const getMovingAverages = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { periods } = req.query;
    
    if (!symbol) {
      return next(createError(400, 'Stock symbol is required'));
    }
    
    let periodArray = [20, 50, 200];
    if (periods) {
      periodArray = periods.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
      if (periodArray.length === 0) {
        periodArray = [20, 50, 200];
      }
    }
    
    const movingAverages = await stockService.getMovingAverages(symbol, periodArray);
    
    res.json({
      success: true,
      data: movingAverages,
      symbol: symbol.toUpperCase(),
      periods: periodArray,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Get earnings data
const getEarningsData = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return next(createError(400, 'Stock symbol is required'));
    }
    
    const earningsData = await stockService.getEarningsData(symbol);
    
    res.json({
      success: true,
      data: earningsData,
      symbol: symbol.toUpperCase(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Test Yahoo Finance API
const testYahooFinanceAPI = async (req, res, next) => {
  try {
    const { symbol = 'AAPL' } = req.params;
    
    await stockService.testYahooFinanceAPI(symbol);
    
    res.json({
      success: true,
      message: 'Yahoo Finance API test completed. Check server logs for details.',
      symbol: symbol.toUpperCase(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

module.exports = {
  getQuote,
  getHistoricalData,
  getTechnicalIndicator,
  searchStocks,
  getCompanyOverview,
  getRateLimitStatus,
  getMultipleQuotes,
  getMovingAverages,
  getEarningsData,
  testYahooFinanceAPI
}; 