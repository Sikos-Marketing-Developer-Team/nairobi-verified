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

// Middleware
app.use(cookieParser());
app.use(express.json());

// Configure CORS with credentials support
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3001',
    'https://nairobi-verified-frontend.onrender.com',
    'https://nairobi-verified.onrender.com',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080'
  ],
  credentials: true
}));

// Rate limiting for sensitive auth routes
const strictAuthLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: {
    success: false,
    error: 'Too many login or registration attempts, please try again after 5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for all auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
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

app.use(session({
  name: 'sid',
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

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Nairobi Verified Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth/admin', require('./routes/adminAuth'));
app.use('/api/admin', require('./routes/admin'));
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Check if response was already sent
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

// Define port
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});