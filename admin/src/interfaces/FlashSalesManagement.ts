export interface FlashSaleProduct {
  productId: string;
  name: string;
  originalPrice: number;
  salePrice: number;
  discountPercentage: number;
  image: string;
  merchant: string;
  merchantId: string;
  stockQuantity: number;
  soldQuantity: number;
  maxQuantityPerUser: number;
}

export interface FlashSale {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  products: FlashSaleProduct[];
  totalViews: number;
  totalSales: number;
  createdAt: string;
  updatedAt: string;
  isCurrentlyActive?: boolean;
}

export interface FlashSaleFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  products: FlashSaleProduct[];
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  merchant: {
    _id: string;
    businessName: string;
  };
  stock: number;
  category: string;
  isActive: boolean;
}
