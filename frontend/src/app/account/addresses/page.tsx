"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { 
  FiUser, FiShoppingBag, FiHeart, FiMapPin, FiCreditCard, 
  FiLogOut, FiPlus, FiEdit, FiTrash2, FiCheck, FiX
} from 'react-icons/fi';

// Mock addresses data - will be replaced with API call
const mockAddresses = [
  {
    _id: 'addr1',
    fullName: 'John Doe',
    phone: '0712345678',
    address: '123 Main St, Apartment 4B',
    city: 'Nairobi',
    postalCode: '00100',
    isDefault: true
  },
  {
    _id: 'addr2',
    fullName: 'John Doe',
    phone: '0712345678',
    address: '456 Business Avenue, Office 7',
    city: 'Nairobi',
    postalCode: '00200',
    isDefault: false
  }
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState(mockAddresses);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  
  // Fetch addresses data
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        // Replace with actual API call when backend is ready
        // const response = await fetch('/api/user/addresses');
        // const data = await response.json();
        // setAddresses(data.addresses);
        
        // Using mock data for now
        setTimeout(() => {
          setAddresses(mockAddresses);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Failed to load addresses');
        setLoading(false);
      }
    };
    
    fetchAddresses();
  }, []);
  
  // Handle set default address
  const handleSetDefault = async (addressId: string) => {
    try {
      // Replace with actual API call when backend is ready
      // await fetch(`/api/user/addresses/${addressId}/set-default`, {
      //   method: 'PUT'
      // });
      
      // Update state
      setAddresses(prevAddresses => 
        prevAddresses.map(addr => ({
          ...addr,
          isDefault: addr._id === addressId
        }))
      );
    } catch (err) {
      console.error('Failed to set default address', err);
    }
  };
  
  // Handle delete address
  const handleDeleteAddress = async (addressId: string) => {
    try {
      // Replace with actual API call when backend is ready
      // await fetch(`/api/user/addresses/${addressId}`, {
      //   method: 'DELETE'
      // });
      
      // Update state
      setAddresses(prevAddresses => prevAddresses.filter(addr => addr._id !== addressId));
      setShowDeleteModal(false);
      setAddressToDelete(null);
    } catch (err) {
      console.error('Failed to delete address', err);
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Addresses</h1>
        
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
                <Link href="/account/addresses" className="flex items-center px-4 py-2 text-gray-900 dark:text-white bg-orange-100 dark:bg-orange-900/20 rounded-md">
                  <FiMapPin className="mr-3 text-orange-500 dark:text-orange-400" />
                  <span>Addresses</span>
                </Link>
                <Link href="/account/payment-methods" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <FiCreditCard className="mr-3 text-gray-500 dark:text-gray-400" />
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
                  Saved Addresses
                </h2>
                <Link href="/account/addresses/add">
                  <button className="flex items-center text-sm bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md">
                    <FiPlus className="mr-1" />
                    Add New Address
                  </button>
                </Link>
              </div>
              
              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map(address => (
                    <div 
                      key={address._id} 
                      className={`border rounded-lg p-4 relative ${
                        address.isDefault 
                          ? 'border-green-500 dark:border-green-600' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {address.isDefault && (
                        <div className="absolute top-2 right-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            <FiCheck className="mr-1" />
                            Default
                          </span>
                        </div>
                      )}
                      
                      <div className="mb-4 pt-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {address.fullName}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {address.address}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {address.city}, {address.postalCode}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {address.phone}
                        </p>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Link href={`/account/addresses/edit/${address._id}`}>
                          <button className="flex items-center text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                            <FiEdit className="mr-1" />
                            Edit
                          </button>
                        </Link>
                        
                        <button 
                          onClick={() => {
                            setShowDeleteModal(true);
                            setAddressToDelete(address._id);
                          }}
                          className="flex items-center text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FiTrash2 className="mr-1" />
                          Delete
                        </button>
                        
                        {!address.isDefault && (
                          <button 
                            onClick={() => handleSetDefault(address._id)}
                            className="flex items-center text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          >
                            <FiCheck className="mr-1" />
                            Set as Default
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  <FiMapPin className="mx-auto text-gray-400 dark:text-gray-500 text-4xl mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No addresses saved yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Add a delivery address to make checkout faster.
                  </p>
                  <Link href="/account/addresses/add">
                    <button className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-md font-medium">
                      Add New Address
                    </button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Address Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                Address Tips
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>Make sure your delivery address is accurate and complete</li>
                <li>Include landmarks or building names to help delivery personnel</li>
                <li>Set a default address to speed up the checkout process</li>
                <li>Keep your contact number updated for delivery notifications</li>
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
                      Delete Address
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this address? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleDeleteAddress(addressToDelete!)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
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