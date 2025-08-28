import { useState, useEffect } from 'react';

export const usePageLoading = (initialDelay: number = 300) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Use requestAnimationFrame for smoother transitions
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        setIsLoading(false);
      });
    }, initialDelay);

    return () => clearTimeout(timer);
  }, [initialDelay]);

  return isLoading;
};

export const useAsyncLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeAsync = async <T,>(
    asyncFunction: () => Promise<T>,
    onSuccess?: (data: T) => void,
    onError?: (error: Error) => void
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, executeAsync, setError };
};