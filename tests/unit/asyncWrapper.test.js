jest.unmock('../../services/rateLimiter');
const asyncWrapper = require('../../utils/asyncWrapper');

describe('asyncWrapper', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    mockNext = createMockNext();
  });

  describe('successful async operations', () => {
    it('should handle successful async function', async () => {
      const asyncFunction = jest.fn().mockResolvedValue({ data: 'test' });
      const wrappedFunction = asyncWrapper(asyncFunction);

      await wrappedFunction(mockReq, mockRes, mockNext);

      expect(asyncFunction).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle async function that returns data', async () => {
      const testData = { message: 'success' };
      const asyncFunction = jest.fn().mockResolvedValue(testData);
      const wrappedFunction = asyncWrapper(asyncFunction);

      await wrappedFunction(mockReq, mockRes, mockNext);

      expect(asyncFunction).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle async function with no return value', async () => {
      const asyncFunction = jest.fn().mockResolvedValue(undefined);
      const wrappedFunction = asyncWrapper(asyncFunction);

      await wrappedFunction(mockReq, mockRes, mockNext);

      expect(asyncFunction).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should catch and pass errors to next middleware', async () => {
      const testError = new Error('Test error');
      const asyncFunction = jest.fn().mockRejectedValue(testError);
      const wrappedFunction = asyncWrapper(asyncFunction);

      await wrappedFunction(mockReq, mockRes, mockNext);

      expect(asyncFunction).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(testError);
    });

    it('should handle non-Error objects thrown', async () => {
      const testError = 'String error';
      const asyncFunction = jest.fn().mockRejectedValue(testError);
      const wrappedFunction = asyncWrapper(asyncFunction);

      await wrappedFunction(mockReq, mockRes, mockNext);

      expect(asyncFunction).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(testError);
    });

    it('should handle null errors', async () => {
      const asyncFunction = jest.fn().mockRejectedValue(null);
      const wrappedFunction = asyncWrapper(asyncFunction);

      await wrappedFunction(mockReq, mockRes, mockNext);

      expect(asyncFunction).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(null);
    });

    it('should handle undefined errors', async () => {
      const asyncFunction = jest.fn().mockRejectedValue(undefined);
      const wrappedFunction = asyncWrapper(asyncFunction);

      await wrappedFunction(mockReq, mockRes, mockNext);

      expect(asyncFunction).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(undefined);
    });
  });

  describe('edge cases', () => {
    it('should handle function that throws synchronously', async () => {
      const testError = new Error('Sync error');
      const asyncFunction = jest.fn().mockImplementation(() => {
        throw testError;
      });
      const wrappedFunction = asyncWrapper(asyncFunction);

      await wrappedFunction(mockReq, mockRes, mockNext);

      expect(asyncFunction).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(testError);
    });

    it('should handle function that returns a promise that resolves to an error', async () => {
      const testError = new Error('Promise error');
      const asyncFunction = jest.fn().mockResolvedValue(testError);
      const wrappedFunction = asyncWrapper(asyncFunction);

      await wrappedFunction(mockReq, mockRes, mockNext);

      expect(asyncFunction).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled(); // Should not treat resolved value as error
    });

    it('should preserve function context', async () => {
      const context = { test: 'value' };
      const asyncFunction = jest.fn().mockResolvedValue('success');
      const wrappedFunction = asyncWrapper(asyncFunction);

      await wrappedFunction.call(context, mockReq, mockRes, mockNext);

      expect(asyncFunction).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(asyncFunction.mock.instances[0]).toBe(context);
    });
  });

  describe('integration scenarios', () => {
    it('should work with Express-style middleware functions', async () => {
      const middlewareFunction = jest.fn().mockImplementation(async (req, res, next) => {
        req.processed = true;
        return 'middleware result';
      });
      const wrappedMiddleware = asyncWrapper(middlewareFunction);

      await wrappedMiddleware(mockReq, mockRes, mockNext);

      expect(middlewareFunction).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockReq.processed).toBe(true);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should work with controller functions that modify response', async () => {
      const controllerFunction = jest.fn().mockImplementation(async (req, res, next) => {
        res.status(200).json({ success: true });
        return 'controller result';
      });
      const wrappedController = asyncWrapper(controllerFunction);

      await wrappedController(mockReq, mockRes, mockNext);

      expect(controllerFunction).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 