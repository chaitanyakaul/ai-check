const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const stockRoutes = require('./stockRoutes');

// API versioning
const apiVersion = '/v1';

// Mount routes
router.use(`${apiVersion}/auth`, authRoutes);
router.use(`${apiVersion}/stocks`, stockRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'AI Backend Service API',
    version: '1.0.0',
    endpoints: {
      auth: `${req.baseUrl}${apiVersion}/auth`,
      stocks: `${req.baseUrl}${apiVersion}/stocks`,
    },
    documentation: 'Coming soon...'
  });
});

module.exports = router; 