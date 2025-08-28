
import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { usePageLoading } from '@/hooks/use-loading';
import { PageSkeleton } from '@/components/ui/loading-skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';

const Cart = () => {
  const isLoading = usePageLoading(500);
  const { 
    items: cartItems, 
    subtotal, 
    total, 
    promoCode, 
    isLoading: isCartLoading,
    updateItemQuantity,
    removeItem,
    applyPromoCode,
    removePromoCode
  } = useCart();
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    try {
      await updateItemQuantity(itemId, newQuantity);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item quantity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem(itemId);
      toast({
        title: "Success",
        description: "Item removed from cart.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a promo code.",
        variant: "destructive",
      });
      return;
    }

    try {
      await applyPromoCode(promoCodeInput.trim());
      toast({
        title: "Success",
        description: "Promo code applied successfully!",
      });
      setPromoCodeInput('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid promo code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deliveryFee = 500;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <PageSkeleton>
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center space-x-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-8 w-32" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items Skeleton */}
              <div className="lg:col-span-2 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-20 w-20 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-6 w-1/4" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-12" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary Skeleton */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
                  <Skeleton className="h-6 w-1/2" />
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-5 w-1/4" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
          </div>
        </PageSkeleton>
        
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
            <Link to="/products">
              <Button className="bg-primary hover:bg-primary-dark text-white">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/products" className="inline-flex items-center text-primary hover:text-primary-dark">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Shopping Cart</h1>
          <p className="text-gray-600">Review your items and proceed to checkout</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.merchantName}</p>
                      <p className="text-lg font-bold text-primary mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={isCartLoading}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-4 py-2 min-w-[3rem] text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={isCartLoading}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                        disabled={isCartLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code
                  </label>
                  {promoCode ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                      <div>
                        <span className="text-sm font-medium text-green-800">
                          {promoCode.code} applied
                        </span>
                        <p className="text-xs text-green-600">
                          {promoCode.discountType === 'percentage' 
                            ? `${promoCode.discount}% discount` 
                            : `KES ${promoCode.discount} discount`}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={removePromoCode}
                        className="text-green-700 hover:text-green-800"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter code"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value)}
                      />
                      <Button 
                        variant="outline"
                        onClick={handleApplyPromoCode}
                        disabled={isCartLoading}
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                </div>

                <Button className="w-full bg-primary hover:bg-primary-dark text-white mb-4">
                  Proceed to Checkout
                </Button>

                <div className="text-center">
                  <Link to="/products" className="text-primary hover:text-primary-dark text-sm">
                    Continue Shopping
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Cart;
