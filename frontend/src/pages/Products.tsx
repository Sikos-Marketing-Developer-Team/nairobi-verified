import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, Star, MapPin, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePageLoading } from '@/hooks/use-loading';
import { ProductGridSkeleton, PageSkeleton } from '@/components/ui/loading-skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { productsAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

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
  description?: string;
}

const categories = [
  'All', 
  'Electronics', 
  'Fashion & Clothing', 
  'Health & Beauty', 
  'Home & Garden', 
  'Books & Media', 
  'Sports & Fitness',
  'Transport & Mobility',
  'Printing & Stationery',
  'Events & Decorations',
  'Household & Kitchen',
  'Medical & Wellness',
  'Beauty & Personal Care',
  'Business Services',
  'Automotive',
  'Food & Beverages'
];

const ProductCard = React.memo(({ product, viewMode }: { product: Product; viewMode: 'grid' | 'list' }) => {
  const navigate = useNavigate();
  
  if (!product) return null;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    const productId = product._id || product.id;
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };
  
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
  
  // List view layout
  if (viewMode === 'list') {
    return (
      <Card 
        className="cursor-pointer border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden h-full"
        onClick={handleClick}
      >
        <CardContent className="p-0 h-full">
          <div className="flex flex-col sm:flex-row h-full">
            {/* Fixed size image container for list view */}
            <div className="relative sm:w-64 md:w-72 flex-shrink-0 h-64 sm:h-auto">
              <img
                src={displayImage}
                alt={product.name || 'Product image'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                }}
              />
            </div>
            
            <div className="flex-1 p-4 sm:p-6 flex flex-col min-h-64">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-600 text-sm font-medium truncate">
                  {merchantName}
                </span>
                {isVerified && (
                  <div className="verified-badge flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full flex-shrink-0 text-xs font-medium">
                    <Check className="h-3 w-3" />
                    Verified
                  </div>
                )}
              </div>
              
              <h3 className="font-bold text-gray-900 mb-3 text-lg sm:text-xl line-clamp-2 leading-tight">
                {product.name || 'Unnamed Product'}
              </h3>
              
              {product.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed flex-shrink-0">
                  {product.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 flex-shrink-0">
                <MapPin className="text-gray-400 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{locationDisplay}</span>
              </div>
              
              <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                <div className="flex items-center">
                  <Star className="text-yellow-400 fill-current h-4 w-4" />
                  <span className="font-semibold ml-1 text-sm text-gray-900">
                    {product.rating || 0}
                  </span>
                </div>
                <span className="text-gray-500 text-xs">
                  ({product.reviewCount || product.reviews || 0} reviews)
                </span>
              </div>
              
              <div className="flex items-center justify-between gap-4 mt-auto pt-3 border-t border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary text-xl sm:text-2xl">
                    {formatPrice(product.price || 0)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-gray-500 line-through text-sm">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                
                <Button 
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    const productId = product._id || product.id;
                    if (productId) {
                      navigate(`/product/${productId}`);
                    }
                  }}
                >
                  View Product
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Grid view layout (default)
  return (
    <Card 
      className="hover-scale cursor-pointer border-0 shadow-lg overflow-hidden h-full"
      onClick={handleClick}
    >
      <CardContent className="p-0 flex flex-col h-full">
        {/* Fixed size image container for grid view */}
        <div className="relative h-48 w-full">
          <img
            src={displayImage}
            alt={product.name || 'Product image'}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
            }}
          />
        </div>
        
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-gray-600 truncate text-sm">
              {merchantName}
            </span>
            {isVerified && (
              <div className="verified-badge flex items-center gap-1 bg-green-100 text-green-700 px-1 py-0.5 rounded-full flex-shrink-0 text-xs">
                <Check className="h-3 w-3" />
                Verified
              </div>
            )}
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-base">
            {product.name || 'Unnamed Product'}
          </h3>
          
          <div className="flex items-center gap-1 mb-1 text-sm">
            <MapPin className="text-gray-400 h-4 w-4" />
            <span className="truncate">{locationDisplay}</span>
          </div>
          
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              <Star className="text-yellow-400 fill-current h-4 w-4" />
              <span className="font-medium ml-1 text-sm">
                {product.rating || 0}
              </span>
            </div>
            <span className="text-gray-500 text-sm">
              ({product.reviewCount || product.reviews || 0})
            </span>
          </div>
          
          <div className="flex items-center gap-1 mb-3 mt-auto">
            <span className="font-bold text-primary text-xl">
              {formatPrice(product.price || 0)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-gray-500 line-through text-sm">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          <Button 
            className="w-full bg-primary hover:bg-primary-dark text-white"
            onClick={(e) => {
              e.stopPropagation();
              const productId = product._id || product.id;
              if (productId) {
                navigate(`/product/${productId}`);
              }
            }}
          >
            View Product
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageLoading = usePageLoading(600);
  const abortControllerRef = useRef<AbortController | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Debounce search term (wait 500ms after user stops typing)
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const loadProducts = async (page: number = 1, append: boolean = false) => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    // Only show loading state for pagination (page > 1)
    if (page > 1) {
      setIsLoadingProducts(true);
    } else {
      // Show subtle searching indicator for filters/search
      setIsSearching(true);
    }

    try {
      setError(null);
      
      let response;
      
      if (debouncedSearchTerm.trim()) {
        response = await productsAPI.searchProducts(debouncedSearchTerm, {
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          page: page,
          limit: 24
        });
      } else {
        const params: Record<string, string | number> = {
          page: page,
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
      
      if (append) {
        setProducts(prev => [...prev, ...productsData]);
      } else {
        setProducts(productsData);
      }
      
      setTotalProducts(total);
      setHasMore(productsData.length > 0 && productsData.length === 24);
    } catch (err: any) {
      // Don't show error if request was aborted (user is still typing)
      if (err.name === 'AbortError' || err.message === 'canceled') {
        return;
      }
      
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      if (!append) {
        setProducts([]);
      }
      setTotalProducts(0);
    } finally {
      if (page > 1) {
        setIsLoadingProducts(false);
      } else {
        setIsSearching(false);
      }
    }
  };

  // Load products when debounced values change
  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
    loadProducts(1, false);
    
    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedSearchTerm, selectedCategory]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingProducts && !isSearching) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          loadProducts(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingProducts, isSearching, currentPage]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'All';

  // Show loading skeleton only on initial page load
  if (pageLoading) {
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
        {/* Search and Filters Header */}
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
                  className="pl-10 pr-10 py-2 md:py-3"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {isSearching && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                )}
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
                  title="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-10 w-10 p-0"
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Category Filters */}
          <div className={`mt-4 md:mt-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="text-xs md:text-sm py-1 px-2 md:px-3"
                    disabled={isSearching}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs h-8 text-gray-600 hover:text-gray-900"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Showing {products.length} of {totalProducts} products
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </p>
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                  Search: "{searchTerm}"
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-primary/80" 
                    onClick={clearSearch}
                  />
                </div>
              )}
              {selectedCategory !== 'All' && (
                <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                  Category: {selectedCategory}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-primary/80" 
                    onClick={() => setSelectedCategory('All')}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Products Display */}
        {products.length > 0 ? (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
                style={{ opacity: isSearching ? 0.6 : 1, transition: 'opacity 0.2s' }}
              >
                {products.map((product) => (
                  <ProductCard 
                    key={product._id || product.id} 
                    product={product}
                    viewMode="grid"
                  />
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div 
                className="space-y-6 mb-8"
                style={{ opacity: isSearching ? 0.6 : 1, transition: 'opacity 0.2s' }}
              >
                {products.map((product) => (
                  <ProductCard 
                    key={product._id || product.id} 
                    product={product}
                    viewMode="list"
                  />
                ))}
              </div>
            )}

            {/* Infinite scroll trigger */}
            {hasMore && (
              <div ref={observerTarget} className="flex justify-center py-8">
                {isLoadingProducts && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span>Loading more products...</span>
                  </div>
                )}
              </div>
            )}

            {/* End of results message */}
            {!hasMore && products.length > 0 && (
              <div className="text-center py-8 text-gray-600">
                <p>You've reached the end of the results</p>
              </div>
            )}
          </>
        ) : (
          !isSearching && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="max-w-md mx-auto px-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {hasActiveFilters 
                    ? "Try adjusting your search criteria or filters to find more products."
                    : "No products are currently available. Please check back later."
                  }
                </p>
                {hasActiveFilters && (
                  <Button 
                    onClick={clearFilters}
                    size="sm"
                    className="px-4"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            </div>
          )
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Products;