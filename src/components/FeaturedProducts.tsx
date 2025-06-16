import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Check, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const products = [
  {
    id: 1,
    name: 'MacBook Pro 16-inch',
    price: 185000,
    originalPrice: 200000,
    rating: 4.8,
    reviews: 24,
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop',
    merchant: 'TechHub Kenya',
    location: 'Kimathi Street, CBD',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10101'
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra',
    price: 120000,
    originalPrice: 135000,
    rating: 4.7,
    reviews: 18,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
    merchant: 'Mobile World',
    location: 'Tom Mboya Street, CBD',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10102'
  },
  {
    id: 3,
    name: 'Nike Air Max 270',
    price: 12000,
    originalPrice: 15000,
    rating: 4.6,
    reviews: 32,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
    merchant: 'Sports Corner',
    location: 'Moi Avenue, CBD',
    verified: true,
    featured: false,
    merchantId: '60d0fe4f5311236168a10103'
  },
  {
    id: 4,
    name: 'Canon EOS R5 Camera',
    price: 75000,
    originalPrice: 85000,
    rating: 4.9,
    reviews: 15,
    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop',
    merchant: 'PhotoPro Kenya',
    location: 'Koinange Street, CBD',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10104'
  }
];

const ProductCard = ({ product }: { product: typeof products[0] }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <Card className="hover-scale cursor-pointer border-0 shadow-lg overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          {product.featured && (
            <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-medium">
              Featured
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600">{product.merchant}</span>
            {product.verified && (
              <div className="verified-badge">
                <Check className="h-3 w-3" />
                Verified
              </div>
            )}
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          <Link to={`/merchants/${product.merchantId}`} className="text-sm text-gray-600 hover:text-primary transition-colors flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{product.merchant}</span>
          </Link>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium ml-1">{product.rating}</span>
            </div>
            <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          <Button className="w-full bg-primary hover:bg-primary-dark text-white"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              alert(`Added ${product.name} to cart!`);
            }}
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const FeaturedProducts = () => {
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center">
          <Link to="/merchants">
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
