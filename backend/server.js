const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
const compression = require('compression');
const { v4: uuidv4 } = require('uuid');
const { client, webVitalsLCP, webVitalsCLS, webVitalsFID } = require('./utils/metrics');
const merchantDashboardRoutes = require('./routes/merchantDashboard');

// OPTIMIZATION: Increase event loop capacity
require('events').EventEmitter.defaultMaxListeners = 20;

// Load environment variables
dotenv.config();

// OPTIMIZATION: Thread pool size for bcrypt/crypto operations
process.env.UV_THREADPOOL_SIZE = process.env.UV_THREADPOOL_SIZE || '128';
console.log(`🔧 UV_THREADPOOL_SIZE set to: ${process.env.UV_THREADPOOL_SIZE}`);

// Connect to database
if (process.env.NODE_ENV === 'development' && process.env.MOCK_DB === 'true') {
  console.log('Using mock database for development');
} else {
  connectDB();
}

// Passport config
require('./config/passport');

// Initialize express app
const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// OPTIMIZATION: Compression middleware
// app.use(compression({
//   filter: (req, res) => {
//     // Don't compress API responses
//     if (req.path.startsWith('/api/')) {
//       return false;
//     }
//     if (req.headers['x-no-compression']) {
//       return false;
//     }
//     return compression.filter(req, res);
//   },
//   level: 6
// }));

// Debug middleware to log IP information (helpful for troubleshooting rate limiting)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    // Only log auth endpoints to reduce noise
    if (req.path.startsWith('/api/auth')) {
      console.log('\n--- Request IP Debug Info ---');
      console.log('Path:', req.path);
      console.log('Method:', req.method);
      console.log('req.ip:', req.ip);
      console.log('req.ips:', req.ips);
      console.log('X-Forwarded-For:', req.headers['x-forwarded-for']);
      console.log('X-Real-IP:', req.headers['x-real-ip']);
      console.log('Remote Address:', req.connection?.remoteAddress);
      console.log('----------------------------\n');
    }
    next();
  });
}

// OPTIMIZATION: Request tracking for slow requests
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 1000) {
        console.log(`🐌 SLOW REQUEST: ${req.method} ${req.path} - ${duration}ms`);
      }
    });
    next();
  });
}

// Middleware
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// OPTIMIZATION: Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 second timeout
  res.setTimeout(30000);
  next();
});

// Configure CORS with credentials support
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:8080',
    process.env.ADMIN_URL || 'http://localhost:3001',
    'https://nairobi-verified-frontend.onrender.com',
    'http://localhost:3000',
    'https://nairobi-verified-admin.onrender.com/',
    'https://www.nairobiverified.co.ke',
    'https://nairobiverified.co.ke',
    'https://nairobi-verified-1-rmgv.onrender.com/'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['set-cookie']
}));

app.options('*', cors());

app.use((req, res, next) => {
  // Set headers to prevent Cloudflare from caching/modifying responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Cloudflare-CDN-Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-No-Transform', '1');
  
  // Prevent response body modification
  const originalJson = res.json;
  res.json = function(data) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Length', JSON.stringify(data).length.toString());
    return originalJson.call(this, data);
  };
  
  next();
});

// Session configuration
const mongoStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI,
  collectionName: 'sessions',
  ttl: 7 * 24 * 60 * 60,
  autoRemove: 'native',
  touchAfter: 24 * 3600,
  stringify: false,
  crypto: {
    secret: process.env.JWT_SECRET
  },
  writeOperationOptions: {
    upsert: true,
    retryWrites: false
  }
});

mongoStore.on('error', (error) => {
  console.error('Session store error:', error);
});

mongoStore.on('connected', () => {
  console.log('Session store connected to MongoDB');
});

const isProduction = process.env.NODE_ENV === 'production';

// OPTIMIZATION: Optimized session configuration
const sessionConfig = {
  name: 'nairobi_verified_session',
  genid: () => uuidv4(),
  secret: process.env.JWT_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  store: mongoStore,
  rolling: false, // Don't reset session expiry on every request
  cookie: {
    httpOnly: true,
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    domain: isProduction ? '.nairobiverified.co.ke' : undefined
  },
  proxy: true,
  unset: 'destroy'
};

// CRITICAL: Skip session middleware if SKIP_SESSION is enabled (load testing)
if (process.env.SKIP_SESSION === 'true') {
  console.log('⚠️  SESSION DISABLED - Load Testing Mode Active');
  app.use((req, res, next) => {
    req.isAuthenticated = () => false;
    req.login = (user, cb) => cb && cb(null);
    req.logout = (cb) => cb && cb(null);
    req.user = null;
    next();
  });
} else {
  app.use(session(sessionConfig));
  app.use(passport.initialize());
  app.use(passport.session());
}

// OPTIMIZATION: Optimized logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Production: Only log errors and slow requests
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400
  }));
}

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// MONITORING: Endpoint to receive frontend Web Vitals
app.post('/api/metrics/frontend', (req, res) => {
  const { name, value, navigationType } = req.body;
  try {
    if (name === 'LCP') {
      webVitalsLCP.observe({ labels: { navigation_type: navigationType || 'unknown' } }, value / 1000);
    } else if (name === 'CLS') {
      webVitalsCLS.observe({ labels: { navigation_type: navigationType || 'unknown' } }, value);
    } else if (name === 'FID') {
      webVitalsFID.observe({ labels: { navigation_type: navigationType || 'unknown' } }, value / 1000);
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error recording Web Vitals:', error);
    res.status(500).json({ success: false, error: 'Failed to record metrics' });
  }
});

// MONITORING: Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// OPTIMIZATION: Health check with database status
app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    database: 'disconnected',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    }
  };

  try {
    if (mongoose.connection.readyState === 1) {
      health.database = 'connected';
    }
  } catch (error) {
    health.database = 'error';
  }

  const statusCode = health.database === 'connected' ? 200 : 503;
  res.status(statusCode).json(health);
});

// OPTIMIZATION: Performance monitoring endpoint (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/status', (req, res) => {
    const mongoose = require('mongoose');
    res.json({
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      database: {
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        skipSession: process.env.SKIP_SESSION,
        disableRateLimit: process.env.DISABLE_RATE_LIMIT,
        threadPoolSize: process.env.UV_THREADPOOL_SIZE
      }
    });
  });
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth/admin', require('./routes/adminAuth'));
app.use('/api/admin/dashboard', require('./routes/adminDashboard'));
app.use('/api/users', require('./routes/users'));
app.use('/api/merchants', require('./routes/merchants'));
app.use('/api/products', require('./routes/products'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/flash-sales', require('./routes/flashSales'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/merchants/dashboard', merchantDashboardRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// OPTIMIZATION: Improved error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  if (res.headersSent) return next(err);

  let statusCode = 500;
  let message = 'Server Error';

  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern || {})[0];
    message = `${field || 'Field'} already exists`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message)[0] || 'Validation failed';
  } else if (err.message) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    error: message
  });
});

// Define port
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`API status: http://localhost:${PORT}/api/status`);
  console.log(`Metrics endpoint: http://localhost:${PORT}/metrics`);
  
  // Display load testing mode status
  if (process.env.SKIP_SESSION === 'true' || process.env.DISABLE_RATE_LIMIT === 'true') {
    console.log('\n⚠️  ========== LOAD TESTING MODE ========== ⚠️');
    if (process.env.SKIP_SESSION === 'true') {
      console.log('   ✓ Sessions: DISABLED');
    }
    if (process.env.DISABLE_RATE_LIMIT === 'true') {
      console.log('   ✓ Rate Limiting: DISABLED');
    }
    console.log('⚠️  ======================================= ⚠️\n');
  }
});

// OPTIMIZATION: Graceful shutdown improvements
const gracefulShutdown = async () => {
  console.log('\n🛑 Received shutdown signal, closing gracefully...');
  
  server.close(async () => {
    console.log('✅ HTTP server closed');
    
    try {
      // Close database connection
      const { closeDB } = require('./config/db');
      await closeDB();
      console.log('✅ Database connection closed');
      
      console.log('✅ Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// OPTIMIZATION: Better unhandled rejection handler
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Promise Rejection: ${err.message}`);
  console.error(err.stack);
  
  if (process.env.NODE_ENV === 'production') {
    gracefulShutdown();
  }
});

// OPTIMIZATION: Better uncaught exception handler
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  
  // Always exit on uncaught exception
  process.exit(1);
});

module.exports = app;