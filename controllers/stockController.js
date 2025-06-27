const { StockService } = require('../services/stockService');
const asyncWrapper = require('../utils/asyncWrapper');

// Get real-time stock quote
const getQuote = asyncWrapper(async (req, res, next) => {
  const { symbol } = req.params;
  if (!symbol) {
    return res.status(400).json({ success: false, error: 'Stock symbol is required', requestId: req.requestId });
  }
  const quote = await StockService.getQuote(symbol);
  if (!quote || Object.keys(quote).length === 0) {
    throw new Error('No data found');
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
    return res.status(400).json({ success: false, error: 'Stock symbol is required', requestId: req.requestId });
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
    return res.status(400).json({ success: false, error: 'Search keywords are required', requestId: req.requestId });
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
  const data = await StockService.getCompanyOverview(symbol);
  if (!data) {
    throw new Error('No data found');
  }
  res.json({ success: true, data });
});

// Get moving averages
const getMovingAverages = asyncWrapper(async (req, res, next) => {
  const { symbol } = req.params;
  const { periods } = req.query;
  if (!symbol) {
    return res.status(400).json({ success: false, error: 'Stock symbol is required', requestId: req.requestId });
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
    return res.status(400).json({ success: false, error: 'Stock symbol is required', requestId: req.requestId });
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
    return res.status(400).json({ success: false, error: 'Stock symbol is required', requestId: req.requestId });
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