"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { FaCreditCard, FaMobileAlt, FaPlus, FaEdit, FaTrash, FaCheck } from "react-icons/fa";

interface PaymentMethod {
  id: number;
  type: "card" | "mobile";
  name: string;
  details: string;
  expiryDate?: string;
  isDefault: boolean;
}

export default function PaymentMethodsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    // Simulate API call with mock data
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Mock payment methods data
        setPaymentMethods([
          {
            id: 1,
            type: "mobile",
            name: "M-Pesa",
            details: "+254 712 345 678",
            isDefault: true
          },
          {
            id: 2,
            type: "card",
            name: "Visa ending in 4242",
            details: "John Doe",
            expiryDate: "12/25",
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

  // Set payment method as default
  const setDefaultPaymentMethod = (id: number) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };

  // Delete payment method
  const deletePaymentMethod = (id: number) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
  };

  return (
    <MainLayout>
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Payment Methods</h1>
            <p className="text-gray-600">Manage your payment options</p>
          </div>

          {/* Add New Payment Method Button */}
          <div className="mb-6">
            <button className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
              <FaPlus className="mr-2" /> Add Payment Method
            </button>
          </div>

          {/* Payment Methods List */}
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : paymentMethods.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paymentMethods.map((method) => (
                <div key={method.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      {method.type === "card" ? (
                        <FaCreditCard className="text-gray-500 mr-2" />
                      ) : (
                        <FaMobileAlt className="text-gray-500 mr-2" />
                      )}
                      <h2 className="text-lg font-medium text-gray-900">{method.name}</h2>
                    </div>
                    {method.isDefault && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  
                  <div className="text-gray-600 mb-6">
                    <p>Name: {method.details}</p>
                    {method.expiryDate && <p className="mt-1">Expires: {method.expiryDate}</p>}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                      <FaEdit className="mr-1" /> Edit
                    </button>
                    <button 
                      onClick={() => deletePaymentMethod(method.id)}
                      className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                    {!method.isDefault && (
                      <button 
                        onClick={() => setDefaultPaymentMethod(method.id)}
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
              <FaCreditCard className="mx-auto text-gray-400 text-5xl mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods found</h3>
              <p className="text-gray-600 mb-6">
                You haven't added any payment methods yet.
              </p>
              <button className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 inline-block">
                Add Your First Payment Method
              </button>
            </div>
          )}
          
          {/* Payment Information */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Information</h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Secure Payments</h3>
                <p className="text-blue-700 text-sm">
                  All payment information is encrypted and securely stored. We never store your full card details on our servers.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Accepted Payment Methods</h3>
                <ul className="list-disc list-inside text-gray-600 text-sm">
                  <li>M-Pesa</li>
                  <li>Credit/Debit Cards (Visa, Mastercard)</li>
                  <li>Bank Transfer</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Payment Security</h3>
                <p className="text-gray-600 text-sm">
                  We use industry-standard encryption and security protocols to ensure your payment information is always protected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}