const express = require('express');
const router = express.Router();

// Import route modules
const stockRoutes = require('./stockRoutes');

// API versioning
const apiVersion = '/v1';

// Mount routes
router.use(`${apiVersion}/stocks`, stockRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'AI Backend Service API',
    version: '1.0.0',
    endpoints: {
      stocks: `${req.baseUrl}${apiVersion}/stocks`,
    },
    documentation: 'Coming soon...'
  });
});

module.exports = router; 