class RateLimiter {
  constructor(options = {}) {
    this.defaultLimit = options.defaultLimit || 60; // default: 60 requests
    this.defaultWindow = options.defaultWindow || 60 * 1000; // default: 1 minute
    this.limits = {}; // custom limits per key
    this.windows = {}; // custom windows per key
    this.requests = {}; // { key: [timestamps] }
  }

  isAllowed(key = 'default', limit = this.defaultLimit, window = this.defaultWindow) {
    if (!this.requests[key]) {
      this.requests[key] = [];
    }
    const now = Date.now();
    // Remove expired requests
    this.requests[key] = this.requests[key].filter(ts => ts > now - window);
    if (this.requests[key].length < limit) {
      this.requests[key].push(now);
      return {
        allowed: true,
        remaining: limit - this.requests[key].length,
        resetTime: this.getResetTime(key, limit, window)
      };
    } else {
      return {
        allowed: false,
        remaining: 0,
        resetTime: this.getResetTime(key, limit, window)
      };
    }
  }

  getRemaining(key = 'default', limit = this.defaultLimit, window = this.defaultWindow) {
    if (!this.requests[key]) return limit;
    const now = Date.now();
    this.requests[key] = this.requests[key].filter(ts => ts > now - window);
    return Math.max(0, limit - this.requests[key].length);
  }

  getResetTime(key = 'default', limit = this.defaultLimit, window = this.defaultWindow) {
    if (!this.requests[key] || this.requests[key].length === 0) return null;
    const now = Date.now();
    const oldest = Math.min(...this.requests[key]);
    return oldest + window;
  }

  clear() {
    this.requests = {};
  }

  cleanup() {
    const now = Date.now();
    for (const key in this.requests) {
      // Use the largest window for cleanup
      const window = this.windows[key] || this.defaultWindow;
      this.requests[key] = this.requests[key].filter(ts => ts > now - window);
      if (this.requests[key].length === 0) {
        delete this.requests[key];
      }
    }
  }
}

// Singleton instance
const rateLimiter = new RateLimiter({ defaultLimit: 60, defaultWindow: 60 * 1000 });

module.exports = {
  RateLimiter,
  rateLimiter
}; 