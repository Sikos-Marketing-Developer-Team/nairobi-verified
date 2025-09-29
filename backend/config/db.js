const mongoose = require('mongoose');
const { dbConnectionGauge } = require('../utils/metrics'); // MONITORING

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      minPoolSize: 5, // Minimum connection pool size
      maxPoolSize: 50, // Maximum connection pool size for scalability
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Socket timeout
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    dbConnectionGauge.set(1); // MONITORING: Set connected
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    dbConnectionGauge.set(0); // MONITORING: Set disconnected
    setTimeout(connectDB, 5000); // Retry connection after 5 seconds
  }
};

module.exports = connectDB;