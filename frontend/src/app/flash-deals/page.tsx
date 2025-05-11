"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiClock, FiStar, FiHeart, FiShoppingCart } from 'react-icons/fi';
import MainLayout from '@/components/MainLayout';

// Mock data for flash deals
const flashDeals = [
  {
    id: 1,
    name: 'Wireless Noise Cancelling Headphones',
    originalPrice: 199.99,
    discountPrice: 129.99,
    discountPercentage: 35,
    rating: 4.7,
    reviewCount: 245,
    image: '/images/products/headphones.jpg',
    endTime: new Date(Date.now() + 86400000), // 24 hours from now
    sold: 42,
    available: 58
  },
  {
    id: 2,
    name: 'Smart Watch Series 5',
    originalPrice: 299.99,
    discountPrice: 199.99,
    discountPercentage: 33,
    rating: 4.5,
    reviewCount: 189,
    image: '/images/products/smartwatch.jpg',
    endTime: new Date(Date.now() + 43200000), // 12 hours from now
    sold: 67,
    available: 33
  },
  {
    id: 3,
    name: 'Portable Bluetooth Speaker',
    originalPrice: 89.99,
    discountPrice: 49.99,
    discountPercentage: 44,
    rating: 4.3,
    reviewCount: 156,
    image: '/images/products/speaker.jpg',
    endTime: new Date(Date.now() + 64800000), // 18 hours from now
    sold: 28,
    available: 72
  },
  {
    id: 4,
    name: 'Ultra HD 4K Action Camera',
    originalPrice: 249.99,
    discountPrice: 149.99,
    discountPercentage: 40,
    rating: 4.6,
    reviewCount: 112,
    image: '/images/products/camera.jpg',
    endTime: new Date(Date.now() + 32400000), // 9 hours from now
    sold: 53,
    available: 47
  },
  {
    id: 5,
    name: 'Ergonomic Gaming Chair',
    originalPrice: 199.99,
    discountPrice: 139.99,
    discountPercentage: 30,
    rating: 4.4,
    reviewCount: 98,
    image: '/images/products/chair.jpg',
    endTime: new Date(Date.now() + 54000000), // 15 hours from now
    sold: 35,
    available: 65
  },
  {
    id: 6,
    name: 'Wireless Gaming Mouse',
    originalPrice: 79.99,
    discountPrice: 39.99,
    discountPercentage: 50,
    rating: 4.8,
    reviewCount: 203,
    image: '/images/products/mouse.jpg',
    endTime: new Date(Date.now() + 21600000), // 6 hours from now
    sold: 75,
    available: 25
  }
];

export default function FlashDealsPage() {
  const [timeLeft, setTimeLeft] = useState<{[key: number]: {hours: number, minutes: number, seconds: number}}>(
    flashDeals.reduce((acc, deal) => ({
      ...acc,
      [deal.id]: getTimeLeft(deal.endTime)
    }), {})
  );

  function getTimeLeft(endTime: Date) {
    const total = endTime.getTime() - Date.now();
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)));
    
    return {
      hours,
      minutes,
      seconds
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(
        flashDeals.reduce((acc, deal) => ({
          ...acc,
          [deal.id]: getTimeLeft(deal.endTime)
        }), {})
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen py-8 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Flash Deals</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Limited-time offers with massive discounts. Grab them before they're gone!
            </p>
          </div>

          {/* Flash Deals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashDeals.map((deal) => (
              <div key={deal.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all">
                <div className="relative">
                  {/* Product Image */}
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {deal.image ? (
                      <Image
                        src={deal.image}
                        alt={deal.name}
                        width={300}
                        height={300}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="text-4xl text-gray-400">
                        <i className="bx bx-image"></i>
                      </div>
                    )}
                  </div>
                  
                  {/* Discount Badge */}
                  <div className="absolute top-0 left-0 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-br-lg">
                    {deal.discountPercentage}% OFF
                  </div>
                  
                  {/* Wishlist Button */}
                  <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 bg-white rounded-full p-1.5 shadow-sm">
                    <FiHeart size={18} />
                  </button>
                </div>
                
                <div className="p-4">
                  {/* Product Name */}
                  <h3 className="font-medium text-gray-900 mb-1 truncate">{deal.name}</h3>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400 mr-1">
                      <FiStar className="fill-current" />
                    </div>
                    <span className="text-sm text-gray-600">{deal.rating} ({deal.reviewCount})</span>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center mb-3">
                    <span className="text-lg font-bold text-red-600">${deal.discountPrice}</span>
                    <span className="text-sm text-gray-500 line-through ml-2">${deal.originalPrice}</span>
                  </div>
                  
                  {/* Timer */}
                  <div className="flex items-center mb-3 text-sm text-gray-600">
                    <FiClock className="mr-1" />
                    <span>
                      Ends in: {timeLeft[deal.id]?.hours.toString().padStart(2, '0')}:
                      {timeLeft[deal.id]?.minutes.toString().padStart(2, '0')}:
                      {timeLeft[deal.id]?.seconds.toString().padStart(2, '0')}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{deal.sold} sold</span>
                      <span>{deal.available} available</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${(deal.sold / (deal.sold + deal.available)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-md transition-colors flex items-center justify-center">
                    <FiShoppingCart className="mr-2" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* More Deals Section */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">More Ways to Save</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/hot-deals" className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-2">Hot Deals</h3>
                <p className="mb-4">Explore our best-selling products at discounted prices.</p>
                <span className="inline-block border-b-2 border-white">Shop Now</span>
              </Link>
              
              <Link href="/clearance" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-2">Clearance Sale</h3>
                <p className="mb-4">Last chance to buy products that are being discontinued.</p>
                <span className="inline-block border-b-2 border-white">Shop Now</span>
              </Link>
              
              <Link href="/bundle-deals" className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-2">Bundle Deals</h3>
                <p className="mb-4">Save more when you buy products together in bundles.</p>
                <span className="inline-block border-b-2 border-white">Shop Now</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}