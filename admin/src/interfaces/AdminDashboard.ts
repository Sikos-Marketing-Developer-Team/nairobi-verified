export interface DashboardStats {
  totalUsers: number;
  totalMerchants: number;
  verifiedMerchants: number;
  activeMerchants: number;
  pendingVerifications: number;
  pendingMerchants: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentUsers: number;
  recentMerchants: number;
  userGrowth: number;
  merchantGrowth: number;
}

export interface RecentActivity {
  id: string;
  type: 'user_signup' | 'merchant_registration' | 'merchant_verified' | 'product_added' | 'review_posted' | 'verification_request';
  description: string;
  timestamp: string;
  user?: string;
  details?: any;
}