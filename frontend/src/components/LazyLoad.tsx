'use client';

import React, { useEffect, useRef, useState } from 'react';

interface LazyLoadProps {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  placeholder?: React.ReactNode;
  className?: string;
  onVisible?: () => void;
}

/**
 * LazyLoad component that renders children only when they are about to enter the viewport
 * 
 * @param children - The content to be lazily loaded
 * @param threshold - A value between 0 and 1 indicating the percentage of the element that needs to be visible
 * @param rootMargin - Margin around the root similar to CSS margin property
 * @param placeholder - Content to show while the main content is loading
 * @param className - Additional CSS classes
 * @param onVisible - Callback function that is called when the element becomes visible
 */
const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  threshold = 0.1,
  rootMargin = '100px',
  placeholder,
  className = '',
  onVisible
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          if (onVisible) {
            onVisible();
          }
          
          // Set a small timeout to allow for any animations or transitions
          setTimeout(() => {
            setHasLoaded(true);
          }, 100);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isVisible, threshold, rootMargin, onVisible]);

  return (
    <div ref={ref} className={`lazy-load-container ${className}`} data-loaded={hasLoaded}>
      {isVisible ? (
        <div className={`lazy-load-content ${hasLoaded ? 'loaded' : 'loading'}`}>
          {children}
        </div>
      ) : (
        <div className="lazy-load-placeholder">
          {placeholder || (
            <div className="animate-pulse bg-gray-200 rounded-md w-full h-full min-h-[100px]"></div>
          )}
        </div>
      )}
    </div>
  );
};

export default LazyLoad;