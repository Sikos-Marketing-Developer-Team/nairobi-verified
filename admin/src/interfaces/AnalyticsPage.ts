export interface AnalyticsData {
  registrationTrends: {
    merchants: Array<{ _id: any; count: number }>;
    users: Array<{ _id: any; count: number }>;
  };
  businessTypeDistribution: Array<{ _id: string; count: number }>;
  geographicDistribution: Array<{ _id: string; count: number }>;
  verificationAnalytics: Array<{
    totalMerchants: number;
    verified: number;
    pending: number;
    averageRating: number;
  }>;
  reviewAnalytics: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Array<{ _id: number; count: number }>;
  };
  productAnalytics: {
    totalProducts: number;
    activeProducts: number;
    categoryDistribution: Array<{ _id: string; count: number }>;
  };
  revenueAnalytics: {
    totalRevenue: number;
    monthlyRevenue: Array<{ month: string; revenue: number }>;
  };
}

export interface DashboardStats {
  totalMerchants: number;
  totalUsers: number;
  totalProducts: number;
  totalReviews: number;
  verifiedMerchants: number;
  activeProducts: number;
  growth: {
    merchantsThisMonth: number;
    usersThisMonth: number;
    reviewsThisMonth: number;
    merchantGrowth: number;
    userGrowth: number;
    reviewGrowth: number;
  };
  metrics: {
    verificationRate: number;
    averageRating: number;
    productUploadRate: number;
  };
}