export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface Merchant {
  id: string;
  businessName: string;
  email: string;
  phone: string;
  businessType: string;
  description: string;
  address: string;
  location: string;
  verified: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  logo?: string;
  banner?: string;
  website?: string;
  yearEstablished?: number;
  businessHours?: string;
  createdAt: string;
  updatedAt: string;
  documents?: {
    businessRegistration?: string;
    idDocument?: string;
    utilityBill?: string;
    additionalDocs?: string[];
  };
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  merchant: Merchant;
  images: string[];
  stock: number;
  isActive: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FlashSale {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  maxQuantity?: number;
  currentQuantity: number;
  products: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface VerificationRequest {
  id: string;
  merchant: Merchant;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  processedAt?: string;
  processedBy?: AdminUser;
  notes?: string;
  documents: {
    businessRegistration?: string;
    idDocument?: string;
    utilityBill?: string;
    additionalDocs?: string[];
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalMerchants: number;
  verifiedMerchants: number;
  pendingVerifications: number;
  totalProducts: number;
  activeFlashSales: number;
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  userGrowth: {
    current: number;
    previous: number;
    percentage: number;
  };
  merchantGrowth: {
    current: number;
    previous: number;
    percentage: number;
  };
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  userId?: string;
  action?: string;
  resource?: string;
  details?: any;
}

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  adminEmail: string;
  supportEmail: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  merchantRegistrationEnabled: boolean;
  emailVerificationRequired: boolean;
  autoApproveVerifications: boolean;
  maxUploadSize: number;
  allowedFileTypes: string[];
  socialLogin: {
    google: boolean;
    facebook: boolean;
    twitter: boolean;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  analytics: {
    googleAnalytics: string;
    facebookPixel: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
