import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Check, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productsAPI } from '@/lib/api';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  primaryImage?: string;
  merchant?: {
    name: string;
    location: string;
    verified: boolean;
  };
  category?: string;
  featured?: boolean;
}

const ProductCard = ({ product }: { product: Product }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getDiscountPercentage = () => {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  return (
    <Link to={`/products/${product._id}`}>
      <Card className="hover-scale cursor-pointer border-0 shadow-lg overflow-hidden group">
        <CardContent className="p-0">
          <div className="relative">
            <img
              src={product.primaryImage || 'https://via.placeholder.com/400x300?text=No+Image'}
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {getDiscountPercentage() > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{getDiscountPercentage()}%
              </div>
            )}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="secondary" className="p-2 h-8 w-8">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">{product.merchant?.name || 'Unknown Merchant'}</span>
              {product.merchant?.verified && (
                <div className="verified-badge">
                  <Check className="h-3 w-3" />
                  Verified
                </div>
              )}
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {product.name}
            </h3>
            
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{product.merchant?.location || 'Location not specified'}</span>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium ml-1">{product.rating || 0}</span>
              </div>
              <span className="text-sm text-gray-500">({product.reviewCount || 0} reviews)</span>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            
            <Button className="w-full bg-primary hover:bg-primary-dark text-white">
              View Product
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getProducts({ featured: true });
        setProducts((response.data || []).slice(0, 8));
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600">
              Loading featured products...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="h-96 animate-pulse">
                <CardContent className="p-0">
                  <div className="bg-gray-200 h-48"></div>
                  <div className="p-4 space-y-3">
                    <div className="bg-gray-200 h-4 rounded"></div>
                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                    <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-xl text-gray-600">
            Handpicked products from our most trusted verified merchants
          </p>
          <div className="mt-4 flex justify-center gap-4 text-sm text-gray-500">
            <span>✨ Curated Selection</span>
            <span>🛡️ Verified Merchants</span>
            <span>⚡ Best Deals</span>
          </div>
        </div>

        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            
            <div className="text-center">
              <Link to="/products">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white mr-4">
                  View All Products
                </Button>
              </Link>
              <Link to="/merchants">
                <Button size="lg" className="bg-primary hover:bg-primary-dark text-white">
                  Browse Merchants
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No featured products available at the moment.</p>
            <Link to="/products">
              <Button size="lg" className="mt-4 bg-primary hover:bg-primary-dark text-white">
                Browse All Products
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
