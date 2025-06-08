"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import ProductCard from '../../../components/ProductCard';
import { FiStar, FiMapPin, FiPhone, FiMail, FiClock, FiCheck, FiChevronDown } from 'react-icons/fi';

// Mock data for now - will be replaced with API call
const mockMerchant = {
  _id: '101',
  companyName: 'Electronics Hub',
  description: 'We are a leading electronics retailer in Nairobi, offering a wide range of high-quality gadgets and devices at competitive prices. Our store has been serving customers for over 5 years with excellent service and product knowledge.',
  logo: '/images/shops/electronics-hub.svg',
  coverImage: '/images/shops/electronics-hub.svg',
  isVerified: true,
  rating: 4.5,
  reviewCount: 128,
  location: 'Westlands, Nairobi',
  address: 'Shop 23, Westgate Mall, Westlands, Nairobi',
  phone: '+254712345678',
  email: 'info@electronicshub.co.ke',
  website: 'https://electronicshub.co.ke',
  socialMedia: {
    facebook: 'https://facebook.com/electronicshub',
    instagram: 'https://instagram.com/electronicshub',
    twitter: 'https://twitter.com/electronicshub'
  },
  businessHours: [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: 'Closed' }
  ],
  productCount: 45,
  joinedDate: '2019-05-15'
};

const mockProducts = [
  {
    _id: '1',
    name: 'Wireless Bluetooth Headphones',
    price: 5999,
    discountPrice: 4999,
    images: [{ url: '/images/products/headphones.svg', isMain: true }],
    ratings: { average: 4.5, count: 128 },
    merchant: { _id: '101', companyName: 'Electronics Hub', isVerified: true }
  },
  {
    _id: '4',
    name: 'Smart Watch with Heart Rate Monitor',
    price: 8999,
    discountPrice: 7499,
    images: [{ url: '/images/products/smartwatch.svg', isMain: true }],
    ratings: { average: 4.3, count: 156 },
    merchant: { _id: '101', companyName: 'Electronics Hub', isVerified: true }
  },
  {
    _id: '3',
    name: 'Wireless Gaming Mouse',
    price: 3999,
    discountPrice: null,
    images: [{ url: '/images/products/mouse.svg', isMain: true }],
    ratings: { average: 4.4, count: 89 },
    merchant: { _id: '101', companyName: 'Electronics Hub', isVerified: true }
  },
  {
    _id: '6',
    name: 'Wireless Earbuds',
    price: 3500,
    discountPrice: 2999,
    images: [{ url: '/images/products/earbuds.svg', isMain: true }],
    ratings: { average: 4.6, count: 98 },
    merchant: { _id: '101', companyName: 'Electronics Hub', isVerified: true }
  },
  {
    _id: '8',
    name: 'Wireless Keyboard and Mouse Combo',
    price: 5500,
    discountPrice: 4999,
    images: [{ url: '/images/products/mouse.svg', isMain: true }],
    ratings: { average: 4.2, count: 67 },
    merchant: { _id: '101', companyName: 'Electronics Hub', isVerified: true }
  },
  {
    _id: '9',
    name: 'Portable Power Bank 20000mAh',
    price: 2500,
    discountPrice: 1999,
    images: [{ url: '/images/products/charger.svg', isMain: true }],
    ratings: { average: 4.7, count: 112 },
    merchant: { _id: '101', companyName: 'Electronics Hub', isVerified: true }
  }
];

// Sort options
const sortOptions = [
  { id: 'newest', label: 'Newest Arrivals' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'rating', label: 'Highest Rated' },
  { id: 'popularity', label: 'Most Popular' }
];

export default function ShopPage({ params }: { params: { id: string } }) {
  const [merchant, setMerchant] = useState(mockMerchant);
  const [products, setProducts] = useState(mockProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('products');
  const [sortBy, setSortBy] = useState('newest');
  
  // Fetch merchant and products
  useEffect(() => {
    const fetchMerchantAndProducts = async () => {
      try {
        setLoading(true);
        
        // Use real API calls
        const { apiService } = await import('@/lib/api');
        
        // Get merchant data
        const merchantResponse = await apiService.merchants.getById(params.id);
        if (merchantResponse.data) {
          setMerchant(merchantResponse.data);
        }
        
        // Get merchant products
        const productsResponse = await apiService.merchants.getProducts(params.id);
        if (productsResponse.data) {
          setProducts(productsResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching merchant data:', err);
        setError('Failed to load merchant and products');
        setLoading(false);
      }
    };
    
    fetchMerchantAndProducts();
  }, [params.id]);
  
  // Handle sort change
  const handleSortChange = (sortId: string) => {
    setSortBy(sortId);
  };
  
  // Handle add to cart
  const handleAddToCart = (product: any) => {
    console.log(`Adding product ${product._id || product.id} to cart`);
    // Implement cart functionality
  };
  
  // Handle add to wishlist
  const handleAddToWishlist = (product: any) => {
    console.log(`Adding product ${product._id || product.id} to wishlist`);
    // Implement wishlist functionality
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
      
      <div className="mt-[150px]">
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 lg:h-80 w-full bg-gray-300 dark:bg-gray-700">
          {merchant.coverImage ? (
            <Image
              src={merchant.coverImage}
              alt={`${merchant.companyName} cover`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500">
              <span className="text-white text-2xl font-bold">{merchant.companyName}</span>
            </div>
          )}
        </div>
        
        <div className="container mx-auto px-4 py-8">
          {/* Merchant Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 -mt-16 md:-mt-20 relative z-10 mb-8">
            <div className="flex flex-col md:flex-row">
              {/* Logo */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 mb-4 md:mb-0 md:mr-6">
                {merchant.logo ? (
                  <Image
                    src={merchant.logo}
                    alt={`${merchant.companyName} logo`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-orange-100 dark:bg-gray-600 text-orange-500 dark:text-orange-300 text-2xl font-bold">
                    {merchant.companyName.charAt(0)}
                  </div>
                )}
                
                {merchant.isVerified && (
                  <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full">
                    <FiCheck size={12} />
                  </div>
                )}
              </div>
              
              {/* Merchant Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                      {merchant.companyName}
                      {merchant.isVerified && (
                        <span className="inline-block ml-2 text-blue-500 dark:text-blue-400">
                          <FiCheck className="inline" />
                          <span className="text-xs ml-1">Verified</span>
                        </span>
                      )}
                    </h1>
                    
                    <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400">
                      <FiMapPin className="mr-1" />
                      <span>{merchant.location}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        <FiStar className={`${merchant.rating >= 1 ? 'fill-current' : ''}`} />
                        <FiStar className={`${merchant.rating >= 2 ? 'fill-current' : ''}`} />
                        <FiStar className={`${merchant.rating >= 3 ? 'fill-current' : ''}`} />
                        <FiStar className={`${merchant.rating >= 4 ? 'fill-current' : ''}`} />
                        <FiStar className={`${merchant.rating >= 5 ? 'fill-current' : ''}`} />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                        {merchant.rating.toFixed(1)} ({merchant.reviewCount} reviews)
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Member since {new Date(merchant.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </p>
                  </div>
                </div>
                
                <p className="mt-4 text-gray-700 dark:text-gray-300">
                  {merchant.description}
                </p>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-8">
            <div className="flex overflow-x-auto">
              <button 
                onClick={() => setActiveTab('products')}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-b-2 border-orange-500 text-orange-500'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Products ({merchant.productCount})
              </button>
              <button 
                onClick={() => setActiveTab('about')}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'about'
                    ? 'border-b-2 border-orange-500 text-orange-500'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                About
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-orange-500 text-orange-500'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Reviews ({merchant.reviewCount})
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'products' && (
            <div>
              {/* Sort */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
                    Showing <span className="font-medium text-gray-900 dark:text-white">{products.length}</span> products
                  </p>
                  
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-10 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      {sortOptions.map(option => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                      <FiChevronDown size={16} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Product Grid */}
              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => {
                    // Create a new object without the discountPrice property
                    const { discountPrice, ...productWithoutDiscountPrice } = product;
                    
                    // Adapt product to match the expected Product type
                    const adaptedProduct = {
                      ...productWithoutDiscountPrice,
                      id: product._id,
                      category: (product as any).category || 'shop-product',
                      merchantId: product.merchant?._id || params.id,
                      rating: product.ratings?.average || 0,
                      reviewCount: product.ratings?.count || 0,
                      images: product.images || [],
                      // Use discountPrice as salePrice if it exists
                      salePrice: discountPrice || undefined,
                      // Add missing properties required by the Product type
                      description: (product as any).description || '',
                      stock: (product as any).stock || 0,
                      createdAt: (product as any).createdAt || new Date().toISOString(),
                      updatedAt: (product as any).updatedAt || new Date().toISOString(),
                      // Fix merchant property
                      merchant: {
                        id: product.merchant?._id || '',
                        name: product.merchant?.companyName || '',
                        logo: (product.merchant as any)?.logo
                      }
                    };
                    
                    return (
                      <ProductCard
                        key={product._id}
                        product={adaptedProduct}
                        onAddToCart={handleAddToCart}
                        onAddToWishlist={handleAddToWishlist}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    This merchant has no products available at the moment.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'about' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FiMapPin className="mt-1 mr-3 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">Address</p>
                        <p className="text-gray-600 dark:text-gray-400">{merchant.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FiPhone className="mt-1 mr-3 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">Phone</p>
                        <p className="text-gray-600 dark:text-gray-400">{merchant.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FiMail className="mt-1 mr-3 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">Email</p>
                        <p className="text-gray-600 dark:text-gray-400">{merchant.email}</p>
                      </div>
                    </div>
                    
                    {merchant.website && (
                      <div className="flex items-start">
                        <div className="mt-1 mr-3 text-gray-600 dark:text-gray-400">🌐</div>
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium">Website</p>
                          <a 
                            href={merchant.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
                          >
                            {merchant.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Social Media */}
                  {merchant.socialMedia && Object.values(merchant.socialMedia).some(link => link) && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Social Media</h3>
                      <div className="flex space-x-4">
                        {merchant.socialMedia.facebook && (
                          <a 
                            href={merchant.socialMedia.facebook} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Facebook
                          </a>
                        )}
                        {merchant.socialMedia.instagram && (
                          <a 
                            href={merchant.socialMedia.instagram} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
                          >
                            Instagram
                          </a>
                        )}
                        {merchant.socialMedia.twitter && (
                          <a 
                            href={merchant.socialMedia.twitter} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200"
                          >
                            Twitter
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Business Hours</h2>
                  
                  <div className="space-y-3">
                    {merchant.businessHours.map((schedule, index) => (
                      <div key={index} className="flex items-start">
                        <FiClock className="mt-1 mr-3 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium">{schedule.day}</p>
                          <p className="text-gray-600 dark:text-gray-400">{schedule.hours}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Map placeholder */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Location</h3>
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">Map will be implemented in a future update</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <p className="text-gray-700 dark:text-gray-300">
                Reviews will be implemented in a future update.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}