import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Check, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const products = [
  {
    id: 1,
    name: 'MacBook Pro 16-inch M3',
    price: 185000,
    originalPrice: 250000,
    rating: 4.8,
    reviews: 24,
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop',
    merchant: 'TechHub Kenya',
    location: 'Kimathi Street, CBD',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10101',
    category: 'Electronics'
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra',
    price: 120000,
    originalPrice: 150000,
    rating: 4.7,
    reviews: 32,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
    merchant: 'Mobile World CBD',
    location: 'Tom Mboya Street, CBD',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10102',
    category: 'Electronics'
  },
  {
    id: 3,
    name: 'Designer Leather Handbag',
    price: 8500,
    originalPrice: 15000,
    rating: 4.4,
    reviews: 18,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=300&fit=crop',
    merchant: 'Fashion House CBD',
    location: 'River Road, CBD',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10106',
    category: 'Fashion'
  },
  {
    id: 4,
    name: 'Canon EOS R5 Camera',
    price: 75000,
    originalPrice: 95000,
    rating: 4.9,
    reviews: 15,
    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop',
    merchant: 'PhotoPro Kenya',
    location: 'Koinange Street, CBD',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10104',
    category: 'Electronics'
  },
  {
    id: 5,
    name: 'Sony WH-1000XM5 Headphones',
    price: 32000,
    originalPrice: 45000,
    rating: 4.6,
    reviews: 28,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    merchant: 'Audio Excellence',
    location: 'Moi Avenue, CBD',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10105',
    category: 'Electronics'
  },
  {
    id: 6,
    name: 'Premium Watch Collection',
    price: 16000,
    originalPrice: 25000,
    rating: 4.7,
    reviews: 12,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    merchant: 'Time Pieces Kenya',
    location: 'Kenyatta Avenue, CBD',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10107',
    category: 'Fashion'
  },
  {
    id: 7,
    name: 'Smart Fitness Watch',
    price: 8500,
    originalPrice: 12000,
    rating: 4.4,
    reviews: 35,
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
    merchant: 'FitTech Kenya',
    location: 'Westlands, Nairobi',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10109',
    category: 'Electronics'
  },
  {
    id: 8,
    name: 'Gaming Mechanical Keyboard',
    price: 6500,
    originalPrice: 9000,
    rating: 4.3,
    reviews: 25,
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop',
    merchant: 'Gaming Hub Kenya',
    location: 'Sarit Centre, Westlands',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10108',
    category: 'Electronics'
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

  const calculateDiscount = () => {
    if (product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  return (
    <Card className="hover-scale cursor-pointer border-0 shadow-lg overflow-hidden group">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.featured && (
            <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-medium">
              Featured
            </div>
          )}
          {calculateDiscount() > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              -{calculateDiscount()}%
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-2 right-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-8 w-8"
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
          
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          <Link to={`/merchant/${product.merchantId}`} className="text-sm text-gray-600 hover:text-primary transition-colors flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{product.location}</span>
          </Link>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium ml-1">{product.rating}</span>
            </div>
            <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{product.category}</span>
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
  // Show only featured products (first 8)
  const featuredProducts = products.filter(product => product.featured).slice(0, 8);

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
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
      </div>
    </section>
  );
};

export default FeaturedProducts;