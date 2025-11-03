const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// @desc    Health check endpoint
// @route   GET /api/health
// @access  Public
router.get('/', async (req, res) => {
  try {
    const healthCheck = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    };

    // Check database connection
    if (mongoose.connection.readyState === 1) {
      healthCheck.database = 'Connected';
      healthCheck.databaseName = mongoose.connection.name;
    } else {
      healthCheck.database = 'Disconnected';
      healthCheck.status = 'DEGRADED';
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    healthCheck.memory = {
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`
    };

    // System info
    healthCheck.system = {
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid
    };

    const statusCode = healthCheck.status === 'UP' ? 200 : 503;
    res.status(statusCode).json({
      success: true,
      data: healthCheck
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'DOWN',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// @desc    Readiness check
// @route   GET /api/health/ready
// @access  Public
router.get('/ready', async (req, res) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;
    
    if (isDbReady) {
      res.status(200).json({
        success: true,
        status: 'READY',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        success: false,
        status: 'NOT_READY',
        reason: 'Database not connected',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'NOT_READY',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// @desc    Liveness check
// @route   GET /api/health/live
// @access  Public
router.get('/live', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ALIVE',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

module.exports = router;