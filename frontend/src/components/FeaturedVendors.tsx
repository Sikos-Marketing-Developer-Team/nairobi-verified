import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMapPin, FiStar, FiChevronRight } from 'react-icons/fi';
import { useFeaturedMerchants } from '@/hooks/useApi';
import { Merchant } from '@/types/api';

interface FeaturedVendorsProps {
  title?: string;
  subtitle?: string;
}

const FeaturedVendors: React.FC<FeaturedVendorsProps> = ({
  title = "Our Verified Vendors",
  subtitle = "Shop with confidence from our trusted and verified vendors"
}) => {
  const { data: merchants, isLoading, error } = useFeaturedMerchants();
  
  // Helper function to get location string
  const getLocationString = (merchant: Merchant): string => {
    if (!merchant.location) return 'Nairobi, Kenya';
    
    const { address, city } = merchant.location;
    if (address && city) return `${address}, ${city}`;
    if (address) return address;
    if (city) return city;
    
    return 'Nairobi, Kenya';
  };
  
  // Helper function to get average rating
  const getAverageRating = (merchant: Merchant): number => {
    // This would normally come from the API
    // For now, generate a random rating between 3.5 and 5
    return Math.floor(Math.random() * 15 + 35) / 10;
  };
  
  // Helper function to get review count
  const getReviewCount = (merchant: Merchant): number => {
    // This would normally come from the API
    // For now, generate a random number between 10 and 200
    return Math.floor(Math.random() * 190 + 10);
  };
  
  // Helper function to get product count
  const getProductCount = (merchant: Merchant): number => {
    // This would normally come from the API
    // For now, generate a random number between 5 and 100
    return Math.floor(Math.random() * 95 + 5);
  };
  
  return (
    <section className="py-12 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 dark:text-red-400 py-8">
            Failed to load vendors. Please try again later.
          </div>
        ) : !merchants || merchants.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No vendors available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {merchants.map((merchant: Merchant) => {
              const rating = getAverageRating(merchant);
              const reviewCount = getReviewCount(merchant);
              const productCount = getProductCount(merchant);
              
              return (
                <Link 
                  key={merchant._id} 
                  href={`/shop/${merchant._id}`}
                  className="group"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
                      {merchant.logo ? (
                        <Image
                          src={merchant.logo.startsWith('http') ? merchant.logo : `/${merchant.logo}`}
                          alt={merchant.companyName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                          <span className="text-3xl font-bold text-gray-500 dark:text-gray-400">
                            {merchant.companyName.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      {merchant.isVerified && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Verified
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                        {merchant.companyName}
                      </h3>
                      
                      <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <FiMapPin className="mr-1" />
                        <span>{getLocationString(merchant)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                          <div className="flex text-yellow-400">
                            <FiStar className={`${rating >= 1 ? 'fill-current' : ''}`} />
                            <FiStar className={`${rating >= 2 ? 'fill-current' : ''}`} />
                            <FiStar className={`${rating >= 3 ? 'fill-current' : ''}`} />
                            <FiStar className={`${rating >= 4 ? 'fill-current' : ''}`} />
                            <FiStar className={`${rating >= 5 ? 'fill-current' : ''}`} />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                            ({reviewCount})
                          </span>
                        </div>
                        
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {productCount} products
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        
        <div className="text-center mt-8">
          <a 
            href="/shops" 
            className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium"
          >
            View All Vendors
            <FiChevronRight className="ml-1" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedVendors;