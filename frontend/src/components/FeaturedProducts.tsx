import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Check, Heart, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '@/lib/api';

interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  reviews?: number;
  image?: string;
  images?: string[];
  primaryImage?: string;
  merchant?: {
    _id?: string;
    businessName?: string;
    verified?: boolean;
    address?: string;
  };
  merchantName?: string;
  merchantId?: string;
  location?: string;
  verified?: boolean;
  featured?: boolean;
  category?: string;
}

const ProductCard = ({ product, onProductClick, isMobile = false }: { product: Product; onProductClick: (id: string) => void; isMobile?: boolean }) => {
const ProductCard = ({ product, onProductClick, isMobile = false }: { product: Product; onProductClick: (id: string) => void; isMobile?: boolean }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = () => {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    const productId = product._id || product.id;
    if (productId) {
      onProductClick(productId);
    }
  };

  // Get merchant info
  const merchantName = typeof product.merchant === 'object' && product.merchant?.businessName
    ? product.merchant.businessName
    : product.merchantName || 'Unknown Merchant';
    
  const isVerified = typeof product.merchant === 'object'
    ? product.merchant?.verified
    : product.verified || false;
    
  const locationDisplay = typeof product.merchant === 'object' && product.merchant?.address
    ? product.merchant.address
    : product.location || 'Location not specified';
  
  const displayImage = product.primaryImage || product.image || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop';

  return (
    <Card 
      className={`hover-scale cursor-pointer border-0 shadow-lg overflow-hidden group transition-transform duration-200 hover:scale-105 flex-shrink-0 ${isMobile ? 'w-[160px]' : 'w-full'}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full ${isMobile ? 'h-32' : 'h-48'} object-cover group-hover:scale-105 transition-transform duration-300`}
          />
          {product.featured && (
            <div className={`absolute top-2 left-2 bg-secondary text-secondary-foreground px-2 py-1 rounded font-medium ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
              Featured
            </div>
          )}
          {calculateDiscount() > 0 && (
            <div className={`absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded font-bold ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
              -{calculateDiscount()}%
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute bottom-2 right-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`}
            onClick={(e) => {
              e.stopPropagation();
              alert(`Added ${product.name} to wishlist!`);
            }}
          >
            <Heart className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </Button>
        </div>
        
        <div className={`${isMobile ? 'p-2' : 'p-4'}`}>
          <div className="flex items-center gap-1 mb-1">
            <span className={`text-gray-600 truncate ${isMobile ? 'text-[10px]' : 'text-sm'}`}>{product.merchant}</span>
            {product.verified && (
              <div className={`flex items-center gap-1 bg-green-100 text-green-700 px-1 py-0.5 rounded-full flex-shrink-0 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                <Check className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
                Verified
              </div>
            )}
          </div>
          
          <h3 className={`font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary transition-colors ${isMobile ? 'text-xs' : 'text-base'}`}>
            {product.name}
          </h3>
          
          <div className={`text-gray-600 hover:text-primary transition-colors flex items-center gap-1 mb-1 ${isMobile ? 'text-[10px]' : 'text-sm'}`}>
            <MapPin className={`text-gray-400 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            <span className="truncate">{product.location}</span>
          </div>
          
          <div className="flex items-center gap-1 mb-2 flex-wrap">
            <div className="flex items-center">
              <Star className={`text-yellow-400 fill-current ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
              <span className={`font-medium ml-1 ${isMobile ? 'text-[10px]' : 'text-sm'}`}>{product.rating}</span>
            </div>
            <span className={`text-gray-500 ${isMobile ? 'text-[10px]' : 'text-sm'}`}>({product.reviews})</span>
            <span className={`bg-gray-100 text-gray-600 px-1 py-0.5 rounded ${isMobile ? 'text-[10px]' : 'text-xs'}`}>{product.category}</span>
          </div>
          
          <div className="flex items-center gap-1 mb-2">
            <span className={`font-bold text-primary ${isMobile ? 'text-sm' : 'text-xl'}`}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className={`text-gray-500 line-through ${isMobile ? 'text-[10px]' : 'text-sm'}`}>
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <Button className={`w-full ${isMobile ? 'text-xs py-1 h-7' : ''}`} onClick={() => onProductClick(product.id)}>
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const featuredProducts = products.filter(product => product.featured).slice(0, 8);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [visibleCards, setVisibleCards] = useState(4);

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  // Check screen size and update visible cards count
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (window.innerWidth >= 1280) {
        setVisibleCards(4); // xl screens
      } else if (window.innerWidth >= 1024) {
        setVisibleCards(3); // lg screens
      } else if (window.innerWidth >= 768) {
        setVisibleCards(2); // md screens
      } else {
        setVisibleCards(1); // mobile screens
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Navigation functions for the carousel
  const nextSlide = () => {
    if (currentIndex < featuredProducts.length - visibleCards) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Calculate the transform value for the carousel
  const getTransformValue = () => {
    if (carouselRef.current) {
      const card = carouselRef.current.querySelector('.flex-shrink-0') as HTMLElement;
      if (card) {
        const cardWidth = card.offsetWidth + 16; // card width + gap
        return `translateX(-${currentIndex * cardWidth}px)`;
      }
    }
    return `translateX(-${currentIndex * (100 / visibleCards)}%)`;
  };

  return (
   <section className="py-8 sm:py-16 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-6 sm:mb-12">
      <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
        Featured Products
      </h2>
      <p className="text-sm sm:text-lg text-gray-600 mb-2 sm:mb-4">
        Handpicked products from our most trusted verified merchants
      </p>
     <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row justify-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
  <span>✨ Curated Selection</span>
  <span>🛡️ Verified Merchants</span>
  <span>⚡ Best Deals</span>
</div>

    </div>



        {/* Carousel for all screen sizes */}
        <div className="relative mb-8 overflow-hidden">
          <div 
            ref={carouselRef}
            className="flex transition-transform duration-300 ease-in-out gap-4"
            style={{ transform: getTransformValue() }}
          >
            {featuredProducts.map((product) => (
              <div key={product.id} className="flex-shrink-0" style={{ width: isMobile ? '160px' : 'calc(25% - 12px)' }}>
                <ProductCard 
                  product={product} 
                  onProductClick={handleProductClick}
                  isMobile={isMobile}
                />
              </div>
            ))}
          </div>
          
          {/* Navigation arrows */}
          {currentIndex > 0 && (
            <Button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 shadow-md h-10 w-10 rounded-full p-0 z-10"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </Button>
          )}
          
          {currentIndex < featuredProducts.length - visibleCards && (
            <Button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 shadow-md h-10 w-10 rounded-full p-0 z-10"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </Button>
          )}

          {/* Counter indicator */}
          <div className="flex justify-center mt-6">
            <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {featuredProducts.length - visibleCards + 1}
            </div>
          </div>
        </div>

       <div className="text-center mt-6">
  <div className="flex justify-center gap-2 sm:gap-4">
    <Link to="/products">
      <Button 
        size="sm" 
        variant="outline" 
        className="border-primary text-primary hover:bg-primary hover:text-white"
      >
        View All Products
      </Button>
    </Link>
    <Link to="/merchants">
      <Button 
        size="sm" 
        className="bg-primary hover:bg-primary-dark text-white"
      >
        Browse Merchants
      </Button>
    </Link>
  </div>
</div>

      </div>
    </section>
  );
};

export default FeaturedProducts;