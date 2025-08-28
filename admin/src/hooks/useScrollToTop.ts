import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to automatically scroll to top when route changes
 */
export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Smooth scroll to top when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);
};

/**
 * Function to scroll to top programmatically
 */
export const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior
  });
};

/**
 * Function to scroll element to top
 */
export const scrollElementToTop = (element: HTMLElement | null, behavior: ScrollBehavior = 'smooth') => {
  if (element) {
    element.scrollTo({
      top: 0,
      left: 0,
      behavior
    });
  }
};