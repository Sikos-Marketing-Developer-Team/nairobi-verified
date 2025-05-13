import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';
import { Product } from '@/types/api';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { _id, name, price, discountPrice, images, ratings, merchant } = product;
  const { addToCart, isLoading: isCartLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, isLoading: isWishlistLoading } = useWishlist();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Find main image or use first image
  const mainImage = images.find(img => img.isMain) || images[0];
  
  // Calculate discount percentage if applicable
  const discountPercentage = discountPrice && price > discountPrice 
    ? Math.round(((price - discountPrice) / price) * 100) 
    : null;
  
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=' + encodeURIComponent(`/product/${_id}`));
      return;
    }
    
    try {
      await addToCart(_id, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };
  
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=' + encodeURIComponent(`/product/${_id}`));
      return;
    }
    
    try {
      if (isInWishlist(_id)) {
        await removeFromWishlist(_id);
      } else {
        await addToWishlist(_id);
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    }
  };
  
  const isProductInWishlist = isInWishlist(_id);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        <Link href={`/product/${_id}`}>
          <div className="w-full h-full relative">
            {mainImage ? (
              <Image
                src={mainImage.url.startsWith('http') ? mainImage.url : `/${mainImage.url}`}
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
            className="bg-orange-500 p-2 rounded-full shadow-md hover:bg-orange-600 transition-colors"
            aria-label="Add to cart"
          >
            <FiShoppingCart className="text-white" />
          </button>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <Link href={`/product/${_id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
            {name.length > 40 ? `${name.substring(0, 40)}...` : name}
          </h3>
        </Link>
        
        {/* Merchant */}
        <Link href={`/shop/${merchant._id}`}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
            {merchant.companyName}
            {merchant.isVerified && (
              <span className="inline-block ml-1 text-blue-500 dark:text-blue-400">✓</span>
            )}
          </p>
        </Link>
        
        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center text-yellow-400">
            <FiStar className={`${ratings.average >= 1 ? 'fill-current' : ''}`} />
            <FiStar className={`${ratings.average >= 2 ? 'fill-current' : ''}`} />
            <FiStar className={`${ratings.average >= 3 ? 'fill-current' : ''}`} />
            <FiStar className={`${ratings.average >= 4 ? 'fill-current' : ''}`} />
            <FiStar className={`${ratings.average >= 5 ? 'fill-current' : ''}`} />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            ({ratings.count})
          </span>
        </div>
        
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