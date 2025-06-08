'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { Product } from '../types/api';
import { Product as ProductType } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import OptimizedImage from './OptimizedImage';
import { toast } from 'react-hot-toast';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import Image from 'next/image';

interface ProductCardProps {
  product: Product | ProductType;
  viewMode?: 'grid' | 'list';
  onAddToCart?: (product: Product | ProductType) => void;
  onAddToWishlist?: (product: Product | ProductType) => void;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  viewMode = 'grid',
  onAddToCart,
  onAddToWishlist,
  className = ''
}) => {
  // Handle both Product and ProductType interfaces
  const id = 'id' in product ? product.id : product._id;
  const { name, price, images, rating } = product;
  const merchant = product.merchant || { id: '', _id: '', name: 'Unknown Merchant' };
  const salePrice = 'salePrice' in product ? product.salePrice : ('discountPrice' in product ? product.discountPrice : undefined);
  const { addToCart, isLoading: isCartLoading } = useCart();
  const { addToWishlist: addToWishlistContext, removeFromWishlist, isInWishlist, isLoading: isWishlistLoading } = useWishlist();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate discount percentage if applicable
  const discountPercentage = salePrice && price > salePrice 
    ? Math.round(((price - salePrice) / price) * 100) 
    : null;
  
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=' + encodeURIComponent(`/product/${id}`));
      return;
    }
    
    try {
      if (onAddToCart) {
        onAddToCart(product);
      } else {
        await addToCart(id, 1);
        toast.success('Added to cart');
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };
  
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=' + encodeURIComponent(`/product/${id}`));
      return;
    }
    
    try {
      if (onAddToWishlist) {
        onAddToWishlist(product);
      } else if (isInWishlist(id)) {
        await removeFromWishlist(id);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlistContext(id);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };
  
  const isProductInWishlist = isInWishlist(id);
  
  if (viewMode === 'list') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${className}`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div className="relative h-48 md:h-auto md:w-48 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
            <Link href={`/product/${id}`}>
              <div className="w-full h-full relative">
                {images && images.length > 0 ? (
                  <Image
                    src={typeof images[0] === 'string' ? images[0] : images[0].url || "/images/placeholder.png"}
                    alt={name}
                    width={500}
                    height={500}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
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
              <Link href={`/shop/${'id' in merchant ? merchant.id : merchant._id}`}>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                  {merchant.name}
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
                    ({'reviews' in product && Array.isArray((product as any).reviews) ? (product as any).reviews.length : 0})
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
                {salePrice && salePrice < price ? (
                  <>
                    <span className="font-bold text-gray-900 dark:text-white">
                      KES {salePrice.toLocaleString()}
                    </span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                      KES {price.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-gray-900 dark:text-white">
                    KES {price.toLocaleString()}
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
                  {isProductInWishlist ? (
                    <FaHeart className="text-white" />
                  ) : (
                    <FaRegHeart className="text-gray-600 dark:text-gray-300" />
                  )}
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
    <div className={`group relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-200 dark:bg-gray-700">
        <Link href={`/product/${id}`}>
          <div className="w-full h-full relative">
            {images && images.length > 0 ? (
              <Image
                src={typeof images[0] === 'string' ? images[0] : images[0].url || "/images/placeholder.png"}
                alt={name}
                width={500}
                height={500}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
        <div className="absolute top-2 right-2 flex space-x-1">
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
            {isProductInWishlist ? (
              <FaHeart className="text-white" />
            ) : (
              <FaRegHeart className="text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <Link href={`/product/${id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 hover:text-orange-500 dark:hover:text-orange-400 transition-colors line-clamp-2">
            {name}
          </h3>
        </Link>
        
        <Link href={`/shop/${'id' in merchant ? merchant.id : merchant._id}`}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
            {merchant.name}
          </p>
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            {salePrice && salePrice < price ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-orange-600">
                  KES {salePrice.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  KES {price.toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="text-lg font-semibold text-orange-600">
                KES {price.toLocaleString()}
              </span>
            )}
          </div>
          
          {rating && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isCartLoading}
          className={`w-full mt-3 bg-orange-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors ${
            isHovered ? 'opacity-100' : 'opacity-0 md:opacity-100'
          }`}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;