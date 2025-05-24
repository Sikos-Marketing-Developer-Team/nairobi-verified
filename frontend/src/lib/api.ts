import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { mockApi } from './mockApi';

const MOCK_ENABLED = false;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/signin')) {
        window.location.href = '/auth/signin';
      }
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  auth: {
    login: (email: string, password: string, rememberMe: boolean = false) =>
      MOCK_ENABLED
        ? mockApi.auth.login(email, password, rememberMe)
        : api.post('/api/auth/login', { username: email, password, rememberMe }),
    register: (userData: any, endpoint: string) =>
      MOCK_ENABLED
        ? mockApi.auth.register(userData, endpoint)
        : api.post(endpoint, userData),
    forgotPassword: (email: string) =>
      MOCK_ENABLED
        ? mockApi.auth.forgotPassword(email)
        : api.post('/api/auth/forgot-password', { email }),
    resetPassword: (token: string, password: string) =>
      MOCK_ENABLED
        ? mockApi.auth.resetPassword(token, password)
        : api.post('/api/auth/reset-password', { token, password }),
    logout: () =>
      MOCK_ENABLED
        ? mockApi.auth.logout()
        : api.post('/api/auth/logout'),
    check: () =>
      MOCK_ENABLED
        ? mockApi.auth.check()
        : api.get('/api/auth/check'),
    me: () =>
      MOCK_ENABLED
        ? mockApi.auth.me()
        : api.get('/api/auth/user'),
    verifyEmail: (token: string) =>
      MOCK_ENABLED
        ? mockApi.auth.verifyEmail(token)
        : api.get(`/api/auth/verify-email/${token}`),
  },
  products: {
    getAll: (params?: any) =>
      MOCK_ENABLED
        ? mockApi.products.getAll(params)
        : api.get('/api/products', { params }),
    getById: (id: string) =>
      MOCK_ENABLED
        ? mockApi.products.getById(id)
        : api.get(`/api/products/${id}`),
    getFeatured: () =>
      MOCK_ENABLED
        ? mockApi.products.getFeatured()
        : api.get('/api/products/featured'),
    getByCategory: (categoryId: string, params?: any) =>
      MOCK_ENABLED
        ? mockApi.products.getByCategory(categoryId, params)
        : api.get(`/api/categories/${categoryId}/products`, { params }),
    search: (query: string, params?: any) =>
      MOCK_ENABLED
        ? mockApi.products.search(query, params)
        : api.get('/api/products/search', { params: { query, ...params } }),
  },
  categories: {
    getAll: () =>
      MOCK_ENABLED
        ? mockApi.categories.getAll()
        : api.get('/api/categories'),
    getById: (id: string) =>
      MOCK_ENABLED
        ? mockApi.categories.getById(id)
        : api.get(`/api/categories/${id}`),
    getFeatured: () =>
      MOCK_ENABLED
        ? mockApi.categories.getFeatured()
        : api.get('/api/categories/featured'),
  },
  merchants: {
    getAll: (params?: any) =>
      MOCK_ENABLED
        ? mockApi.merchants.getAll(params)
        : api.get('/api/merchants', { params }),
    getById: (id: string) =>
      MOCK_ENABLED
        ? mockApi.merchants.getById(id)
        : api.get(`/api/merchants/${id}`),
    getFeatured: () =>
      MOCK_ENABLED
        ? mockApi.merchants.getFeatured()
        : api.get('/api/merchants/featured'),
    getProducts: (merchantId: string, params?: any) =>
      MOCK_ENABLED
        ? mockApi.merchants.getProducts(merchantId, params)
        : api.get(`/api/merchants/${merchantId}/products`, { params }),
  },
  cart: {
    getItems: () =>
      MOCK_ENABLED
        ? mockApi.cart.getItems()
        : api.get('/api/cart'),
    addItem: (productId: string, quantity: number = 1) =>
      MOCK_ENABLED
        ? mockApi.cart.addItem(productId, quantity)
        : api.post('/api/cart/items', { productId, quantity }),
    updateItem: (itemId: string, quantity: number) =>
      MOCK_ENABLED
        ? mockApi.cart.updateItem(itemId, quantity)
        : api.put(`/api/cart/items/${itemId}`, { quantity }),
    removeItem: (itemId: string) =>
      MOCK_ENABLED
        ? mockApi.cart.removeItem(itemId)
        : api.delete(`/api/cart/items/${itemId}`),
    clear: () =>
      MOCK_ENABLED
        ? mockApi.cart.clear()
        : api.delete('/api/cart'),
  },
  wishlist: {
    getItems: () =>
      MOCK_ENABLED
        ? mockApi.wishlist.getItems()
        : api.get('/api/wishlist'),
    addItem: (productId: string) =>
      MOCK_ENABLED
        ? mockApi.wishlist.addItem(productId)
        : api.post('/api/wishlist/items', { productId }),
    removeItem: (productId: string) =>
      MOCK_ENABLED
        ? mockApi.wishlist.removeItem(productId)
        : api.delete(`/api/wishlist/items/${productId}`),
    clear: () =>
      MOCK_ENABLED
        ? mockApi.wishlist.clear()
        : api.delete('/api/wishlist'),
  },
  user: {
    getProfile: () =>
      MOCK_ENABLED
        ? mockApi.user.getProfile()
        : api.get('/api/user/profile'),
    updateProfile: (profileData: any) =>
      MOCK_ENABLED
        ? mockApi.user.updateProfile(profileData)
        : api.put('/api/user/profile', profileData),
    changePassword: (currentPassword: string, newPassword: string) =>
      MOCK_ENABLED
        ? mockApi.user.changePassword(currentPassword, newPassword)
        : api.put('/api/user/password', { currentPassword, newPassword }),
    getAddresses: () =>
      MOCK_ENABLED
        ? mockApi.user.getAddresses()
        : api.get('/api/user/addresses'),
    addAddress: (addressData: any) =>
      MOCK_ENABLED
        ? mockApi.user.addAddress(addressData)
        : api.post('/api/user/addresses', addressData),
    updateAddress: (addressId: string, addressData: any) =>
      MOCK_ENABLED
        ? mockApi.user.updateAddress(addressId, addressData)
        : api.put(`/api/user/addresses/${addressId}`, addressData),
    deleteAddress: (addressId: string) =>
      MOCK_ENABLED
        ? mockApi.user.deleteAddress(addressId)
        : api.delete(`/api/user/addresses/${addressId}`),
    getOrders: (params?: any) =>
      MOCK_ENABLED
        ? mockApi.user.getOrders(params)
        : api.get('/api/user/orders', { params }),
    getOrderById: (orderId: string) =>
      MOCK_ENABLED
        ? mockApi.user.getOrderById(orderId)
        : api.get(`/api/user/orders/${orderId}`),
  },
  merchant: {
    getProfile: () =>
      MOCK_ENABLED
        ? mockApi.merchant.getProfile()
        : api.get('/api/merchant/profile'),
    updateProfile: (profileData: any) =>
      MOCK_ENABLED
        ? mockApi.merchant.updateProfile(profileData)
        : api.put('/api/merchant/profile', profileData),
    getProducts: (params?: any) =>
      MOCK_ENABLED
        ? mockApi.merchant.getProducts(params)
        : api.get('/api/merchant/products', { params }),
    addProduct: (productData: any) =>
      MOCK_ENABLED
        ? mockApi.merchant.addProduct(productData)
        : api.post('/api/merchant/products', productData),
    updateProduct: (productId: string, productData: any) =>
      MOCK_ENABLED
        ? mockApi.merchant.updateProduct(productId, productData)
        : api.put(`/api/merchant/products/${productId}`, productData),
    deleteProduct: (productId: string) =>
      MOCK_ENABLED
        ? mockApi.merchant.deleteProduct(productId)
        : api.delete(`/api/merchant/products/${productId}`),
    getOrders: (params?: any) =>
      MOCK_ENABLED
        ? mockApi.merchant.getOrders(params)
        : api.get('/api/merchant/orders', { params }),
    getOrderById: (orderId: string) =>
      MOCK_ENABLED
        ? mockApi.merchant.getOrderById(orderId)
        : api.get(`/api/merchant/orders/${orderId}`),
    updateOrderStatus: (orderId: string, status: string) =>
      MOCK_ENABLED
        ? mockApi.merchant.updateOrderStatus(orderId, status)
        : api.put(`/api/merchant/orders/${orderId}/status`, { status }),
  },
  checkout: {
    createOrder: (orderData: any) =>
      MOCK_ENABLED
        ? mockApi.checkout.createOrder(orderData)
        : api.post('/api/checkout/order', orderData),
    getPaymentMethods: () =>
      MOCK_ENABLED
        ? mockApi.checkout.getPaymentMethods()
        : api.get('/api/checkout/payment-methods'),
    processPayment: (paymentData: any) =>
      MOCK_ENABLED
        ? mockApi.checkout.processPayment(paymentData)
        : api.post('/api/checkout/payment', paymentData),
  },
  admin: {
    getDashboardStats: () =>
      MOCK_ENABLED
        ? mockApi.admin.getDashboardStats()
        : api.get('/api/admin/dashboard'),
    getUsers: (params?: any) =>
      MOCK_ENABLED
        ? mockApi.admin.getUsers(params)
        : api.get('/api/admin/users', { params }),
    updateUser: (userId: string, userData: any) =>
      MOCK_ENABLED
        ? mockApi.admin.updateUser(userId, userData)
        : api.put(`/api/admin/users/${userId}`, userData),
    getPendingVerifications: (params?: any) =>
      MOCK_ENABLED
        ? mockApi.admin.getPendingVerifications(params)
        : api.get('/api/admin/verifications', { params }),
    processMerchantVerification: (merchantId: string, action: string, notes?: string) =>
      MOCK_ENABLED
        ? mockApi.admin.processMerchantVerification(merchantId, action, notes)
        : api.put(`/api/admin/verifications/${merchantId}`, { action, notes }),
    getTransactions: (params?: any) =>
      MOCK_ENABLED
        ? mockApi.admin.getTransactions(params)
        : api.get('/api/admin/transactions', { params }),
  },
};

export default api;