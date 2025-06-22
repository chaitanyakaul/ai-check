const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Controller wrapper to eliminate repetitive try-catch and response structure
const controllerWrapper = (handler) => async (req, res, next) => {
  try {
    const result = await handler(req, res, next);
    
    // If handler returns data, send success response
    if (result !== undefined) {
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    next(createError(500, error.message));
  }
};

module.exports = {
  createError,
  asyncHandler,
  controllerWrapper
}; 