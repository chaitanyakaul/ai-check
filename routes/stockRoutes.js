const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// GET /api/v1/stocks/quote/:symbol - Get real-time stock quote
router.get('/quote/:symbol', stockController.getQuote);

// GET /api/v1/stocks/historical/:symbol - Get historical data
router.get('/historical/:symbol', stockController.getHistoricalData);

// GET /api/v1/stocks/search - Search for stocks
router.get('/search', stockController.searchStocks);

// GET /api/v1/stocks/overview/:symbol - Get company overview
router.get('/overview/:symbol', stockController.getCompanyOverview);

// GET /api/v1/stocks/quotes - Get multiple stock quotes
router.get('/quotes', stockController.getMultipleQuotes);

// GET /api/v1/stocks/moving-averages/:symbol - Get moving averages
router.get('/moving-averages/:symbol', stockController.getMovingAverages);

// GET /api/v1/stocks/earnings/:symbol - Get earnings data
router.get('/earnings/:symbol', stockController.getEarningsData);

// Route for Risk Radar data
router.get('/risk-radar/:symbol', stockController.getRiskRadarData);

module.exports = router; 