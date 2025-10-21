const rateLimit = require('express-rate-limit');

// OPTIMIZATION: Simplified IP detection
const getClientIp = (req) => {
  return req.ip || 
         req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         'unknown';
};

// OPTIMIZATION: Strict limiter for login endpoints only (5 attempts per 15 minutes)
const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Too many login attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // LOAD TESTING: Skip rate limiting if DISABLE_RATE_LIMIT env var is set
    return process.env.DISABLE_RATE_LIMIT === 'true';
  },
  keyGenerator: (req) => {
    const ip = getClientIp(req);
    const email = req.body?.email;
    return email ? `login-${ip}-${email}` : `login-${ip}`;
  },
  handler: (req, res) => {
    const ip = getClientIp(req);
    console.warn(`⚠️ RATE LIMIT: Login blocked for IP ${ip}, email: ${req.body?.email || 'N/A'}`);
    res.status(429).json({
      success: false,
      error: 'Too many login attempts, please try again after 15 minutes'
    });
  }
});

// OPTIMIZATION: Merchant registration limiter (more permissive for legitimate traffic)
const merchantRegisterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Allow 20 registrations per IP per 15 minutes
  message: {
    success: false,
    error: 'Too many registration attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // LOAD TESTING: Skip rate limiting if DISABLE_RATE_LIMIT env var is set
    return process.env.DISABLE_RATE_LIMIT === 'true';
  },
  keyGenerator: (req) => {
    const ip = getClientIp(req);
    return `merchant-register-${ip}`;
  },
  handler: (req, res) => {
    const ip = getClientIp(req);
    console.warn(`⚠️ RATE LIMIT: Merchant registration blocked for IP ${ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many registration attempts from this IP. Please try again after 15 minutes.'
    });
  }
});

// OPTIMIZATION: General auth limiter (100 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.DISABLE_RATE_LIMIT === 'true';
  },
  keyGenerator: getClientIp,
  handler: (req, res) => {
    console.warn(`⚠️ RATE LIMIT: General auth blocked for IP ${getClientIp(req)}`);
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again after 15 minutes'
    });
  }
});

// OPTIMIZATION: Failed login tracking (only counts actual failures)
const failedLoginLimiter = () => {
  const attempts = new Map();
  
  // Cleanup old entries every hour
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of attempts.entries()) {
      if (now - data.firstAttempt > 15 * 60 * 1000) {
        attempts.delete(key);
      }
    }
  }, 60 * 60 * 1000);
  
  return (req, res, next) => {
    // Skip if rate limiting is disabled
    if (process.env.DISABLE_RATE_LIMIT === 'true') {
      return next();
    }

    const ip = getClientIp(req);
    const email = req.body?.email;
    const key = `${ip}-${email}`;
    
    const originalJson = res.json;
    res.json = function(data) {
      // Only track failed login attempts (401 status)
      if (res.statusCode === 401 && email) {
        const current = attempts.get(key) || { count: 0, firstAttempt: Date.now() };
        
        // Reset if window expired
        if (Date.now() - current.firstAttempt > 15 * 60 * 1000) {
          current.count = 1;
          current.firstAttempt = Date.now();
        } else {
          current.count++;
        }
        
        attempts.set(key, current);
        
        console.log(`Failed login ${current.count}/10 for ${email} from IP ${ip}`);
        
        // Block after 10 failed attempts
        if (current.count >= 10) {
          console.warn(`🚨 BLOCKING: Too many failed attempts for ${email} from ${ip}`);
          res.status(429);
          return originalJson.call(this, {
            success: false,
            error: 'Too many failed login attempts. Please try again after 15 minutes.'
          });
        }
      } else if (res.statusCode === 200 && email) {
        // Successful login - clear attempts
        attempts.delete(key);
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

const merchantCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 200, // 200 merchant creations per hour per admin
  message: {
    success: false,
    error: 'Merchant creation limit reached. Please wait before adding more merchants.'
  },
  keyGenerator: (req) => {
    // Rate limit per admin user ID
    return `merchant-create:${req.user?.id || req.ip}`;
  },
  skip: (req) => {
    // Skip for super admins or in development
    return process.env.NODE_ENV === 'development' || req.user?.role === 'super_admin';
  }
});

const bulkUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 bulk uploads per hour (assuming 50+ merchants per upload)
  message: {
    success: false,
    error: 'Bulk upload limit reached. Please wait before uploading another batch.'
  },
  keyGenerator: (req) => {
    return `bulk-upload:${req.user?.id || req.ip}`;
  },
  skip: (req) => {
    return process.env.NODE_ENV === 'development' || req.user?.role === 'super_admin';
  }
});

module.exports = { 
  strictAuthLimiter, 
  merchantRegisterLimiter,
  authLimiter,
  merchantCreationLimiter,
  bulkUploadLimiter,
  failedLoginLimiter: failedLoginLimiter()
};