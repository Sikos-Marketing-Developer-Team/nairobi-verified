const Redis = require('ioredis');
const { redisConnectionGauge } = require('../utils/metrics');

let redisClient = null;

const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
    
    if (!redisUrl) {
      console.warn('⚠️  No REDIS_URL found, sessions will use MongoDB fallback');
      return null;
    }

    // Parse Redis URL
    const redisOptions = {
      // Upstash requires TLS
      tls: redisUrl.startsWith('rediss://') ? {} : undefined,
      
      // Connection options
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      
      // Keep-alive
      keepAlive: 30000,
      
      // Timeouts
      connectTimeout: 10000,
      
      // Reconnect on error
      reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
      
      // Lazy connect (don't block startup)
      lazyConnect: true,
      
      // Enable offline queue
      enableOfflineQueue: true,
      
      // Show friendly error names
      showFriendlyErrorStack: process.env.NODE_ENV === 'development'
    };

    redisClient = new Redis(redisUrl, redisOptions);

    // Connect
    await redisClient.connect();

    console.log('✅ Redis Connected:', redisClient.options.host || 'Upstash');
    console.log('🔒 TLS Enabled:', !!redisOptions.tls);
    redisConnectionGauge.set(1);

    // Event handlers
    redisClient.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
      redisConnectionGauge.set(0);
    });

    redisClient.on('connect', () => {
      console.log('🔄 Redis connecting...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis ready');
      redisConnectionGauge.set(1);
    });

    redisClient.on('close', () => {
      console.warn('⚠️  Redis connection closed');
      redisConnectionGauge.set(0);
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });

    // Test connection
    await redisClient.ping();
    console.log('✅ Redis PING successful');

    // Log stats in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(async () => {
        try {
          const info = await redisClient.info('stats');
          const totalCommands = info.match(/total_commands_processed:(\d+)/)?.[1] || 0;
          console.log(`📊 Redis Commands Processed: ${totalCommands}`);
        } catch (err) {
          console.error('Redis info error:', err.message);
        }
      }, 60000); // Every minute
    }

    return redisClient;

  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    console.log('⚠️  Falling back to MongoDB sessions');
    redisConnectionGauge.set(0);
    return null;
  }
};

const getRedisClient = () => redisClient;

const closeRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('✅ Redis connection closed gracefully');
      redisConnectionGauge.set(0);
    } catch (error) {
      console.error('❌ Error closing Redis:', error.message);
    }
  }
};

module.exports = { connectRedis, getRedisClient, closeRedis };