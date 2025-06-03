"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { FiStar, FiShoppingCart, FiHeart, FiShare2, FiMapPin, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { apiService } from '@/lib/api';

type ProductSpecification = {
  name: string;
  value: string;
};
// Define ProductDetailType here if not exported from '@/types/api'
type ProductDetailType = {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  category?: { id: string; name: string };
  merchant?: {
    id: string;
    businessName: string;
    isVerified?: boolean;
    address?: string;
    city?: string;
  };
  isNew?: boolean;
  rating?: number;
  reviewCount?: number;
  reviews?: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: { firstName: string; lastName: string };
  }[];
  specifications?: ProductSpecification[];
  relatedProducts?: any[];
};
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Fallback product image
const FALLBACK_IMAGE = '/images/placeholder-product.png';

export default function ProductDetail({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  const { addToCart, isLoading: isCartLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, isLoading: isWishlistLoading } = useWishlist();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await apiService.products.getById(params.id);
        setProduct(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [params.id]);
  
  // Handle quantity change
  const handleQuantityChange = (value: number) => {
    if (!product) return;
    if (value < 1) return;
    if (value > product.stock) return;
    setQuantity(value);
  };
  
  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      router.push(`/auth/signin?redirect=${encodeURIComponent(`/product/${params.id}`)}`);
      return;
    }
    
    try {
      await addToCart(product.id, quantity);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };
  
  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      router.push(`/auth/signin?redirect=${encodeURIComponent(`/product/${params.id}`)}`);
      return;
    }
    
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    }
  };
  
  // Calculate discount percentage if applicable
  const discountPercentage = product?.discountPrice && product.price > product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
    : null;
  
  // Check if product is in wishlist
  const isProductInWishlist = product ? isInWishlist(product.id) : false;
  
  // Extract features from description (temporary solution until API provides structured features)
  const extractFeatures = (description: string): string[] => {
    // Simple extraction - split by newlines and filter out empty lines
    const lines = description.split('\n').map(line => line.trim()).filter(Boolean);
    
    // If there are bullet points or numbered lists, try to extract them
    const bulletPoints = lines.filter(line => line.startsWith('•') || line.startsWith('-') || /^\d+\./.test(line));
    
    if (bulletPoints.length > 0) {
      return bulletPoints.map(point => point.replace(/^[•\-\d\.]+\s*/, ''));
    }
    
    // If no bullet points found, just return the first few sentences as features
    if (lines.length > 1) {
      return lines.slice(0, Math.min(5, lines.length));
    }
    
    // If all else fails, split the description into shorter segments
    return description.split('. ').slice(0, 5).map(s => s.trim() + (s.endsWith('.') ? '' : '.'));
  };
  
  // Create specifications from product data
  const createSpecifications = (product: ProductDetailType): Record<string, string> => {
    const specs: Record<string, string> = {};
    
    if (product.specifications && product.specifications.length > 0) {
      // If the API provides specifications, use them
      product.specifications.forEach((spec: ProductSpecification) => {
        specs[spec.name] = spec.value;
      });
    } else {
      // Otherwise, create some basic specs from available data
      if (product.category?.name) specs['Category'] = product.category.name;
      if (product.merchant?.businessName) specs['Seller'] = product.merchant.businessName;
      specs['Stock'] = product.stock.toString();
      if (product.isNew) specs['Condition'] = 'New';
    }
    
    return specs;
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
            <FiAlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        ) : product ? (
          <>
            {/* Breadcrumb */}
            <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/" className="hover:text-orange-500 dark:hover:text-orange-400">Home</Link>
              <span className="mx-2">/</span>
              {product.category && (
                <>
                  <Link 
                    href={`/category/${product.category.id}`} 
                    className="hover:text-orange-500 dark:hover:text-orange-400"
                  >
                    {product.category.name}
                  </Link>
                  <span className="mx-2">/</span>
                </>
              )}
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
                        src={product.images[selectedImage] || FALLBACK_IMAGE}
                        alt={product.name}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <Image
                        src={FALLBACK_IMAGE}
                        alt={product.name}
                        fill
                        className="object-contain"
                      />
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
                            src={image || FALLBACK_IMAGE}
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
                  {product.merchant && (
                    <Link href={`/shop/${product.merchant.id}`} className="inline-block mb-4">
                      <div className="flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400">
                        <span className="font-medium">{product.merchant.businessName}</span>
                        {product.merchant.isVerified && (
                          <span className="inline-block ml-1 text-blue-500 dark:text-blue-400">
                            <FiCheck className="inline" />
                          </span>
                        )}
                      </div>
                    </Link>
                  )}
                  
                  {/* Rating */}
                  {product.rating !== undefined && (
                    <div className="flex items-center mb-4">
                      <div className="flex text-yellow-400">
                        <FiStar className={`${product.rating >= 1 ? 'fill-current' : ''}`} />
                        <FiStar className={`${product.rating >= 2 ? 'fill-current' : ''}`} />
                        <FiStar className={`${product.rating >= 3 ? 'fill-current' : ''}`} />
                        <FiStar className={`${product.rating >= 4 ? 'fill-current' : ''}`} />
                        <FiStar className={`${product.rating >= 5 ? 'fill-current' : ''}`} />
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        {product.rating.toFixed(1)} ({product.reviewCount || 0} reviews)
                      </span>
                    </div>
                  )}
                  
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
                      disabled={product.stock === 0 || isCartLoading}
                      className={`flex-1 flex items-center justify-center px-6 py-3 rounded-md font-medium ${
                        product.stock > 0 && !isCartLoading
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <FiShoppingCart className="mr-2" />
                      {isCartLoading ? "Adding..." : "Add to Cart"}
                    </button>
                    <button 
                      onClick={handleWishlistToggle}
                      disabled={isWishlistLoading}
                      className={`flex-1 flex items-center justify-center px-6 py-3 rounded-md font-medium ${
                        isProductInWishlist
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <FiHeart className={`mr-2 ${isProductInWishlist ? 'fill-current' : ''}`} />
                      {isWishlistLoading ? "Updating..." : (isProductInWishlist ? "Remove from Wishlist" : "Add to Wishlist")}
                    </button>
                  </div>
                  
                  {/* Merchant Location */}
                  {product.merchant && product.merchant.address && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                      <FiMapPin className="mr-2" />
                      <span>{product.merchant.address}, {product.merchant.city}</span>
                    </div>
                  )}
                  
                  {/* Share Button */}
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: product.name,
                          text: product.description.substring(0, 100) + '...',
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400"
                  >
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
                    Reviews ({product.reviewCount || 0})
                  </button>
                </div>
                
                <div className="p-6">
                  {activeTab === 'description' && (
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
                        {product.description}
                      </p>
                      
                      {/* Extract features from description */}
                      {product.description && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Key Features
                          </h3>
                          <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
                            {extractFeatures(product.description).map((feature, index) => (
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
                          {Object.entries(createSpecifications(product)).map(([key, value]) => (
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
                      {product.reviews && product.reviews.length > 0 ? (
                        <div className="space-y-4">
                          {product.reviews.map(review => (
                            <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                              <div className="flex items-center mb-2">
                                <div className="flex text-yellow-400">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <FiStar 
                                      key={star} 
                                      className={review.rating >= star ? 'fill-current' : ''}
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                                  {review.user.firstName} {review.user.lastName}
                                </span>
                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300">
                                {review.comment}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300">
                          No reviews yet. Be the first to review this product!
                        </p>
                      )}
                      
                      {isAuthenticated && (
                        <div className="mt-6">
                          <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
                            Write a Review
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Related Products Section - To be implemented */}
            {product.relatedProducts && product.relatedProducts.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Related Products
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {/* Map through related products and render ProductCard components */}
                  {/* This will be implemented when we have the ProductCard component ready */}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-700 dark:text-gray-300">Product not found</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}