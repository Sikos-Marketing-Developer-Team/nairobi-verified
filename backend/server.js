const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const cookieParser = require('cookie-parser');
const { testConnection, sequelize } = require('./config/postgres');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

// Connect to PostgreSQL
testConnection();
console.log('🚀 Server configured to use PostgreSQL database');

// Passport config
require('./config/passport');

const app = express();

// Middleware
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// CORS configuration - CRITICAL for frontend communication
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

// Session configuration with PostgreSQL store
const sessionStore = new SequelizeStore({
  db: sequelize,
  table: 'sessions',
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 7 * 24 * 60 * 60 * 1000
});

sessionStore.sync();

app.use(session({
  name: 'nairobi_verified_session',
  genid: () => uuidv4(),
  secret: process.env.JWT_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes - ESSENTIAL for frontend functionality
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/merchants', require('./routes/merchants'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/flash-sales', require('./routes/flashSales'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api', require('./routes/documents'));

// Admin routes
app.use('/api/auth/admin', require('./routes/adminAuth'));
app.use('/api/admin/dashboard', require('./routes/adminDashboard'));
app.use('/api/admin/dashboard', require('./routes/adminDocuments'));

// Test route
app.use('/api/test', require('./routes/test'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    database: 'PostgreSQL',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Nairobi Verified API - PostgreSQL Ready',
    version: '1.0.0',
    database: 'PostgreSQL',
    endpoints: [
      '/api/auth',
      '/api/users', 
      '/api/merchants',
      '/api/products',
      '/health'
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
  console.log(`🔗 API documentation at http://localhost:${PORT}/`);
});
