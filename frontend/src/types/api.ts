export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'client' | 'merchant' | 'admin';
  companyName?: string;
  location?: string;
  isEmailVerified?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  companyName?: string;
  location?: string;
  role: 'client' | 'merchant';
}

export interface AuthResponse {
  user: User;
  message: string;
}

export interface Product {
  _id: string;
  id?: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  images: string[] | { url: string; isMain: boolean }[];
  category: string;
  merchantId: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isFlashSale?: boolean;
  description?: string;
  // Additional fields that might be present in the API response
  ratings?: { average: number; count: number };
  merchant?: { _id: string; companyName: string; isVerified: boolean };
}

export interface Category {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isFeatured?: boolean;
}

export interface Merchant {
  _id: string;
  id?: string;
  companyName: string;
  businessType: string;
  location: string;
  coverImage?: string;
  logo?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  isFeatured?: boolean;
}

export interface CartItem {
  _id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}