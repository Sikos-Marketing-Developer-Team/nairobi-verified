import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMapPin, FiStar, FiChevronRight } from 'react-icons/fi';

// Mock data for now - will be replaced with API call
const mockVendors = [
  {
    _id: '101',
    companyName: 'Electronics Hub',
    location: 'Westlands, Nairobi',
    rating: 4.5,
    reviewCount: 128,
    isVerified: true,
    image: '/images/shops/electronics-hub.svg',
    productCount: 45
  },
  {
    _id: '102',
    companyName: 'Gadget World',
    location: 'Karen, Nairobi',
    rating: 4.7,
    reviewCount: 156,
    isVerified: true,
    image: '/images/shops/gadget-world.svg',
    productCount: 78
  },
  {
    _id: '103',
    companyName: 'Fashion Store',
    location: 'Kilimani, Nairobi',
    rating: 4.3,
    reviewCount: 96,
    isVerified: false,
    image: '/images/shops/fashion-store.svg',
    productCount: 120
  },
  {
    _id: '104',
    companyName: 'Home Essentials',
    location: 'Lavington, Nairobi',
    rating: 4.6,
    reviewCount: 112,
    isVerified: true,
    image: '/images/shops/home-essentials.svg',
    productCount: 65
  }
];

interface FeaturedVendorsProps {
  title?: string;
  subtitle?: string;
}

const FeaturedVendors: React.FC<FeaturedVendorsProps> = ({
  title = "Our Verified Vendors",
  subtitle = "Shop with confidence from our trusted and verified vendors"
}) => {
  const [vendors, setVendors] = useState(mockVendors);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch featured vendors from API
  useEffect(() => {
    const fetchFeaturedVendors = async () => {
      try {
        setLoading(true);
        // Replace with actual API call when backend is ready
        // const response = await fetch('/api/vendors/featured');
        // const data = await response.json();
        // setVendors(data.vendors);
        
        // Using mock data for now
        setTimeout(() => {
          setVendors(mockVendors);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Failed to load vendors');
        setLoading(false);
      }
    };
    
    fetchFeaturedVendors();
  }, []);
  
  return (
    <section className="py-12 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 dark:text-red-400 py-8">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vendors.map(vendor => (
              <Link 
                key={vendor._id} 
                href={`/shop/${vendor._id}`}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
                    {vendor.image ? (
                      <Image
                        src={vendor.image}
                        alt={vendor.companyName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                        <span className="text-gray-500 dark:text-gray-400">No image</span>
                      </div>
                    )}
                    
                    {vendor.isVerified && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Verified
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                      {vendor.companyName}
                    </h3>
                    
                    <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <FiMapPin className="mr-1" />
                      <span>{vendor.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          <FiStar className={`${vendor.rating >= 1 ? 'fill-current' : ''}`} />
                          <FiStar className={`${vendor.rating >= 2 ? 'fill-current' : ''}`} />
                          <FiStar className={`${vendor.rating >= 3 ? 'fill-current' : ''}`} />
                          <FiStar className={`${vendor.rating >= 4 ? 'fill-current' : ''}`} />
                          <FiStar className={`${vendor.rating >= 5 ? 'fill-current' : ''}`} />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          ({vendor.reviewCount})
                        </span>
                      </div>
                      
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {vendor.productCount} products
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        <div className="text-center mt-8">
          <a 
            href="/vendors" 
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