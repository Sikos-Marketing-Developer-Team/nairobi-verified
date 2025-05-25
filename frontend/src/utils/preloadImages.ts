/**
 * Utility for preloading critical images
 */

/**
 * Preloads an array of images to improve perceived performance
 * @param imageSources Array of image URLs to preload
 * @returns A promise that resolves when all images are loaded
 */
export const preloadImages = (imageSources: string[]): Promise<void[]> => {
  const imagePromises = imageSources.map(src => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn(`Failed to preload image: ${src}`);
        resolve(); // Resolve anyway to not block other images
      };
    });
  });
  
  return Promise.all(imagePromises);
};

/**
 * Preloads critical images for the application
 */
export const preloadCriticalImages = (): Promise<void[]> => {
  const criticalImages = [
    '/images/logo.svg',
    '/images/placeholder.svg',
    '/images/spinner.svg',
    '/images/icons/verified.svg',
    '/images/icons/cart.svg',
    '/images/icons/user.svg',
    '/images/icons/location.svg'
  ];
  
  return preloadImages(criticalImages);
};

export default preloadCriticalImages;