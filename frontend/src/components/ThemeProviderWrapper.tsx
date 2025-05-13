'use client';

import { useEffect } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';

export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Detect if the user's system is in dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return <ThemeProvider>{children}</ThemeProvider>;
}
 
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );

// (feat: Integrate API for Featured Categories, Products, and Vendors)
