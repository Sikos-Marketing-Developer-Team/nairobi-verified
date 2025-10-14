import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Flame, Star, MapPin, Check, ShoppingCart, Eye, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { flashSalesAPI } from '@/lib/api';

interface FlashSaleProduct {
  productId: string;
  name: string;
  originalPrice: number;
  salePrice: number;
  discountPercentage: number;
  image: string;
  merchant: string;
  merchantId: string;
  stockQuantity: number;
  soldQuantity: number;
  maxQuantityPerUser: number;
}

interface FlashSale {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  products: FlashSaleProduct[];
  totalViews: number;
  totalSales: number;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  };
  isCurrentlyActive: boolean;
}

const FlashSales = () => {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndices, setCurrentIndices] = useState<{[key: string]: number}>({});
  const [isMobile, setIsMobile] = useState(false);
  const [visibleCards, setVisibleCards] = useState(4);
  const carouselRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  useEffect(() => {
    fetchFlashSales();
    
    // Check screen size and update visible cards count
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

  const fetchFlashSales = async () => {
  try {
    setLoading(true);
    setError(null);

    // FIX: Use the centralized API instance
    const response = await flashSalesAPI.getFlashSales();

    console.log('🔥 FlashSales API Response:', response.data);

    if (response.data.success) {
      // Filter flash sales to only show those with products for better UX
      const flashSalesWithProducts = response.data.data.filter((sale: FlashSale) => 
        sale.products && sale.products.length > 0
      );
      setFlashSales(flashSalesWithProducts);
      // Initialize current indices for each flash sale
      const indices: {[key: string]: number} = {};
      flashSalesWithProducts.forEach((sale: FlashSale) => {
        indices[sale._id] = 0;
      });
      setCurrentIndices(indices);
    } else {
      throw new Error(response.data.message || 'Failed to fetch flash sales');
    }
  } catch (err) {
    console.error('Flash sales fetch error:', err);
    setError('We could not load the flash sales right now. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Navigation functions for the carousel
  const nextSlide = (flashSaleId: string) => {
    const flashSale = flashSales.find(sale => sale._id === flashSaleId);
    if (!flashSale) return;
    
    if (currentIndices[flashSaleId] < flashSale.products.length - visibleCards) {
      setCurrentIndices(prev => ({
        ...prev,
        [flashSaleId]: prev[flashSaleId] + 1
      }));
    }
  };

  const prevSlide = (flashSaleId: string) => {
    if (currentIndices[flashSaleId] > 0) {
      setCurrentIndices(prev => ({
        ...prev,
        [flashSaleId]: prev[flashSaleId] - 1
      }));
    }
  };

  // Calculate the transform value for the carousel
  const getTransformValue = (flashSaleId: string) => {
    const carousel = carouselRefs.current[flashSaleId];
    if (carousel) {
      const card = carousel.querySelector('.flex-shrink-0') as HTMLElement;
      if (card) {
        const cardWidth = card.offsetWidth + (isMobile ? 8 : 16); // card width + gap (smaller gap on mobile)
        return `translateX(-${currentIndices[flashSaleId] * cardWidth}px)`;
      }
    }
    return `translateX(-${currentIndices[flashSaleId] * (100 / visibleCards)}%)`;
  };

  const CountdownTimer = ({ timeRemaining }: { timeRemaining: FlashSale['timeRemaining'] }) => {
    const [time, setTime] = useState(timeRemaining);

    useEffect(() => {
      if (time.expired) return;

      const timer = setInterval(() => {
        setTime(prevTime => {
          if (prevTime.expired) return prevTime;
          
          let { days, hours, minutes, seconds } = prevTime;
          
          if (seconds > 0) {
            seconds--;
          } else if (minutes > 0) {
            minutes--;
            seconds = 59;
          } else if (hours > 0) {
            hours--;
            minutes = 59;
            seconds = 59;
          } else if (days > 0) {
            days--;
            hours = 23;
            minutes = 59;
            seconds = 59;
          } else {
            return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
          }
          
          return { days, hours, minutes, seconds, expired: false };
        });
      }, 1000);

      return () => clearInterval(timer);
    }, [time.expired]);

    if (time.expired) {
      return <span className="text-red-500 font-semibold text-sm">Expired</span>;
    }

    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
        <div className="flex gap-0.5 sm:gap-1">
          {time.days > 0 && (
            <div className="bg-red-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-bold">
              {time.days}d
            </div>
          )}
          <div className="bg-red-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-bold">
            {String(time.hours).padStart(2, '0')}h
          </div>
          <div className="bg-red-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-bold">
            {String(time.minutes).padStart(2, '0')}m
          </div>
          <div className="bg-red-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-bold">
            {String(time.seconds).padStart(2, '0')}s
          </div>
        </div>
      </div>
    );
  };

  const ProductCard = ({ product, flashSaleId, isMobile = false }: { product: FlashSaleProduct; flashSaleId: string; isMobile?: boolean }) => {
    const stockPercentage = (product.soldQuantity / product.stockQuantity) * 100;
    const isLowStock = stockPercentage > 80;
    const isOutOfStock = product.soldQuantity >= product.stockQuantity;

    return (
      <Link to={`/product/${product.productId}`}>
        <Card className={`hover-scale cursor-pointer border-0 shadow-lg overflow-hidden relative flex-shrink-0 ${isMobile ? 'w-[140px]' : 'w-full'}`}>
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className={`w-full ${isMobile ? 'h-28' : 'h-48'} object-cover`}
              />
              <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
                <Badge className={`bg-red-500 text-white font-bold ${isMobile ? 'text-[9px] px-1' : ''}`}>
                  -{product.discountPercentage}%
                </Badge>
              </div>
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">Sold Out</span>
                </div>
              )}
            </div>
            
            <div className={`${isMobile ? 'p-1.5' : 'p-4'}`}>
              <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
                <span className={`text-gray-600 truncate ${isMobile ? 'text-[9px]' : 'text-sm'}`}>{product.merchant}</span>
                <div className={`verified-badge flex items-center gap-1 bg-green-100 text-green-700 px-1 py-0.5 rounded-full flex-shrink-0 ${isMobile ? 'text-[8px]' : 'text-xs'}`}>
                  <Check className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
                  Verified
                </div>
              </div>
              
              <h3 className={`font-semibold text-gray-900 mb-1 line-clamp-2 ${isMobile ? 'text-xs leading-tight' : 'text-base'}`}>
                {product.name}
              </h3>
              
              <div className="flex items-center gap-1 mb-1 sm:mb-2">
                <span className={`font-bold text-red-500 ${isMobile ? 'text-xs' : 'text-xl'}`}>
                  {formatPrice(product.salePrice)}
                </span>
                <span className={`text-gray-500 line-through ${isMobile ? 'text-[9px]' : 'text-sm'}`}>
                  {formatPrice(product.originalPrice)}
                </span>
              </div>

              {/* Stock Progress Bar */}
              <div className="mb-1 sm:mb-2">
                <div className={`flex justify-between text-gray-600 mb-0.5 ${isMobile ? 'text-[9px]' : 'text-xs'}`}>
                  <span>Sold: {product.soldQuantity}</span>
                  <span>Stock: {product.stockQuantity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div 
                    className={`h-1.5 sm:h-2 rounded-full ${isLowStock ? 'bg-red-500' : 'bg-orange-500'}`}
                    style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                  ></div>
                </div>
                {isLowStock && !isOutOfStock && (
                  <p className={`text-red-500 mt-0.5 ${isMobile ? 'text-[9px]' : 'text-xs'}`}>Only {product.stockQuantity - product.soldQuantity} left!</p>
                )}
              </div>
              
              <Button 
                className={`w-full bg-red-500 hover:bg-red-600 text-white ${isMobile ? 'text-xs py-0.5 h-6' : ''}`}
                disabled={isOutOfStock}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isOutOfStock) {
                    try {
                      alert(`Added ${product.name} to cart!`);
                    } catch {
                      alert('Failed to add item to cart');
                    }
                  }
                }}
              >
                <ShoppingCart className={`${isMobile ? 'h-2.5 w-2.5 mr-0.5' : 'h-4 w-4 mr-2'}`} />
                {isOutOfStock ? 'Sold Out' : 'Buy Now'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  if (loading) {
    return (
      <section className="sm:py-16 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="animate-pulse">
              <div className="h-6 sm:h-8 bg-gray-300 rounded w-1/3 mx-auto mb-3 sm:mb-4"></div>
              <div className="h-3 sm:h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
          {/* Updated grid for loading state */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="h-32 sm:h-48 bg-gray-300"></div>
                  <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-6 sm:h-10 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 sm:py-16 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
          <AlertTriangle className="mx-auto mb-3 sm:mb-4 text-red-500 w-8 h-8 sm:w-12 sm:h-12" />
          <p className="text-red-500 font-medium mb-3 sm:mb-4 text-sm sm:text-base">{error}</p>
          <Button
            onClick={fetchFlashSales}
            className="bg-red-500 hover:bg-red-600 text-white text-sm sm:text-base"
          >
            Retry
          </Button>
        </div>
      </section>
    );
  }

  if (flashSales.length === 0 && !loading && !error) {
    return (
      <section className="py-8 sm:py-16 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Flame className="h-5 w-5 sm:h-8 sm:w-8 text-red-500" />
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold inter text-gray-900">
              Flash Sales
            </h2>
            <Flame className="h-5 w-5 sm:h-8 sm:w-8 text-red-500" />
          </div>
          <p className="text-gray-600 mb-4">No active flash sales at the moment. Check back soon!</p>
          <Button
            onClick={fetchFlashSales}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Refresh
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-16 bg-gradient-to-r from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {flashSales.map((flashSale) => (
          <div key={flashSale._id} className="mb-10 sm:mb-16">
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Flame className="h-5 w-5 sm:h-8 sm:w-8 text-red-500" />
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold inter text-gray-900">
                  {flashSale.title}
                </h2>
                <Flame className="h-5 w-5 sm:h-8 sm:w-8 text-red-500" />
              </div>
              <p className="text-sm sm:text-xl text-gray-600 mb-3 sm:mb-4">
                {flashSale.description}
              </p>

              <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                <span className="text-sm sm:text-lg font-semibold text-gray-700">Ends in:</span>
                <CountdownTimer timeRemaining={flashSale.timeRemaining} />
              </div>

              <div className="flex items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{flashSale.totalViews.toLocaleString()} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{flashSale.totalSales.toLocaleString()} sold</span>
                </div>
              </div>
            </div>

            {/* Carousel for all screen sizes */}
            {flashSale.products && flashSale.products.length > 0 ? (
              <div className="relative mb-6 sm:mb-8 overflow-hidden">
                <div 
                  ref={el => carouselRefs.current[flashSale._id] = el}
                  className="flex transition-transform duration-300 ease-in-out gap-2 sm:gap-4"
                  style={{ transform: getTransformValue(flashSale._id) }}
                >
                  {flashSale.products.slice(0, 8).map((product) => (
                    <div key={product.productId} className="flex-shrink-0" style={{ width: isMobile ? '140px' : 'calc(25% - 12px)' }}>
                      <ProductCard 
                        product={product} 
                        flashSaleId={flashSale._id}
                        isMobile={isMobile}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Navigation arrows */}
                {currentIndices[flashSale._id] > 0 && (
                  <Button
                    onClick={() => prevSlide(flashSale._id)}
                    className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 shadow-md h-6 w-6 sm:h-10 sm:w-10 rounded-full p-0 z-10"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </Button>
                )}
                
                {currentIndices[flashSale._id] < flashSale.products.length - visibleCards && (
                  <Button
                    onClick={() => nextSlide(flashSale._id)}
                    className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 shadow-md h-6 w-6 sm:h-10 sm:w-10 rounded-full p-0 z-10"
                  >
                    <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </Button>
                )}

                {/* Counter indicator */}
                <div className="flex justify-center mt-4 sm:mt-6">
                  <div className="bg-black/70 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm">
                    {currentIndices[flashSale._id] + 1} / {flashSale.products.length - visibleCards + 1}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-500 mb-4">No products available for this flash sale yet.</p>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  Check Back Soon
                </Button>
              </div>
            )}

            {flashSale.products.length > 8 && (
              <div className="text-center">
                <Link to="/products">
                  <Button size={isMobile ? "sm" : "lg"} className="bg-red-500 hover:bg-red-600 text-white text-sm sm:text-base">
                    View All {flashSale.products.length} Products
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FlashSales;