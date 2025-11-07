import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, Star, MapPin, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePageLoading } from '@/hooks/use-loading';
import { ProductGridSkeleton, PageSkeleton } from '@/components/ui/loading-skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { productsAPI } from '@/lib/api';

// Define the Product interface
interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount?: number;
  reviews?: number;
  image?: string;
  images?: string[];
  primaryImage?: string;
  merchant?: {
    _id?: string;
    businessName?: string;
    verified?: boolean;
    address?: string;
  };
  merchantName?: string;
  location?: string;
  verified?: boolean;
  category: string;
  inStock?: boolean;
  isActive?: boolean;
  stockQuantity?: number;
}

const categories = ['All', 'Electronics', 'Fashion', 'Beauty', 'Home & Garden', 'Books & Media', 'Sports & Fitness'];

const Products = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(4);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const pageLoading = usePageLoading(600);

  // Fetch products when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
    setProducts([]); // Clear existing products
  }, [searchTerm, selectedCategory]);

  // Fetch products when page or filters change
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        
        if (searchTerm.trim()) {
          response = await productsAPI.searchProducts(searchTerm, {
            category: selectedCategory !== 'All' ? selectedCategory : undefined,
            page: currentPage,
            limit: 24
          });
        } else {
          const params: Record<string, string | number> = {
            page: currentPage,
            limit: 24
          };
          if (selectedCategory !== 'All') {
            params.category = selectedCategory;
          }
          response = await productsAPI.getProducts(params);
        }
        
        let productsData: Product[] = [];
        let total = 0;
        
        if (response && response.data) {
          if (response.data.data && Array.isArray(response.data.data)) {
            productsData = response.data.data;
            total = response.data.pagination?.total || 0;
          } else if (Array.isArray(response.data)) {
            productsData = response.data;
            total = response.data.length;
          } else if (response.data.products && Array.isArray(response.data.products)) {
            productsData = response.data.products;
            total = response.data.pagination?.total || 0;
          } else if (typeof response.data === 'object' && response.data._id) {
            productsData = [response.data];
            total = 1;
          }
        }
        
        console.log('Fetched products:', productsData, 'Total:', total);
        
        // Append new products to existing ones or replace if page 1
        setProducts(prev => {
          const newProducts = currentPage === 1 ? productsData : [...prev, ...productsData];
          setHasMore(newProducts.length < total);
          return newProducts;
        });
        setTotalProducts(total);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
        if (currentPage === 1) {
          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (!pageLoading) {
      loadProducts();
    }
  }, [currentPage, searchTerm, selectedCategory, pageLoading]);



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

  // Safely filter products - ensure products is always treated as an array
  const filteredProducts = Array.isArray(products) 
    ? products.filter(product => {
        if (!product || typeof product !== 'object') return false;
        
        const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    : [];

  const ProductCard = ({ product, isMobile = false }: { product: Product; isMobile?: boolean }) => {
    if (!product) return null;
    
    // Get the display image
    const displayImage = product.primaryImage || product.image || (product.images && product.images[0]) || '/placeholder-image.jpg';
    
    // Get merchant name and verification status
    const merchantName = typeof product.merchant === 'object' && product.merchant?.businessName 
      ? product.merchant.businessName 
      : product.merchantName || 'Unknown Merchant';
    
    const isVerified = typeof product.merchant === 'object' 
      ? product.merchant?.verified 
      : product.verified || false;
    
    // Get location
    const locationDisplay = typeof product.merchant === 'object' && product.merchant?.address
      ? product.merchant.address
      : product.location || 'Location not specified';
    
    // Check if product is in stock
    const inStock = product.isActive !== false && (product.stockQuantity === undefined || product.stockQuantity > 0);
    
    const handleClick = () => {
      const productId = product._id || product.id;
      if (productId) {
        navigate(`/product/${productId}`);
      }
    };
    
    return (
      <Card 
        className={`hover-scale cursor-pointer border-0 shadow-lg overflow-hidden flex-shrink-0 ${isMobile ? 'w-[160px]' : 'w-full'}`}
        onClick={handleClick}
      >
        <CardContent className="p-0">
          <div className="relative">
            <img
              src={displayImage}
              alt={product.name || 'Product image'}
              className={`w-full ${isMobile ? 'h-32' : 'h-48'} object-cover`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
              }}
            />
            {!inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold">Out of Stock</span>
              </div>
            )}
          </div>
          
          <div className={`${isMobile ? 'p-2' : 'p-4'}`}>
            <div className="flex items-center gap-1 mb-1">
              <span className={`text-gray-600 truncate ${isMobile ? 'text-[10px]' : 'text-sm'}`}>
                {merchantName}
              </span>
              {isVerified && (
                <div className={`verified-badge flex items-center gap-1 bg-green-100 text-green-700 px-1 py-0.5 rounded-full flex-shrink-0 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                  <Check className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
                  Verified
                </div>
              )}
            </div>
            
            <h3 className={`font-semibold text-gray-900 mb-1 line-clamp-2 ${isMobile ? 'text-xs' : 'text-base'}`}>
              {product.name || 'Unnamed Product'}
            </h3>
            
            <div className={`flex items-center gap-1 mb-1 ${isMobile ? 'text-[10px]' : 'text-sm'}`}>
              <MapPin className={`text-gray-400 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
              <span className="truncate">{locationDisplay}</span>
            </div>
            
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                <Star className={`text-yellow-400 fill-current ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                <span className={`font-medium ml-1 ${isMobile ? 'text-[10px]' : 'text-sm'}`}>
                  {product.rating || 0}
                </span>
              </div>
              <span className={`text-gray-500 ${isMobile ? 'text-[10px]' : 'text-sm'}`}>
                ({product.reviewCount || product.reviews || 0})
              </span>
            </div>
            
            <div className="flex items-center gap-1 mb-2">
              <span className={`font-bold text-primary ${isMobile ? 'text-sm' : 'text-xl'}`}>
                {formatPrice(product.price || 0)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className={`text-gray-500 line-through ${isMobile ? 'text-[10px]' : 'text-sm'}`}>
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            
            <Button 
              className={`w-full bg-primary hover:bg-primary-dark text-white ${isMobile ? 'text-xs py-1 h-7' : ''}`}
              disabled={!inStock}
            >
              {inStock ? 'View' : 'Out of Stock'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Show loading skeleton
  if (pageLoading || loading) {
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

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto mt-20 px-4 pt-16 sm:px-6 sm:mt-15 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary-dark">
              Try Again
            </Button>
          </div>
        </div>
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
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Showing {filteredProducts.length} of {totalProducts} products
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </p>
          {totalProducts > filteredProducts.length && (
            <Button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={loading}
              variant="outline"
              className="text-sm"
            >
              {loading ? 'Loading...' : `Load More (${totalProducts - filteredProducts.length} remaining)`}
            </Button>
          )}
        </div>

        {/* Carousel for all screen sizes */}
        {filteredProducts.length > 0 ? (
          <>
            <div className="relative mb-8 overflow-hidden">
              <div 
                ref={carouselRef}
                className="flex transition-transform duration-300 ease-in-out gap-4"
                style={{ transform: getTransformValue() }}
              >
                {filteredProducts.map((product) => (
                  <div key={product._id || product.id} className="flex-shrink-0" style={{ width: isMobile ? '160px' : 'calc(25% - 12px)' }}>
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
            
            {/* Load More Button */}
            {hasMore && !loading && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  size="lg"
                  className="bg-primary hover:bg-primary-dark"
                >
                  Load More Products ({totalProducts - filteredProducts.length} remaining)
                </Button>
              </div>
            )}
            
            {loading && currentPage > 1 && (
              <div className="flex justify-center mt-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="mt-4 bg-primary hover:bg-primary-dark"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Products;