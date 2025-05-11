"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiSearch, FiMapPin, FiStar, FiFilter, FiChevronDown } from 'react-icons/fi';
import MainLayout from '@/components/MainLayout';

// Mock data for shops
const shops = [
  {
    id: 1,
    slug: 'tech-hub-electronics',
    name: 'Tech Hub Electronics',
    logo: '/images/shops/tech-hub.jpg',
    coverImage: '/images/shops/tech-hub-cover.jpg',
    category: 'Electronics',
    location: 'Moi Avenue, Nairobi CBD',
    rating: 4.8,
    reviewCount: 124,
    verified: true,
    featured: true,
    description: 'Your one-stop shop for all electronics and gadgets. We offer a wide range of products including smartphones, laptops, accessories, and more.',
    productCount: 78
  },
  {
    id: 2,
    slug: 'fashion-trends',
    name: 'Fashion Trends',
    logo: '/images/shops/fashion-trends.jpg',
    coverImage: '/images/shops/fashion-trends-cover.jpg',
    category: 'Fashion',
    location: 'Kimathi Street, Nairobi CBD',
    rating: 4.6,
    reviewCount: 98,
    verified: true,
    featured: true,
    description: 'Discover the latest fashion trends for men and women. We offer clothing, shoes, and accessories from top brands at affordable prices.',
    productCount: 120
  },
  {
    id: 3,
    slug: 'home-essentials',
    name: 'Home Essentials',
    logo: '/images/shops/home-essentials.jpg',
    coverImage: '/images/shops/home-essentials-cover.jpg',
    category: 'Home & Kitchen',
    location: 'Biashara Street, Nairobi CBD',
    rating: 4.5,
    reviewCount: 76,
    verified: true,
    featured: false,
    description: 'Everything you need for your home. We offer furniture, kitchenware, home decor, and more to make your house a home.',
    productCount: 95
  },
  {
    id: 4,
    slug: 'beauty-spot',
    name: 'Beauty Spot',
    logo: '/images/shops/beauty-spot.jpg',
    coverImage: '/images/shops/beauty-spot-cover.jpg',
    category: 'Beauty',
    location: 'Kenyatta Avenue, Nairobi CBD',
    rating: 4.7,
    reviewCount: 112,
    verified: true,
    featured: false,
    description: 'Your beauty destination. We offer a wide range of skincare, makeup, haircare, and fragrance products from top brands.',
    productCount: 86
  },
  {
    id: 5,
    slug: 'sports-world',
    name: 'Sports World',
    logo: '/images/shops/sports-world.jpg',
    coverImage: '/images/shops/sports-world-cover.jpg',
    category: 'Sports',
    location: 'Muindi Mbingu Street, Nairobi CBD',
    rating: 4.4,
    reviewCount: 68,
    verified: true,
    featured: false,
    description: 'Everything for the sports enthusiast. We offer sports equipment, clothing, and accessories for various sports and outdoor activities.',
    productCount: 64
  },
  {
    id: 6,
    slug: 'book-haven',
    name: 'Book Haven',
    logo: '/images/shops/book-haven.jpg',
    coverImage: '/images/shops/book-haven-cover.jpg',
    category: 'Books & Stationery',
    location: 'Tom Mboya Street, Nairobi CBD',
    rating: 4.9,
    reviewCount: 156,
    verified: true,
    featured: true,
    description: 'A paradise for book lovers. We offer a wide selection of books across various genres, as well as stationery and office supplies.',
    productCount: 110
  },
  {
    id: 7,
    slug: 'kids-corner',
    name: 'Kids Corner',
    logo: '/images/shops/kids-corner.jpg',
    coverImage: '/images/shops/kids-corner-cover.jpg',
    category: 'Toys & Kids',
    location: 'Moi Avenue, Nairobi CBD',
    rating: 4.6,
    reviewCount: 87,
    verified: true,
    featured: false,
    description: 'Everything for your little ones. We offer toys, clothing, and accessories for babies and children of all ages.',
    productCount: 92
  },
  {
    id: 8,
    slug: 'gourmet-delights',
    name: 'Gourmet Delights',
    logo: '/images/shops/gourmet-delights.jpg',
    coverImage: '/images/shops/gourmet-delights-cover.jpg',
    category: 'Food & Groceries',
    location: 'Kimathi Street, Nairobi CBD',
    rating: 4.7,
    reviewCount: 104,
    verified: true,
    featured: false,
    description: 'Premium food products for the discerning palate. We offer gourmet foods, specialty ingredients, and fine wines.',
    productCount: 68
  }
];

// Categories for filtering
const categories = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Home & Kitchen',
  'Beauty',
  'Sports',
  'Books & Stationery',
  'Toys & Kids',
  'Food & Groceries'
];

export default function ShopsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);
  
  // Filter and sort shops
  const filteredShops = shops
    .filter(shop => 
      (searchQuery === '' || 
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedCategory === 'All Categories' || shop.category === selectedCategory) &&
      (shop.rating >= minRating)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'featured':
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the filter function
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen py-8 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explore Verified Shops</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover trusted vendors in Nairobi CBD offering quality products across various categories.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search for shops by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-600 text-white px-4 py-1.5 rounded-md hover:bg-orange-700 transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* Filter Toggle (Mobile) */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
            >
              <span className="flex items-center">
                <FiFilter className="mr-2" />
                Filters & Sorting
              </span>
              <FiChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters Sidebar */}
            <div className={`md:w-1/4 ${showFilters ? 'block' : 'hidden md:block'}`}>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="font-semibold text-lg mb-4">Filters</h2>
                
                {/* Category Filter */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Category</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center">
                        <input
                          type="radio"
                          id={category}
                          name="category"
                          checked={selectedCategory === category}
                          onChange={() => setSelectedCategory(category)}
                          className="mr-2"
                        />
                        <label htmlFor={category} className="text-gray-700">{category}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Rating Filter */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Minimum Rating</h3>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={minRating}
                      onChange={(e) => setMinRating(parseFloat(e.target.value))}
                      className="w-full mr-2"
                    />
                    <span className="text-sm text-gray-700">{minRating}+ ⭐</span>
                  </div>
                </div>
                
                {/* Sort Options (Mobile) */}
                <div className="md:hidden mb-6">
                  <h3 className="font-medium mb-2">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="featured">Featured</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                  </select>
                </div>
                
                {/* Apply/Reset Buttons (Mobile) */}
                <div className="md:hidden flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('All Categories');
                      setMinRating(0);
                      setSearchQuery('');
                    }}
                    className="flex-1 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* Shops Section */}
            <div className="md:w-3/4">
              {/* Sort Options (Desktop) */}
              <div className="hidden md:flex justify-between items-center mb-6">
                <p className="text-gray-600">{filteredShops.length} shops found</p>
                <div className="flex items-center">
                  <label htmlFor="sort" className="text-sm text-gray-600 mr-2">Sort by:</label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border rounded-md p-2 text-sm"
                  >
                    <option value="featured">Featured</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                  </select>
                </div>
              </div>

              {/* Shops Grid */}
              {filteredShops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {filteredShops.map((shop) => (
                    <Link
                      key={shop.id}
                      href={`/shops/${shop.slug}`}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="relative h-40">
                        {shop.coverImage ? (
                          <Image
                            src={shop.coverImage}
                            alt={shop.name}
                            width={500}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No cover image</span>
                          </div>
                        )}
                        
                        {/* Shop Logo */}
                        <div className="absolute -bottom-10 left-4">
                          <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-white">
                            {shop.logo ? (
                              <Image
                                src={shop.logo}
                                alt={`${shop.name} logo`}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No logo</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Verified Badge */}
                        {shop.verified && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                            Verified
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 pt-12">
                        {/* Shop Name */}
                        <h3 className="font-semibold text-xl text-gray-900 mb-1">{shop.name}</h3>
                        
                        {/* Category */}
                        <p className="text-sm text-gray-500 mb-2">{shop.category}</p>
                        
                        {/* Location */}
                        <div className="flex items-center text-gray-600 mb-2">
                          <FiMapPin className="mr-1 text-orange-600" size={14} />
                          <span className="text-sm">{shop.location}</span>
                        </div>
                        
                        {/* Rating */}
                        <div className="flex items-center mb-3">
                          <div className="flex text-yellow-400 mr-1">
                            <FiStar className="fill-current" />
                          </div>
                          <span className="text-sm text-gray-600">{shop.rating} ({shop.reviewCount} reviews)</span>
                        </div>
                        
                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{shop.description}</p>
                        
                        {/* Product Count */}
                        <p className="text-sm text-gray-500">{shop.productCount} products</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-600 mb-4">No shops match your current filters.</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All Categories');
                      setMinRating(0);
                      setSearchQuery('');
                    }}
                    className="text-orange-600 hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Map Section */}
          <div className="mt-16 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Find Shops on the Map</h2>
            <p className="text-gray-600 mb-6">
              Explore verified shops in Nairobi CBD with our interactive map. Find directions to your favorite stores.
            </p>
            <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Map will be displayed here</p>
            </div>
            <div className="mt-4 text-center">
              <Link
                href="/map"
                className="inline-block bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors"
              >
                View Full Map
              </Link>
            </div>
          </div>
          
          {/* Become a Vendor Section */}
          <div className="mt-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-8 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Own a Shop in Nairobi CBD?</h2>
              <p className="mb-6">Join Nairobi Verified as a trusted vendor and reach more customers. Get verified and grow your business.</p>
              <Link
                href="/auth/register/merchant"
                className="inline-block bg-white text-orange-600 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors font-medium"
              >
                Become a Verified Vendor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}