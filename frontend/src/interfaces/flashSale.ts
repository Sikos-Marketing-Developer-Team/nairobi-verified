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
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  };
  isCurrentlyActive: boolean;
}