export interface Merchant {
  _id: string;
  businessName: string;
  email: string;
  phone: string;
  businessType: string;
  description: string;
  yearEstablished: number;
  address: string;
  location: string;
  logo: string;
  bannerImage?: string;
  verified: boolean;
  rating: number;
  reviews: number;
  businessHours?: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  gallery?: string[];
  documents?: {
    businessRegistration?: string;
    idDocument?: string;
    utilityBill?: string;
    additionalDocs?: string[];
  };
  verifiedDate?: Date;
  createdAt: Date;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  avatar?: string;
  favorites?: string[];
  createdAt: Date;
  address?: string;
}

export interface Review {
  _id: string;
  merchant: string;
  user: string;
  rating: number;
  comment: string;
  helpful: number;
  createdAt: Date;
}

export interface Order {
  _id: string;
  user: string;
  merchant: string;
  products: Array<{ productId: string; quantity: number; price: number; } >;
  totalAmount: number;
  shippingAddress: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  _id: string;
  user: string;
  type: string;
  address: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  _id: string;
  user: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  createdAt: Date;
  updatedAt: Date;
} 