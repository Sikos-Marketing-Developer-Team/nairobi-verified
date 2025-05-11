"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiStar, FiHeart, FiShoppingCart, FiFilter, FiChevronDown } from 'react-icons/fi';
import MainLayout from '@/components/MainLayout';

// Mock data for hot deals
const hotDeals = [
  {
    id: 1,
    name: 'Premium Wireless Earbuds',
    originalPrice: 129.99,
    discountPrice: 79.99,
    discountPercentage: 38,
    rating: 4.6,
    reviewCount: 178,
    image: '/images/products/earbuds.jpg',
    category: 'Electronics',
    isNew: false,
    isBestSeller: true,
    description: 'High-quality wireless earbuds with active noise cancellation and long battery life.'
  },
  {
    id: 2,
    name: 'Smart Home Security Camera',
    originalPrice: 149.99,
    discountPrice: 99.99,
    discountPercentage: 33,
    rating: 4.4,
    reviewCount: 132,
    image: '/images/products/camera.jpg',
    category: 'Electronics',
    isNew: true,
    isBestSeller: false,
    description: 'HD security camera with motion detection, night vision, and smartphone alerts.'
  },
  {
    id: 3,
    name: 'Men\'s Running Shoes',
    originalPrice: 89.99,
    discountPrice: 59.99,
    discountPercentage: 33,
    rating: 4.7,
    reviewCount: 215,
    image: '/images/products/shoes.jpg',
    category: 'Fashion',
    isNew: false,
    isBestSeller: true,
    description: 'Lightweight and comfortable running shoes with responsive cushioning.'
  },
  {
    id: 4,
    name: 'Stainless Steel Cookware Set',
    originalPrice: 199.99,
    discountPrice: 129.99,
    discountPercentage: 35,
    rating: 4.8,
    reviewCount: 94,
    image: '/images/products/cookware.jpg',
    category: 'Home & Kitchen',
    isNew: false,
    isBestSeller: false,
    description: 'Complete 10-piece cookware set made of premium stainless steel.'
  },
  {
    id: 5,
    name: 'Vitamin C Serum',
    originalPrice: 34.99,
    discountPrice: 24.99,
    discountPercentage: 29,
    rating: 4.5,
    reviewCount: 167,
    image: '/images/products/serum.jpg',
    category: 'Beauty',
    isNew: true,
    isBestSeller: true,
    description: 'Brightening serum with Vitamin C to reduce dark spots and improve skin texture.'
  },
  {
    id: 6,
    name: 'Yoga Mat',
    originalPrice: 49.99,
    discountPrice: 29.99,
    discountPercentage: 40,
    rating: 4.3,
    reviewCount: 88,
    image: '/images/products/yoga-mat.jpg',
    category: 'Sports',
    isNew: false,
    isBestSeller: false,
    description: 'Non-slip yoga mat with alignment lines for proper positioning.'
  },
  {
    id: 7,
    name: 'Portable Blender',
    originalPrice: 39.99,
    discountPrice: 24.99,
    discountPercentage: 38,
    rating: 4.2,
    reviewCount: 76,
    image: '/images/products/blender.jpg',
    category: 'Home & Kitchen',
    isNew: true,
    isBestSeller: false,
    description: 'USB rechargeable portable blender for smoothies and shakes on the go.'
  },
  {
    id: 8,
    name: 'Wireless Charging Pad',
    originalPrice: 29.99,
    discountPrice: 19.99,
    discountPercentage: 33,
    rating: 4.4,
    reviewCount: 112,
    image: '/images/products/charger.jpg',
    category: 'Electronics',
    isNew: false,
    isBestSeller: true,
    description: 'Fast wireless charging pad compatible with all Qi-enabled devices.'
  }
];

// Categories for filtering
const categories = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Home & Kitchen',
  'Beauty',
  'Sports'
];

export default function HotDealsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('discount');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [minRating, setMinRating] = useState(0);
  
  // Filter and sort products
  const filteredProducts = hotDeals
    .filter(product => 
      (selectedCategory === 'All Categories' || product.category === selectedCategory) &&
      (product.discountPrice >= priceRange[0] && product.discountPrice <= priceRange[1]) &&
      (product.rating >= minRating)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.discountPrice - b.discountPrice;
        case 'price-high':
          return b.discountPrice - a.discountPrice;
        case 'rating':
          return b.rating - a.rating;
        case 'discount':
        default:
          return b.discountPercentage - a.discountPercentage;
      }
    });

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen py-8 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Hot Deals</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our best deals with big discounts on popular products across all categories.
            </p>
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
                
                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Price Range</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">${priceRange[0]}</span>
                      <span className="text-sm text-gray-500">${priceRange[1]}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
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
                    <option value="discount">Biggest Discount</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
                
                {/* Apply/Reset Buttons (Mobile) */}
                <div className="md:hidden flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('All Categories');
                      setPriceRange([0, 200]);
                      setMinRating(0);
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

            {/* Products Section */}
            <div className="md:w-3/4">
              {/* Sort Options (Desktop) */}
              <div className="hidden md:flex justify-between items-center mb-6">
                <p className="text-gray-600">{filteredProducts.length} products found</p>
                <div className="flex items-center">
                  <label htmlFor="sort" className="text-sm text-gray-600 mr-2">Sort by:</label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border rounded-md p-2 text-sm"
                  >
                    <option value="discount">Biggest Discount</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all">
                      <div className="relative">
                        {/* Product Image */}
                        <div className="h-48 bg-gray-200 flex items-center justify-center">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
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
                        
                        {/* Badges */}
                        <div className="absolute top-0 left-0 flex flex-col">
                          <div className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-br-lg">
                            {product.discountPercentage}% OFF
                          </div>
                          {product.isNew && (
                            <div className="bg-green-500 text-white text-sm font-bold px-3 py-1 mt-1 rounded-br-lg">
                              NEW
                            </div>
                          )}
                          {product.isBestSeller && (
                            <div className="bg-yellow-500 text-white text-sm font-bold px-3 py-1 mt-1 rounded-br-lg">
                              BEST SELLER
                            </div>
                          )}
                        </div>
                        
                        {/* Wishlist Button */}
                        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 bg-white rounded-full p-1.5 shadow-sm">
                          <FiHeart size={18} />
                        </button>
                      </div>
                      
                      <div className="p-4">
                        {/* Product Name */}
                        <h3 className="font-medium text-gray-900 mb-1 truncate">{product.name}</h3>
                        
                        {/* Category */}
                        <p className="text-sm text-gray-500 mb-1">{product.category}</p>
                        
                        {/* Rating */}
                        <div className="flex items-center mb-2">
                          <div className="flex text-yellow-400 mr-1">
                            <FiStar className="fill-current" />
                          </div>
                          <span className="text-sm text-gray-600">{product.rating} ({product.reviewCount})</span>
                        </div>
                        
                        {/* Price */}
                        <div className="flex items-center mb-3">
                          <span className="text-lg font-bold text-red-600">${product.discountPrice}</span>
                          <span className="text-sm text-gray-500 line-through ml-2">${product.originalPrice}</span>
                        </div>
                        
                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                        
                        {/* Add to Cart Button */}
                        <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-md transition-colors flex items-center justify-center">
                          <FiShoppingCart className="mr-2" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-600 mb-4">No products match your current filters.</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All Categories');
                      setPriceRange([0, 200]);
                      setMinRating(0);
                    }}
                    className="text-orange-600 hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Newsletter Section */}
          <div className="mt-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-8 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Never Miss a Deal!</h2>
              <p className="mb-6">Subscribe to our newsletter and be the first to know about our exclusive deals and promotions.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-grow px-4 py-2 rounded-md text-gray-900 focus:outline-none"
                />
                <button className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-md transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}