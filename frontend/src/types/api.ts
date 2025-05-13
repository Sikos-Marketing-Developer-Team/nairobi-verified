// Common API response structure
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any;
}

// Pagination metadata
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Paginated response
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// User related types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'customer' | 'merchant' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  addresses?: Address[];
}

export interface Address {
  id: string;
  userId: string;
  title: string;
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product related types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  categoryId: string;
  merchantId: string;
  stock: number;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isFlashSale?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDetail extends Product {
  category: Category;
  merchant: Merchant;
  specifications?: ProductSpecification[];
  reviews?: Review[];
  relatedProducts?: Product[];
}

export interface ProductSpecification {
  id: string;
  productId: string;
  name: string;
  value: string;
}

// Category related types
export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

// Merchant related types
export interface Merchant {
  id: string;
  userId: string;
  businessName: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  address: string;
  city: string;
  location: {
    lat: number;
    lng: number;
  };
  phone: string;
  email: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  rating?: number;
  reviewCount?: number;
  isVerified: boolean;
  isFeatured: boolean;
  subscriptionStatus: 'active' | 'inactive' | 'pending';
  subscriptionPlan?: string;
  subscriptionExpiry?: string;
  createdAt: string;
  updatedAt: string;
}

// Review related types
export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Cart related types
export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

// Wishlist related types
export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
}

// Order related types
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

// Auth related types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'customer' | 'merchant';
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Flash sale related types
export interface FlashSale {
  id: string;
  productId: string;
  discount: number;
  startDate: string;
  endDate: string;
  product: Product;
}

// Subscription related types
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in days
  features: string[];
  isPopular: boolean;
}

export interface MerchantSubscription {
  id: string;
  merchantId: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'pending';
  plan: SubscriptionPlan;
}

// Payment related types
export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'mpesa';
  details: CardDetails | MpesaDetails;
  isDefault: boolean;
}

export interface CardDetails {
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface MpesaDetails {
  phoneNumber: string;
}

export interface PaymentRequest {
  orderId: string;
  paymentMethodId: string;
  amount: number;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  status: 'completed' | 'pending' | 'failed';
  message?: string;
}