"use client";

import { useTheme } from '@/context/ThemeContext';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

export default function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  animation = 'pulse'
}: SkeletonProps) {
  const { theme } = useTheme();
  
  // Base styles
  const baseStyles = theme === 'dark' 
    ? 'bg-gray-700' 
    : 'bg-gray-200';
  
  // Animation styles
  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent',
    none: ''
  };
  
  // Variant styles
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg'
  };
  
  // Default dimensions based on variant
  const getDefaultDimensions = () => {
    switch (variant) {
      case 'text':
        return { height: height || '1rem', width: width || '100%' };
      case 'circular':
        return { height: height || '2.5rem', width: width || '2.5rem' };
      case 'rectangular':
      case 'rounded':
        return { height: height || '100px', width: width || '100%' };
      default:
        return { height: height || '1rem', width: width || '100%' };
    }
  };
  
  const dimensions = getDefaultDimensions();
  
  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${animationStyles[animation]} ${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height
      }}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
  lineHeight?: string | number;
  spacing?: string | number;
  lastLineWidth?: string | number;
}

export function SkeletonText({
  lines = 3,
  className = '',
  animation = 'pulse',
  lineHeight = '1rem',
  spacing = '0.5rem',
  lastLineWidth = '75%'
}: SkeletonTextProps) {
  return (
    <div className={`space-y-${typeof spacing === 'string' ? spacing : `[${spacing}]`} ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height={lineHeight}
          width={index === lines - 1 && lastLineWidth ? lastLineWidth : '100%'}
          animation={animation}
        />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
  height?: string | number;
  width?: string | number;
  hasImage?: boolean;
  imageHeight?: string | number;
  hasHeader?: boolean;
  headerHeight?: string | number;
  contentLines?: number;
  hasFooter?: boolean;
  footerHeight?: string | number;
}

export function SkeletonCard({
  className = '',
  animation = 'pulse',
  height,
  width = '100%',
  hasImage = false,
  imageHeight = '200px',
  hasHeader = true,
  headerHeight = '3rem',
  contentLines = 3,
  hasFooter = false,
  footerHeight = '3rem'
}: SkeletonCardProps) {
  const { theme } = useTheme();
  
  return (
    <div 
      className={`overflow-hidden ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border rounded-lg ${className}`}
      style={{ width, height }}
    >
      {hasImage && (
        <Skeleton
          variant="rectangular"
          height={imageHeight}
          animation={animation}
        />
      )}
      
      <div className="p-4">
        {hasHeader && (
          <div className="mb-4">
            <Skeleton
              variant="text"
              height={headerHeight}
              animation={animation}
            />
          </div>
        )}
        
        <SkeletonText
          lines={contentLines}
          animation={animation}
        />
        
        {hasFooter && (
          <div className="mt-4">
            <Skeleton
              variant="text"
              height={footerHeight}
              animation={animation}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
  hasHeader?: boolean;
  headerHeight?: string | number;
  rowHeight?: string | number;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className = '',
  animation = 'pulse',
  hasHeader = true,
  headerHeight = '2.5rem',
  rowHeight = '3rem'
}: SkeletonTableProps) {
  const { theme } = useTheme();
  
  return (
    <div className={`overflow-hidden ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border rounded-lg ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {hasHeader && (
            <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                {Array.from({ length: columns }).map((_, index) => (
                  <th key={index} className="px-6 py-3">
                    <Skeleton
                      variant="text"
                      height={headerHeight}
                      animation={animation}
                    />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          
          <tbody className={`divide-y ${
            theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
          }`}>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <Skeleton
                      variant="text"
                      height={rowHeight}
                      animation={animation}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}