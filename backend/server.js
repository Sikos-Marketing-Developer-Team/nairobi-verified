const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { testConnection } = require('./config/postgres');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const { client, webVitalsLCP, webVitalsCLS, webVitalsFID } = require('./utils/metrics');
const merchantDashboardRoutes = require('./routes/merchantDashboard');


// Load environment variables
dotenv.config();

// Connect to database
if (process.env.NODE_ENV === 'development' && process.env.MOCK_DB === 'true') {
  console.log('Using mock database for development');
} else {
  connectDB();
  // Also test PostgreSQL connection
  testConnection();
}

// Passport config
require('./config/passport');

// Initialize express app
const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

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

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure CORS with credentials support
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:8080',
    process.env.ADMIN_URL || 'http://localhost:3001',
    'https://nairobi-verified-frontend.onrender.com',
    'https://nairobi-verified.onrender.com',
    'http://localhost:3000',
    'https://nairobi-verified-frontend1-6f8g.onrender.com',
    'https://nairobi-verified-1-rmgv.onrender.com',
    'https://nairobi-verified-admin.onrender.com/'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));


// Session configuration
const mongoStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI,
  collectionName: 'sessions',
  ttl: 7 * 24 * 60 * 60,
  autoRemove: 'native',
  touchAfter: 24 * 3600,
  stringify: false,
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

app.use(session({
  name: 'nairobi_verified_session',
  genid: () => uuidv4(),
  secret: process.env.JWT_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  store: mongoStore,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Logging middleware in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
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



// auth routes
app.use('/api/auth', require('./routes/auth'));

// Other routes
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
app.use('/api', require('./routes/documents'));


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (res.headersSent) return next(err);

  let error = { ...err };
  error.message = err.message;

  if (err.name === 'CastError') {
    error = { message: 'Resource not found', statusCode: 404 };
  }

  if (err.code === 11000) {
    error = { message: 'Duplicate field value entered', statusCode: 400 };
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message);
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Define port
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`API status: http://localhost:${PORT}/api/status`);
  console.log(`Metrics endpoint: http://localhost:${PORT}/metrics`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Unhandled Promise Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = app;