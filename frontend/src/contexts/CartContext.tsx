import { createContext, useContext, useState, useEffect } from 'react';
type ReactNode = React.ReactNode;
import { cartAPI } from '@/lib/api';
import { useAuth } from './AuthContext';

// Define types
type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  merchantId: string;
  merchantName: string;
};

type PromoCode = {
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
};

type CartContextType = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
  promoCode: PromoCode | null;
  isLoading: boolean;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyPromoCode: (code: string) => Promise<void>;
  removePromoCode: () => Promise<void>;
};

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState<PromoCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Calculate derived values
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discount = promoCode 
    ? promoCode.discountType === 'percentage' 
      ? (subtotal * promoCode.discount / 100) 
      : promoCode.discount
    : 0;
  const total = Math.max(0, subtotal - discount);

  // Fetch cart data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Clear any cached cart data for non-authenticated users
      setItems([]);
      setPromoCode(null);
      // Clear localStorage to prevent old cart data from showing
      localStorage.removeItem('cart');
    }
  }, [isAuthenticated]);

  // Save cart to localStorage when it changes (for non-authenticated users)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify({ items, promoCode }));
    }
  }, [items, promoCode, isAuthenticated]);

  // Fetch cart from API
  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const response = await cartAPI.getCart();
      setItems(response.data.items || []);
      setPromoCode(response.data.promoCode || null);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to cart
  const addItem = async (productId: string, quantity: number) => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        // Add to server cart
        await cartAPI.addToCart(productId, quantity);
        await fetchCart();
      } else {
        // Add to local cart
        // First check if item already exists
        const existingItemIndex = items.findIndex(item => item.productId === productId);
        
        if (existingItemIndex >= 0) {
          // Update quantity if item exists
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += quantity;
          setItems(updatedItems);
        } else {
          // For local cart, we need to fetch product details from API
          // This should be implemented when products API is available
          console.warn('Adding to local cart requires product details from API');
          throw new Error('Product details not available for local cart');
        }
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update item quantity
  const updateItemQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        // Update on server
        await cartAPI.updateCartItem(itemId, quantity);
        await fetchCart();
      } else {
        // Update local cart
        const updatedItems = items.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        );
        setItems(updatedItems);
      }
    } catch (error) {
      console.error('Failed to update item quantity:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (itemId: string) => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        // Remove from server
        await cartAPI.removeCartItem(itemId);
        await fetchCart();
      } else {
        // Remove from local cart
        const updatedItems = items.filter(item => item.id !== itemId);
        setItems(updatedItems);
      }
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        // Clear server cart
        await cartAPI.clearCart();
        await fetchCart();
      } else {
        // Clear local cart
        setItems([]);
        setPromoCode(null);
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Apply promo code
  const applyPromoCode = async (code: string) => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        // Apply on server
        await cartAPI.applyPromoCode(code);
        await fetchCart();
      } else {
        // For local cart, promo codes should be validated with API
        // This should be implemented when promo code API is available
        console.warn('Promo code validation requires API call');
        throw new Error('Promo code validation not available for local cart');
      }
    } catch (error) {
      console.error('Failed to apply promo code:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove promo code
  const removePromoCode = async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        // Remove on server
        await cartAPI.removePromoCode();
        await fetchCart();
      } else {
        // Remove from local cart
        setPromoCode(null);
      }
    } catch (error) {
      console.error('Failed to remove promo code:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    items,
    itemCount,
    subtotal,
    discount,
    total,
    promoCode,
    isLoading,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    applyPromoCode,
    removePromoCode,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;