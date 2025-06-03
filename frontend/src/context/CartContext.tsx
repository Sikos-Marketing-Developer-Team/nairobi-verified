'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../lib/api';
import { Cart, CartItem, Product } from '../types/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
  getCartItemQuantity: (productId: string) => number;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Calculate derived values
  const totalItems = cart?.totalItems || 0;
  const subtotal = cart?.subtotal || 0;

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    }
  }, [isAuthenticated]);

  const refreshCart = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.cart.getItems();
      setCart(response.data.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch cart.';
      setError(errorMessage);
      console.error('Error fetching cart:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apiService.cart.addItem(productId, quantity);
      await refreshCart();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add item to cart.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apiService.cart.updateItem(itemId, quantity);
      await refreshCart();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update cart item.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apiService.cart.removeItem(itemId);
      await refreshCart();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to remove item from cart.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apiService.cart.clear();
      setCart(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to clear cart.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isInCart = (productId: string): boolean => {
    if (!cart || !cart.items) return false;
    return cart.items.some((item: CartItem) => item.productId === productId);
  };

  const getCartItemQuantity = (productId: string): number => {
    if (!cart || !cart.items) return 0;
    const item = cart.items.find((item: CartItem) => item.productId === productId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        error,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refreshCart,
        isInCart,
        getCartItemQuantity,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};

export default CartContext;