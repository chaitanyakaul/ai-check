jest.unmock('../../services/rateLimiter');
const { RateLimiter } = require('../../services/rateLimiter');

describe('RateLimiter', () => {
  let rateLimiter;
  const testKey = 'test-user';
  const testLimit = 10;
  const testWindow = 60000; // 1 minute

  beforeEach(() => {
    rateLimiter = new RateLimiter();
    // Clear any existing data
    rateLimiter.clear();
  });

  afterEach(() => {
    rateLimiter.clear();
  });

  describe('constructor', () => {
    it('should initialize with default settings', () => {
      const defaultLimiter = new RateLimiter();
      expect(defaultLimiter.limits).toBeDefined();
      expect(defaultLimiter.windows).toBeDefined();
    });

    it('should initialize with custom settings', () => {
      const customLimiter = new RateLimiter({
        defaultLimit: 5,
        defaultWindow: 30000
      });
      expect(customLimiter.defaultLimit).toBe(5);
      expect(customLimiter.defaultWindow).toBe(30000);
    });
  });

  describe('isAllowed', () => {
    it('should allow first request', () => {
      const result = rateLimiter.isAllowed(testKey, testLimit, testWindow);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(testLimit - 1);
      expect(result.resetTime).toBeDefined();
    });

    it('should allow multiple requests within limit', () => {
      for (let i = 0; i < testLimit; i++) {
        const result = rateLimiter.isAllowed(testKey, testLimit, testWindow);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(testLimit - i - 1);
      }
    });

    it('should block request when limit exceeded', () => {
      // Make testLimit + 1 requests
      for (let i = 0; i < testLimit; i++) {
        rateLimiter.isAllowed(testKey, testLimit, testWindow);
      }
      
      const result = rateLimiter.isAllowed(testKey, testLimit, testWindow);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.resetTime).toBeDefined();
    });

    it('should reset after window expires', (done) => {
      const shortWindow = 100; // 100ms
      
      // Make one request
      rateLimiter.isAllowed(testKey, 1, shortWindow);
      
      // Wait for window to expire
      setTimeout(() => {
        const result = rateLimiter.isAllowed(testKey, 1, shortWindow);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(0);
        done();
      }, shortWindow + 50);
    });

    it('should handle different keys independently', () => {
      const key1 = 'user1';
      const key2 = 'user2';
      
      // Use up limit for key1
      for (let i = 0; i < testLimit; i++) {
        rateLimiter.isAllowed(key1, testLimit, testWindow);
      }
      
      // key2 should still be allowed
      const result = rateLimiter.isAllowed(key2, testLimit, testWindow);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(testLimit - 1);
    });

    it('should use default values when not provided', () => {
      const result = rateLimiter.isAllowed(testKey);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(rateLimiter.defaultLimit - 1);
    });
  });

  describe('getRemaining', () => {
    it('should return correct remaining count', () => {
      rateLimiter.isAllowed(testKey, testLimit, testWindow);
      const remaining = rateLimiter.getRemaining(testKey, testLimit, testWindow);
      expect(remaining).toBe(testLimit - 1);
    });

    it('should return 0 when limit exceeded', () => {
      for (let i = 0; i < testLimit; i++) {
        rateLimiter.isAllowed(testKey, testLimit, testWindow);
      }
      
      const remaining = rateLimiter.getRemaining(testKey, testLimit, testWindow);
      expect(remaining).toBe(0);
    });

    it('should return limit for new key', () => {
      const remaining = rateLimiter.getRemaining('new-key', testLimit, testWindow);
      expect(remaining).toBe(testLimit);
    });
  });

  describe('getResetTime', () => {
    it('should return reset time for existing key', () => {
      rateLimiter.isAllowed(testKey, testLimit, testWindow);
      const resetTime = rateLimiter.getResetTime(testKey, testLimit, testWindow);
      expect(resetTime).toBeDefined();
      expect(resetTime).toBeGreaterThan(Date.now());
    });

    it('should return null for new key', () => {
      const resetTime = rateLimiter.getResetTime('new-key', testLimit, testWindow);
      expect(resetTime).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all rate limit data', () => {
      rateLimiter.isAllowed(testKey, testLimit, testWindow);
      rateLimiter.clear();
      
      const remaining = rateLimiter.getRemaining(testKey, testLimit, testWindow);
      expect(remaining).toBe(testLimit);
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', (done) => {
      const shortWindow = 100; // 100ms
      
      rateLimiter.isAllowed(testKey, testLimit, shortWindow);
      
      setTimeout(() => {
        rateLimiter.cleanup();
        const remaining = rateLimiter.getRemaining(testKey, testLimit, shortWindow);
        expect(remaining).toBe(testLimit);
        done();
      }, shortWindow + 50);
    });
  });

  describe('edge cases', () => {
    it('should handle zero limit', () => {
      const result = rateLimiter.isAllowed(testKey, 0, testWindow);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should handle negative limit', () => {
      const result = rateLimiter.isAllowed(testKey, -1, testWindow);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should handle zero window', () => {
      const result = rateLimiter.isAllowed(testKey, testLimit, 0);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(testLimit - 1);
    });

    it('should handle null/undefined key', () => {
      const result = rateLimiter.isAllowed(null, testLimit, testWindow);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(testLimit - 1);
    });
  });
}); 