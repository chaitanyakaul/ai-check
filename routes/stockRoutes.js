const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const validateSymbol = require('../utils/validateSymbol');
const validateQueryParams = require('../utils/validateQueryParams');

// GET /api/v1/stocks/quote/:symbol - Get real-time stock quote
router.get('/quote/:symbol', validateSymbol, stockController.getQuote);

// GET /api/v1/stocks/historical/:symbol - Get historical data
router.get('/historical/:symbol', validateSymbol, validateQueryParams, stockController.getHistoricalData);

// GET /api/v1/stocks/search - Search for stocks
router.get('/search', stockController.searchStocks);

// GET /api/v1/stocks/overview/:symbol - Get company overview
router.get('/overview/:symbol', validateSymbol, stockController.getCompanyOverview);

// GET /api/v1/stocks/moving-averages/:symbol - Get moving averages
router.get('/moving-averages/:symbol', validateSymbol, validateQueryParams, stockController.getMovingAverages);

// GET /api/v1/stocks/earnings/:symbol - Get earnings data
router.get('/earnings/:symbol', validateSymbol, stockController.getEarningsData);

// Route for Risk Radar data
router.get('/risk-radar/:symbol', validateSymbol, stockController.getRiskRadarData);

module.exports = router; 