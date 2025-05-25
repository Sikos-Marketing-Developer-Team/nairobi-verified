import { useState, useEffect, useCallback } from 'react';

interface CacheOptions {
  cacheKey: string;
  cacheDuration?: number; // in milliseconds
  staleWhileRevalidate?: boolean;
}

interface CachedApiResponse<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isStale: boolean;
}

/**
 * A custom hook for fetching and caching API data
 * 
 * @param url - The URL to fetch data from
 * @param options - Cache configuration options
 * @returns Object containing data, loading state, error state, and refetch function
 */
export function useCachedApi<T>(
  url: string,
  { cacheKey, cacheDuration = 5 * 60 * 1000, staleWhileRevalidate = true }: CacheOptions
): CachedApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);

  // Function to fetch data from the API
  const fetchData = useCallback(async (skipCache = false): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Check if we have cached data
      if (!skipCache) {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const { data: cachedValue, timestamp } = JSON.parse(cachedData);
          const isExpired = Date.now() - timestamp > cacheDuration;
          
          if (!isExpired) {
            setData(cachedValue);
            setIsLoading(false);
            setIsStale(false);
            return;
          } else if (staleWhileRevalidate) {
            // Use stale data while fetching fresh data
            setData(cachedValue);
            setIsStale(true);
          }
        }
      }
      
      // Fetch fresh data
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      
      // Cache the data
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: result,
          timestamp: Date.now()
        })
      );
      
      setData(result);
      setIsStale(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [url, cacheKey, cacheDuration, staleWhileRevalidate]);

  // Fetch data on mount or when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Function to manually refetch data
  const refetch = useCallback(async (): Promise<void> => {
    await fetchData(true);
  }, [fetchData]);

  return { data, isLoading, error, refetch, isStale };
}

export default useCachedApi;