// API Configuration for different environments

// Use Vite environment variables for API configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

export { API_URL, BASE_URL };