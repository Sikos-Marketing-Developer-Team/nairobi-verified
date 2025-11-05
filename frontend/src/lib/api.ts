// src/lib/api.ts
import axios from 'axios';

// Determine base URL based on environment

const getBaseURL = () => {
  // Use proxy in development to maintain sessions
  if (import.meta.env.DEV) {
    return '/api'; // This will use the Vite proxy
  }
  // Use environment variable in production
  return import.meta.env.VITE_API_URL || 'https://nairobi-verified-backend-4c1b.onrender.com/api';
};

// Create axios instance with base URL
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true, // Important for sending/receiving cookies with CORS
  timeout: 30000, // 30 second timeout
  transformResponse: [(data) => {
    // Handle empty response from Cloudflare
    if (!data || data === '') {
      console.warn('⚠️ Received empty response, returning null');
      return null;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      console.warn('⚠️ Failed to parse response as JSON:', data);
      return data;
    }
  }]
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
      hasData: !!response.data,
      dataType: typeof response.data
    });
    
    // Check for empty response with 200 status (Cloudflare issue)
    if (response.status === 200 && (!response.data || response.data === '')) {
      console.error('❌ Received 200 status with empty response body');
      console.error('This is likely a Cloudflare or proxy issue');
      console.error('Response headers:', response.headers);
      
      // Return a generic error structure
      const error: any = new Error('Server returned empty response');
      error.response = response;
      error.config = response.config;
      return Promise.reject(error);
    }
    
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  registerMerchant: (merchantData: any) => api.post('/auth/register/merchant', merchantData),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  loginMerchant: (email: string, password: string) => api.post('/auth/login/merchant', { email, password }),
  googleAuth: async (credential: string) => {
    console.log('🚀 API Request: Google OAuth');
    const response = await api.post('/auth/google', { credential });
    
    console.log('✅ API Response: Google OAuth', {
      hasUser: !!response.data.user,
      isMerchant: response.data.user?.isMerchant,
      redirectTo: response.data.redirectTo
    });
    
    return response;
  },
  getMe: () => api.get('/auth/me'),
  logout: () => api.get('/auth/logout'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post(`/auth/reset-password/${token}`, { password }),
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

// Merchants API - CORRECTED with proper dashboard endpoints
export const merchantsAPI = {
  // Basic merchant endpoints
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
  verifyMerchant: (id: string) => api.put(`/merchants/${id}/verify`),

  // Current merchant endpoints
  getMyMerchant: () => api.get('/merchants/me'),
  updateMyMerchant: (merchantData: any) => api.put('/merchants/me', merchantData),
  
  // DASHBOARD ENDPOINTS - CORRECTED to match backend
  getDashboardOverview: () => api.get('/merchants/dashboard/overview'),
  getDashboardAnalytics: (period: string = '30') => api.get(`/merchants/dashboard/analytics?period=${period}`),
  getDashboardActivity: (limit: number = 10) => api.get(`/merchants/dashboard/activity?limit=${limit}`),
  getDashboardNotifications: () => api.get('/merchants/dashboard/notifications'),
  getDashboardReviews: (params = {}) => api.get('/merchants/dashboard/reviews', { params }),
  getDashboardQuickActions: () => api.get('/merchants/dashboard/quick-actions'),

  // VERIFICATION ENDPOINTS - ADDED
  getVerificationStatus: () => api.get('/merchants/dashboard/verification/status'),
  getVerificationHistory: () => api.get('/merchants/dashboard/verification/history'),
  submitVerificationRequest: () => api.post('/merchants/dashboard/verification/request'),
  uploadVerificationDocuments: (documents: Record<string, File>) => {
    const formData = new FormData();
    Object.entries(documents).forEach(([fieldName, file]) => {
      formData.append(fieldName, file);
    });
    return api.post('/merchants/dashboard/verification/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Image upload endpoints
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
  
  // Current merchant image uploads
  uploadMyLogo: (logoFile: File) => {
    const formData = new FormData();
    formData.append('logo', logoFile);
    return api.put('/merchants/me/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadMyBanner: (bannerFile: File) => {
    const formData = new FormData();
    formData.append('banner', bannerFile);
    return api.put('/merchants/me/banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadMyGallery: (galleryFiles: File[]) => {
    const formData = new FormData();
    galleryFiles.forEach(file => {
      formData.append('gallery', file);
    });
    return api.put('/merchants/me/gallery', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Gallery management
  deleteGalleryImage: (id: string, imageIndex: number) => api.delete(`/merchants/${id}/gallery/${imageIndex}`),
  deleteMyGalleryImage: (imageIndex: number) => api.delete(`/merchants/me/gallery/${imageIndex}`),
  
  // Business hours management
  updateBusinessHours: (id: string, businessHours: any) => api.put(`/merchants/${id}/hours`, { businessHours }),
  updateMyBusinessHours: (businessHours: any) => api.put('/merchants/me/hours', { businessHours }),
  
  // Social links management
  updateSocialLinks: (id: string, socialLinks: any) => api.put(`/merchants/${id}/social`, { socialLinks }),
  updateMySocialLinks: (socialLinks: any) => api.put('/merchants/me/social', { socialLinks }),
  
  // SEO settings
  updateSEOSettings: (id: string, seoSettings: any) => api.put(`/merchants/${id}/seo`, seoSettings),
  updateMySEOSettings: (seoSettings: any) => api.put('/merchants/me/seo', seoSettings),

  // Documents upload
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
};

// Reviews API
export const reviewsAPI = {
  getReviews: (merchantId: string, params = {}) => api.get(`/reviews/merchant/${merchantId}`, { params }),
  getUserReviews: (params = {}) => api.get('/reviews/user', { params }),
  getReview: (id: string) => api.get(`/reviews/${id}`),
  createReview: (reviewData: any) => api.post('/reviews', reviewData),
  addReview: (merchantId: string, reviewData: any) => api.post(`/merchants/${merchantId}/reviews`, reviewData),
  updateReview: (id: string, reviewData: any) => api.put(`/reviews/${id}`, reviewData),
  deleteReview: (id: string) => api.delete(`/reviews/${id}`),
  addReply: (id: string, replyData: any) => api.post(`/reviews/${id}/reply`, replyData),
  markHelpful: (id: string) => api.put(`/reviews/${id}/helpful`),
  
  // Merchant review management - UPDATED to use dashboard endpoints
  getMyMerchantReviews: (params = {}) => api.get('/merchants/dashboard/reviews', { params }),
  replyToReview: (reviewId: string, reply: string) => api.post(`/merchants/me/reviews/${reviewId}/reply`, { reply }),
  deleteReviewReply: (reviewId: string) => api.delete(`/merchants/me/reviews/${reviewId}/reply`),
};

// Favorites API
export const favoritesAPI = {
  getFavorites: () => api.get('/favorites'),
  addFavorite: (merchantId: string) => api.post(`/favorites/${merchantId}`),
  removeFavorite: (merchantId: string) => api.delete(`/favorites/${merchantId}`),
};

// Orders API
export const ordersAPI = {
  getOrders: () => api.get('/orders'),
  getOrder: (id: string) => api.get(`/orders/${id}`),
  
  // Merchant order management
  getMyMerchantOrders: (params = {}) => api.get('/merchants/me/orders', { params }),
  updateOrderStatus: (orderId: string, status: string) => api.put(`/merchants/me/orders/${orderId}/status`, { status }),
  getOrderAnalytics: (period: string = 'monthly') => api.get(`/merchants/me/orders/analytics?period=${period}`),
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

// Products API
export const productsAPI = {
  getProducts: (params = {}) => api.get('/products', { params }),
  getProduct: (id: string) => api.get(`/products/${id}`),
  searchProducts: (query: string, params = {}) => api.get('/products/search', { params: { q: query, ...params } }),
  getFeaturedProducts: (limit = 8) => api.get('/products/featured', { params: { limit } }),
  getProductsByMerchant: (merchantId: string, params = {}) => api.get(`/products/merchant/${merchantId}`, { params }),
  getCategories: () => api.get('/products/categories'),
  getSearchSuggestions: (query: string) => api.get('/products/suggestions', { params: { q: query } }),
  createProduct: (productData: any) => api.post('/products', productData),
  updateProduct: (id: string, productData: any) => api.put(`/products/${id}`, productData),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  
  // Merchant product management
  getMyProducts: (params = {}) => api.get('/merchants/me/products', { params }),
  createMyProduct: (productData: any) => api.post('/merchants/me/products', productData),
  updateMyProduct: (productId: string, productData: any) => api.put(`/merchants/me/products/${productId}`, productData),
  deleteMyProduct: (productId: string) => api.delete(`/merchants/me/products/${productId}`),
  updateProductInventory: (productId: string, inventory: number) => api.put(`/merchants/me/products/${productId}/inventory`, { inventory }),
  bulkUpdateProducts: (updates: Array<{ id: string; data: any }>) => api.put('/merchants/me/products/bulk', { updates }),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUser: (userId: string) => api.get(`/admin/users/${userId}`),
  updateUser: (userId: string, userData: any) => api.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  getMerchants: (params?: any) => api.get('/admin/merchants', { params }),
  getMerchant: (merchantId: string) => api.get(`/admin/merchants/${merchantId}`),
  updateMerchant: (merchantId: string, merchantData: any) => api.put(`/admin/merchants/${merchantId}`, merchantData),
  deleteMerchant: (merchantId: string) => api.delete(`/admin/merchants/${merchantId}`),
  verifyMerchant: (merchantId: string) => api.post(`/admin/merchants/${merchantId}/verify`),
  rejectMerchant: (merchantId: string, reason: string) => api.post(`/admin/merchants/${merchantId}/reject`, { reason }),
  removeMockData: () => api.delete('/admin/mock-data'),
  removeMockDataByType: (dataType: string) => api.delete(`/admin/mock-data/${dataType}`),
  // Verification endpoints
  getPendingVerifications: (params?: any) => api.get('/admin/merchants', { params: { ...params, documentStatus: 'pending_review' } }),
  approveMerchant: (merchantId: string, notes?: string) => api.post(`/admin/merchants/${merchantId}/verify`, { notes }),
  rejectMerchantVerification: (merchantId: string, reason: string, notes?: string) => api.post(`/admin/merchants/${merchantId}/reject`, { reason, notes }),
  
  // Admin merchant management
  getMerchantAnalytics: (merchantId: string) => api.get(`/admin/merchants/${merchantId}/analytics`),
  suspendMerchant: (merchantId: string, reason: string) => api.post(`/admin/merchants/${merchantId}/suspend`, { reason }),
  unsuspendMerchant: (merchantId: string) => api.post(`/admin/merchants/${merchantId}/unsuspend`),
};

// Analytics API
export const analyticsAPI = {
  // Merchant analytics
  getMerchantOverview: (period: string = 'monthly') => api.get(`/analytics/merchant/overview?period=${period}`),
  getRevenueAnalytics: (period: string = 'monthly') => api.get(`/analytics/merchant/revenue?period=${period}`),
  getCustomerAnalytics: (period: string = 'monthly') => api.get(`/analytics/merchant/customers?period=${period}`),
  getProductPerformance: (period: string = 'monthly') => api.get(`/analytics/merchant/products?period=${period}`),
  getReviewAnalytics: (period: string = 'monthly') => api.get(`/analytics/merchant/reviews?period=${period}`),
  
  // Admin analytics
  getPlatformOverview: (period: string = 'monthly') => api.get(`/analytics/admin/overview?period=${period}`),
  getPlatformRevenue: (period: string = 'monthly') => api.get(`/analytics/admin/revenue?period=${period}`),
  getUserGrowth: (period: string = 'monthly') => api.get(`/analytics/admin/users?period=${period}`),
  getMerchantGrowth: (period: string = 'monthly') => api.get(`/analytics/admin/merchants?period=${period}`),
};

// Notifications API - UPDATED to use dashboard endpoints
export const notificationsAPI = {
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  markAsRead: (notificationId: string) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  deleteNotification: (notificationId: string) => api.delete(`/notifications/${notificationId}`),
  
  // Merchant specific notifications - UPDATED
  getMerchantNotifications: () => api.get('/merchants/dashboard/notifications'),
  getMerchantUnreadCount: () => api.get('/merchants/dashboard/notifications').then(response => response.data.unreadCount),
};

// Flash Sales API
export const flashSalesAPI = {
  getFlashSales: () => api.get('/flash-sales'),
  getFlashSale: (id: string) => api.get(`/flash-sales/${id}`),
};

export default api;