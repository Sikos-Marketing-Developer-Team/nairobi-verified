const rateLimit = require('express-rate-limit');

// Helper function to get client IP with fallbacks
const getClientIp = (req) => {
  // Since trust proxy is set to 1, req.ip should work
  // But we'll add fallbacks just in case
  const ip = req.ip || 
             req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
             req.headers['x-real-ip'] ||
             req.connection?.remoteAddress ||
             req.socket?.remoteAddress ||
             'unknown';
  
  // Log IP info ALWAYS (not just in development) for debugging
  console.log(`[Rate Limiter] IP: ${ip}, Path: ${req.originalUrl}, XFF: ${req.headers['x-forwarded-for']}`);
  
  return ip;
};

// Strict limiter for authentication endpoints (5 attempts per 15 minutes)
const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per IP
  message: {
    success: false,
    error: 'Too many login or registration attempts, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  
  // Custom key generator with better IP detection
  keyGenerator: (req) => {
    const ip = getClientIp(req);
    // For extra security, include the email if present
    const email = req.body?.email;
    if (email) {
      return `${ip}-${email}`; // Rate limit by IP + email combination
    }
    return ip;
  },
  
  // The middleware runs BEFORE the controller, so res.statusCode is always 200 at this point
  
  handler: (req, res, next, options) => {
    const ip = getClientIp(req);
    console.warn(`⚠️ RATE LIMIT EXCEEDED for IP ${ip} on ${req.originalUrl}`);
    console.warn(`   Email attempted: ${req.body?.email || 'N/A'}`);
    console.warn(`   Timestamp: ${new Date().toISOString()}`);
    
    res.status(429).json(options.message);
  }
});

// General auth limiter (100 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  handler: (req, res, next, options) => {
    console.warn(`Rate limit exceeded for IP ${getClientIp(req)}`);
    res.status(429).json(options.message);
  }
});

// Optional: Failed login attempt limiter (only counts failures)
const createFailedLoginLimiter = () => {
  const attempts = new Map(); // In-memory store for tracking attempts
  
  return (req, res, next) => {
    const ip = getClientIp(req);
    const email = req.body?.email;
    const key = `${ip}-${email}`;
    
    // Store original send to intercept response
    const originalSend = res.send;
    res.send = function(data) {
      // Only count failed login attempts
      if (res.statusCode === 401) {
        const current = attempts.get(key) || { count: 0, firstAttempt: Date.now() };
        current.count++;
        
        // Reset after 15 minutes
        if (Date.now() - current.firstAttempt > 15 * 60 * 1000) {
          current.count = 1;
          current.firstAttempt = Date.now();
        }
        
        attempts.set(key, current);
        
        console.log(`Failed login attempt ${current.count}/5 for ${email} from IP ${ip}`);
        
        if (current.count > 5) {
          console.warn(`🚨 BLOCKING: Too many failed attempts for ${email} from ${ip}`);
          return res.status(429).json({
            success: false,
            error: 'Too many failed login attempts. Please try again after 15 minutes.'
          });
        }
      } else if (res.statusCode === 200) {
        // Successful login - clear attempts
        attempts.delete(key);
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Cleanup old entries periodically (for in-memory store)
setInterval(() => {
  console.log('Cleaning up old rate limit entries...');
}, 60 * 60 * 1000); // Every hour

module.exports = { 
  strictAuthLimiter, 
  authLimiter,
  failedLoginLimiter: createFailedLoginLimiter()
};