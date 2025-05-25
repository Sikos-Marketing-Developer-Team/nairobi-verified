'use client';

import { useEffect } from 'react';

interface FontLoaderProps {
  fonts: {
    family: string;
    weights?: number[];
    styles?: ('normal' | 'italic')[];
    display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
    preload?: boolean;
  }[];
}

/**
 * FontLoader component for optimized font loading
 * 
 * This component handles font loading strategies including:
 * - Preloading critical fonts
 * - Using font-display swap for better performance
 * - Loading non-critical fonts only when needed
 */
const FontLoader: React.FC<FontLoaderProps> = ({ fonts }) => {
  useEffect(() => {
    // Create link elements for preloaded fonts
    fonts.forEach(font => {
      if (font.preload) {
        const weights = font.weights || [400];
        const styles = font.styles || ['normal'];
        
        weights.forEach(weight => {
          styles.forEach(style => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.type = 'font/woff2';
            link.href = `/fonts/${font.family.toLowerCase().replace(/\s+/g, '-')}-${weight}${style === 'italic' ? '-italic' : ''}.woff2`;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
          });
        });
      }
    });
    
    // Create a stylesheet for font-face declarations
    const style = document.createElement('style');
    let css = '';
    
    fonts.forEach(font => {
      const weights = font.weights || [400];
      const styles = font.styles || ['normal'];
      const display = font.display || 'swap';
      
      weights.forEach(weight => {
        styles.forEach(style => {
          const fontName = font.family.toLowerCase().replace(/\s+/g, '-');
          const fontStyle = style;
          const fontWeight = weight;
          const fontPath = `/fonts/${fontName}-${weight}${style === 'italic' ? '-italic' : ''}`;
          
          css += `
            @font-face {
              font-family: '${font.family}';
              font-style: ${fontStyle};
              font-weight: ${fontWeight};
              font-display: ${display};
              src: url('${fontPath}.woff2') format('woff2'),
                   url('${fontPath}.woff') format('woff');
              unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
          `;
        });
      });
    });
    
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [fonts]);

  return null;
};

export default FontLoader;