"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { 
  FiUser, FiShoppingBag, FiHeart, FiMapPin, FiCreditCard, 
  FiLogOut, FiPlus, FiTrash2, FiCheck, FiX, FiPhone
} from 'react-icons/fi';

// Mock payment methods data - will be replaced with API call
const mockPaymentMethods = [
  {
    _id: 'pm1',
    type: 'mpesa',
    phoneNumber: '0712345678',
    isDefault: true
  },
  {
    _id: 'pm2',
    type: 'card',
    cardBrand: 'Visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: false
  }
];

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);
  
  // Fetch payment methods data
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
        // Replace with actual API call when backend is ready
        // const response = await fetch('/api/user/payment-methods');
        // const data = await response.json();
        // setPaymentMethods(data.paymentMethods);
        
        // Use real API call
        try {
          const { apiService } = await import('@/lib/api');
          
          // Get payment methods
          const response = await apiService.checkout.getPaymentMethods();
          
          if (response.data && Array.isArray(response.data)) {
            setPaymentMethods(response.data);
          } else {
            // Fallback to empty array if no data
            setPaymentMethods([]);
          }
        } catch (error) {
          console.error('Error fetching payment methods:', error);
          // Fallback to empty array on error
          setPaymentMethods([]);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load payment methods');
        setLoading(false);
      }
    };
    
    fetchPaymentMethods();
  }, []);
  
  // Handle set default payment method
  const handleSetDefault = async (methodId: string) => {
    try {
      // Replace with actual API call when backend is ready
      // await fetch(`/api/user/payment-methods/${methodId}/set-default`, {
      //   method: 'PUT'
      // });
      
      // Update state
      setPaymentMethods(prevMethods => 
        prevMethods.map(method => ({
          ...method,
          isDefault: method._id === methodId
        }))
      );
    } catch (err) {
      console.error('Failed to set default payment method', err);
    }
  };
  
  // Handle delete payment method
  const handleDeleteMethod = async (methodId: string) => {
    try {
      // Replace with actual API call when backend is ready
      // await fetch(`/api/user/payment-methods/${methodId}`, {
      //   method: 'DELETE'
      // });
      
      // Update state
      setPaymentMethods(prevMethods => prevMethods.filter(method => method._id !== methodId));
      setShowDeleteModal(false);
      setMethodToDelete(null);
    } catch (err) {
      console.error('Failed to delete payment method', err);
    }
  };
  
  // Get card icon based on brand
  const getCardIcon = (brand: string | undefined) => {
    if (!brand) return null;
    switch (brand.toLowerCase()) {
      case 'visa':
        return (
          <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold italic text-sm">
            VISA
          </div>
        );
      case 'mastercard':
        return (
          <div className="w-10 h-6 bg-red-500 rounded flex items-center justify-center text-white font-bold text-sm">
            MC
          </div>
        );
      default:
        return (
          <div className="w-10 h-6 bg-gray-500 rounded flex items-center justify-center text-white font-bold text-sm">
            CARD
          </div>
        );
    }
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Payment Methods</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Account Menu
              </h2>
              
              <nav className="space-y-1">
                <Link href="/account" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <FiUser className="mr-3 text-gray-500 dark:text-gray-400" />
                  <span>Account Overview</span>
                </Link>
                <Link href="/account/orders" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <FiShoppingBag className="mr-3 text-gray-500 dark:text-gray-400" />
                  <span>My Orders</span>
                </Link>
                <Link href="/account/wishlist" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <FiHeart className="mr-3 text-gray-500 dark:text-gray-400" />
                  <span>Wishlist</span>
                </Link>
                <Link href="/account/addresses" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <FiMapPin className="mr-3 text-gray-500 dark:text-gray-400" />
                  <span>Addresses</span>
                </Link>
                <Link href="/account/payment-methods" className="flex items-center px-4 py-2 text-gray-900 dark:text-white bg-orange-100 dark:bg-orange-900/20 rounded-md">
                  <FiCreditCard className="mr-3 text-orange-500 dark:text-orange-400" />
                  <span>Payment Methods</span>
                </Link>
                <Link href="/auth/logout" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <FiLogOut className="mr-3 text-gray-500 dark:text-gray-400" />
                  <span>Logout</span>
                </Link>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Saved Payment Methods
                </h2>
                <div className="flex space-x-2">
                  <Link href="/account/payment-methods/add-card">
                    <button className="flex items-center text-sm bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md">
                      <FiPlus className="mr-1" />
                      Add Card
                    </button>
                  </Link>
                  <Link href="/account/payment-methods/add-mpesa">
                    <button className="flex items-center text-sm bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md">
                      <FiPhone className="mr-1" />
                      Add M-Pesa
                    </button>
                  </Link>
                </div>
              </div>
              
              {paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {paymentMethods.map(method => (
                    <div 
                      key={method._id} 
                      className={`border rounded-lg p-4 relative ${
                        method.isDefault 
                          ? 'border-green-500 dark:border-green-600' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {method.isDefault && (
                        <div className="absolute top-2 right-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            <FiCheck className="mr-1" />
                            Default
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-start">
                        {method.type === 'card' ? (
                          <div className="mr-4">
                            {getCardIcon(method.cardBrand)}
                          </div>
                        ) : (
                          <div className="mr-4 w-10 h-6 bg-green-500 rounded flex items-center justify-center text-white font-bold text-xs">
                            MPESA
                          </div>
                        )}
                        
                        <div className="flex-1">
                          {method.type === 'card' ? (
                            <>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {method.cardBrand} •••• {method.last4}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Expires {method.expiryMonth}/{method.expiryYear}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-medium text-gray-900 dark:text-white">
                                M-Pesa
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {method.phoneNumber}
                              </p>
                            </>
                          )}
                          
                          <div className="flex space-x-4 mt-2">
                            {!method.isDefault && (
                              <button 
                                onClick={() => handleSetDefault(method._id)}
                                className="flex items-center text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                              >
                                <FiCheck className="mr-1" />
                                Set as Default
                              </button>
                            )}
                            
                            <button 
                              onClick={() => {
                                setShowDeleteModal(true);
                                setMethodToDelete(method._id);
                              }}
                              className="flex items-center text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <FiTrash2 className="mr-1" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  <FiCreditCard className="mx-auto text-gray-400 dark:text-gray-500 text-4xl mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No payment methods saved yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Add a payment method to make checkout faster.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Link href="/account/payment-methods/add-card">
                      <button className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md font-medium">
                        Add Card
                      </button>
                    </Link>
                    <Link href="/account/payment-methods/add-mpesa">
                      <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md font-medium">
                        Add M-Pesa
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Payment Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                Payment Information
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>Your payment information is securely stored</li>
                <li>We use industry-standard encryption to protect your data</li>
                <li>Set a default payment method to speed up checkout</li>
                <li>You can add multiple payment methods for convenience</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowDeleteModal(false)}>
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <FiTrash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Remove Payment Method
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to remove this payment method? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleDeleteMethod(methodToDelete!)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Remove
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}