import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Flame, Star, MapPin, Check, ShoppingCart, Eye, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePageLoading } from '@/hooks/use-loading';
import { PageSkeleton } from '@/components/ui/loading-skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

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

const FlashSaleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const isLoading = usePageLoading(600);
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && id) {
      fetchFlashSale();
    }
  }, [isLoading, id]);

  const fetchFlashSale = async () => {
    try {
      const response = await fetch(`/api/flash-sales/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setFlashSale(data.data);
      } else {
        setError('Flash sale not found');
      }
    } catch (err) {
      setError('Error loading flash sale');
      console.error('Flash sale fetch error:', err);
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
      return (
        <div className="text-center py-8">
          <div className="text-red-500 text-2xl font-bold mb-2">SALE ENDED</div>
          <p className="text-gray-600">This flash sale has expired</p>
        </div>
      );
    }

    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clock className="h-6 w-6 text-red-500" />
          <span className="text-xl font-semibold text-gray-700">Sale ends in:</span>
        </div>
        <div className="flex justify-center gap-2">
          {time.days > 0 && (
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg text-center min-w-[60px]">
              <div className="text-2xl font-bold">{time.days}</div>
              <div className="text-xs">DAYS</div>
            </div>
          )}
          <div className="bg-red-500 text-white px-4 py-3 rounded-lg text-center min-w-[60px]">
            <div className="text-2xl font-bold">{String(time.hours).padStart(2, '0')}</div>
            <div className="text-xs">HOURS</div>
          </div>
          <div className="bg-red-500 text-white px-4 py-3 rounded-lg text-center min-w-[60px]">
            <div className="text-2xl font-bold">{String(time.minutes).padStart(2, '0')}</div>
            <div className="text-xs">MINS</div>
          </div>
          <div className="bg-red-500 text-white px-4 py-3 rounded-lg text-center min-w-[60px]">
            <div className="text-2xl font-bold">{String(time.seconds).padStart(2, '0')}</div>
            <div className="text-xs">SECS</div>
          </div>
        </div>
      </div>
    );
  };

  const ProductCard = ({ product }: { product: FlashSaleProduct }) => {
    const stockPercentage = (product.soldQuantity / product.stockQuantity) * 100;
    const isLowStock = stockPercentage > 80;
    const isOutOfStock = product.soldQuantity >= product.stockQuantity;

    return (
      <Card className="hover-scale cursor-pointer border-0 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-64 object-cover"
            />
            <div className="absolute top-3 left-3">
              <Badge className="bg-red-500 text-white font-bold text-lg px-3 py-1">
                -{product.discountPercentage}%
              </Badge>
            </div>
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">SOLD OUT</span>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-600">{product.merchant}</span>
              <div className="verified-badge">
                <Check className="h-3 w-3" />
                Verified
              </div>
            </div>
            
            <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2">
              {product.name}
            </h3>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold text-red-500">
                {formatPrice(product.salePrice)}
              </span>
              <span className="text-lg text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Sold: {product.soldQuantity}</span>
                <span>Available: {product.stockQuantity - product.soldQuantity}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${isLowStock ? 'bg-red-500' : 'bg-orange-500'}`}
                  style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                ></div>
              </div>
              {isLowStock && !isOutOfStock && (
                <p className="text-sm text-red-500 mt-2 font-medium">
                  Hurry! Only {product.stockQuantity - product.soldQuantity} left!
                </p>
              )}
            </div>
            
            <Button 
              className="w-full bg-red-500 hover:bg-red-600 text-white text-lg py-3"
              disabled={isOutOfStock}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isOutOfStock) {
                  alert(`Added ${product.name} to cart!`);
                }
              }}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isOutOfStock ? 'SOLD OUT' : 'BUY NOW'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <PageSkeleton>
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="text-center space-y-4">
              <Skeleton className="h-12 w-2/3 mx-auto" />
              <Skeleton className="h-6 w-1/2 mx-auto" />
            </div>

            {/* Countdown Skeleton */}
            <div className="text-center space-y-4">
              <Skeleton className="h-8 w-48 mx-auto" />
              <div className="flex justify-center gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-16" />
                ))}
              </div>
            </div>

            {/* Products Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <Skeleton className="h-64 w-full" />
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageSkeleton>
        
        <Footer />
      </div>
    );
  }

  if (error || !flashSale) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Flame className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Flash Sale Not Found</h2>
          <p className="text-gray-600 mb-8">{error || 'The flash sale you\'re looking for doesn\'t exist or has been removed.'}</p>
          <Link to="/">
            <Button className="bg-primary hover:bg-primary-dark text-white">
              Back to Home
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-primary hover:text-primary-dark mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        {/* Flash Sale Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Flame className="h-10 w-10 text-red-500" />
            <h1 className="text-4xl lg:text-5xl font-bold inter text-gray-900">
              {flashSale.title}
            </h1>
            <Flame className="h-10 w-10 text-red-500" />
          </div>
          <p className="text-xl text-gray-600 mb-6">
            {flashSale.description}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              <span className="font-medium">{flashSale.totalViews.toLocaleString()} views</span>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-medium">{flashSale.totalSales.toLocaleString()} sold</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              <span className="font-medium">{flashSale.products.length} products</span>
            </div>
          </div>

          {/* Share Button */}
          <Button 
            variant="outline" 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: flashSale.title,
                  text: flashSale.description,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Sale
          </Button>
        </div>

        {/* Countdown Timer */}
        <Card className="mb-8 bg-gradient-to-r from-red-500 to-orange-500 text-white">
          <CardContent className="p-0">
            <CountdownTimer timeRemaining={flashSale.timeRemaining} />
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {flashSale.products.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>

        {/* Call to Action */}
        {!flashSale.timeRemaining.expired && (
          <div className="text-center mt-12 py-8 bg-red-50 rounded-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Don't Miss Out!
            </h3>
            <p className="text-gray-600 mb-6">
              These amazing deals won't last long. Shop now before they're gone!
            </p>
            <Button className="bg-red-500 hover:bg-red-600 text-white text-lg px-8 py-3">
              <Flame className="h-5 w-5 mr-2" />
              Shop All Deals
            </Button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default FlashSaleDetail;