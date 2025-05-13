import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const { response } = error;
    
    // Handle authentication errors
    if (response?.status === 401) {
      // Clear auth cookies
      Cookies.remove('auth_token');
      Cookies.remove('user_info');
      
      // Redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/signin')) {
        window.location.href = '/auth/signin';
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints organized by resource
export const apiService = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) => 
      api.post('/api/auth/login', { email, password }),
    
    register: (userData: any) => 
      api.post('/api/auth/register', userData),
    
    forgotPassword: (email: string) => 
      api.post('/api/auth/forgot-password', { email }),
    
    resetPassword: (token: string, password: string) => 
      api.post('/api/auth/reset-password', { token, password }),
    
    validateResetToken: (token: string) => 
      api.post('/api/auth/validate-reset-token', { token }),
    
    logout: () => 
      api.post('/api/auth/logout'),
    
    me: () => 
      api.get('/api/auth/me'),
  },
  
  // Products endpoints
  products: {
    getAll: (params?: any) => 
      api.get('/api/products', { params }),
    
    getById: (id: string) => 
      api.get(`/api/products/${id}`),
    
    getFeatured: () => 
      api.get('/api/products/featured'),
    
    getByCategory: (categoryId: string, params?: any) => 
      api.get(`/api/categories/${categoryId}/products`, { params }),
    
    search: (query: string, params?: any) => 
      api.get('/api/products/search', { params: { query, ...params } }),
  },
  
  // Categories endpoints
  categories: {
    getAll: () => 
      api.get('/api/categories'),
    
    getById: (id: string) => 
      api.get(`/api/categories/${id}`),
    
    getFeatured: () => 
      api.get('/api/categories/featured'),
  },
  
  // Merchants endpoints
  merchants: {
    getAll: (params?: any) => 
      api.get('/api/merchants', { params }),
    
    getById: (id: string) => 
      api.get(`/api/merchants/${id}`),
    
    getFeatured: () => 
      api.get('/api/merchants/featured'),
    
    getProducts: (merchantId: string, params?: any) => 
      api.get(`/api/merchants/${merchantId}/products`, { params }),
  },
  
  // Cart endpoints
  cart: {
    getItems: () => 
      api.get('/api/cart'),
    
    addItem: (productId: string, quantity: number = 1) => 
      api.post('/api/cart/items', { productId, quantity }),
    
    updateItem: (itemId: string, quantity: number) => 
      api.put(`/api/cart/items/${itemId}`, { quantity }),
    
    removeItem: (itemId: string) => 
      api.delete(`/api/cart/items/${itemId}`),
    
    clear: () => 
      api.delete('/api/cart'),
  },
  
  // Wishlist endpoints
  wishlist: {
    getItems: () => 
      api.get('/api/wishlist'),
    
    addItem: (productId: string) => 
      api.post('/api/wishlist/items', { productId }),
    
    removeItem: (productId: string) => 
      api.delete(`/api/wishlist/items/${productId}`),
    
    clear: () => 
      api.delete('/api/wishlist'),
  },
  
  // User profile endpoints
  user: {
    getProfile: () => 
      api.get('/api/user/profile'),
    
    updateProfile: (profileData: any) => 
      api.put('/api/user/profile', profileData),
    
    changePassword: (currentPassword: string, newPassword: string) => 
      api.put('/api/user/password', { currentPassword, newPassword }),
    
    getAddresses: () => 
      api.get('/api/user/addresses'),
    
    addAddress: (addressData: any) => 
      api.post('/api/user/addresses', addressData),
    
    updateAddress: (addressId: string, addressData: any) => 
      api.put(`/api/user/addresses/${addressId}`, addressData),
    
    deleteAddress: (addressId: string) => 
      api.delete(`/api/user/addresses/${addressId}`),
    
    getOrders: (params?: any) => 
      api.get('/api/user/orders', { params }),
    
    getOrderById: (orderId: string) => 
      api.get(`/api/user/orders/${orderId}`),
  },
  
  // Merchant profile endpoints
  merchant: {
    getProfile: () => 
      api.get('/api/merchant/profile'),
    
    updateProfile: (profileData: any) => 
      api.put('/api/merchant/profile', profileData),
    
    getProducts: (params?: any) => 
      api.get('/api/merchant/products', { params }),
    
    addProduct: (productData: any) => 
      api.post('/api/merchant/products', productData),
    
    updateProduct: (productId: string, productData: any) => 
      api.put(`/api/merchant/products/${productId}`, productData),
    
    deleteProduct: (productId: string) => 
      api.delete(`/api/merchant/products/${productId}`),
    
    getOrders: (params?: any) => 
      api.get('/api/merchant/orders', { params }),
    
    getOrderById: (orderId: string) => 
      api.get(`/api/merchant/orders/${orderId}`),
    
    updateOrderStatus: (orderId: string, status: string) => 
      api.put(`/api/merchant/orders/${orderId}/status`, { status }),
  },
  
  // Checkout endpoints
  checkout: {
    createOrder: (orderData: any) => 
      api.post('/api/checkout/order', orderData),
    
    getPaymentMethods: () => 
      api.get('/api/checkout/payment-methods'),
    
    processPayment: (paymentData: any) => 
      api.post('/api/checkout/payment', paymentData),
  },
  
  // Admin endpoints
  admin: {
    getDashboardStats: () => 
      api.get('/api/admin/dashboard'),
    
    getUsers: (params?: any) => 
      api.get('/api/admin/users', { params }),
    
    updateUser: (userId: string, userData: any) => 
      api.put(`/api/admin/users/${userId}`, userData),
    
    getPendingVerifications: (params?: any) => 
      api.get('/api/admin/verifications', { params }),
    
    processMerchantVerification: (merchantId: string, action: string, notes?: string) => 
      api.put(`/api/admin/verifications/${merchantId}`, { action, notes }),
    
    getTransactions: (params?: any) => 
      api.get('/api/admin/transactions', { params }),
  },
};

export default api;