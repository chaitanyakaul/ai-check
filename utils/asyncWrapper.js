const asyncWrapper = (fn) => {
  return function wrappedFunction(req, res, next) {
    try {
      const maybePromise = fn.call(this, req, res, next);
      if (maybePromise && typeof maybePromise.then === 'function') {
        maybePromise.catch(next);
      }
    } catch (err) {
      next(err);
    }
  };
};

module.exports = asyncWrapper; 