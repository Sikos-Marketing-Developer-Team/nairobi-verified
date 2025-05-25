/**
 * Utility functions for image optimization
 */

/**
 * Generates a placeholder blur data URL for images
 * @returns A base64 encoded SVG that can be used as a placeholder
 */
export const generateBlurPlaceholder = (): string => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PC9zdmc+';
};

/**
 * Determines the appropriate image size based on the viewport
 * @returns A sizes string for the Next.js Image component
 */
export const getResponsiveImageSizes = (): string => {
  return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
};

/**
 * Formats an image URL to ensure it's properly handled
 * @param url The original image URL
 * @returns A properly formatted image URL
 */
export const formatImageUrl = (url: string): string => {
  if (!url) return '';
  
  // If it's already an absolute URL, return it as is
  if (url.startsWith('http') || url.startsWith('https')) {
    return url;
  }
  
  // If it's a relative URL, ensure it has a leading slash
  return url.startsWith('/') ? url : `/${url}`;
};

/**
 * Generates Cloudinary transformation parameters for optimized images
 * @param url The original Cloudinary URL
 * @param width The desired width
 * @param quality The desired quality (1-100)
 * @returns A transformed Cloudinary URL
 */
export const optimizeCloudinaryUrl = (url: string, width = 800, quality = 80): string => {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  // Parse the URL to insert transformation parameters
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  
  return `${parts[0]}/upload/w_${width},q_${quality},f_auto/${parts[1]}`;
};