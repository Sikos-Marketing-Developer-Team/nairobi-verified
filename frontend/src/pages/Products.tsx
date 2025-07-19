import React, { useState } from 'react';
import { Search, Filter, Grid, List, Star, MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePageLoading } from '@/hooks/use-loading';
import { ProductGridSkeleton, PageSkeleton } from '@/components/ui/loading-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

const products = [
  {
    id: '60d0fe4f5311236168a10101',
    name: 'MacBook Pro 16-inch',
    price: 185000,
    originalPrice: 200000,
    rating: 4.8,
    reviews: 24,
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop',
    merchant: 'TechHub Kenya',
    location: 'Kimathi Street, CBD',
    verified: true,
    category: 'Electronics',
    inStock: true
  },
  {
    id: '60d0fe4f5311236168a10102',
    name: 'Samsung Galaxy S24 Ultra',
    price: 120000,
    originalPrice: 135000,
    rating: 4.7,
    reviews: 18,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
    merchant: 'Mobile World',
    location: 'Tom Mboya Street, CBD',
    verified: true,
    category: 'Electronics',
    inStock: true
  },
  {
    id: '60d0fe4f5311236168a10103',
    name: 'Nike Air Max 270',
    price: 12000,
    originalPrice: 15000,
    rating: 4.6,
    reviews: 32,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
    merchant: 'Sports Corner',
    location: 'Moi Avenue, CBD',
    verified: true,
    category: 'Fashion',
    inStock: true
  },
  {
    id: '60d0fe4f5311236168a10104',
    name: 'Canon EOS R5 Camera',
    price: 75000,
    originalPrice: 85000,
    rating: 4.9,
    reviews: 15,
    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop',
    merchant: 'PhotoPro Kenya',
    location: 'Koinange Street, CBD',
    verified: true,
    category: 'Electronics',
    inStock: false
  },
  {
    id: '60d0fe4f5311236168a10105',
    name: 'Designer Handbag',
    price: 8500,
    originalPrice: 12000,
    rating: 4.4,
    reviews: 28,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=300&fit=crop',
    merchant: 'Fashion House',
    location: 'River Road, CBD',
    verified: true,
    category: 'Fashion',
    inStock: true
  },
  {
    id: '60d0fe4f5311236168a10106',
    name: 'Office Chair',
    price: 15000,
    originalPrice: 18000,
    rating: 4.3,
    reviews: 12,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    merchant: 'Office Solutions',
    location: 'Haile Selassie Avenue, CBD',
    verified: true,
    category: 'Home & Garden',
    inStock: true
  }
];

const categories = ['All', 'Electronics', 'Fashion', 'Home & Garden', 'Books', 'Sports'];

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const isLoading = usePageLoading(600);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <PageSkeleton>
          <div className="space-y-8">
            {/* Search and Filters Header Skeleton */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-2xl">
                  <Skeleton className="h-12 w-full" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </div>
              
              {/* Categories Skeleton */}
              <div className="flex flex-wrap gap-2 mt-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-20" />
                ))}
              </div>
            </div>

            {/* Results Header Skeleton */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-32" />
            </div>

            {/* Products Grid Skeleton */}
            <ProductGridSkeleton />
          </div>
        </PageSkeleton>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Category Filters */}
          <div className={`mt-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredProducts.length} products
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Products Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover-scale cursor-pointer border-0 shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full object-cover ${viewMode === 'grid' ? 'h-48' : 'h-32'}`}
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold">Out of Stock</span>
                    </div>
                  )}
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
                  
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{product.location}</span>
                  </div>
                  
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
                  
                  <Button 
                    className="w-full bg-primary hover:bg-primary-dark text-white"
                    disabled={!product.inStock}
                  >
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Products;
