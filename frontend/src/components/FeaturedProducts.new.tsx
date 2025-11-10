import { useState, useEffect } from 'react';
import { Star, MapPin, CheckCircle, Loader2 } from 'lucide-react';
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const merchantName = product.merchant?.businessName || product.merchantName || 'Unknown Merchant';
    const isVerified = product.merchant?.verified || false;
    const locationDisplay = product.merchant?.address || product.location || 'Nairobi';
    const displayImage = product.primaryImage || product.images?.[0] || '/placeholder-product.jpg';

    const handleClick = () => {
      navigate(`/product/${product._id}`);
    };

    return (
      <Card 
        className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md hover:scale-[1.02]"
        onClick={handleClick}
      >
        <div className="relative h-48 bg-gray-100">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
            }}
          />
          {product.originalPrice && product.originalPrice > product.price && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </Badge>
          )}
        </div>

        <div className="p-4">
          {/* Merchant Info */}
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs text-gray-600 truncate">{merchantName}</span>
            {isVerified && (
              <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 text-gray-900 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs ml-1">{product.rating?.toFixed(1) || '0.0'}</span>
            </div>
            <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 mb-3">
            <MapPin className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-600 truncate">{locationDisplay}</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-orange-600">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
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

        {/* Grid Layout - Scrollable on mobile, full grid on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
