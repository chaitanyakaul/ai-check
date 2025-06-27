const { v4: uuidv4 } = require('uuid');
module.exports = function validateQueryParams(req, res, next) {
  // Validate outputsize
  if (req.query.outputsize && !['compact', 'full'].includes(req.query.outputsize)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid outputsize parameter.',
      requestId: req.id || uuidv4()
    });
  }
  // Validate periods (should be comma-separated positive integers)
  if (req.query.periods) {
    const periods = req.query.periods.split(',');
    if (!periods.every(p => /^\d+$/.test(p) && parseInt(p) > 0)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid periods parameter.',
        requestId: req.id || uuidv4()
      });
    }
  }
  next();
}; 