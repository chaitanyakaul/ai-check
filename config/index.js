require('dotenv').config();

module.exports = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration (for future use)
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/ai-backend',
  },
  
  // JWT configuration (for future use)
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  // API configuration
  api: {
    prefix: '/api',
    version: 'v1',
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  
  // Stock data configuration
  alphaVantage: {
    apiKey: process.env.ALPHA_VANTAGE_API_KEY || 'demo',
    baseUrl: 'https://www.alphavantage.co/query',
    rateLimit: {
      callsPerMinute: 5,
      callsPerDay: 500
    }
  }
}; 