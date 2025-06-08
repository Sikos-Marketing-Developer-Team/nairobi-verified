import { useState, useCallback, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { Product } from '@/types';
import { toast } from 'react-hot-toast';

export const useWishlist = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define loadWishlist function first
  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.wishlist.getItems();
      setItems(response.data.items);
      setError(null);
    } catch (err) {
      setError('Failed to load wishlist');
      console.error('Error loading wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToWishlist = useCallback(async (product: Product) => {
    try {
      setLoading(true);
      const response = await apiService.wishlist.addItem(product.id);
      setItems(response.data.items);
      toast.success('Added to wishlist');
      setError(null);
    } catch (err) {
      setError('Failed to add item to wishlist');
      toast.error('Failed to add item to wishlist');
      console.error('Error adding to wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromWishlist = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      const response = await apiService.wishlist.removeItem(productId);
      setItems(response.data.items);
      toast.success('Removed from wishlist');
      setError(null);
    } catch (err) {
      setError('Failed to remove item from wishlist');
      toast.error('Failed to remove item from wishlist');
      console.error('Error removing from wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearWishlist = useCallback(async () => {
    try {
      setLoading(true);
      await apiService.wishlist.clear();
      setItems([]);
      toast.success('Wishlist cleared');
      setError(null);
    } catch (err) {
      setError('Failed to clear wishlist');
      toast.error('Failed to clear wishlist');
      console.error('Error clearing wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load wishlist items on mount
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const isInWishlist = useCallback((productId: string) => {
    return items.some(item => item.id === productId);
  }, [items]);

  return {
    items,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    refreshWishlist: loadWishlist,
  };
}; 