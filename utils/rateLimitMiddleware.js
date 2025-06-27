const { rateLimiter } = require('../services/rateLimiter');

module.exports = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const { allowed, remaining, resetTime } = rateLimiter.isAllowed(ip);
  if (!allowed) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later.',
      requestId: req.requestId,
      remaining,
      resetTime
    });
  }
  next();
}; 