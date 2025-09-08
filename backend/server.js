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
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const { client, webVitalsLCP, webVitalsCLS, webVitalsFID } = require('./utils/metrics'); // MONITORING: Updated import for Web Vitals

// Load environment variables
dotenv.config();

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
    'http://localhost:3001',
    'http://localhost:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting for sensitive auth routes (relaxed for testing)
const strictAuthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Increased for testing
  message: {
    success: false,
    error: 'Too many login or registration attempts, please try again after 1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development';
  }
});

// Rate limiting for all auth routes (relaxed for testing)
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // Increased for testing
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development';
  }
});

// Session configuration
const mongoStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI,
  collectionName: 'sessions',
  ttl: 7 * 24 * 60 * 60, // 7 days
  autoRemove: 'native', // Automatically remove expired sessions
  touchAfter: 24 * 3600, // lazy session update
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
  genid: (req) => uuidv4(),
  secret: process.env.JWT_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  store: mongoStore,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

// Apply rate limiting to auth routes
app.use('/api/auth/login', strictAuthLimiter);
app.use('/api/auth/register', strictAuthLimiter);
app.use('/api/auth/register/merchant', strictAuthLimiter);
app.use('/api/auth/login/merchant', strictAuthLimiter);
app.use('/api/auth', authLimiter);

// MONITORING: Endpoint to receive frontend Web Vitals
app.post('/api/metrics/frontend', (req, res) => {
  const { name, value, navigationType } = req.body;
  try {
    if (name === 'LCP') {
      webVitalsLCP.observe({ labels: { navigation_type: navigationType || 'unknown' } }, value / 1000); // Convert ms to seconds
    } else if (name === 'CLS') {
      webVitalsCLS.observe({ labels: { navigation_type: navigationType || 'unknown' } }, value);
    } else if (name === 'FID') {
      webVitalsFID.observe({ labels: { navigation_type: navigationType || 'unknown' } }, value / 1000); // Convert ms to seconds
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

// Routes - FIXED: Reordered to prevent conflicts
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

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Check if response was already sent
  if (res.headersSent) {
    return next(err);
  }

  // Handle different types of errors
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(error => error.message);
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
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = app;