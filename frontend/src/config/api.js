// API Configuration for different environments

const config = {
  development: {
    API_URL: 'http://localhost:5000/api',
    BASE_URL: 'http://localhost:5000'
  },
  production: {
    API_URL: 'https://nairobi-cbd-backend.onrender.com/api',  // Will be updated after backend deployment
    BASE_URL: 'https://nairobi-cbd-backend.onrender.com'
  }
};

const environment = process.env.NODE_ENV || 'development';
export const API_CONFIG = config[environment];

// Default API URL (fallback)
export const API_URL = API_CONFIG.API_URL;
export const BASE_URL = API_CONFIG.BASE_URL;