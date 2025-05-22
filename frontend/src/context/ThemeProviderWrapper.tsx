'use client';

import React, { ReactNode } from 'react';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';

interface ThemeProviderWrapperProps {
  children: ReactNode;
}

export default function ThemeProviderWrapper({ children }: ThemeProviderWrapperProps) {
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
}