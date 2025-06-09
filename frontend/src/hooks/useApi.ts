'use client';

import { useState, useEffect, useCallback } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { ApiResponse, Category, Merchant } from '../types/api';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: AxiosError) => void;
  initialData?: T;
  immediate?: boolean;
}

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: AxiosError | null;
}

type ApiFunction<T, P> = (params: P) => Promise<AxiosResponse<ApiResponse<T>> | { data: any }>;

/**
 * Custom hook for making API calls with loading, error, and data states
 */
export function useApi<T, P = any>(
  apiFunction: ApiFunction<T, P>,
  options: UseApiOptions<T> = {}
) {
  const { onSuccess, onError, initialData = null, immediate = false } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    isLoading: immediate,
    error: null,
  });

  const execute = useCallback(
    async (params?: P) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const response = await apiFunction(params as P);
        // Handle both AxiosResponse and direct data object
        const data = 'status' in response ? response.data.data : response.data;
        
        setState({ data, isLoading: false, error: null });
        
        if (onSuccess) {
          onSuccess(data);
        }
        
        return { data, response };
      } catch (err) {
        const error = err as AxiosError;
        
        setState((prev) => ({ ...prev, isLoading: false, error }));
        
        if (onError) {
          onError(error);
        }
        
        throw error;
      }
    },
    [apiFunction, onSuccess, onError]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    ...state,
    execute,
    setData: (data: T) => setState((prev) => ({ ...prev, data })),
    reset: () => setState({ data: initialData, isLoading: false, error: null }),
  };
}

// Specialized hooks for common API operations

/**
 * Hook for fetching featured products
 */
export function useFeaturedProducts() {
  const { data, isLoading, error } = useApi<any, any>(
    async (params) => {
      const { apiService } = await import('../lib/api');
      return apiService.products.getFeatured();
    },
    { immediate: true }
  );
  
  return { products: data || [], isLoading, error };
}

/**
 * Hook for fetching featured categories
 */
export function useFeaturedCategories() {
  const [usedFallback, setUsedFallback] = useState(false);
  
  // Fallback categories data
  const fallbackCategories: Category[] = [
    {
      _id: 'cat-1',
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest gadgets and electronic devices',
      image: '/images/categories/electronics.jpg'
    },
    {
      _id: 'cat-2',
      name: 'Fashion',
      slug: 'fashion',
      description: 'Clothing, shoes, and accessories',
      image: '/images/categories/fashion.jpg'
    },
    {
      _id: 'cat-3',
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Furniture and home decor',
      image: '/images/categories/home.jpg'
    },
    {
      _id: 'cat-4',
      name: 'Health & Beauty',
      slug: 'health-beauty',
      description: 'Personal care and beauty products',
      image: '/images/categories/beauty.jpg'
    },
    {
      _id: 'cat-5',
      name: 'Food & Beverages',
      slug: 'food-beverages',
      description: 'Groceries and food items',
      image: '/images/categories/food.jpg'
    },
    {
      _id: 'cat-6',
      name: 'Sports & Outdoors',
      slug: 'sports-outdoors',
      description: 'Sports equipment and outdoor gear',
      image: '/images/categories/sports.jpg'
    }
  ];
  
  const { data, isLoading, error } = useApi<any, any>(
    async (params) => {
      try {
        const { apiService } = await import('../lib/api');
        const response = await apiService.categories.getFeatured();
        setUsedFallback(false);
        return response;
      } catch (err) {
        console.error('Error fetching categories:', err);
        setUsedFallback(true);
        // Return fallback data in the same format as the API would
        return { data: fallbackCategories };
      }
    },
    { immediate: true }
  );
  
  return { 
    categories: data || [], 
    isLoading, 
    error,
    usedFallback
  };
}

/**
 * Hook for fetching featured merchants
 */
export function useFeaturedMerchants() {
  const [usedFallback, setUsedFallback] = useState(false);
  
  // Fallback merchants data
  const fallbackMerchants: Merchant[] = [
    {
      _id: 'merch-1',
      name: 'Tech Store',
      description: 'Leading electronics retailer in Nairobi',
      email: 'contact@techstore.com',
      phone: '+254712345678',
      address: 'Kimathi Street, Nairobi CBD',
      logo: '/images/merchants/tech-store.jpg',
      coverImage: '/images/merchants/tech-store-cover.jpg',
      categories: ['electronics', 'gadgets'],
      rating: 4.8,
      reviews: 124,
      isVerified: true,
      socialMedia: {
        website: 'https://techstore.example.com',
        facebook: 'https://facebook.com/techstore',
        twitter: 'https://twitter.com/techstore'
      },
      openingHours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '10:00', close: '16:00' }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'merch-2',
      name: 'Fashion Hub',
      description: 'Trendy fashion for all occasions',
      email: 'info@fashionhub.com',
      phone: '+254723456789',
      address: 'Kenyatta Avenue, Nairobi CBD',
      logo: '/images/merchants/fashion-hub.jpg',
      coverImage: '/images/merchants/fashion-hub-cover.jpg',
      categories: ['fashion', 'clothing', 'accessories'],
      rating: 4.6,
      reviews: 98,
      isVerified: true,
      socialMedia: {
        website: 'https://fashionhub.example.com',
        instagram: 'https://instagram.com/fashionhub'
      },
      openingHours: {
        monday: { open: '10:00', close: '19:00' },
        tuesday: { open: '10:00', close: '19:00' },
        wednesday: { open: '10:00', close: '19:00' },
        thursday: { open: '10:00', close: '19:00' },
        friday: { open: '10:00', close: '19:00' },
        saturday: { open: '10:00', close: '19:00' },
        sunday: { open: '12:00', close: '16:00' }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'merch-3',
      name: 'Home Essentials',
      description: 'Quality home and kitchen products',
      email: 'sales@homeessentials.com',
      phone: '+254734567890',
      address: 'Moi Avenue, Nairobi CBD',
      logo: '/images/merchants/home-essentials.jpg',
      coverImage: '/images/merchants/home-essentials-cover.jpg',
      categories: ['home', 'kitchen', 'furniture'],
      rating: 4.4,
      reviews: 76,
      isVerified: true,
      socialMedia: {
        website: 'https://homeessentials.example.com'
      },
      openingHours: {
        monday: { open: '08:30', close: '17:30' },
        tuesday: { open: '08:30', close: '17:30' },
        wednesday: { open: '08:30', close: '17:30' },
        thursday: { open: '08:30', close: '17:30' },
        friday: { open: '08:30', close: '17:30' }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'merch-4',
      name: 'Beauty World',
      description: 'Premium beauty and skincare products',
      email: 'info@beautyworld.com',
      phone: '+254745678901',
      address: 'Tom Mboya Street, Nairobi CBD',
      logo: '/images/merchants/beauty-world.jpg',
      coverImage: '/images/merchants/beauty-world-cover.jpg',
      categories: ['beauty', 'skincare', 'cosmetics'],
      rating: 4.7,
      reviews: 112,
      isVerified: true,
      socialMedia: {
        website: 'https://beautyworld.example.com',
        instagram: 'https://instagram.com/beautyworld'
      },
      openingHours: {
        monday: { open: '09:00', close: '19:00' },
        tuesday: { open: '09:00', close: '19:00' },
        wednesday: { open: '09:00', close: '19:00' },
        thursday: { open: '09:00', close: '19:00' },
        friday: { open: '09:00', close: '19:00' },
        saturday: { open: '09:00', close: '19:00' },
        sunday: { open: '10:00', close: '16:00' }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  const { data, isLoading, error } = useApi<any, any>(
    async (params) => {
      try {
        const { apiService } = await import('../lib/api');
        const response = await apiService.merchants.getFeatured();
        setUsedFallback(false);
        return response;
      } catch (err) {
        console.error('Error fetching merchants:', err);
        setUsedFallback(true);
        // Return fallback data in the same format as the API would
        return { data: fallbackMerchants };
      }
    },
    { immediate: true }
  );
  
  return { 
    merchants: data || [], 
    isLoading, 
    error,
    usedFallback
  };
}

/**
 * Hook for fetching product details
 */
export function useProductDetails(productId: string) {
  const { data, isLoading, error } = useApi<any, any>(
    async (params) => {
      const { apiService } = await import('../lib/api');
      return apiService.products.getById(productId);
    },
    { immediate: !!productId }
  );
  
  return { product: data, isLoading, error };
}

/**
 * Hook for fetching products by category
 */
export function useCategoryProducts(categoryId: string, params?: any) {
  const { data, isLoading, error, execute } = useApi<any, any>(
    async (p) => {
      const { apiService } = await import('../lib/api');
      return apiService.products.getByCategory(categoryId, p);
    },
    { immediate: !!categoryId }
  );
  
  const fetchProducts = useCallback(
    (newParams?: any) => {
      execute(newParams || params);
    },
    [execute, params]
  );
  
  return { products: data?.items || [], meta: data?.meta, isLoading, error, fetchProducts };
}

/**
 * Hook for searching products
 */
export function useProductSearch() {
  const { data, isLoading, error, execute } = useApi<any, { query: string; [key: string]: any }>(
    async (params: { query: string; [key: string]: any }) => {
      const { apiService } = await import('../lib/api');
      return apiService.products.search(params.query, params);
    }
  );
  
  const searchProducts = useCallback(
    (query: string, params?: any) => {
      execute({ query, ...params });
    },
    [execute]
  );
  
  return { 
    results: data?.items || [], 
    meta: data?.meta, 
    isLoading, 
    error, 
    searchProducts 
  };
}

/**
 * Hook for fetching merchant details
 */
export function useMerchantDetails(merchantId: string) {
  const { data, isLoading, error } = useApi<any, any>(
    async (params) => {
      const { apiService } = await import('../lib/api');
      return apiService.merchants.getById(merchantId);
    },
    { immediate: !!merchantId }
  );
  
  return { merchant: data, isLoading, error };
}

/**
 * Hook for fetching merchant products
 */
export function useMerchantProducts(merchantId: string, params?: any) {
  const { data, isLoading, error, execute } = useApi<any, any>(
    async (p) => {
      const { apiService } = await import('../lib/api');
      return apiService.merchants.getProducts(merchantId, p);
    },
    { immediate: !!merchantId }
  );
  
  const fetchProducts = useCallback(
    (newParams?: any) => {
      execute(newParams || params);
    },
    [execute, params]
  );
  
  return { products: data?.items || [], meta: data?.meta, isLoading, error, fetchProducts };
}

/**
 * Hook for fetching user orders
 */
export function useUserOrders(params?: any) {
  const { data, isLoading, error, execute } = useApi<any, any>(
    async (p) => {
      const { apiService } = await import('../lib/api');
      return apiService.user.getOrders(p);
    },
    { immediate: true }
  );
  
  const fetchOrders = useCallback(
    (newParams?: any) => {
      execute(newParams || params);
    },
    [execute, params]
  );
  
  return { orders: data?.items || [], meta: data?.meta, isLoading, error, fetchOrders };
}

/**
 * Hook for fetching order details
 */
export function useOrderDetails(orderId: string) {
  const { data, isLoading, error } = useApi<any, any>(
    async (params) => {
      const { apiService } = await import('../lib/api');
      return apiService.user.getOrderById(orderId);
    },
    { immediate: !!orderId }
  );
  
  return { order: data, isLoading, error };
}