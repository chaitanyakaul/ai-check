const { v4: uuidv4 } = require('uuid');
module.exports = function validateSymbol(req, res, next) {
  const symbol = req.params.symbol;
  if (!symbol || !/^[A-Z0-9.-]{1,10}$/.test(symbol)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid stock symbol format.',
      requestId: req.id || uuidv4()
    });
  }
  next();
}; 