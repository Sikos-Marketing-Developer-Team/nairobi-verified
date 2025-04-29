"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function MapPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading the map
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Shop Locations</h1>
        
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <p className="text-gray-700 mb-4">
            Find verified vendors across Nairobi CBD. Use the map below to locate shops and get directions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search for shops or locations"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home">Home & Garden</option>
                <option value="beauty">Beauty & Health</option>
                <option value="food">Food & Groceries</option>
              </select>
            </div>
            <button className="bg-[#EC5C0B] text-white py-2 px-4 rounded-md hover:bg-[#C94A06]">
              Search
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-[500px] bg-gray-200 relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#EC5C0B]"></div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-500 text-center">
                  Map visualization will be implemented here.<br />
                  This is a placeholder for the Google Maps integration.
                </p>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <h3 className="font-semibold text-lg mb-2">Nearby Verified Vendors</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-start p-2 hover:bg-gray-50 rounded">
                  <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                    <i className="bx bx-store text-gray-400 text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-medium">Sample Vendor {item}</h4>
                    <p className="text-sm text-gray-600">123 Kenyatta Avenue, Nairobi</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Verified</span>
                      <span className="text-xs text-gray-500 ml-2">Electronics</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}