"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { FaMapMarkerAlt, FaPlus, FaEdit, FaTrash, FaCheck } from "react-icons/fa";

interface Address {
  id: number;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    // Simulate API call with mock data
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Mock addresses data
        setAddresses([
          {
            id: 1,
            name: "Home",
            addressLine1: "123 Kimathi Street",
            addressLine2: "Apartment 4B",
            city: "Nairobi CBD",
            postalCode: "00100",
            phone: "+254 712 345 678",
            isDefault: true
          },
          {
            id: 2,
            name: "Office",
            addressLine1: "456 Moi Avenue",
            addressLine2: "Floor 3, Suite 302",
            city: "Nairobi CBD",
            postalCode: "00100",
            phone: "+254 723 456 789",
            isDefault: false
          }
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set address as default
  const setDefaultAddress = (id: number) => {
    setAddresses(addresses.map(address => ({
      ...address,
      isDefault: address.id === id
    })));
  };

  // Delete address
  const deleteAddress = (id: number) => {
    setAddresses(addresses.filter(address => address.id !== id));
  };

  return (
    <MainLayout>
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Addresses</h1>
            <p className="text-gray-600">Manage your delivery addresses</p>
          </div>

          {/* Add New Address Button */}
          <div className="mb-6">
            <button className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
              <FaPlus className="mr-2" /> Add New Address
            </button>
          </div>

          {/* Addresses List */}
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : addresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <div key={address.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-gray-500 mr-2" />
                      <h2 className="text-lg font-medium text-gray-900">{address.name}</h2>
                    </div>
                    {address.isDefault && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  
                  <div className="text-gray-600 mb-6">
                    <p>{address.addressLine1}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p>{address.city}, {address.postalCode}</p>
                    <p className="mt-2">Phone: {address.phone}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                      <FaEdit className="mr-1" /> Edit
                    </button>
                    <button 
                      onClick={() => deleteAddress(address.id)}
                      className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                    {!address.isDefault && (
                      <button 
                        onClick={() => setDefaultAddress(address.id)}
                        className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        <FaCheck className="mr-1" /> Set as Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FaMapMarkerAlt className="mx-auto text-gray-400 text-5xl mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses found</h3>
              <p className="text-gray-600 mb-6">
                You haven't added any delivery addresses yet.
              </p>
              <button className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 inline-block">
                Add Your First Address
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}