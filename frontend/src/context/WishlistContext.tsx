'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/lib/api';
import { Wishlist, WishlistItem } from '@/types/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: Wishlist | null;
  isLoading: boolean;
  error: string | null;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Fetch wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshWishlist();
    }
  }, [isAuthenticated]);

  const refreshWishlist = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.wishlist.getItems();
      setWishlist(response.data.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch wishlist.';
      setError(errorMessage);
      console.error('Error fetching wishlist:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await apiService.wishlist.addItem(productId);
      await refreshWishlist();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add item to wishlist.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await apiService.wishlist.removeItem(productId);
      await refreshWishlist();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to remove item from wishlist.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearWishlist = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await apiService.wishlist.clear();
      setWishlist(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to clear wishlist.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (productId: string): boolean => {
    if (!wishlist || !wishlist.items) return false;
    return wishlist.items.some((item: WishlistItem) => item.productId === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isLoading,
        error,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        refreshWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  
  return context;
};

export default WishlistContext;