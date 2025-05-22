'use client';

import { useEffect } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { SocketProvider } from '@/context/SocketContext';
import { ToastProvider } from '@/context/ToastContext';

export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// (feat: Integrate API for Featured Categories, Products, and Vendors)
