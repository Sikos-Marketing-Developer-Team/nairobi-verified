"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { 
  FiArrowLeft, FiPhone, FiCheck, FiInfo
} from 'react-icons/fi';

export default function AddMpesaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    phoneNumber: '',
    isDefault: false
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState({
    phoneNumber: ''
  });
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Validate form
  const validateForm = () => {
    let valid = true;
    const newErrors = { ...formErrors };
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
      valid = false;
    } else if (!/^(?:\+254|0)[17]\d{8}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid Kenyan phone number';
      valid = false;
    }
    
    setFormErrors(newErrors);
    return valid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Replace with actual API call when backend is ready
      // const response = await fetch('/api/user/payment-methods/mpesa', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(formData)
      // });
      // const data = await response.json();
      // if (!response.ok) {
      //   throw new Error(data.message || 'Failed to add M-Pesa');
      // }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to payment methods page
      router.push('/account/payment-methods');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add M-Pesa');
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-[150px]">
        <div className="mb-6">
          <Link href="/account/payment-methods" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400">
            <FiArrowLeft className="mr-2" />
            Back to Payment Methods
          </Link>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add M-Pesa</h1>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-md">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mb-6">
              <div className="flex items-start">
                <FiInfo className="text-blue-500 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-blue-800 dark:text-blue-300 font-medium mb-1">About M-Pesa Integration</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Adding your M-Pesa phone number allows for faster checkout. When you place an order, 
                    you'll receive an M-Pesa payment prompt on this number.
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  M-Pesa Phone Number*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiPhone className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full pl-10 px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      formErrors.phoneNumber ? 'border-red-500 dark:border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0712 345 678"
                  />
                </div>
                {formErrors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.phoneNumber}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Format: 07XX XXX XXX or +254 7XX XXX XXX
                </p>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Set as default payment method
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Link href="/account/payment-methods">
                  <button type="button" className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Cancel
                  </button>
                </Link>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheck className="mr-2" />
                      Save M-Pesa
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  Is my M-Pesa information secure?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Yes, we use industry-standard encryption to protect your data. We only store your phone number, 
                  not any PIN or other sensitive information.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  How does the M-Pesa payment work?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  When you place an order, you'll receive an STK push prompt on your phone. 
                  Simply enter your M-Pesa PIN to complete the payment.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  Can I add multiple M-Pesa numbers?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Yes, you can add multiple M-Pesa numbers to your account and choose which one to use during checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}