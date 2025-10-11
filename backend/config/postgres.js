const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_V3AQvn8fFmYt@ep-orange-mode-admqbf5t-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require', {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log, // Set to false in production
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to PostgreSQL database:', error);
  }
};

module.exports = { sequelize, testConnection };