'use client';

import { useState, useEffect, useRef } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
}

/**
 * Custom hook for lazy loading components when they enter the viewport
 * @param options Configuration options for the IntersectionObserver
 * @returns An object containing the ref to attach to the element and whether it's visible
 */
export function useLazyLoad({ threshold = 0.1, rootMargin = '200px' }: UseLazyLoadOptions = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip if SSR or if already visible
    if (typeof window === 'undefined' || isVisible) return;
    
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isVisible, threshold, rootMargin]);

  return { ref, isVisible };
}

export default useLazyLoad;