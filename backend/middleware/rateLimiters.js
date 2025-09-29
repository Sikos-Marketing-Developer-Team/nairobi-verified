// backend/middleware/rateLimiters.js
const rateLimit = require('express-rate-limit');

const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per IP
  message: {
    success: false,
    error: 'Too many login or registration attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // use IP by default (trust proxy must be configured)
    return req.ip;
  },
  handler: (req, res, next, options) => {
    console.warn(`Rate limit exceeded for IP ${req.ip} on ${req.originalUrl}`);
    res.status(options.statusCode || 429).json(options.message);
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip
});

module.exports = { strictAuthLimiter, authLimiter };
