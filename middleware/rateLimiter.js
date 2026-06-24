// In-memory rate limiting store
const ipCache = new Map();

// Periodic cleanup of expired entries (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of ipCache.entries()) {
    const validTimestamps = timestamps.filter(time => now - time < 60000);
    if (validTimestamps.length === 0) {
      ipCache.delete(ip);
    } else {
      ipCache.set(ip, validTimestamps);
    }
  }
}, 600000);

/**
 * Express Rate Limiting Middleware
 * @param {Object} options Configuration options
 * @param {number} options.windowMs Time window in milliseconds (default: 1 minute)
 * @param {number} options.max Limit of requests per IP in the window (default: 15)
 */
const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 60000; // 1 minute
  const max = options.max || 15; // 15 requests

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!ipCache.has(ip)) {
      ipCache.set(ip, [now]);
      return next();
    }

    const timestamps = ipCache.get(ip);
    // Filter timestamps within current window
    const recentRequests = timestamps.filter(time => now - time < windowMs);
    recentRequests.push(now);
    ipCache.set(ip, recentRequests);

    if (recentRequests.length > max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests from this IP. Please try again after some time.'
      });
    }

    next();
  };
};

module.exports = rateLimiter;
