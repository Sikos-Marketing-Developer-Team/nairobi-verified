import { useState, useCallback, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { CartItem, Product } from '@/types';
import { toast } from 'react-hot-toast';

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cart items on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.cart.getItems();
      setItems(response.data.items);
      setError(null);
    } catch (err) {
      setError('Failed to load cart');
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (product: Product, quantity: number = 1) => {
    try {
      setLoading(true);
      const response = await apiService.cart.addItem(product.id, quantity);
      setItems(response.data.items);
      toast.success('Added to cart');
      setError(null);
    } catch (err) {
      setError('Failed to add item to cart');
      toast.error('Failed to add item to cart');
      console.error('Error adding to cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      setLoading(true);
      const response = await apiService.cart.updateItem(itemId, quantity);
      setItems(response.data.items);
      setError(null);
    } catch (err) {
      setError('Failed to update cart');
      toast.error('Failed to update cart');
      console.error('Error updating cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      setLoading(true);
      const response = await apiService.cart.removeItem(itemId);
      setItems(response.data.items);
      toast.success('Removed from cart');
      setError(null);
    } catch (err) {
      setError('Failed to remove item from cart');
      toast.error('Failed to remove item from cart');
      console.error('Error removing from cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      await apiService.cart.clear();
      setItems([]);
      toast.success('Cart cleared');
      setError(null);
    } catch (err) {
      setError('Failed to clear cart');
      toast.error('Failed to clear cart');
      console.error('Error clearing cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTotal = useCallback(() => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [items]);

  const getItemCount = useCallback(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  return {
    items,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotal,
    getItemCount,
    refreshCart: loadCart,
  };
}; 