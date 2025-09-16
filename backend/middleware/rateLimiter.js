const rateLimit = require('express-rate-limit');

// Create different rate limiters for different endpoints
const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100,
    message: options.message || 'Too many requests',
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General API rate limiter
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many API requests, please try again later'
});

// AI generation rate limiter (stricter)
const aiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: 'Too many AI generation requests, please try again later'
});

// File upload rate limiter
const uploadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many file uploads, please try again later'
});

module.exports = {
  apiLimiter,
  aiLimiter,
  uploadLimiter
};
