import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for sending/receiving cookies with CORS
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
// Auth API - Updated with proper reset password flow
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  registerMerchant: (merchantData: any) => api.post('/auth/register/merchant', merchantData),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  loginMerchant: (email: string, password: string) => api.post('/auth/login/merchant', { email, password }),
  getMe: () => api.get('/auth/me'),
  logout: () => api.get('/auth/logout'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  
  // Fixed reset password endpoints
  resetPassword: (token: string, password: string) => 
    api.post(`/auth/reset-password/${token}`, { password }),
  
  validateResetToken: (token: string) => 
    api.get(`/auth/validate-reset-token/${token}`),
    
  updateProfile: (userData: any) => api.put('/users/me', userData)
};
// Users API
export const usersAPI = {
  getUsers: () => api.get('/users'),
  getUser: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, userData: any) => api.put(`/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  updatePassword: (id: string, passwordData: any) => api.put(`/users/${id}/password`, passwordData)
};

// Merchants API
export const merchantsAPI = {
  getMerchants: (params = {}) => api.get('/merchants', { params }),
  searchMerchants: (searchTerm: string, category?: string) => api.get('/merchants', { 
    params: { 
      search: searchTerm,
      category: category !== 'All' ? category : undefined
    } 
  }),
  getMerchant: (id: string) => api.get(`/merchants/${id}`),
  updateMerchant: (id: string, merchantData: any) => api.put(`/merchants/${id}`, merchantData),
  deleteMerchant: (id: string) => api.delete(`/merchants/${id}`),
  uploadLogo: (id: string, logoFile: File) => {
    const formData = new FormData();
    formData.append('logo', logoFile);
    return api.put(`/merchants/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadBanner: (id: string, bannerFile: File) => {
    const formData = new FormData();
    formData.append('banner', bannerFile);
    return api.put(`/merchants/${id}/banner`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadGallery: (id: string, galleryFiles: File[]) => {
    const formData = new FormData();
    galleryFiles.forEach(file => {
      formData.append('gallery', file);
    });
    return api.put(`/merchants/${id}/gallery`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadDocuments: (id: string, documents: Record<string, File | File[]>) => {
    const formData = new FormData();
    Object.entries(documents).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(file => {
          formData.append(key, file);
        });
      } else {
        formData.append(key, value);
      }
    });
    return api.put(`/merchants/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  verifyMerchant: (id: string) => api.put(`/merchants/${id}/verify`)
};

// Reviews API
export const reviewsAPI = {
  getReviews: (merchantId: string) => api.get(`/merchants/${merchantId}/reviews`),
  getReview: (id: string) => api.get(`/reviews/${id}`),
  addReview: (merchantId: string, reviewData: any) => api.post(`/merchants/${merchantId}/reviews`, reviewData),
  updateReview: (id: string, reviewData: any) => api.put(`/reviews/${id}`, reviewData),
  deleteReview: (id: string) => api.delete(`/reviews/${id}`),
  addReply: (id: string, replyData: any) => api.post(`/reviews/${id}/reply`, replyData),
  markHelpful: (id: string) => api.put(`/reviews/${id}/helpful`)
};

// Favorites API
export const favoritesAPI = {
  getFavorites: () => api.get('/favorites'),
  addFavorite: (merchantId: string) => api.post(`/favorites/${merchantId}`),
  removeFavorite: (merchantId: string) => api.delete(`/favorites/${merchantId}`)
};

// Orders API
export const ordersAPI = {
  getOrders: () => api.get('/orders'),
  getOrder: (id: string) => api.get(`/orders/${id}`),
};

// Addresses API
export const addressesAPI = {
  getAddresses: () => api.get('/addresses'),
  addAddress: (addressData: any) => api.post('/addresses', addressData),
  updateAddress: (id: string, addressData: any) => api.put(`/addresses/${id}`, addressData),
  deleteAddress: (id: string) => api.delete(`/addresses/${id}`),
};

// Settings API
export const settingsAPI = {
  getSettings: () => api.get('/settings/me'),
  updateSettings: (id: string, settingsData: any) => api.put(`/settings/${id}`, settingsData),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (productId: string, quantity: number) => api.post('/cart/items', { productId, quantity }),
  updateCartItem: (itemId: string, quantity: number) => api.put(`/cart/items/${itemId}`, { quantity }),
  removeCartItem: (itemId: string) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart/items'),
  applyPromoCode: (code: string) => api.post('/cart/promo', { code }),
  removePromoCode: () => api.delete('/cart/promo'),
};

// User API
export const userAPI = {
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData: any) => api.put('/users/me', userData),
  changePassword: (currentPassword: string, newPassword: string) => api.post('/users/change-password', { currentPassword, newPassword }),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (addressData: any) => api.post('/users/addresses', addressData),
  updateAddress: (addressId: string, addressData: any) => api.put(`/users/addresses/${addressId}`, addressData),
  deleteAddress: (addressId: string) => api.delete(`/users/addresses/${addressId}`),
  getWishlist: () => api.get('/users/wishlist'),
  addToWishlist: (productId: string) => api.post('/users/wishlist', { productId }),
  removeFromWishlist: (productId: string) => api.delete(`/users/wishlist/${productId}`),
};

// Admin API
export const adminAPI = {
  // Auth methods
  login: (email: string, password: string) => api.post('/auth/admin/login', { email, password }),
  logout: () => api.post('/auth/admin/logout'),
  checkAuth: () => api.get('/auth/admin/me'),
  
  // Dashboard methods
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getRecentActivity: (limit?: number) => api.get('/admin/dashboard/recent-activity', { params: { limit } }),
  getPendingVerifications: () => api.get('/admin/verifications/pending'),
  
  // User management
  getUsers: (params?: any) => api.get('/admin/dashboard/users', { params }),
  getUser: (userId: string) => api.get(`/admin/users/${userId}`),
  createUser: (userData: any) => api.post('/admin/dashboard/users', userData),
  updateUser: (userId: string, userData: any) => api.put(`/admin/users/${userId}`, userData),
  updateUserStatus: (userId: string, isActive: boolean) => api.put(`/admin/users/${userId}/status`, { isActive }),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  
  // Merchant management
  getMerchants: (params?: any) => api.get('/admin/dashboard/merchants', { params }),
  getMerchant: (merchantId: string) => api.get(`/admin/merchants/${merchantId}`),
  updateMerchant: (merchantId: string, merchantData: any) => api.put(`/admin/merchants/${merchantId}`, merchantData),
  deleteMerchant: (merchantIds: string[]) => api.delete('/admin/dashboard/merchants/:merchantId', { data: { merchantIds } }),
  verifyMerchant: (merchantId: string) => api.put(`/admin/merchants/${merchantId}/verify`),
  rejectMerchant: (merchantId: string, reason: string) => api.post(`/admin/merchants/${merchantId}/reject`, { reason }),
  updateMerchantStatus: (merchantIdOrIds: string | string[], isActive: boolean) => {
    const endpoint = Array.isArray(merchantIdOrIds) 
      ? '/admin/dashboard/merchants/bulk-status' 
      : `/admin/dashboard/merchants/${merchantIdOrIds}/status`;
    return api.put(endpoint, { isActive, merchantIds: Array.isArray(merchantIdOrIds) ? merchantIdOrIds : undefined });
  },
  createMerchant: (merchantData: any) => api.post('/admin/dashboard/merchants', merchantData),
  
  // Document management
  getMerchantDocuments: (merchantId: string) => api.get(`/admin/dashboard/merchants/${merchantId}/documents`),
  viewMerchantDocument: (merchantId: string, docType: string) => {
    return api.get(`/admin/dashboard/merchants/${merchantId}/documents/${docType}/view`, {
      responseType: 'blob' // Important for file downloads
    });
  },
  
  // Product management
  getProducts: (params?: any) => api.get('/admin/dashboard/products', { params }),
  createProduct: (productData: any) => api.post('/admin/dashboard/products', productData),
  updateProduct: (productId: string, productData: any) => api.put(`/admin/dashboard/products/${productId}`, productData),
  deleteProduct: (productId: string) => api.delete(`/admin/dashboard/products/${productId}`),
  
  // Review management
  getReviews: (params?: any) => api.get('/admin/dashboard/reviews', { params }),
  deleteReview: (reviewId: string) => api.delete(`/admin/dashboard/reviews/${reviewId}`),
  
  // Analytics
  getAnalytics: (params?: any) => api.get('/admin/dashboard/analytics', { params }),
  
  // Flash Sales management
  getFlashSales: (params?: any) => api.get('/admin/dashboard/flash-sales', { params }),
  getFlashSalesAnalytics: () => api.get('/admin/dashboard/flash-sales/analytics'),
  createFlashSale: (flashSaleData: any) => api.post('/admin/dashboard/flash-sales', flashSaleData),
  updateFlashSale: (flashSaleId: string, flashSaleData: any) => api.put(`/admin/dashboard/flash-sales/${flashSaleId}`, flashSaleData),
  deleteFlashSale: (flashSaleId: string) => api.delete(`/admin/dashboard/flash-sales/${flashSaleId}`),
  toggleFlashSaleStatus: (flashSaleId: string) => api.patch(`/admin/dashboard/flash-sales/${flashSaleId}/toggle`),
  
  // Export functions
  exportUsers: () => api.get('/admin/dashboard/export/users', { responseType: 'blob' }),
  exportMerchants: () => api.get('/admin/dashboard/export/merchants', { responseType: 'blob' }),
  exportAnalytics: (type: string) => api.get(`/admin/dashboard/export/${type}`, { responseType: 'blob' }),
  
  // Bulk operations
  bulkVerifyMerchants: (merchantIds: string[]) => api.post('/admin/dashboard/merchants/bulk-verify', { merchantIds }),
  
  // Settings management
  getSettings: () => api.get('/admin/dashboard/settings'),
  updateSettings: (settings: any) => api.put('/admin/dashboard/settings', settings),
  
  // Data management
  removeMockData: () => api.delete('/admin/mock-data'),
  removeMockDataByType: (dataType: string) => api.delete(`/admin/mock-data/${dataType}`)
};

export default api;