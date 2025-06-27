const { v4: uuidv4 } = require('uuid');
module.exports = function checkUrlLength(req, res, next) {
  if (req.url.length > 255) {
    return res.status(414).json({
      success: false,
      error: 'Request-URI Too Long.',
      requestId: req.id || uuidv4()
    });
  }
  next();
}; 