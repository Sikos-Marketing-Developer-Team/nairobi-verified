import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Log detailed error information
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    const { response } = error;
    
    // Handle specific error cases
    if (response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      Cookies.remove('auth_token');
      Cookies.remove('user_info');
      
      // Show error message
      toast.error('Your session has expired. Please log in again.');
      
      // Redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/signin')) {
        window.location.href = '/auth/signin';
      }
    } else if (response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (response?.status === 404) {
      toast.error('The requested resource was not found.');
    } else if (response?.status === 422) {
      // Handle validation errors
      const errorData = response.data as { errors?: Array<{ message: string }> };
      const errors = errorData.errors || [];
      if (Array.isArray(errors)) {
        errors.forEach(err => toast.error(err.message));
      } else {
        toast.error('Please check your input and try again.');
      }
    } else if (response?.status === 429) {
      toast.error('Too many requests. Please try again later.');
    } else if (response?.status && response.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.message === 'Network Error') {
      toast.error('Network error. Please check your internet connection.');
    } else {
      const errorData = response?.data as { message?: string };
      toast.error(errorData?.message || 'An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

export const apiService = {
  // System endpoints
  system: {
    healthCheck: () => api.get('/health'),
  },
  
  // Auth endpoints
  auth: {
    login: (email: string, password: string, rememberMe: boolean = false) =>
      api.post('/auth/login', { email, password, rememberMe }),
    
    register: (userData: any) =>
      api.post('/auth/register', userData),
    
    forgotPassword: (email: string) =>
      api.post('/auth/forgot-password', { email }),
    
    resetPassword: (token: string, password: string) =>
      api.post('/auth/reset-password', { token, password }),
    
    validateResetToken: (token: string) => 
      api.post('/auth/validate-reset-token', { token }),
    
    logout: () =>
      api.post('/auth/logout'),
    
    check: () =>
      api.get('/auth/check'),
    
    me: () =>
      api.get('/auth/me'),
    
    verifyEmail: (token: string) =>
      api.get(`/auth/verify-email/${token}`),
  },

  // Product endpoints
  products: {
    getAll: (params?: any) =>
      api.get('/products', { params }),
    getById: (id: string) =>
      api.get(`/products/${id}`),
    getFeatured: () =>
      api.get('/products/featured'),
    getByCategory: (categoryId: string, params?: any) =>
      api.get(`/categories/${categoryId}/products`, { params }),
    search: (query: string, params?: any) =>
      api.get('/products/search', { params: { query, ...params } }),
    create: (data: any) => api.post('/products', data),
    update: (id: string, data: any) => api.put(`/products/${id}`, data),
    delete: (id: string) => api.delete(`/products/${id}`),
  },

  // Category endpoints
  categories: {
    getAll: () =>
      api.get('/categories'),
    getById: (id: string) =>
      api.get(`/categories/${id}`),
    getFeatured: () =>
      api.get('/categories/featured'),
  },

  // Merchant endpoints
  merchants: {
    getAll: (params?: any) =>
      api.get('/merchants', { params }),
    getById: (id: string) =>
      api.get(`/merchants/${id}`),
    getFeatured: () =>
      api.get('/merchants/featured'),
    getProducts: (merchantId: string, params?: any) =>
      api.get(`/merchants/${merchantId}/products`, { params }),
    create: (data: any) => api.post('/merchants', data),
    update: (id: string, data: any) => api.put(`/merchants/${id}`, data),
    delete: (id: string) => api.delete(`/merchants/${id}`),
  },

  // Cart endpoints
  cart: {
    getItems: () =>
      api.get('/cart'),
    addItem: (productId: string, quantity: number = 1) =>
      api.post('/cart/items', { productId, quantity }),
    updateItem: (itemId: string, quantity: number) =>
      api.put(`/cart/items/${itemId}`, { quantity }),
    removeItem: (itemId: string) =>
      api.delete(`/cart/items/${itemId}`),
    clear: () =>
      api.delete('/cart'),
  },

  // Wishlist endpoints
  wishlist: {
    getItems: () =>
      api.get('/wishlist'),
    addItem: (productId: string) =>
      api.post('/wishlist/items', { productId }),
    removeItem: (itemId: string) =>
      api.delete(`/wishlist/items/${itemId}`),
    clear: () =>
      api.delete('/wishlist'),
  },

  // Media endpoints
  media: {
    upload: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    delete: (id: string) =>
      api.delete(`/media/${id}`),
    get: (id: string) =>
      api.get(`/media/${id}`),
  },
};