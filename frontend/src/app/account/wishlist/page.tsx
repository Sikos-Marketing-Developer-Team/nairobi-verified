"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { 
  FiUser, FiShoppingBag, FiHeart, FiMapPin, FiCreditCard, 
  FiLogOut, FiSearch, FiTrash2, FiShoppingCart, FiX
} from 'react-icons/fi';

// Mock wishlist data - will be replaced with API call
const mockWishlistItems = [
  {
    _id: 'wish1',
    product: {
      _id: 'prod1',
      name: 'Wireless Earbuds',
      price: 3500,
      discountPrice: 2999,
      images: [{ url: '/images/products/earbuds.svg', isMain: true }],
      merchant: { _id: '101', companyName: 'Electronics Hub', isVerified: true },
      ratings: { average: 4.6, count: 98 }
    },
    addedAt: '2023-06-10T08:20:00.000Z'
  },
  {
    _id: 'wish2',
    product: {
      _id: 'prod2',
      name: 'USB-C Hub Adapter',
      price: 2200,
      discountPrice: null,
      images: [{ url: '/images/products/charger.svg', isMain: true }],
      merchant: { _id: '102', companyName: 'Gadget World', isVerified: true },
      ratings: { average: 4.0, count: 45 }
    },
    addedAt: '2023-06-05T16:15:00.000Z'
  },
  {
    _id: 'wish3',
    product: {
      _id: 'prod3',
      name: 'Smart Watch with Heart Rate Monitor',
      price: 8999,
      discountPrice: 7499,
      images: [{ url: '/images/products/smartwatch.svg', isMain: true }],
      merchant: { _id: '101', companyName: 'Electronics Hub', isVerified: true },
      ratings: { average: 4.3, count: 156 }
    },
    addedAt: '2023-05-28T12:30:00.000Z'
  },
  {
    _id: 'wish4',
    product: {
      _id: 'prod4',
      name: 'Portable Bluetooth Speaker',
      price: 4500,
      discountPrice: 3999,
      images: [{ url: '/images/products/speaker.svg', isMain: true }],
      merchant: { _id: '102', companyName: 'Gadget World', isVerified: true },
      ratings: { average: 4.1, count: 112 }
    },
    addedAt: '2023-05-20T09:45:00.000Z'
  }
];

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems);
  const [filteredItems, setFilteredItems] = useState(mockWishlistItems);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  
  // Fetch wishlist data
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        // Replace with actual API call when backend is ready
        // const response = await fetch('/api/wishlist');
        // const data = await response.json();
        // setWishlistItems(data.items);
        // setFilteredItems(data.items);
        
        // Using mock data for now
        setTimeout(() => {
          setWishlistItems(mockWishlistItems);
          setFilteredItems(mockWishlistItems);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Failed to load wishlist');
        setLoading(false);
      }
    };
    
    fetchWishlist();
  }, []);
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...wishlistItems];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.product.name.toLowerCase().includes(query) ||
        item.product.merchant.companyName.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime());
        break;
      case 'price-high':
        result.sort((a, b) => (b.product.discountPrice || b.product.price) - (a.product.discountPrice || a.product.price));
        break;
      case 'price-low':
        result.sort((a, b) => (a.product.discountPrice || a.product.price) - (b.product.discountPrice || b.product.price));
        break;
      case 'rating':
        result.sort((a, b) => b.product.ratings.average - a.product.ratings.average);
        break;
    }
    
    setFilteredItems(result);
  }, [wishlistItems, searchQuery, sortBy]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };
  
  // Handle remove item
  const handleRemoveItem = async (itemId: string) => {
    try {
      // Replace with actual API call when backend is ready
      // await fetch(`/api/wishlist/${itemId}`, {
      //   method: 'DELETE'
      // });
      
      // Update state
      setWishlistItems(prevItems => prevItems.filter(item => item._id !== itemId));
      setShowRemoveModal(false);
      setItemToRemove(null);
    } catch (err) {
      console.error('Failed to remove item from wishlist', err);
    }
  };
  
  // Handle add to cart
  const handleAddToCart = async (productId: string) => {
    try {
      setAddingToCart(productId);
      
      // Replace with actual API call when backend is ready
      // await fetch('/api/cart/add', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     productId,
      //     quantity: 1
      //   })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAddingToCart(null);
    } catch (err) {
      console.error('Failed to add item to cart', err);
      setAddingToCart(null);
    }
  };
  
  // Handle clear wishlist
  const handleClearWishlist = async () => {
    try {
      // Replace with actual API call when backend is ready
      // await fetch('/api/wishlist/clear', {
      //   method: 'DELETE'
      // });
      
      // Update state
      setWishlistItems([]);
      setShowRemoveModal(false);
    } catch (err) {
      console.error('Failed to clear wishlist', err);
    }
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
      
      <div className="container mx-auto px-4 py-8 mt-[150px]">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Wishlist</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Account Menu
              </h2>
              
              <nav className="space-y-1">
                <Link href="/account" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <FiUser className="mr-3 text-gray-500 dark:text-gray-400" />
                  <span>Account Overview</span>
                </Link>
                <Link href="/account/orders" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <FiShoppingBag className="mr-3 text-gray-500 dark:text-gray-400" />
                  <span>My Orders</span>
                </Link>
                <Link href="/account/wishlist" className="flex items-center px-4 py-2 text-gray-900 dark:text-white bg-orange-100 dark:bg-orange-900/20 rounded-md">
                  <FiHeart className="mr-3 text-orange-500 dark:text-orange-400" />
                  <span>Wishlist</span>
                </Link>
                <Link href="/account/addresses" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <FiMapPin className="mr-3 text-gray-500 dark:text-gray-400" />
                  <span>Addresses</span>
                </Link>
                <Link href="/account/payment-methods" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <FiCreditCard className="mr-3 text-gray-500 dark:text-gray-400" />
                  <span>Payment Methods</span>
                </Link>
                <Link href="/auth/logout" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <FiLogOut className="mr-3 text-gray-500 dark:text-gray-400" />
                  <span>Logout</span>
                </Link>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Sort */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiSearch className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Search wishlist items"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-full md:w-48">
                    <select
                      value={sortBy}
                      onChange={handleSortChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                  
                  {wishlistItems.length > 0 && (
                    <button
                      onClick={() => {
                        setShowRemoveModal(true);
                        setItemToRemove('all');
                      }}
                      className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center"
                    >
                      <FiTrash2 className="mr-1" />
                      <span className="hidden md:inline">Clear All</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Wishlist Items */}
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                  <div key={item._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                      {item.product.images && item.product.images.length > 0 ? (
                        <Image
                          src={item.product.images[0].url.startsWith('http') 
                            ? item.product.images[0].url 
                            : `/${item.product.images[0].url}`}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          setShowRemoveModal(true);
                          setItemToRemove(item._id);
                        }}
                        className="absolute top-2 right-2 bg-white dark:bg-gray-800 p-1.5 rounded-full text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 shadow-md"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="p-4">
                      <Link href={`/product/${item.product._id}`}>
                        <h3 className="font-medium text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 line-clamp-2 mb-1">
                          {item.product.name}
                        </h3>
                      </Link>
                      
                      <Link href={`/shop/${item.product.merchant._id}`}>
                        <p className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 mb-2">
                          {item.product.merchant.companyName}
                          {item.product.merchant.isVerified && (
                            <span className="inline-block ml-1 text-blue-500 dark:text-blue-400">✓</span>
                          )}
                        </p>
                      </Link>
                      
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(item.product.ratings.average)
                                  ? 'text-yellow-400'
                                  : i < item.product.ratings.average
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                              fill={i < Math.floor(item.product.ratings.average) ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          ({item.product.ratings.count})
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            KSh {(item.product.discountPrice || item.product.price).toLocaleString()}
                          </p>
                          {item.product.discountPrice && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                              KSh {item.product.price.toLocaleString()}
                            </p>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleAddToCart(item.product._id)}
                          disabled={addingToCart === item.product._id}
                          className={`flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-md text-sm ${
                            addingToCart === item.product._id ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                        >
                          {addingToCart === item.product._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <FiShoppingCart className="mr-1" />
                              Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Added on {new Date(item.addedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <FiHeart className="mx-auto text-gray-400 dark:text-gray-500 text-4xl mb-4" />
                {searchQuery ? (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No items found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      We couldn't find any wishlist items matching your search.
                    </p>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-md font-medium"
                    >
                      Clear Search
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Save items you're interested in by clicking the heart icon on product pages.
                    </p>
                    <Link href="/products">
                      <button className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-md font-medium">
                        Discover Products
                      </button>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Remove Confirmation Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowRemoveModal(false)}>
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <FiTrash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      {itemToRemove === 'all' ? 'Clear Wishlist' : 'Remove Item'}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {itemToRemove === 'all'
                          ? 'Are you sure you want to remove all items from your wishlist? This action cannot be undone.'
                          : 'Are you sure you want to remove this item from your wishlist?'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => itemToRemove === 'all' ? handleClearWishlist() : handleRemoveItem(itemToRemove!)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {itemToRemove === 'all' ? 'Clear All' : 'Remove'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRemoveModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}