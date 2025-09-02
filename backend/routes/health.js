const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Basic health check
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'HomeEase API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database health check
router.get('/db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected', 
      2: 'connecting',
      3: 'disconnecting'
    };

    if (dbState === 1) {
      // Test database with a simple query
      await mongoose.connection.db.admin().ping();
      
      res.status(200).json({
        status: 'OK',
        database: {
          state: states[dbState],
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'ERROR',
        database: {
          state: states[dbState],
          message: 'Database not connected'
        },
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      database: {
        state: 'error',
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// System health check
router.get('/system', (req, res) => {
  const memUsage = process.memoryUsage();
  
  res.status(200).json({
    status: 'OK',
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
      },
      cpu: process.cpuUsage()
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
