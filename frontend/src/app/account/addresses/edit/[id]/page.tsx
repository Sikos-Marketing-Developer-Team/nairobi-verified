"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { 
  FiArrowLeft, FiMapPin, FiUser, FiPhone, FiHome, FiMail, FiCheck, FiAlertCircle
} from 'react-icons/fi';

// Mock addresses data - will be replaced with API call
const mockAddresses = [
  {
    _id: 'addr1',
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '0712345678',
    address: '123 Main St, Apartment 4B',
    city: 'Nairobi',
    postalCode: '00100',
    isDefault: true
  },
  {
    _id: 'addr2',
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '0712345678',
    address: '456 Business Avenue, Office 7',
    city: 'Nairobi',
    postalCode: '00200',
    isDefault: false
  }
];

export default function EditAddressPage() {
  const params = useParams();
  const addressId = params.id as string;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Nairobi',
    postalCode: '',
    isDefault: false
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    postalCode: ''
  });
  
  // Fetch address data
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        setLoading(true);
        // Replace with actual API call when backend is ready
        // const response = await fetch(`/api/user/addresses/${addressId}`);
        // if (!response.ok) {
        //   if (response.status === 404) {
        //     setNotFound(true);
        //   } else {
        //     throw new Error('Failed to fetch address');
        //   }
        //   return;
        // }
        // const data = await response.json();
        // setFormData(data.address);
        
        // Using mock data for now
        setTimeout(() => {
          const address = mockAddresses.find(addr => addr._id === addressId);
          if (address) {
            setFormData(address);
          } else {
            setNotFound(true);
          }
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Failed to load address details');
        setLoading(false);
      }
    };
    
    fetchAddress();
  }, [addressId]);
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      valid = false;
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      valid = false;
    } else if (!/^(?:\+254|0)[17]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Kenyan phone number';
      valid = false;
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
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
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Replace with actual API call when backend is ready
      // const response = await fetch(`/api/user/addresses/${addressId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(formData)
      // });
      // const data = await response.json();
      // if (!response.ok) {
      //   throw new Error(data.message || 'Failed to update address');
      // }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to addresses page
      router.push('/account/addresses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update address');
      setSubmitting(false);
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
  
  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8 mt-[150px]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto">
            <div className="text-red-500 dark:text-red-400 text-5xl mb-4">
              <FiAlertCircle className="mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Address Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The address you're trying to edit doesn't exist or has been deleted.
            </p>
            <Link href="/account/addresses">
              <button className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-md font-medium">
                Back to Addresses
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-[150px]">
        <div className="mb-6">
          <Link href="/account/addresses" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400">
            <FiArrowLeft className="mr-2" />
            Back to Addresses
          </Link>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Address</h1>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-md">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiUser className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full pl-10 px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        formErrors.fullName ? 'border-red-500 dark:border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="John Doe"
                    />
                  </div>
                  {formErrors.fullName && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.fullName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiMail className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        formErrors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiPhone className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full pl-10 px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      formErrors.phone ? 'border-red-500 dark:border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0712 345 678"
                  />
                </div>
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Format: 07XX XXX XXX or +254 7XX XXX XXX
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiHome className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full pl-10 px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      formErrors.address ? 'border-red-500 dark:border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123 Main St, Apartment 4B"
                  />
                </div>
                {formErrors.address && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City*
                  </label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="Nairobi">Nairobi</option>
                    <option value="Mombasa">Mombasa</option>
                    <option value="Kisumu">Kisumu</option>
                    <option value="Nakuru">Nakuru</option>
                    <option value="Eldoret">Eldoret</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      formErrors.postalCode ? 'border-red-500 dark:border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="00100"
                  />
                  {formErrors.postalCode && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.postalCode}</p>
                  )}
                </div>
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
                    Set as default address
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Link href="/account/addresses">
                  <button type="button" className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Cancel
                  </button>
                </Link>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md flex items-center ${
                    submitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FiCheck className="mr-2" />
                      Update Address
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}