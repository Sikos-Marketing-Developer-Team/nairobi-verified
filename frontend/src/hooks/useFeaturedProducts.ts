import { useState, useEffect } from 'react';
import { Product } from '@/types/api';
import { apiService } from '@/lib/api';

// Fallback data in case the API is unavailable
const fallbackProducts: Product[] = [
  {
    _id: 'fallback-1',
    name: 'Smartphone X Pro',
    price: 799.99,
    description: 'Latest smartphone with advanced features',
    images: ['/images/fallback/smartphone.jpg'],
    category: 'electronics',
    merchant: { 
      _id: 'merch-1', 
      name: 'Tech Store' 
    },
    stock: 10,
    rating: 4.5,
    reviews: 24,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    salePrice: 749.99,
  },
  {
    _id: 'fallback-2',
    name: 'Wireless Headphones',
    price: 129.99,
    description: 'Premium noise-cancelling headphones',
    images: ['/images/fallback/headphones.jpg'],
    category: 'electronics',
    merchant: { 
      _id: 'merch-1', 
      name: 'Tech Store' 
    },
    stock: 15,
    rating: 4.7,
    reviews: 18,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'fallback-3',
    name: 'Casual T-Shirt',
    price: 24.99,
    description: 'Comfortable cotton t-shirt',
    images: ['/images/fallback/tshirt.jpg'],
    category: 'fashion',
    merchant: { 
      _id: 'merch-2', 
      name: 'Fashion Hub' 
    },
    stock: 50,
    rating: 4.2,
    reviews: 32,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'fallback-4',
    name: 'Coffee Maker',
    price: 89.99,
    description: 'Automatic coffee maker for home use',
    images: ['/images/fallback/coffee-maker.jpg'],
    category: 'home-kitchen',
    merchant: { 
      _id: 'merch-3', 
      name: 'Home Essentials' 
    },
    stock: 8,
    rating: 4.4,
    reviews: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    salePrice: 69.99,
  }
];

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.products.getFeatured();
        setProducts(response.data);
        setError(null);
        setUsedFallback(false);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        // Use fallback data if API call fails
        setProducts(fallbackProducts);
        setUsedFallback(true);
        setError(err instanceof Error ? err : new Error('Failed to fetch featured products'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, isLoading, error, usedFallback };
} 