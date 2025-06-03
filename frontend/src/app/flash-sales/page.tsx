"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import MainLayout from "@/components/MainLayout";
import { FaBolt, FaShoppingCart, FaStar, FaRegClock } from "react-icons/fa";

interface Product {
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  category: string;
  vendor: string;
  rating: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isFlashSale?: boolean;
}

interface FlashSale {
  id: number;
  product: Product;
  discount: number;
  endsAt: string;
}

export default function FlashSalesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Use real API calls
        const { apiService } = await import('@/lib/api');
        
        // Get flash sales data - assuming there's an endpoint for flash sales
        // If there's no specific endpoint, we can use the featured products endpoint
        const response = await apiService.products.getFeatured();
        
        if (response.data) {
          // Transform the data to match the FlashSale type
          const salesData = response.data.map((product: any, index: number) => {
            // Calculate discount percentage
            const price = product.price || 0;
            const discountPrice = product.discountPrice || 0;
            const discount = price > 0 ? Math.round(((price - discountPrice) / price) * 100) : 0;
            
            // Generate a future end date
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 5) + 1); // 1-5 days from now
            
            return {
              id: product.id || product._id || index + 1,
              product: {
                id: product.id || product._id || index + 100,
                name: product.name || `Product ${index + 1}`,
                price: product.price || 9999,
                discountPrice: product.discountPrice || (product.price ? product.price * 0.8 : 7999),
                image: product.images?.[0]?.url || `/images/products/placeholder.jpg`,
                category: product.category || "Electronics",
                vendor: product.merchant?.companyName || "Verified Merchant",
                rating: product.ratings?.average || 4.5,
                isFlashSale: true
              },
              discount: discount || 20,
              endsAt: endDate.toISOString().split('T')[0]
            };
          });
          
          setFlashSales(salesData);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching flash sales data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to render product card
  const renderProductCard = (sale: FlashSale) => (
    <div key={sale.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <div className="h-48 bg-gray-200">
          {sale.product.image ? (
            <Image
              src={sale.product.image}
              alt={sale.product.name}
              width={300}
              height={300}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
        
        {/* Flash Sale Badge */}
        <div className="absolute top-0 left-0">
          <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 m-2 rounded flex items-center">
            <FaBolt className="mr-1" /> {sale.discount}% OFF
          </div>
        </div>
        
        {/* Countdown Badge */}
        <div className="absolute top-0 right-0">
          <div className="bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 m-2 rounded flex items-center">
            <FaRegClock className="mr-1" /> Ends soon
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1">{sale.product.name}</h3>
        
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400 mr-1">
            <FaStar className="fill-current" />
          </div>
          <span className="text-sm text-gray-600">{sale.product.rating}</span>
          <span className="text-sm text-gray-500 ml-2">{sale.product.vendor}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">KSh {sale.product.discountPrice?.toLocaleString()}</span>
            <span className="text-sm text-gray-500 line-through ml-2">KSh {sale.product.price.toLocaleString()}</span>
          </div>
          <button className="text-white bg-orange-600 p-2 rounded-full hover:bg-orange-700">
            <FaShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Flash Sales Header */}
          <div className="mb-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 p-6 shadow-md">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                  <FaBolt className="mr-2" /> Flash Sales
                </h1>
                <p className="text-white text-opacity-90 mt-1">
                  Incredible deals at unbeatable prices. Limited time only!
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 text-white">
                <div className="text-center">
                  <p className="text-sm mb-1">Ends in</p>
                  <div className="flex space-x-2">
                    <div className="bg-black bg-opacity-30 px-3 py-2 rounded">
                      <span className="text-xl font-bold">2</span>
                      <span className="text-xs block">Days</span>
                    </div>
                    <div className="bg-black bg-opacity-30 px-3 py-2 rounded">
                      <span className="text-xl font-bold">8</span>
                      <span className="text-xs block">Hours</span>
                    </div>
                    <div className="bg-black bg-opacity-30 px-3 py-2 rounded">
                      <span className="text-xl font-bold">45</span>
                      <span className="text-xs block">Mins</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              <button className="whitespace-nowrap px-4 py-2 bg-orange-600 text-white rounded-full">
                All Categories
              </button>
              <button className="whitespace-nowrap px-4 py-2 bg-white text-gray-700 rounded-full hover:bg-gray-100">
                Electronics
              </button>
              <button className="whitespace-nowrap px-4 py-2 bg-white text-gray-700 rounded-full hover:bg-gray-100">
                Fashion
              </button>
              <button className="whitespace-nowrap px-4 py-2 bg-white text-gray-700 rounded-full hover:bg-gray-100">
                Home & Kitchen
              </button>
              <button className="whitespace-nowrap px-4 py-2 bg-white text-gray-700 rounded-full hover:bg-gray-100">
                Beauty
              </button>
              <button className="whitespace-nowrap px-4 py-2 bg-white text-gray-700 rounded-full hover:bg-gray-100">
                Sports
              </button>
            </div>
          </div>

          {/* Flash Sales Products */}
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {flashSales.map((sale) => renderProductCard(sale))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}