import { useState, useEffect, useCallback } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types/api';

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

type ApiFunction<T, P> = (params: P) => Promise<AxiosResponse<ApiResponse<T>>>;

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
        const data = response.data.data;
        
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
  const { data, isLoading, error } = useApi(
    async () => {
      const { apiService } = await import('@/lib/api');
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
  const { data, isLoading, error } = useApi(
    async () => {
      const { apiService } = await import('@/lib/api');
      return apiService.categories.getFeatured();
    },
    { immediate: true }
  );
  
  return { categories: data || [], isLoading, error };
}

/**
 * Hook for fetching featured merchants
 */
export function useFeaturedMerchants() {
  const { data, isLoading, error } = useApi(
    async () => {
      const { apiService } = await import('@/lib/api');
      return apiService.merchants.getFeatured();
    },
    { immediate: true }
  );
  
  return { merchants: data || [], isLoading, error };
}

/**
 * Hook for fetching product details
 */
export function useProductDetails(productId: string) {
  const { data, isLoading, error } = useApi(
    async () => {
      const { apiService } = await import('@/lib/api');
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
  const { data, isLoading, error, execute } = useApi(
    async (p) => {
      const { apiService } = await import('@/lib/api');
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
  const { data, isLoading, error, execute } = useApi(
    async (params: { query: string; [key: string]: any }) => {
      const { apiService } = await import('@/lib/api');
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
  const { data, isLoading, error } = useApi(
    async () => {
      const { apiService } = await import('@/lib/api');
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
  const { data, isLoading, error, execute } = useApi(
    async (p) => {
      const { apiService } = await import('@/lib/api');
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
  const { data, isLoading, error, execute } = useApi(
    async (p) => {
      const { apiService } = await import('@/lib/api');
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
  const { data, isLoading, error } = useApi(
    async () => {
      const { apiService } = await import('@/lib/api');
      return apiService.user.getOrderById(orderId);
    },
    { immediate: !!orderId }
  );
  
  return { order: data, isLoading, error };
}