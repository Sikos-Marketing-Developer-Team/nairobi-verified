"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

// Mock cart data - will be replaced with API call
const mockCartItems = [
  {
    _id: '1',
    product: {
      _id: '1',
      name: 'Wireless Bluetooth Headphones',
      price: 5999,
      discountPrice: 4999,
      images: [{ url: '/images/products/headphones.jpg', isMain: true }],
      merchant: { _id: '101', companyName: 'Electronics Hub', isVerified: true }
    },
    quantity: 1,
    price: 4999
  },
  {
    _id: '2',
    product: {
      _id: '5',
      name: 'Portable Bluetooth Speaker',
      price: 4500,
      discountPrice: 3999,
      images: [{ url: '/images/products/speaker.jpg', isMain: true }],
      merchant: { _id: '102', companyName: 'Gadget World', isVerified: true }
    },
    quantity: 2,
    price: 3999
  }
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate cart totals
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingFee = 200; // Fixed shipping fee (KES)
  const tax = subtotal * 0.16; // 16% VAT
  const total = subtotal + shippingFee + tax;
  
  // Fetch cart data
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        // Replace with actual API call when backend is ready
        // const response = await fetch('/api/cart');
        // const data = await response.json();
        // setCartItems(data.cart.items);
        
        // Using mock data for now
        setTimeout(() => {
          setCartItems(mockCartItems);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Failed to load cart');
        setLoading(false);
      }
    };
    
    fetchCart();
  }, []);
  
  // Handle quantity change
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  
  // Handle remove item
  const handleRemoveItem = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
  };
  
  // Handle clear cart
  const handleClearCart = () => {
    setCartItems([]);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8 mt-[150px]">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8 mt-[150px]">
          <div className="text-center text-red-500 dark:text-red-400 py-8">
            {error}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-[150px]">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Shopping Cart</h1>
        
        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Cart Items ({cartItems.length})
                  </h2>
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Clear Cart
                  </button>
                </div>
                
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {cartItems.map(item => (
                    <div key={item._id} className="p-4 flex flex-col sm:flex-row">
                      {/* Product Image */}
                      <div className="relative w-full sm:w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden mb-4 sm:mb-0 sm:mr-4">
                        {item.product.images && item.product.images.length > 0 ? (
                          <Image
                            src={item.product.images[0].url.startsWith('http') 
                              ? item.product.images[0].url 
                              : `/${item.product.images[0].url}`}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <div>
                            <Link href={`/product/${item.product._id}`}>
                              <h3 className="font-medium text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400">
                                {item.product.name}
                              </h3>
                            </Link>
                            
                            <Link href={`/shop/${item.product.merchant._id}`}>
                              <p className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400">
                                {item.product.merchant.companyName}
                                {item.product.merchant.isVerified && (
                                  <span className="inline-block ml-1 text-blue-500 dark:text-blue-400">✓</span>
                                )}
                              </p>
                            </Link>
                          </div>
                          
                          <div className="mt-2 sm:mt-0 text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              KSh {item.price.toLocaleString()}
                            </p>
                            {item.product.price > item.price && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                KSh {item.product.price.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          {/* Quantity Selector */}
                          <div className="flex items-center">
                            <span className="mr-2 text-sm text-gray-600 dark:text-gray-400">Qty:</span>
                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                              <button 
                                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                -
                              </button>
                              <input 
                                type="number" 
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                                className="w-10 text-center border-0 focus:ring-0 bg-transparent text-gray-900 dark:text-white"
                              />
                              <button 
                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Continue Shopping */}
              <div className="mt-6">
                <Link href="/products" className="inline-flex items-center text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300">
                  <FiShoppingBag className="mr-2" />
                  Continue Shopping
                </Link>
              </div>
            </div>
            
            {/* Order Summary */}
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>KSh {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span>KSh {shippingFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax (16% VAT)</span>
                    <span>KSh {tax.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-semibold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>KSh {total.toLocaleString()}</span>
                  </div>
                </div>
                
                <Link href="/checkout">
                  <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-md font-medium flex items-center justify-center">
                    Proceed to Checkout
                    <FiArrowRight className="ml-2" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <FiShoppingBag size={48} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link href="/products">
              <button className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-md font-medium">
                Start Shopping
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}