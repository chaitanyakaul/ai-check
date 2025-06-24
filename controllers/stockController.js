const { StockService } = require('../services/stockService');
const asyncWrapper = require('../utils/asyncWrapper');

// Get real-time stock quote
const getQuote = asyncWrapper(async (req, res, next) => {
  const { symbol } = req.params;
  if (!symbol) {
    return next(createError(400, 'Stock symbol is required'));
  }
  const quote = await StockService.getQuote(symbol);
  if (!quote || Object.keys(quote).length === 0) {
    return next(createError(404, `No data found for symbol: ${symbol}`));
  }
  res.json({
    success: true,
    data: quote,
    timestamp: new Date().toISOString()
  });
});

// Get historical stock data
const getHistoricalData = asyncWrapper(async (req, res, next) => {
  const { symbol } = req.params;
  const { outputsize = 'compact' } = req.query;
  if (!symbol) {
    return next(createError(400, 'Stock symbol is required'));
  }
  const historicalData = await StockService.getHistoricalData(symbol, outputsize);
  res.json({
    success: true,
    data: historicalData,
    symbol: symbol.toUpperCase(),
    outputsize,
    timestamp: new Date().toISOString()
  });
});

// Search for stocks
const searchStocks = asyncWrapper(async (req, res, next) => {
  const { keywords } = req.query;
  if (!keywords) {
    return next(createError(400, 'Search keywords are required'));
  }
  const searchResults = await StockService.searchStocks(keywords);
  const results = searchResults || [];
  res.json({
    success: true,
    data: results,
    keywords,
    count: results.length,
    timestamp: new Date().toISOString()
  });
});

// Get company overview
const getCompanyOverview = asyncWrapper(async (req, res, next) => {
  const { symbol } = req.params;
  if (!symbol) {
    return next(createError(400, 'Stock symbol is required'));
  }
  const overview = await StockService.getCompanyOverview(symbol);
  res.json({
    success: true,
    data: overview,
    symbol: symbol.toUpperCase(),
    timestamp: new Date().toISOString()
  });
});

// Get moving averages
const getMovingAverages = asyncWrapper(async (req, res, next) => {
  const { symbol } = req.params;
  const { periods } = req.query;
  if (!symbol) {
    return next(createError(400, 'Stock symbol is required'));
  }
  let periodArray = [20, 50, 200];
  if (periods) {
    periodArray = periods.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p) && p > 0);
    if (periodArray.length === 0) {
      periodArray = [20, 50, 200];
    }
  }
  const movingAverages = await StockService.getMovingAverages(symbol, periodArray);
  res.json({
    success: true,
    data: movingAverages,
    symbol: symbol.toUpperCase(),
    periods: periodArray,
    timestamp: new Date().toISOString()
  });
});

// Get earnings data
const getEarningsData = asyncWrapper(async (req, res, next) => {
  const { symbol } = req.params;
  if (!symbol) {
    return next(createError(400, 'Stock symbol is required'));
  }
  const earningsData = await StockService.getEarningsData(symbol);
  res.json({
    success: true,
    data: earningsData,
    symbol: symbol.toUpperCase(),
    timestamp: new Date().toISOString()
  });
});

// Get Risk Radar data
const getRiskRadarData = asyncWrapper(async (req, res, next) => {
  const { symbol } = req.params;
  if (!symbol) {
    return next(createError(400, 'Stock symbol is required'));
  }
  const riskData = await StockService.getRiskRadarData(symbol);
  res.json({
    success: true,
    data: riskData,
    symbol: symbol.toUpperCase(),
    timestamp: new Date().toISOString()
  });
});

// Only export production endpoints
module.exports = {
  getQuote,
  getHistoricalData,
  searchStocks,
  getCompanyOverview,
  getMovingAverages,
  getEarningsData,
  getRiskRadarData
}; 