'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';
import { Product } from '@/types/api';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import OptimizedImage from './OptimizedImage';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  viewMode = 'grid',
  onAddToCart,
  onAddToWishlist
}) => {
  const { id, name, price, discountPrice, images, rating, reviewCount, merchantId } = product;
  const { addToCart, isLoading: isCartLoading } = useCart();
  const { addToWishlist: addToWishlistContext, removeFromWishlist, isInWishlist, isLoading: isWishlistLoading } = useWishlist();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Get main image or first image
  const mainImage = images && images.length > 0 ? images[0] : null;
  
  // Calculate discount percentage if applicable
  const discountPercentage = discountPrice && price > discountPrice 
    ? Math.round(((price - discountPrice) / price) * 100) 
    : null;
  
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=' + encodeURIComponent(`/product/${id}`));
      return;
    }
    
    try {
      if (onAddToCart) {
        onAddToCart(id || product._id);
      } else {
        await addToCart(id || product._id, 1);
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };
  
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=' + encodeURIComponent(`/product/${id}`));
      return;
    }
    
    try {
      if (onAddToWishlist) {
        onAddToWishlist(id || product._id);
      } else if (isInWishlist(id || product._id)) {
        await removeFromWishlist(id || product._id);
      } else {
        await addToWishlistContext(id || product._id);
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    }
  };
  
  const isProductInWishlist = isInWishlist(id || product._id);
  
  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div className="relative h-48 md:h-auto md:w-48 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
            <Link href={`/product/${id}`}>
              <div className="w-full h-full relative">
                {mainImage ? (
                  <OptimizedImage
                    src={mainImage}
                    alt={name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
            </Link>
            
            {/* Discount Badge */}
            {discountPercentage && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                {discountPercentage}% OFF
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex-1">
              <Link href={`/product/${id}`}>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                  {name}
                </h3>
              </Link>
              
              {/* Merchant */}
              <Link href={`/shop/${merchantId}`}>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                  {/* Merchant name would go here */}
                  {merchantId}
                </p>
              </Link>
              
              {/* Rating */}
              {rating && (
                <div className="flex items-center mb-2">
                  <div className="flex items-center text-yellow-400">
                    <FiStar className={`${rating >= 1 ? 'fill-current' : ''}`} />
                    <FiStar className={`${rating >= 2 ? 'fill-current' : ''}`} />
                    <FiStar className={`${rating >= 3 ? 'fill-current' : ''}`} />
                    <FiStar className={`${rating >= 4 ? 'fill-current' : ''}`} />
                    <FiStar className={`${rating >= 5 ? 'fill-current' : ''}`} />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    ({reviewCount || 0})
                  </span>
                </div>
              )}
              
              {/* Short Description - if available */}
              {product.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-2">
              {/* Price */}
              <div className="flex items-center">
                {discountPrice && discountPrice < price ? (
                  <>
                    <span className="font-bold text-gray-900 dark:text-white">
                      KSh {discountPrice.toLocaleString()}
                    </span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                      KSh {price.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-gray-900 dark:text-white">
                    KSh {price.toLocaleString()}
                  </span>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button 
                  onClick={handleWishlistToggle}
                  disabled={isWishlistLoading}
                  className={`p-2 rounded-full shadow-md transition-colors ${
                    isProductInWishlist 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-label={isProductInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <FiHeart className={`${
                    isProductInWishlist ? 'text-white fill-current' : 'text-gray-600 dark:text-gray-300'
                  }`} />
                </button>
                <button 
                  onClick={handleAddToCart}
                  disabled={isCartLoading}
                  className="bg-orange-600 p-2 rounded-full shadow-md hover:bg-orange-700 transition-colors"
                  aria-label="Add to cart"
                >
                  <FiShoppingCart className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Default Grid View
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        <Link href={`/product/${id}`}>
          <div className="w-full h-full relative">
            {mainImage ? (
              <OptimizedImage
                src={mainImage}
                alt={name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
        </Link>
        
        {/* Discount Badge */}
        {discountPercentage && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            {discountPercentage}% OFF
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute bottom-2 right-2 flex space-x-1">
          <button 
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
            className={`p-2 rounded-full shadow-md transition-colors ${
              isProductInWishlist 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            aria-label={isProductInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <FiHeart className={`${
              isProductInWishlist ? 'text-white fill-current' : 'text-gray-600 dark:text-gray-300'
            }`} />
          </button>
          <button 
            onClick={handleAddToCart}
            disabled={isCartLoading}
            className="bg-orange-600 p-2 rounded-full shadow-md hover:bg-orange-700 transition-colors"
            aria-label="Add to cart"
          >
            <FiShoppingCart className="text-white" />
          </button>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <Link href={`/product/${id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
            {name.length > 40 ? `${name.substring(0, 40)}...` : name}
          </h3>
        </Link>
        
        {/* Merchant - We'll add this when we have merchant data */}
        <Link href={`/shop/${merchantId}`}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
            {/* Merchant name would go here */}
            {merchantId}
          </p>
        </Link>
        
        {/* Rating */}
        {rating && (
          <div className="flex items-center mb-2">
            <div className="flex items-center text-yellow-400">
              <FiStar className={`${rating >= 1 ? 'fill-current' : ''}`} />
              <FiStar className={`${rating >= 2 ? 'fill-current' : ''}`} />
              <FiStar className={`${rating >= 3 ? 'fill-current' : ''}`} />
              <FiStar className={`${rating >= 4 ? 'fill-current' : ''}`} />
              <FiStar className={`${rating >= 5 ? 'fill-current' : ''}`} />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              ({reviewCount || 0})
            </span>
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center">
          {discountPrice && discountPrice < price ? (
            <>
              <span className="font-bold text-gray-900 dark:text-white">
                KSh {discountPrice.toLocaleString()}
              </span>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                KSh {price.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="font-bold text-gray-900 dark:text-white">
              KSh {price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;