"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { FiFilter, FiChevronDown, FiX, FiCheck } from 'react-icons/fi';
import { Loader2 } from 'lucide-react';

// Define interfaces for type safety
interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: Array<{url: string, isMain: boolean}>;
  ratings: {
    average: number;
    count: number;
  };
  merchant: {
    _id: string;
    companyName: string;
    isVerified: boolean;
  };
}

// Define filter interfaces
const filterOptions = [
  {
    _id: '1',
    name: 'Wireless Bluetooth Headphones',
    price: 5999,
    discountPrice: 4999,
    images: [{ url: '/images/products/headphones.jpg', isMain: true }],
    ratings: { average: 4.5, count: 128 },
    merchant: { _id: '101', companyName: 'Electronics Hub', isVerified: true }
  },
  {
    _id: '2',
    name: 'Smartphone Stand with Wireless Charger',
    price: 2500,
    discountPrice: 1999,
    images: [{ url: '/images/products/phone-stand.jpg', isMain: true }],
    ratings: { average: 4.2, count: 75 },
    merchant: { _id: '102', companyName: 'Gadget World', isVerified: true }
  },
  {
    _id: '3',
    name: 'Wireless Gaming Mouse',
    price: 3999,
    discountPrice: null,
    images: [{ url: '/images/products/mouse.jpg', isMain: true }],
    ratings: { average: 4.4, count: 89 },
    merchant: { _id: '101', companyName: 'Electronics Hub', isVerified: true }
  },
  {
    _id: '4',
    name: 'Smart Watch with Heart Rate Monitor',
    price: 8999,
    discountPrice: 7499,
    images: [{ url: '/images/products/smartwatch.jpg', isMain: true }],
    ratings: { average: 4.3, count: 156 },
    merchant: { _id: '101', companyName: 'Electronics Hub', isVerified: true }
  },
  {
    _id: '5',
    name: 'Portable Bluetooth Speaker',
    price: 4500,
    discountPrice: 3999,
    images: [{ url: '/images/products/speaker.jpg', isMain: true }],
    ratings: { average: 4.1, count: 112 },
    merchant: { _id: '102', companyName: 'Gadget World', isVerified: true }
  },
  {
    _id: '6',
    name: 'Wireless Earbuds',
    price: 3500,
    discountPrice: 2999,
    images: [{ url: '/images/products/earbuds.jpg', isMain: true }],
    ratings: { average: 4.6, count: 98 },
    merchant: { _id: '101', companyName: 'Electronics Hub', isVerified: true }
  },
  {
    _id: '7',
    name: 'USB-C Hub Adapter',
    price: 2200,
    discountPrice: null,
    images: [{ url: '/images/products/usb-hub.jpg', isMain: true }],
    ratings: { average: 4.0, count: 45 },
    merchant: { _id: '102', companyName: 'Gadget World', isVerified: true }
  },
  {
    _id: '8',
    name: 'Wireless Keyboard and Mouse Combo',
    price: 5500,
    discountPrice: 4999,
    images: [{ url: '/images/products/keyboard.jpg', isMain: true }],
    ratings: { average: 4.2, count: 67 },
    merchant: { _id: '101', companyName: 'Electronics Hub', isVerified: true }
  }
];

// Mock filter options
const mockFilters = {
  price: [
    { id: 'price-1', label: 'Under KSh 1,000', value: [0, 1000] },
    { id: 'price-2', label: 'KSh 1,000 - KSh 5,000', value: [1000, 5000] },
    { id: 'price-3', label: 'KSh 5,000 - KSh 10,000', value: [5000, 10000] },
    { id: 'price-4', label: 'Over KSh 10,000', value: [10000, 1000000] }
  ],
  merchants: [
    { id: '101', name: 'Electronics Hub', count: 5 },
    { id: '102', name: 'Gadget World', count: 3 },
    { id: '103', name: 'Tech Store', count: 0 }
  ],
  rating: [
    { id: 'rating-4', label: '4 Stars & Above', value: 4 },
    { id: 'rating-3', label: '3 Stars & Above', value: 3 },
    { id: 'rating-2', label: '2 Stars & Above', value: 2 },
    { id: 'rating-1', label: '1 Star & Above', value: 1 }
  ],
  discount: [
    { id: 'discount-1', label: 'On Sale', value: true }
  ]
};

// Sort options
const sortOptions = [
  { id: 'newest', label: 'Newest Arrivals' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'rating', label: 'Highest Rated' },
  { id: 'popularity', label: 'Most Popular' }
];

export default function CategoryPage({ params }: { params: { slug: string } }) {
  // Define types for our data
  interface Category {
    _id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    icon?: string;
  }
  
  interface Product {
    _id: string;
    name: string;
    price: number;
    discountPrice: number | null;
    images: Array<{url: string, isMain: boolean}>;
    ratings: {
      average: number;
      count: number;
    };
    merchant: {
      _id: string;
      companyName: string;
      isVerified: boolean;
    };
  }
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    price: [] as string[],
    merchants: [] as string[],
    rating: [] as string[],
    discount: [] as string[]
  });
  
  // Sort state
  const [sortBy, setSortBy] = useState('newest');
  
  // Mobile filter visibility
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Available merchants for filtering (will be populated from API)
  const [availableMerchants, setAvailableMerchants] = useState<{id: string, name: string, count: number}[]>([]);
  
  // Fetch category and products
  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch category data
        const categoryResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories/${params.slug}`);
        
        if (!categoryResponse.ok) {
          throw new Error('Failed to fetch category');
        }
        
        const categoryData = await categoryResponse.json();
        setCategory(categoryData.category);
        
        // Fetch products in this category
        const productsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products?category=${params.slug}&limit=50`
        );
        
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const productsData = await productsResponse.json();
        setProducts(productsData.products);
        
        // Extract unique merchants from products for filter
        const merchantsMap = new Map();
        productsData.products.forEach((product: Product) => {
          if (!merchantsMap.has(product.merchant._id)) {
            merchantsMap.set(product.merchant._id, {
              id: product.merchant._id,
              name: product.merchant.companyName,
              count: 1
            });
          } else {
            const merchant = merchantsMap.get(product.merchant._id);
            merchant.count += 1;
            merchantsMap.set(product.merchant._id, merchant);
          }
        });
        
        setAvailableMerchants(Array.from(merchantsMap.values()));
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Failed to load category and products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryAndProducts();
  }, [params.slug]);
  
  // Handle filter change
  const handleFilterChange = (filterType: string, filterId: string) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters };
      
      if (updatedFilters[filterType as keyof typeof updatedFilters].includes(filterId)) {
        // Remove filter if already selected
        updatedFilters[filterType as keyof typeof updatedFilters] = updatedFilters[filterType as keyof typeof updatedFilters]
          .filter(id => id !== filterId);
      } else {
        // Add filter
        updatedFilters[filterType as keyof typeof updatedFilters] = [
          ...updatedFilters[filterType as keyof typeof updatedFilters],
          filterId
        ];
      }
      
      return updatedFilters;
    });
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      price: [],
      merchants: [],
      rating: [],
      discount: []
    });
  };
  
  // Handle sort change
  const handleSortChange = (sortId: string) => {
    setSortBy(sortId);
  };
  
  // Handle add to cart
  const handleAddToCart = (productId: string) => {
    console.log(`Adding product ${productId} to cart`);
    // Implement cart functionality
  };
  
  // Handle add to wishlist
  const handleAddToWishlist = (productId: string) => {
    console.log(`Adding product ${productId} to wishlist`);
    // Implement wishlist functionality
  };
  
  // Count active filters
  const activeFilterCount = Object.values(filters).reduce(
    (count, filterArray) => count + filterArray.length, 
    0
  );
  
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
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/" className="hover:text-orange-500 dark:hover:text-orange-400">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/categories" className="hover:text-orange-500 dark:hover:text-orange-400">Categories</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white">{category?.name}</span>
        </div>
        
        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {category?.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {category?.description}
          </p>
        </div>
        
        {/* Mobile Filter Button */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="w-full flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-gray-700 dark:text-gray-300"
          >
            <FiFilter className="mr-2" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters - Desktop */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {/* Price Filter */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Price</h3>
                <div className="space-y-2">
                  {mockFilters.price.map(option => (
                    <div key={option.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={option.id}
                        checked={filters.price.includes(option.id)}
                        onChange={() => handleFilterChange('price', option.id)}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                      />
                      <label htmlFor={option.id} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Merchant Filter */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Merchants</h3>
                <div className="space-y-2">
                  {mockFilters.merchants.map(merchant => (
                    <div key={merchant.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`merchant-${merchant.id}`}
                        checked={filters.merchants.includes(merchant.id)}
                        onChange={() => handleFilterChange('merchants', merchant.id)}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                        disabled={merchant.count === 0}
                      />
                      <label 
                        htmlFor={`merchant-${merchant.id}`} 
                        className={`ml-2 text-sm ${
                          merchant.count === 0 
                            ? 'text-gray-400 dark:text-gray-500' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {merchant.name} ({merchant.count})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Rating Filter */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Rating</h3>
                <div className="space-y-2">
                  {mockFilters.rating.map(option => (
                    <div key={option.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={option.id}
                        checked={filters.rating.includes(option.id)}
                        onChange={() => handleFilterChange('rating', option.id)}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                      />
                      <label htmlFor={option.id} className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Discount Filter */}
              <div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Discount</h3>
                <div className="space-y-2">
                  {mockFilters.discount.map(option => (
                    <div key={option.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={option.id}
                        checked={filters.discount.includes(option.id)}
                        onChange={() => handleFilterChange('discount', option.id)}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                      />
                      <label htmlFor={option.id} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Filters */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-40 flex md:hidden">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)}></div>
              <div className="relative w-full max-w-xs bg-white dark:bg-gray-800 h-full overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FiX size={24} />
                  </button>
                </div>
                
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="w-full text-center py-2 mb-4 text-sm text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
                  >
                    Clear All Filters
                  </button>
                )}
                
                {/* Price Filter */}
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Price</h3>
                  <div className="space-y-2">
                    {mockFilters.price.map(option => (
                      <div key={option.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`mobile-${option.id}`}
                          checked={filters.price.includes(option.id)}
                          onChange={() => handleFilterChange('price', option.id)}
                          className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                        />
                        <label htmlFor={`mobile-${option.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Merchant Filter */}
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Merchants</h3>
                  <div className="space-y-2">
                    {mockFilters.merchants.map(merchant => (
                      <div key={merchant.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`mobile-merchant-${merchant.id}`}
                          checked={filters.merchants.includes(merchant.id)}
                          onChange={() => handleFilterChange('merchants', merchant.id)}
                          className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                          disabled={merchant.count === 0}
                        />
                        <label 
                          htmlFor={`mobile-merchant-${merchant.id}`} 
                          className={`ml-2 text-sm ${
                            merchant.count === 0 
                              ? 'text-gray-400 dark:text-gray-500' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {merchant.name} ({merchant.count})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Rating Filter */}
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Rating</h3>
                  <div className="space-y-2">
                    {mockFilters.rating.map(option => (
                      <div key={option.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`mobile-${option.id}`}
                          checked={filters.rating.includes(option.id)}
                          onChange={() => handleFilterChange('rating', option.id)}
                          className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                        />
                        <label htmlFor={`mobile-${option.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Discount Filter */}
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Discount</h3>
                  <div className="space-y-2">
                    {mockFilters.discount.map(option => (
                      <div key={option.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`mobile-${option.id}`}
                          checked={filters.discount.includes(option.id)}
                          onChange={() => handleFilterChange('discount', option.id)}
                          className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                        />
                        <label htmlFor={`mobile-${option.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Products */}
          <div className="flex-1">
            {/* Sort and Results Count */}
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
            
            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filters).map(([filterType, selectedIds]) => 
                    selectedIds.map(id => {
                      let label = '';
                      
                      if (filterType === 'price') {
                        label = mockFilters.price.find(option => option.id === id)?.label || '';
                      } else if (filterType === 'merchants') {
                        label = mockFilters.merchants.find(merchant => merchant.id === id)?.name || '';
                      } else if (filterType === 'rating') {
                        label = mockFilters.rating.find(option => option.id === id)?.label || '';
                      } else if (filterType === 'discount') {
                        label = mockFilters.discount.find(option => option.id === id)?.label || '';
                      }
                      
                      return (
                        <div 
                          key={`${filterType}-${id}`}
                          className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <span>{label}</span>
                          <button
                            onClick={() => handleFilterChange(filterType, id)}
                            className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
            
            {/* Product Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No products found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}