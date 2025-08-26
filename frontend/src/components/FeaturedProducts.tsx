import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Check, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const products = [
  // ... (your product data remains the same)
];

const ProductCard = ({ product, onProductClick }: { product: typeof products[0]; onProductClick: (id: number) => void }) => {
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

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onProductClick(product.id);
  };

  return (
    <Card 
      className="hover-scale cursor-pointer border-0 shadow-lg overflow-hidden group transition-transform duration-200 hover:scale-105"
      onClick={handleCardClick}
    >
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
            onClick={(e) => {
              e.stopPropagation();
              alert(`Added ${product.name} to wishlist!`);
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600">{product.merchant}</span>
            {product.verified && (
              <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                <Check className="h-3 w-3" />
                Verified
              </div>
            )}
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          <div className="text-sm text-gray-600 hover:text-primary transition-colors flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{product.location}</span>
          </div>
          
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
          
          <Button 
            className="w-full bg-primary hover:bg-primary-dark text-white"
            onClick={(e) => {
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
  const navigate = useNavigate();
  const featuredProducts = products.filter(product => product.featured).slice(0, 8);

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
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
            <ProductCard 
              key={product.id} 
              product={product} 
              onProductClick={handleProductClick}
            />
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