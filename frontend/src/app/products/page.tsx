"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import MainLayout from "@/components/MainLayout";
import { FaShoppingCart, FaStar, FaHeart, FaFilter, FaSort, FaBolt } from "react-icons/fa";

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

interface Category {
  id: number;
  name: string;
  count: number;
}

export default function ProductsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Simulate API call with mock data
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Mock categories data
        setCategories([
          { id: 1, name: "Electronics", count: 120 },
          { id: 2, name: "Fashion", count: 85 },
          { id: 3, name: "Home & Kitchen", count: 64 },
          { id: 4, name: "Beauty", count: 42 },
          { id: 5, name: "Sports", count: 38 },
          { id: 6, name: "Books", count: 29 },
        ]);
        
        // Mock products data
        setProducts([
          { id: 101, name: "Wireless Headphones", price: 4999, discountPrice: 3999, image: "/images/products/headphones.jpg", category: "Electronics", vendor: "Electronics Hub", rating: 4.7, isFeatured: true },
          { id: 102, name: "Summer Dress", price: 2999, image: "/images/products/womens-dress.jpg", category: "Fashion", vendor: "Fashion World", rating: 4.5, isFeatured: true },
          { id: 103, name: "Smartphone Pro", price: 89999, discountPrice: 79999, image: "/images/products/smartphone.jpg", category: "Electronics", vendor: "Electronics Hub", rating: 4.9, isFeatured: true, isNew: true },
          { id: 104, name: "Leather Handbag", price: 5999, image: "/images/products/handbag.jpg", category: "Fashion", vendor: "Fashion World", rating: 4.8, isFeatured: true },
          { id: 105, name: "Smartwatch Series 5", price: 34999, discountPrice: 24999, image: "/images/products/smartwatch.jpg", category: "Electronics", vendor: "Electronics Hub", rating: 4.7, isFlashSale: true },
          { id: 106, name: "Men's Sneakers", price: 4999, discountPrice: 2999, image: "/images/products/sneakers.jpg", category: "Fashion", vendor: "Fashion World", rating: 4.6, isFlashSale: true },
          { id: 107, name: "Bluetooth Speaker", price: 12999, discountPrice: 9999, image: "/images/products/speaker.jpg", category: "Electronics", vendor: "Electronics Hub", rating: 4.6 },
          { id: 108, name: "Coffee Maker", price: 8999, image: "/images/products/coffee-maker.jpg", category: "Home & Kitchen", vendor: "Home Essentials", rating: 4.4 },
          { id: 109, name: "Fitness Tracker", price: 5999, discountPrice: 4999, image: "/images/products/fitness-tracker.jpg", category: "Sports", vendor: "Sports World", rating: 4.3 },
          { id: 110, name: "Blender", price: 7999, image: "/images/products/blender.jpg", category: "Home & Kitchen", vendor: "Home Essentials", rating: 4.5 },
          { id: 111, name: "Makeup Set", price: 3999, discountPrice: 2999, image: "/images/products/makeup.jpg", category: "Beauty", vendor: "Beauty Spot", rating: 4.7 },
          { id: 112, name: "Yoga Mat", price: 1999, image: "/images/products/yoga-mat.jpg", category: "Sports", vendor: "Sports World", rating: 4.4 },
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products by category
  const filteredProducts = selectedCategory
    ? products.filter(product => product.category === selectedCategory)
    : products;

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      case "price-high":
        return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return a.isNew ? -1 : b.isNew ? 1 : 0;
      default: // featured
        return a.isFeatured ? -1 : b.isFeatured ? 1 : 0;
    }
  });

  // Function to render product card
  const renderProductCard = (product: Product) => (
    <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <div className="h-48 bg-gray-200">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
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
        
        {/* Badges */}
        <div className="absolute top-0 left-0 flex flex-col">
          {product.isNew && (
            <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 m-2 rounded">
              NEW
            </div>
          )}
          {product.isFlashSale && (
            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 m-2 rounded flex items-center">
              <FaBolt className="mr-1" /> FLASH SALE
            </div>
          )}
        </div>
        
        {/* Wishlist Button */}
        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 bg-white rounded-full p-1.5 shadow-sm">
          <FaHeart size={18} />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
        
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400 mr-1">
            <FaStar className="fill-current" />
          </div>
          <span className="text-sm text-gray-600">{product.rating}</span>
          <span className="text-sm text-gray-500 ml-2">{product.vendor}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            {product.discountPrice ? (
              <div className="flex items-center">
                <span className="text-lg font-bold text-gray-900">KSh {product.discountPrice.toLocaleString()}</span>
                <span className="text-sm text-gray-500 line-through ml-2">KSh {product.price.toLocaleString()}</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">KSh {product.price.toLocaleString()}</span>
            )}
          </div>
          <button className="text-orange-600 hover:text-orange-700 bg-orange-50 p-2 rounded-full">
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
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">All Products</h1>
            <p className="text-gray-600">Discover our wide range of quality products</p>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center gap-2 bg-white p-3 rounded-lg shadow-sm"
            >
              <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters Sidebar */}
            <div className={`md:w-1/4 ${showFilters ? 'block' : 'hidden md:block'}`}>
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h2 className="font-semibold text-lg mb-4">Categories</h2>
                <ul className="space-y-2">
                  <li>
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-2 py-1 rounded ${selectedCategory === null ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-100'}`}
                    >
                      All Categories
                    </button>
                  </li>
                  {categories.map(category => (
                    <li key={category.id}>
                      <button 
                        onClick={() => setSelectedCategory(category.name)}
                        className={`w-full text-left px-2 py-1 rounded flex justify-between items-center ${selectedCategory === category.name ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-100'}`}
                      >
                        <span>{category.name}</span>
                        <span className="text-xs text-gray-500">{category.count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h2 className="font-semibold text-lg mb-4">Price Range</h2>
                <div className="px-2">
                  <div className="flex justify-between mb-2">
                    <span>KSh {priceRange[0].toLocaleString()}</span>
                    <span>KSh {priceRange[1].toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="200000" 
                    value={priceRange[1]} 
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="font-semibold text-lg mb-4">Vendor</h2>
                <ul className="space-y-2">
                  <li>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>Electronics Hub</span>
                    </label>
                  </li>
                  <li>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>Fashion World</span>
                    </label>
                  </li>
                  <li>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>Home Essentials</span>
                    </label>
                  </li>
                  <li>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>Beauty Spot</span>
                    </label>
                  </li>
                  <li>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>Sports World</span>
                    </label>
                  </li>
                </ul>
              </div>
            </div>

            {/* Products Grid */}
            <div className="md:w-3/4">
              {/* Sort Options */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex justify-between items-center">
                <div>
                  <span className="text-gray-600">Showing {sortedProducts.length} products</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">Sort by:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border rounded-md p-1"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>

              {/* Products */}
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedProducts.map(product => renderProductCard(product))}
                  </div>
                  
                  {/* Pagination */}
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center">
                      <button className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                        Previous
                      </button>
                      <button className="px-3 py-1 border-t border-b border-gray-300 bg-orange-600 text-white">
                        1
                      </button>
                      <button className="px-3 py-1 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                        2
                      </button>
                      <button className="px-3 py-1 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                        3
                      </button>
                      <button className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                        Next
                      </button>
                    </nav>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}