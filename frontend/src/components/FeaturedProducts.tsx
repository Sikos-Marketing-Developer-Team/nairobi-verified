import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '@/lib/api';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  primaryImage?: string;
  images?: string[];
  merchant?: {
    businessName: string;
    verified: boolean;
    address?: string;
  };
  merchantName?: string;
  location?: string;
  category: string;
  isActive: boolean;
  stockQuantity: number;
}

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getFeaturedProducts(12); // Fetch more products for grid
        const productsData = response.data.data || response.data;
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Handle responsive card count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCards(4); // lg screens - 4 cards
      } else if (window.innerWidth >= 768) {
        setVisibleCards(2); // md screens - 2 cards
      } else {
        setVisibleCards(1); // mobile - 1 card
      }
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + 1 >= products.length - (visibleCards - 1) ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - 1 < 0 ? Math.max(0, products.length - visibleCards) : prevIndex - 1
    );
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const merchantName = product.merchant?.businessName || product.merchantName || 'Unknown Merchant';
    const isVerified = product.merchant?.verified || false;
    const locationDisplay = product.merchant?.address || product.location || 'Nairobi';
    const displayImage = product.primaryImage || product.images?.[0] || '/placeholder-product.jpg';

    const handleCardClick = (e: React.MouseEvent) => {
      // Prevent navigation when clicking the button
      if ((e.target as HTMLElement).closest('button')) {
        return;
      }
      handleProductClick(product._id);
    };

    return (
      <Card 
        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer mx-2 flex flex-col h-full"
        onClick={handleCardClick}
      >
        <div className="relative h-40 sm:h-48 bg-gray-100 flex-shrink-0">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.originalPrice && product.originalPrice > product.price && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </Badge>
          )}
        </div>
        
        <div className="p-3 sm:p-4 flex flex-col flex-grow">
          <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2">{product.name}</h3>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 text-xs sm:text-sm">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-xs sm:text-sm text-gray-500">({product.reviewCount})</span>
          </div>

          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
            <span className="truncate">{merchantName}</span>
            {isVerified && (
              <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">{locationDisplay}</span>
          </div>

          <div className="mt-auto space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg sm:text-xl font-bold text-orange-600">
                  {formatPrice(product.price)}
                </div>
                {product.originalPrice && (
                  <div className="text-xs sm:text-sm text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </div>
                )}
              </div>
            </div>
            
            {/* View Product Button */}
            <Button 
              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm py-2"
              onClick={() => handleProductClick(product._id)}
              size="sm"
            >
              View Product
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <section className="py-8 sm:py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Featured Products</h2>
          <div className="flex items-center justify-center h-48 sm:h-64">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-orange-600" />
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-8 sm:py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Featured Products</h2>
          <div className="text-center text-gray-500 py-8 sm:py-12 text-sm sm:text-base">
            No featured products available at the moment.
          </div>
        </div>
      </section>
    );
  }

  const cardWidth = 100 / visibleCards;

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Featured Products</h2>
          <Button 
            variant="outline" 
            onClick={() => navigate('/products')}
            className="w-full sm:w-auto"
          >
            View All Products
          </Button>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * cardWidth}%)` }}
            >
              {products.map((product) => (
                <div 
                  key={product._id} 
                  className="flex-shrink-0"
                  style={{ width: `${cardWidth}%` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {products.length > visibleCards && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 bg-white shadow-lg hover:bg-gray-50 z-10 h-8 w-8 sm:h-10 sm:w-10"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 bg-white shadow-lg hover:bg-gray-50 z-10 h-8 w-8 sm:h-10 sm:w-10"
                onClick={nextSlide}
              >
                <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Mobile dots indicator */}
        {products.length > visibleCards && (
          <div className="flex justify-center mt-6 sm:hidden">
            <div className="flex space-x-2">
              {Array.from({ length: Math.ceil(products.length / visibleCards) }).map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-orange-600' : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
