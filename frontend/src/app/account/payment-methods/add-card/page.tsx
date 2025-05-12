"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { 
  FiArrowLeft, FiCreditCard, FiCalendar, FiLock, FiUser, FiCheck, FiInfo
} from 'react-icons/fi';

export default function AddCardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: false
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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
    
    // Validate card number (remove spaces for validation)
    const cardNumberWithoutSpaces = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumberWithoutSpaces) {
      newErrors.cardNumber = 'Card number is required';
      valid = false;
    } else if (!/^\d{16}$/.test(cardNumberWithoutSpaces)) {
      newErrors.cardNumber = 'Card number must be 16 digits';
      valid = false;
    }
    
    // Validate cardholder name
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
      valid = false;
    }
    
    // Validate expiry month
    if (!formData.expiryMonth) {
      newErrors.expiryMonth = 'Expiry month is required';
      valid = false;
    }
    
    // Validate expiry year
    if (!formData.expiryYear) {
      newErrors.expiryYear = 'Expiry year is required';
      valid = false;
    }
    
    // Validate CVV
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
      valid = false;
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
      valid = false;
    }
    
    // Check if card is expired
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    
    if (
      parseInt(formData.expiryYear) < currentYear || 
      (parseInt(formData.expiryYear) === currentYear && parseInt(formData.expiryMonth) < currentMonth)
    ) {
      newErrors.expiryYear = 'Card has expired';
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
      // const response = await fetch('/api/user/payment-methods/card', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     cardNumber: formData.cardNumber.replace(/\s/g, ''),
      //     cardholderName: formData.cardholderName,
      //     expiryMonth: formData.expiryMonth,
      //     expiryYear: formData.expiryYear,
      //     cvv: formData.cvv,
      //     isDefault: formData.isDefault
      //   })
      // });
      // const data = await response.json();
      // if (!response.ok) {
      //   throw new Error(data.message || 'Failed to add card');
      // }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to payment methods page
      router.push('/account/payment-methods');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add card');
      setLoading(false);
    }
  };
  
  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return (
      <option key={month} value={month.toString().padStart(2, '0')}>
        {month.toString().padStart(2, '0')}
      </option>
    );
  });
  
  // Generate year options (current year + 20 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 21 }, (_, i) => {
    const year = currentYear + i;
    return (
      <option key={year} value={year}>
        {year}
      </option>
    );
  });
  
  // Determine card type based on first digits
  const getCardType = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'Mastercard';
    if (/^3[47]/.test(number)) return 'American Express';
    if (/^6(?:011|5)/.test(number)) return 'Discover';
    
    return null;
  };
  
  const cardType = getCardType(formData.cardNumber);
  
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add Credit/Debit Card</h1>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-md">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mb-6">
              <div className="flex items-start">
                <FiInfo className="text-blue-500 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-blue-800 dark:text-blue-300 font-medium mb-1">Secure Card Processing</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Your card details are encrypted and securely processed. We never store your full card number or CVV.
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Card Number*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiCreditCard className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    maxLength={19} // 16 digits + 3 spaces
                    className={`w-full pl-10 px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      formErrors.cardNumber ? 'border-red-500 dark:border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1234 5678 9012 3456"
                  />
                  {cardType && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cardType}</span>
                    </div>
                  )}
                </div>
                {formErrors.cardNumber && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.cardNumber}</p>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cardholder Name*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiUser className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="cardholderName"
                    name="cardholderName"
                    value={formData.cardholderName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      formErrors.cardholderName ? 'border-red-500 dark:border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                {formErrors.cardholderName && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.cardholderName}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expiry Month*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiCalendar className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <select
                      id="expiryMonth"
                      name="expiryMonth"
                      value={formData.expiryMonth}
                      onChange={handleInputChange}
                      className={`w-full pl-10 px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        formErrors.expiryMonth ? 'border-red-500 dark:border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Month</option>
                      {monthOptions}
                    </select>
                  </div>
                  {formErrors.expiryMonth && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.expiryMonth}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expiry Year*
                  </label>
                  <select
                    id="expiryYear"
                    name="expiryYear"
                    value={formData.expiryYear}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      formErrors.expiryYear ? 'border-red-500 dark:border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Year</option>
                    {yearOptions}
                  </select>
                  {formErrors.expiryYear && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.expiryYear}</p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CVV/CVC*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiLock className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    maxLength={4}
                    className={`w-full pl-10 px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      formErrors.cvv ? 'border-red-500 dark:border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123"
                  />
                </div>
                {formErrors.cvv && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.cvv}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  The 3 or 4 digit security code on the back of your card
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
                  className={`px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md flex items-center ${
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
                      Save Card
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Card Security Information
            </h2>
            
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <span className="font-medium text-gray-900 dark:text-white">Secure Processing:</span> Your card details are encrypted and securely processed using industry-standard protocols.
              </p>
              <p>
                <span className="font-medium text-gray-900 dark:text-white">Data Storage:</span> We store only the last 4 digits of your card number and the expiry date. Your full card number and CVV are never stored on our servers.
              </p>
              <p>
                <span className="font-medium text-gray-900 dark:text-white">Supported Cards:</span> We accept Visa, Mastercard, American Express, and Discover cards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}