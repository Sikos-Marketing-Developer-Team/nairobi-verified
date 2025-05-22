"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiFilter, FiGrid, FiList, FiStar, FiHeart, FiShoppingCart } from 'react-icons/fi';
import MainLayout from '@/components/MainLayout';

// Mock data for products
const mockProducts = [
  {
    id: 1,
    name: 'Wireless Bluetooth Headphones',
    price: 79.99,
    discountPrice: 59.99,
    rating: 4.5,
    reviewCount: 128,
    image: '/images/products/headphones.jpg',
    category: 'electronics',
    isNew: true,
    isFeatured: true
  },
  {
    id: 2,
    name: 'Smartphone Pro Max 128GB',
    price: 999.99,
    discountPrice: null,
    rating: 4.8,
    reviewCount: 256,
    image: '/images/products/smartphone.jpg',
    category: 'electronics',
    isNew: false,
    isFeatured: true
  },
  {
    id: 3,
    name: 'Ultra HD Smart TV 55"',
    price: 699.99,
    discountPrice: 599.99,
    rating: 4.6,
    reviewCount: 89,
    image: '/images/products/tv.jpg',
    category: 'electronics',
    isNew: false,
    isFeatured: false
  },
  {
    id: 4,
    name: 'Laptop Pro 15" 512GB SSD',
    price: 1299.99,
    discountPrice: 1199.99,
    rating: 4.7,
    reviewCount: 176,
    image: '/images/products/laptop.jpg',
    category: 'electronics',
    isNew: true,
    isFeatured: true
  },
  {
    id: 5,
    name: 'Wireless Gaming Mouse',
    price: 49.99,
    discountPrice: null,
    rating: 4.4,
    reviewCount: 64,
    image: '/images/products/mouse.jpg',
    category: 'electronics',
    isNew: false,
    isFeatured: false
  },
  {
    id: 6,
    name: 'Portable Bluetooth Speaker',
    price: 89.99,
    discountPrice: 69.99,
    rating: 4.3,
    reviewCount: 42,
    image: '/images/products/speaker.jpg',
    category: 'electronics',
    isNew: false,
    isFeatured: false
  }
];

// Mock data for categories
const categories = {
  'electronics': {
    name: 'Electronics',
    description: 'Shop the latest electronics including smartphones, laptops, TVs, and more.',
    image: '/images/categories/electronics.jpg',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  'fashion': {
    name: 'Fashion',
    description: 'Discover the latest trends in clothing, shoes, and accessories.',
    image: '/images/categories/fashion.jpg',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600'
  },
  'home-garden': {
    name: 'Home & Garden',
    description: 'Find everything you need for your home and garden.',
    image: '/images/categories/home-garden.jpg',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  'health-beauty': {
    name: 'Health & Beauty',
    description: 'Shop skincare, makeup, and personal care products.',
    image: '/images/categories/health-beauty.jpg',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  }
};

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [products, setProducts] = useState(mockProducts);
  const [category, setCategory] = useState<any>(null);

  useEffect(() => {
    // In a real app, you would fetch products based on the category slug
    // For now, we'll just filter our mock data
    const categoryData = categories[params.slug as keyof typeof categories];
    if (categoryData) {
      setCategory(categoryData);
      // Filter products by category
      const filteredProducts = mockProducts.filter(product => product.category === params.slug);
      setProducts(filteredProducts);
    }
  }, [params.slug]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortBy(value);
    
    // Sort products based on selection
    const sortedProducts = [...products];
    switch (value) {
      case 'price-low':
        sortedProducts.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price-high':
        sortedProducts.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'newest':
        sortedProducts.sort((a, b) => (a.isNew === b.isNew) ? 0 : a.isNew ? -1 : 1);
        break;
      case 'rating':
        sortedProducts.sort((a, b) => b.rating - a.rating);
        break;
      default: // featured
        sortedProducts.sort((a, b) => (a.isFeatured === b.isFeatured) ? 0 : a.isFeatured ? -1 : 1);
    }
    
    setProducts(sortedProducts);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newRange = [...priceRange];
    newRange[index] = parseInt(e.target.value);
    setPriceRange(newRange);
  };

  const applyFilters = () => {
    // Filter products by price range
    const filteredProducts = mockProducts.filter(product => {
      const price = product.discountPrice || product.price;
      return price >= priceRange[0] && price <= priceRange[1] && product.category === params.slug;
    });
    
    setProducts(filteredProducts);
    
    // On mobile, close the filter panel after applying
    if (window.innerWidth < 768) {
      setShowFilters(false);
    }
  };

  if (!category) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold">Category not found</h1>
          <p className="mt-4">The category you're looking for doesn't exist.</p>
          <Link href="/categories" className="mt-6 inline-block text-orange-600 hover:underline">
            Browse all categories
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Category Header */}
        <div className={`${category.bgColor} py-8 px-4`}>
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className={`text-3xl font-bold ${category.textColor}`}>{category.name}</h1>
                <p className="text-gray-600 mt-2">{category.description}</p>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                >
                  <FiGrid size={20} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                >
                  <FiList size={20} />
                </button>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden p-2 rounded-md bg-white shadow-sm"
                >
                  <FiFilter size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row">
            {/* Filters - Desktop (always visible) & Mobile (toggleable) */}
            <div className={`
              md:w-1/4 md:pr-6 md:block
              ${showFilters ? 'block' : 'hidden'}
              mb-6 md:mb-0
            `}>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="font-semibold text-lg mb-4">Filters</h2>
                
                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Price Range</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Min: ${priceRange[0]}</span>
                      <span className="text-sm text-gray-500">Max: ${priceRange[1]}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceChange(e, 0)}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceChange(e, 1)}
                      className="w-full"
                    />
                  </div>
                </div>
                
                {/* Apply Filters Button */}
                <button
                  onClick={applyFilters}
                  className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {/* Products */}
            <div className="md:w-3/4">
              {/* Sort Options */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">{products.length} products found</p>
                <div className="flex items-center">
                  <label htmlFor="sort" className="text-sm text-gray-600 mr-2">Sort by:</label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={handleSortChange}
                    className="border rounded-md p-2 text-sm"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>

              {/* Products Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative">
                        <div className="h-48 bg-gray-200 flex items-center justify-center">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={200}
                              height={200}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="text-4xl text-gray-400">
                              <i className="bx bx-image"></i>
                            </div>
                          )}
                        </div>
                        {product.isNew && (
                          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                            New
                          </span>
                        )}
                        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 bg-white rounded-full p-1.5 shadow-sm">
                          <FiHeart size={18} />
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                        <div className="flex items-center mb-2">
                          <div className="flex text-yellow-400 mr-1">
                            <FiStar className="fill-current" />
                          </div>
                          <span className="text-sm text-gray-600">{product.rating} ({product.reviewCount})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            {product.discountPrice ? (
                              <div className="flex items-center">
                                <span className="text-lg font-bold text-gray-900">${product.discountPrice}</span>
                                <span className="text-sm text-gray-500 line-through ml-2">${product.price}</span>
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-gray-900">${product.price}</span>
                            )}
                          </div>
                          <button className="text-orange-600 hover:text-orange-700 bg-orange-50 p-2 rounded-full">
                            <FiShoppingCart size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/4 relative">
                          <div className="h-48 sm:h-full bg-gray-200 flex items-center justify-center">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={200}
                                height={200}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="text-4xl text-gray-400">
                                <i className="bx bx-image"></i>
                              </div>
                            )}
                          </div>
                          {product.isNew && (
                            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              New
                            </span>
                          )}
                        </div>
                        <div className="sm:w-3/4 p-4 flex flex-col justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                            <div className="flex items-center mb-2">
                              <div className="flex text-yellow-400 mr-1">
                                <FiStar className="fill-current" />
                              </div>
                              <span className="text-sm text-gray-600">{product.rating} ({product.reviewCount})</span>
                            </div>
                            <p className="text-gray-600 mb-4">
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              {product.discountPrice ? (
                                <div className="flex items-center">
                                  <span className="text-lg font-bold text-gray-900">${product.discountPrice}</span>
                                  <span className="text-sm text-gray-500 line-through ml-2">${product.price}</span>
                                </div>
                              ) : (
                                <span className="text-lg font-bold text-gray-900">${product.price}</span>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <button className="text-gray-500 hover:text-red-500 bg-gray-100 p-2 rounded-full">
                                <FiHeart size={18} />
                              </button>
                              <button className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center">
                                <FiShoppingCart size={18} className="mr-2" />
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {products.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No products found matching your criteria.</p>
                  <button
                    onClick={() => {
                      setPriceRange([0, 2000]);
                      setProducts(mockProducts.filter(p => p.category === params.slug));
                    }}
                    className="text-orange-600 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}