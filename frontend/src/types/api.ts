export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'merchant' | 'admin';
  avatar?: string;
  phone?: string;
  addresses?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    isDefault: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
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
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  merchant: {
    _id: string;
    name: string;
    logo?: string;
  };
  stock: number;
  rating?: number;
  reviews?: number;
  tags?: string[];
  specifications?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: string;
  children?: Category[];
}

export interface Merchant {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  coverImage?: string;
  email: string;
  phone: string;
  address: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  categories: string[];
  rating?: number;
  reviews?: number;
  isVerified: boolean;
  openingHours?: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  createdAt: string;
  updatedAt: string;
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

export interface Order {
  _id: string;
  user: string;
  merchant: string;
  items: {
    product: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}