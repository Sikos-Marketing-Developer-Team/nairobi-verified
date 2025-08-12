import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Flame, Star, MapPin, Check, ShoppingCart, Eye, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';

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

  useEffect(() => {
    fetchFlashSales();
  }, []);

  const fetchFlashSales = async () => {
    try {
      setLoading(true);
      setError(null);

     // Use your VITE_API_URL environment variable
    const apiUrl = import.meta.env.VITE_API_URL || 'https://nairobi-cbd-backend.onrender.com';
    const response = await fetch(`${apiUrl}/api/flash-sales`, {
      credentials: 'include' // If using cookies/auth
    });


      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setFlashSales(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch flash sales');
      }
    } catch (err) {
      console.error('Flash sales fetch error:', err);
      setError('We couldn’t load the flash sales right now. Please try again.');
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
      return <span className="text-red-500 font-semibold">Expired</span>;
    }

    return (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-red-500" />
        <div className="flex gap-1">
          {time.days > 0 && (
            <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              {time.days}d
            </div>
          )}
          <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            {String(time.hours).padStart(2, '0')}h
          </div>
          <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            {String(time.minutes).padStart(2, '0')}m
          </div>
          <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            {String(time.seconds).padStart(2, '0')}s
          </div>
        </div>
      </div>
    );
  };

  const ProductCard = ({ product }: { product: FlashSaleProduct; flashSaleId: string }) => {
    const stockPercentage = (product.soldQuantity / product.stockQuantity) * 100;
    const isLowStock = stockPercentage > 80;
    const isOutOfStock = product.soldQuantity >= product.stockQuantity;

    return (
      <Card className="hover-scale cursor-pointer border-0 shadow-lg overflow-hidden relative">
        <CardContent className="p-0">
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-2 left-2">
              <Badge className="bg-red-500 text-white font-bold">
                -{product.discountPercentage}%
              </Badge>
            </div>
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold">Sold Out</span>
              </div>
            )}
          </div>
          
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">{product.merchant}</span>
              <div className="verified-badge">
                <Check className="h-3 w-3" />
                Verified
              </div>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {product.name}
            </h3>
            
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl font-bold text-red-500">
                {formatPrice(product.salePrice)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            </div>

            {/* Stock Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Sold: {product.soldQuantity}</span>
                <span>Stock: {product.stockQuantity}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${isLowStock ? 'bg-red-500' : 'bg-orange-500'}`}
                  style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                ></div>
              </div>
              {isLowStock && !isOutOfStock && (
                <p className="text-xs text-red-500 mt-1">Only {product.stockQuantity - product.soldQuantity} left!</p>
              )}
            </div>
            
            <Button 
              className="w-full bg-red-500 hover:bg-red-600 text-white"
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
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isOutOfStock ? 'Sold Out' : 'Buy Now'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-10 bg-gray-300 rounded"></div>
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
      <section className="py-16 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500 w-12 h-12" />
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <Button
            onClick={fetchFlashSales}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Retry
          </Button>
        </div>
      </section>
    );
  }

  if (flashSales.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-r from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {flashSales.map((flashSale) => (
          <div key={flashSale._id} className="mb-16">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Flame className="h-8 w-8 text-red-500" />
                <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900">
                  {flashSale.title}
                </h2>
                <Flame className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-xl text-gray-600 mb-4">
                {flashSale.description}
              </p>

              <div className="flex items-center justify-center gap-4 mb-6">
                <span className="text-lg font-semibold text-gray-700">Ends in:</span>
                <CountdownTimer timeRemaining={flashSale.timeRemaining} />
              </div>

              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{flashSale.totalViews.toLocaleString()} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShoppingCart className="h-4 w-4" />
                  <span>{flashSale.totalSales.toLocaleString()} sold</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {flashSale.products.slice(0, 4).map((product) => (
                <ProductCard 
                  key={product.productId} 
                  product={product} 
                  flashSaleId={flashSale._id}
                />
              ))}
            </div>

            {flashSale.products.length > 4 && (
              <div className="text-center">
                <Link to="/products">
                  <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white">
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
