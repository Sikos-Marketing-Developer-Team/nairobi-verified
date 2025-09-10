const mongoose = require('mongoose');
const { dbConnectionGauge } = require('../utils/metrics'); // MONITORING

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    dbConnectionGauge.set(1); // MONITORING: Set connected
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    dbConnectionGauge.set(0); // MONITORING: Set disconnected
    process.exit(1);
  }
};

module.exports = connectDB;