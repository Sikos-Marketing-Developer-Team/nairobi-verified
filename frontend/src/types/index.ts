export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "merchant";
  phone?: string;
  location?: string;
  displayName?: string;
  avatar?: string;
  companyName?: string;
  businessType?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  category: string;
  merchantId: string;
  images: {
    url: string;
    isMain: boolean;
  }[];
  rating: number;
  reviewCount: number;
  ratings?: {
    average: number;
    count: number;
  };
  merchant?: {
    id: string;
    name: string;
    logo?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Merchant {
  id: string;
  name: string;
  companyName: string;
  businessType: string;
  email: string;
  phone: string;
  address: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  logo?: string;
  coverImage?: string;
  rating: number;
  reviewCount: number;
  status: "pending" | "active" | "suspended";
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  merchantId: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  merchantId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Address {
  id: string;
  userId: string;
  type: "shipping" | "billing";
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: "card" | "mpesa";
  details: {
    cardNumber?: string;
    cardType?: string;
    expiryDate?: string;
    phoneNumber?: string;
  };
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
} 