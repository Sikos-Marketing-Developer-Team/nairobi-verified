const mongoose = require('mongoose');
const { dbConnectionGauge } = require('../utils/metrics');

const connectDB = async () => {
  try {
    // OPTIMIZATION: Enhanced connection pool settings for high concurrency
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Removed deprecated options (useNewUrlParser, useUnifiedTopology are default in Mongoose 6+)
      
      // Connection pool optimization
      minPoolSize: 10,           // Increased from 5 for better concurrent handling
      maxPoolSize: 100,          // Increased from 50 for load testing
      
      // Timeout optimizations
      serverSelectionTimeoutMS: 10000,  // Increased from 5000
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      
      // Performance optimizations
      maxIdleTimeMS: 60000,      // Close idle connections after 1 minute
      waitQueueTimeoutMS: 10000, // Wait up to 10 seconds for connection from pool
      
      // Retry logic
      retryWrites: true,
      retryReads: true,
      
      // Compression for better network performance
      compressors: 'snappy,zlib',
      
      // Read/Write concerns for better performance
      w: 1,                      // Acknowledge writes from primary only (faster)
      readPreference: 'primaryPreferred', // Read from primary or secondary
      
      // Other optimizations
      autoIndex: process.env.NODE_ENV !== 'production', // Disable auto-indexing in production
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Connection Pool: min=${10}, max=${100}`);
    
    // Monitor connection pool stats in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        const state = mongoose.connection.readyState;
        const stateMap = {
          0: 'disconnected',
          1: 'connected',
          2: 'connecting',
          3: 'disconnecting'
        };
        console.log(`📊 MongoDB State: ${stateMap[state] || 'unknown'}`);
      }, 60000); // Log every minute in dev
    }

    dbConnectionGauge.set(1);

    // Connection event handlers for monitoring
    mongoose.connection.on('disconnected', () => {
      console.error('MongoDB disconnected');
      dbConnectionGauge.set(0);
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
      dbConnectionGauge.set(0);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
      dbConnectionGauge.set(1);
    });

  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    dbConnectionGauge.set(0);
    
    // Retry connection after 5 seconds
    console.log('⏳ Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// OPTIMIZATION: Graceful shutdown handler
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed gracefully');
    dbConnectionGauge.set(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};

module.exports = connectDB;
module.exports.closeDB = closeDB;