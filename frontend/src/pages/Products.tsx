import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Grid, List, Star, MapPin, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
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
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(4);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isLoading = usePageLoading(600);

  useEffect(() => {
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Navigation functions for the carousel
  const nextSlide = () => {
    if (currentIndex < filteredProducts.length - visibleCards) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Calculate the transform value for the carousel
  const getTransformValue = () => {
    if (carouselRef.current) {
      const card = carouselRef.current.querySelector('.flex-shrink-0') as HTMLElement;
      if (card) {
        const cardWidth = card.offsetWidth + 16; // card width + gap
        return `translateX(-${currentIndex * cardWidth}px)`;
      }
    }
    return `translateX(-${currentIndex * (100 / visibleCards)}%)`;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const ProductCard = ({ product, isMobile = false }: { product: typeof products[0]; isMobile?: boolean }) => {
    return (
      <Card className={`hover-scale cursor-pointer border-0 shadow-lg overflow-hidden flex-shrink-0 ${isMobile ? 'w-[160px]' : 'w-full'}`}>
        <CardContent className="p-0">
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className={`w-full ${isMobile ? 'h-32' : 'h-48'} object-cover`}
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold">Out of Stock</span>
              </div>
            )}
          </div>
          
          <div className={`${isMobile ? 'p-2' : 'p-4'}`}>
            <div className="flex items-center gap-1 mb-1">
              <span className={`text-gray-600 truncate ${isMobile ? 'text-[10px]' : 'text-sm'}`}>{product.merchant}</span>
              {product.verified && (
                <div className={`verified-badge flex items-center gap-1 bg-green-100 text-green-700 px-1 py-0.5 rounded-full flex-shrink-0 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                  <Check className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
                  Verified
                </div>
              )}
            </div>
            
            <h3 className={`font-semibold text-gray-900 mb-1 line-clamp-2 ${isMobile ? 'text-xs' : 'text-base'}`}>
              {product.name}
            </h3>
            
            <div className={`flex items-center gap-1 mb-1 ${isMobile ? 'text-[10px]' : 'text-sm'}`}>
              <MapPin className={`text-gray-400 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
              <span className="truncate">{product.location}</span>
            </div>
            
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                <Star className={`text-yellow-400 fill-current ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                <span className={`font-medium ml-1 ${isMobile ? 'text-[10px]' : 'text-sm'}`}>{product.rating}</span>
              </div>
              <span className={`text-gray-500 ${isMobile ? 'text-[10px]' : 'text-sm'}`}>({product.reviews})</span>
            </div>
            
            <div className="flex items-center gap-1 mb-2">
              <span className={`font-bold text-primary ${isMobile ? 'text-sm' : 'text-xl'}`}>
                {formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className={`text-gray-500 line-through ${isMobile ? 'text-[10px]' : 'text-sm'}`}>
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            
            <Button 
              className={`w-full bg-primary hover:bg-primary-dark text-white ${isMobile ? 'text-xs py-1 h-7' : ''}`}
              disabled={!product.inStock}
            >
              {product.inStock ? 'View' : 'Out of Stock'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <PageSkeleton>
          <div className="space-y-8">
            {/* Search and Filters Header Skeleton */}
            <div className="bg-white rounded-lg shadow-sm p-6 ">
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
      
      <div className="max-w-7xl mx-auto mt-20 px-4 pt-16 sm:px-6 sm:mt-15 lg:px-8 py-8">
        {/* Search and Filters Header - Improved Mobile Design */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-2xl w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 md:py-3"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex-1 md:flex-none"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters && <X className="h-4 w-4 ml-2" />}
              </Button>
              
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-10 w-10 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-10 w-10 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Category Filters - Improved Mobile Design */}
          <div className={`mt-4 md:mt-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs md:text-sm py-1 px-2 md:px-3"
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

        {/* Carousel for all screen sizes */}
        <div className="relative mb-8 overflow-hidden">
          <div 
            ref={carouselRef}
            className="flex transition-transform duration-300 ease-in-out gap-4"
            style={{ transform: getTransformValue() }}
          >
            {filteredProducts.map((product) => (
              <div key={product.id} className="flex-shrink-0" style={{ width: isMobile ? '160px' : 'calc(25% - 12px)' }}>
                <ProductCard 
                  product={product} 
                  isMobile={isMobile}
                />
              </div>
            ))}
          </div>
          
          {/* Navigation arrows - Show only when there are more products */}
          {filteredProducts.length > visibleCards && (
            <>
              {currentIndex > 0 && (
                <Button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 shadow-md h-10 w-10 rounded-full p-0 z-10"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </Button>
              )}
              
              {currentIndex < filteredProducts.length - visibleCards && (
                <Button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 shadow-md h-10 w-10 rounded-full p-0 z-10"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </Button>
              )}
            </>
          )}

          {/* Counter indicator */}
          {filteredProducts.length > visibleCards && (
            <div className="flex justify-center mt-6">
              <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {filteredProducts.length - visibleCards + 1}
              </div>
            </div>
          )}
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