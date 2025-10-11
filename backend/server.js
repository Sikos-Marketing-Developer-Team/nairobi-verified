const express = require('express');
const dotenv = require('dotenv');
const { testConnection } = require('./config/postgres');

dotenv.config();

// Connect to PostgreSQL
testConnection();

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Nairobi Verified API - PostgreSQL Ready' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', database: 'PostgreSQL' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
