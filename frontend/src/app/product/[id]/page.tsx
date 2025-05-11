"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { FiStar, FiShoppingCart, FiHeart, FiShare2, FiMapPin, FiCheck } from 'react-icons/fi';

// Mock product data - will be replaced with API call
const mockProduct = {
  _id: '1',
  name: 'Wireless Bluetooth Headphones',
  description: 'High-quality wireless headphones with noise cancellation, long battery life, and comfortable fit. Perfect for music lovers and professionals alike.',
  price: 5999,
  discountPrice: 4999,
  stock: 15,
  images: [
    { url: '/images/products/headphones-1.jpg', isMain: true },
    { url: '/images/products/headphones-2.jpg', isMain: false },
    { url: '/images/products/headphones-3.jpg', isMain: false },
  ],
  ratings: { average: 4.5, count: 128 },
  merchant: { 
    _id: '101', 
    companyName: 'Electronics Hub', 
    isVerified: true,
    location: 'Westlands, Nairobi',
    phone: '+254712345678'
  },
  category: { _id: '1', name: 'Electronics', slug: 'electronics' },
  features: [
    'Bluetooth 5.0 connectivity',
    'Active noise cancellation',
    '30-hour battery life',
    'Quick charge (10 min charge = 5 hours playback)',
    'Built-in microphone for calls',
    'Comfortable over-ear design'
  ],
  specifications: {
    'Brand': 'SoundMaster',
    'Model': 'SM-500',
    'Color': 'Black',
    'Connectivity': 'Bluetooth 5.0',
    'Battery Life': '30 hours',
    'Weight': '250g',
    'Warranty': '1 year'
  }
};

export default function ProductDetail({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState(mockProduct);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Replace with actual API call when backend is ready
        // const response = await fetch(`/api/products/${params.id}`);
        // const data = await response.json();
        // setProduct(data.product);
        
        // Using mock data for now
        setTimeout(() => {
          setProduct(mockProduct);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Failed to load product details');
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [params.id]);
  
  // Handle quantity change
  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    if (value > product.stock) return;
    setQuantity(value);
  };
  
  // Handle add to cart
  const handleAddToCart = () => {
    console.log(`Adding ${quantity} of product ${product._id} to cart`);
    // Implement cart functionality
  };
  
  // Handle add to wishlist
  const handleAddToWishlist = () => {
    console.log(`Adding product ${product._id} to wishlist`);
    // Implement wishlist functionality
  };
  
  // Calculate discount percentage if applicable
  const discountPercentage = product.discountPrice && product.price > product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
    : null;
  
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
          <Link href={`/category/${product.category.slug}`} className="hover:text-orange-500 dark:hover:text-orange-400">
            {product.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white">{product.name}</span>
        </div>
        
        {/* Product Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div>
              <div className="relative h-80 md:h-96 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImage].url.startsWith('http') 
                      ? product.images[selectedImage].url 
                      : `/${product.images[selectedImage].url}`}
                    alt={product.name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                
                {/* Discount Badge */}
                {discountPercentage && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {discountPercentage}% OFF
                  </div>
                )}
              </div>
              
              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <div 
                      key={index}
                      className={`relative w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 ${
                        selectedImage === index 
                          ? 'border-orange-500 dark:border-orange-400' 
                          : 'border-transparent'
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Image
                        src={image.url.startsWith('http') ? image.url : `/${image.url}`}
                        alt={`${product.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h1>
              
              {/* Merchant Info */}
              <Link href={`/shop/${product.merchant._id}`} className="inline-block mb-4">
                <div className="flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400">
                  <span className="font-medium">{product.merchant.companyName}</span>
                  {product.merchant.isVerified && (
                    <span className="inline-block ml-1 text-blue-500 dark:text-blue-400">
                      <FiCheck className="inline" />
                    </span>
                  )}
                </div>
              </Link>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <FiStar className={`${product.ratings.average >= 1 ? 'fill-current' : ''}`} />
                  <FiStar className={`${product.ratings.average >= 2 ? 'fill-current' : ''}`} />
                  <FiStar className={`${product.ratings.average >= 3 ? 'fill-current' : ''}`} />
                  <FiStar className={`${product.ratings.average >= 4 ? 'fill-current' : ''}`} />
                  <FiStar className={`${product.ratings.average >= 5 ? 'fill-current' : ''}`} />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  {product.ratings.average.toFixed(1)} ({product.ratings.count} reviews)
                </span>
              </div>
              
              {/* Price */}
              <div className="mb-6">
                {product.discountPrice && product.discountPrice < product.price ? (
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      KSh {product.discountPrice.toLocaleString()}
                    </span>
                    <span className="ml-3 text-lg text-gray-500 dark:text-gray-400 line-through">
                      KSh {product.price.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    KSh {product.price.toLocaleString()}
                  </span>
                )}
              </div>
              
              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <span className="text-green-500 dark:text-green-400">
                    In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="text-red-500 dark:text-red-400">
                    Out of Stock
                  </span>
                )}
              </div>
              
              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="flex items-center mb-6">
                  <span className="mr-3 text-gray-700 dark:text-gray-300">Quantity:</span>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                    <button 
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-12 text-center border-0 focus:ring-0 bg-transparent text-gray-900 dark:text-white"
                    />
                    <button 
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 flex items-center justify-center px-6 py-3 rounded-md font-medium ${
                    product.stock > 0
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FiShoppingCart className="mr-2" />
                  Add to Cart
                </button>
                <button 
                  onClick={handleAddToWishlist}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <FiHeart className="mr-2" />
                  Wishlist
                </button>
              </div>
              
              {/* Merchant Location */}
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                <FiMapPin className="mr-2" />
                <span>{product.merchant.location}</span>
              </div>
              
              {/* Share Button */}
              <button className="flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400">
                <FiShare2 className="mr-2" />
                Share this product
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="flex overflow-x-auto">
              <button 
                onClick={() => setActiveTab('description')}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'description'
                    ? 'border-b-2 border-orange-500 text-orange-500'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Description
              </button>
              <button 
                onClick={() => setActiveTab('specifications')}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'specifications'
                    ? 'border-b-2 border-orange-500 text-orange-500'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Specifications
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-orange-500 text-orange-500'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Reviews ({product.ratings.count})
              </button>
            </div>
            
            <div className="p-6">
              {activeTab === 'description' && (
                <div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {product.description}
                  </p>
                  
                  {product.features && product.features.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Key Features
                      </h3>
                      <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                        {product.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'specifications' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                        <tr key={key}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white w-1/3">
                            {key}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Reviews will be implemented in a future update.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}