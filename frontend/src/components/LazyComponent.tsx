import React, { ReactNode } from 'react';
import useLazyLoad from '@/hooks/useLazyLoad';
import LoadingSpinner from './LoadingSpinner';

interface LazyComponentProps {
  children: ReactNode;
  placeholder?: ReactNode;
  height?: string | number;
  threshold?: number;
  rootMargin?: string;
}

/**
 * A component that lazily renders its children when they enter the viewport
 */
const LazyComponent: React.FC<LazyComponentProps> = ({
  children,
  placeholder,
  height = 'auto',
  threshold = 0.1,
  rootMargin = '200px',
}) => {
  const { ref, isVisible } = useLazyLoad({ threshold, rootMargin });

  return (
    <div ref={ref} style={{ minHeight: isVisible ? 'auto' : height }}>
      {isVisible ? (
        children
      ) : (
        placeholder || (
          <div className="flex items-center justify-center w-full h-full min-h-[100px]">
            <LoadingSpinner size="small" text="Loading..." />
          </div>
        )
      )}
    </div>
  );
};

export default LazyComponent;