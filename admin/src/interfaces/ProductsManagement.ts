export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  merchant: {
    _id: string;
    businessName: string;
    verified: boolean;
  };
  images: string[];
  isActive: boolean;
  inStock: boolean;
  stock?: number;
  featured?: boolean;
  rating?: number;
  totalReviews?: number;
  totalSales?: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  specifications?: Record<string, any>;
  variants?: Array<{
    name: string;
    price: number;
    stock: number;
  }>;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}