"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { 
  FaHeart, 
  FaShoppingCart, 
  FaStar, 
  FaTrash, 
  FaShare, 
  FaStore,
  FaSearch
} from "react-icons/fa";

interface Product {
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  category: string;
  vendor: string;
  vendorId: number;
  rating: number;
  inStock: boolean;
  dateAdded: string;
}

export default function WishlistPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with mock data
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Mock wishlist data
        setWishlist([
          { 
            id: 101, 
            name: "Wireless Headphones", 
            price: 4999, 
            discountPrice: 3999, 
            image: "/images/products/headphones.jpg", 
            category: "Electronics", 
            vendor: "Electronics Hub",
            vendorId: 1, 
            rating: 4.7,
            inStock: true,
            dateAdded: "2023-06-10"
          },
          { 
            id: 102, 
            name: "Summer Dress", 
            price: 2999, 
            image: "/images/products/womens-dress.jpg", 
            category: "Fashion", 
            vendor: "Fashion World",
            vendorId: 2, 
            rating: 4.5,
            inStock: true,
            dateAdded: "2023-06-08"
          },
          { 
            id: 103, 
            name: "Smartphone Pro", 
            price: 89999, 
            discountPrice: 79999, 
            image: "/images/products/smartphone.jpg", 
            category: "Electronics", 
            vendor: "Electronics Hub",
            vendorId: 1, 
            rating: 4.9,
            inStock: false,
            dateAdded: "2023-06-05"
          },
          { 
            id: 104, 
            name: "Leather Handbag", 
            price: 5999, 
            image: "/images/products/handbag.jpg", 
            category: "Fashion", 
            vendor: "Fashion World",
            vendorId: 2, 
            rating: 4.8,
            inStock: true,
            dateAdded: "2023-06-01"
          },
          { 
            id: 105, 
            name: "Coffee Maker", 
            price: 8999, 
            image: "/images/products/coffee-maker.jpg", 
            category: "Home & Kitchen", 
            vendor: "Home Essentials",
            vendorId: 3, 
            rating: 4.4,
            inStock: true,
            dateAdded: "2023-05-28"
          }
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter wishlist by search query and category
  const filteredWishlist = wishlist.filter(product => {
    const matchesSearch = searchQuery 
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.vendor.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesCategory = selectedCategory 
      ? product.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(wishlist.map(product => product.category)));

  // Remove from wishlist
  const removeFromWishlist = (productId: number) => {
    setWishlist(wishlist.filter(product => product.id !== productId));
  };

  // Move to cart
  const moveToCart = (productId: number) => {
    // In a real app, this would add to cart and remove from wishlist
    // For now, just remove from wishlist
    removeFromWishlist(productId);
    // Show success message or notification
    alert(`Product added to cart!`);
  };

  return (
    <MainLayout>
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Wishlist</h1>
            <p className="text-gray-600">Items you've saved for later</p>
          </div>

          {/* Search and Filter */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:w-3/4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search your wishlist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="md:w-1/4">
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Wishlist Items */}
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredWishlist.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    {filteredWishlist.length} {filteredWishlist.length === 1 ? 'Item' : 'Items'}
                  </h2>
                  <button 
                    onClick={() => setWishlist([])}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {filteredWishlist.map((product) => (
                  <div key={product.id} className="p-6 flex flex-col md:flex-row">
                    <div className="w-full md:w-1/4 mb-4 md:mb-0">
                      <div className="relative h-48 md:h-40 bg-gray-200 rounded-md overflow-hidden">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                        
                        {!product.inStock && (
                          <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white font-medium px-3 py-1 bg-red-600 rounded-md">Out of Stock</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="md:w-2/4 md:px-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{product.name}</h3>
                      
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400 mr-1">
                          <FaStar className="fill-current" />
                        </div>
                        <span className="text-sm text-gray-600">{product.rating}</span>
                      </div>
                      
                      <Link 
                        href={`/shops/${product.vendorId}`}
                        className="text-sm text-gray-600 hover:text-orange-600 flex items-center mb-2"
                      >
                        <FaStore className="mr-1" /> {product.vendor}
                      </Link>
                      
                      <p className="text-sm text-gray-500">Added on {product.dateAdded}</p>
                      
                      <div className="mt-4">
                        {product.discountPrice ? (
                          <div className="flex items-center">
                            <span className="text-lg font-bold text-gray-900">KSh {product.discountPrice.toLocaleString()}</span>
                            <span className="text-sm text-gray-500 line-through ml-2">KSh {product.price.toLocaleString()}</span>
                            <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                              {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">KSh {product.price.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="md:w-1/4 mt-4 md:mt-0 flex flex-col justify-between">
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => moveToCart(product.id)}
                          disabled={!product.inStock}
                          className={`flex items-center justify-center px-4 py-2 rounded-md ${
                            product.inStock 
                              ? 'bg-orange-600 text-white hover:bg-orange-700' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <FaShoppingCart className="mr-2" /> 
                          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        
                        <button 
                          onClick={() => removeFromWishlist(product.id)}
                          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          <FaTrash className="mr-2" /> Remove
                        </button>
                      </div>
                      
                      <button className="mt-4 flex items-center justify-center text-gray-600 hover:text-gray-800">
                        <FaShare className="mr-2" /> Share
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FaHeart className="mx-auto text-gray-400 text-5xl mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedCategory
                  ? "No items match your search criteria. Try adjusting your filters."
                  : "Save items you like by clicking the heart icon on any product."}
              </p>
              <Link 
                href="/products"
                className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 inline-block"
              >
                Browse Products
              </Link>
            </div>
          )}
          
          {/* Recommended Products */}
          {wishlist.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">You Might Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Recommended products would go here */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <div className="h-48 bg-gray-200">
                      <Image
                        src="/images/products/smartwatch.jpg"
                        alt="Smartwatch"
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 bg-white rounded-full p-1.5 shadow-sm">
                      <FaHeart size={18} />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1">Smartwatch Series 5</h3>
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400 mr-1">
                        <FaStar className="fill-current" />
                      </div>
                      <span className="text-sm text-gray-600">4.7</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">KSh 24,999</span>
                      <button className="text-orange-600 hover:text-orange-700 bg-orange-50 p-2 rounded-full">
                        <FaShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <div className="h-48 bg-gray-200">
                      <Image
                        src="/images/products/speaker.jpg"
                        alt="Bluetooth Speaker"
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 bg-white rounded-full p-1.5 shadow-sm">
                      <FaHeart size={18} />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1">Bluetooth Speaker</h3>
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400 mr-1">
                        <FaStar className="fill-current" />
                      </div>
                      <span className="text-sm text-gray-600">4.6</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">KSh 9,999</span>
                      <button className="text-orange-600 hover:text-orange-700 bg-orange-50 p-2 rounded-full">
                        <FaShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <div className="h-48 bg-gray-200">
                      <Image
                        src="/images/products/sneakers.jpg"
                        alt="Men's Sneakers"
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 bg-white rounded-full p-1.5 shadow-sm">
                      <FaHeart size={18} />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1">Men's Sneakers</h3>
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400 mr-1">
                        <FaStar className="fill-current" />
                      </div>
                      <span className="text-sm text-gray-600">4.5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">KSh 3,999</span>
                      <button className="text-orange-600 hover:text-orange-700 bg-orange-50 p-2 rounded-full">
                        <FaShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <div className="h-48 bg-gray-200">
                      <Image
                        src="/images/products/camera.jpg"
                        alt="Digital Camera"
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 bg-white rounded-full p-1.5 shadow-sm">
                      <FaHeart size={18} />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1">Digital Camera</h3>
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400 mr-1">
                        <FaStar className="fill-current" />
                      </div>
                      <span className="text-sm text-gray-600">4.8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">KSh 29,999</span>
                      <button className="text-orange-600 hover:text-orange-700 bg-orange-50 p-2 rounded-full">
                        <FaShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}