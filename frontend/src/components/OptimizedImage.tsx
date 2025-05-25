import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { generateBlurPlaceholder, getResponsiveImageSizes, formatImageUrl, optimizeCloudinaryUrl } from '@/utils/imageOptimizer';

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'blurDataURL'> {
  src: string;
  fallbackSrc?: string;
  optimizeCloudinary?: boolean;
  cloudinaryWidth?: number;
  cloudinaryQuality?: number;
  priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  fallbackSrc = '/images/placeholder.jpg',
  alt,
  width,
  height,
  optimizeCloudinary = true,
  cloudinaryWidth = 800,
  cloudinaryQuality = 80,
  sizes = getResponsiveImageSizes(),
  className = '',
  priority = false,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Format and optimize the image URL
  const formattedSrc = formatImageUrl(src);
  const optimizedSrc = optimizeCloudinary 
    ? optimizeCloudinaryUrl(formattedSrc, cloudinaryWidth, cloudinaryQuality) 
    : formattedSrc;
  
  // Generate a blur placeholder
  const blurDataURL = generateBlurPlaceholder();
  
  // Handle image load complete
  const handleLoadComplete = () => {
    setIsLoading(false);
  };
  
  // Handle image load error
  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };
  
  return (
    <div className={`relative ${isLoading ? 'image-loading' : ''} ${className}`}>
      <Image
        src={error ? fallbackSrc : optimizedSrc}
        alt={alt || 'Image'}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
        placeholder="blur"
        blurDataURL={blurDataURL}
        onLoadingComplete={handleLoadComplete}
        onError={handleError}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;