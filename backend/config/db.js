const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log,
  pool: {
    max: 10,
    min: 1,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected successfully.');

    // Sync models to ensure schema is up-to-date (safe for dev; consider migrations for prod)
    await sequelize.sync();
    console.log('Sequelize models synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    // Avoid hard exit to allow platform restarts/health checks to handle retries
    // process.exit(1);
  }
};

module.exports = { sequelize, connectDB };