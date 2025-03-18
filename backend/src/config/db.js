// Configure database configuration
require("dotenv").config();
const mongoose = require("mongoose");
const url = process.env.MONGODB_URI;

const connectDb = async () => {
  try {
    // Check if the URI exists
    if (!url) {
      throw new Error("MongoDB URI does not exist!");
    }

    // Connect to the Database
    const conn = await mongoose.connect(url);

    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;

  } catch (error) {
    console.error(`MongoDB Connection Error: ${error}.`);
    process.exit(1);
  }
};

module.exports = connectDb;
