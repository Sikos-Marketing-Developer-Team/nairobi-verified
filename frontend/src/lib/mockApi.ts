export const mockApi = {
  auth: {
    login: (email: string, password: string, rememberMe: boolean = false) => {
      console.log('apiService: Mocking /api/auth/login');
      return Promise.resolve({
        data: {
          user: { id: 'mock_user_id', email, role: 'client' },
        },
      });
    },
    register: (userData: any, endpoint: string) => {
      console.log(`apiService: Mocking ${endpoint}`);
      return Promise.resolve({
        data: {
          user: {
            id: 'mock_user_id',
            email: userData.email,
            role: endpoint.includes('merchant') ? 'merchant' : 'client',
          },
        },
      });
    },
    forgotPassword: (email: string) => {
      console.log('apiService: Mocking /api/auth/forgot-password');
      return Promise.resolve({ data: { message: 'Password reset email sent' } });
    },
    resetPassword: (token: string, password: string) => {
      console.log('apiService: Mocking /api/auth/reset-password');
      return Promise.resolve({ data: { message: 'Password reset successful' } });
    },
    logout: () => {
      console.log('apiService: Mocking /api/auth/logout');
      return Promise.resolve({ data: { message: 'Logged out' } });
    },
    check: () => {
      console.log('apiService: Mocking /api/auth/check');
      return Promise.resolve({ data: { isAuthenticated: false } });
    },
    me: () => {
      console.log('apiService: Mocking /api/auth/user');
      return Promise.resolve({ data: { id: 'mock_user_id', role: 'client' } });
    },
    verifyEmail: (token: string) => {
      console.log(`apiService: Mocking /api/auth/verify-email/${token}`);
      return Promise.resolve({ data: { message: 'Email verified' } });
    },
  },
  products: {
    getAll: (params?: any) => Promise.resolve({ data: [] }),
    getById: (id: string) => Promise.resolve({ data: { id } }),
    getFeatured: () => Promise.resolve({ data: [] }),
    getByCategory: (categoryId: string, params?: any) => Promise.resolve({ data: [] }),
    search: (query: string, params?: any) => Promise.resolve({ data: [] }),
  },
  categories: {
    getAll: () => Promise.resolve({ data: [] }),
    getById: (id: string) => Promise.resolve({ data: { id } }),
    getFeatured: () => Promise.resolve({ data: [] }),
  },
  merchants: {
    getAll: (params?: any) => Promise.resolve({ data: [] }),
    getById: (id: string) => Promise.resolve({ data: { id } }),
    getFeatured: () => Promise.resolve({ data: [] }),
    getProducts: (merchantId: string, params?: any) => Promise.resolve({ data: [] }),
  },
  cart: {
    getItems: () => Promise.resolve({ data: [] }),
    addItem: (productId: string, quantity: number = 1) => Promise.resolve({ data: { productId, quantity } }),
    updateItem: (itemId: string, quantity: number) => Promise.resolve({ data: { itemId, quantity } }),
    removeItem: (itemId: string) => Promise.resolve({ data: { message: 'Item removed' } }),
    clear: () => Promise.resolve({ data: { message: 'Cart cleared' } }),
  },
  wishlist: {
    getItems: () => Promise.resolve({ data: [] }),
    addItem: (productId: string) => Promise.resolve({ data: { productId } }),
    removeItem: (productId: string) => Promise.resolve({ data: { message: 'Item removed' } }),
    clear: () => Promise.resolve({ data: { message: 'Wishlist cleared' } }),
  },
  user: {
    getProfile: () => Promise.resolve({ data: {} }),
    updateProfile: (profileData: any) => Promise.resolve({ data: profileData }),
    changePassword: (currentPassword: string, newPassword: string) => Promise.resolve({ data: { message: 'Password changed' } }),
    getAddresses: () => Promise.resolve({ data: [] }),
    addAddress: (addressData: any) => Promise.resolve({ data: addressData }),
    updateAddress: (addressId: string, addressData: any) => Promise.resolve({ data: { addressId, ...addressData } }),
    deleteAddress: (addressId: string) => Promise.resolve({ data: { message: 'Address deleted' } }),
    getOrders: (params?: any) => Promise.resolve({ data: [] }),
    getOrderById: (orderId: string) => Promise.resolve({ data: { orderId } }),
  },
  merchant: {
    getProfile: () => Promise.resolve({ data: {} }),
    updateProfile: (profileData: any) => Promise.resolve({ data: profileData }),
    getProducts: (params?: any) => Promise.resolve({ data: [] }),
    addProduct: (productData: any) => Promise.resolve({ data: productData }),
    updateProduct: (productId: string, productData: any) => Promise.resolve({ data: { productId, ...productData } }),
    deleteProduct: (productId: string) => Promise.resolve({ data: { message: 'Product deleted' } }),
    getOrders: (params?: any) => Promise.resolve({ data: [] }),
    getOrderById: (orderId: string) => Promise.resolve({ data: { orderId } }),
    updateOrderStatus: (orderId: string, status: string) => Promise.resolve({ data: { orderId, status } }),
  },
  checkout: {
    createOrder: (orderData: any) => Promise.resolve({ data: orderData }),
    getPaymentMethods: () => Promise.resolve({ data: [] }),
    processPayment: (paymentData: any) => Promise.resolve({ data: paymentData }),
  },
  admin: {
    getDashboardStats: () => Promise.resolve({ data: {} }),
    getUsers: (params?: any) => Promise.resolve({ data: [] }),
    updateUser: (userId: string, userData: any) => Promise.resolve({ data: { userId, ...userData } }),
    getPendingVerifications: (params?: any) => Promise.resolve({ data: [] }),
    processMerchantVerification: (merchantId: string, action: string, notes?: string) =>
      Promise.resolve({ data: { merchantId, action, notes } }),
    getTransactions: (params?: any) => Promise.resolve({ data: [] }),
  },
};