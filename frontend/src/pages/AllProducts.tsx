import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, MapPin, Star, Heart, Filter, Search, ChevronDown, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { productsAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks';

interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
  reviews?: number;
  merchant?: {
    _id?: string;
    businessName?: string;
    verified?: boolean;
    address?: string;
  };
  merchantId?: string;
  merchantName?: string;
  location?: string;
}

const ProductCard = ({ product }: { product: Product }) => {
  const navigate = useNavigate();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    const productId = product._id || product.id;
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  const displayImage = product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop';
  const merchantName = product.merchant?.businessName || product.merchantName || 'Unknown Merchant';
  const isVerified = product.merchant?.verified || false;
  const locationDisplay = product.merchant?.address || product.location || 'Location not specified';
  const reviewCount = product.reviewCount || product.reviews || 0;

  return (
    <Card 
      className="cursor-pointer border-0 shadow-sm hover:shadow-md overflow-hidden group transition-all duration-200 bg-white"
      onClick={handleCardClick}
    >
      <CardContent className="p-0 h-full flex flex-col">
        <div className="relative">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-32 sm:h-40 md:h-48 object-cover"
          />
          {product.featured && (
            <div className="absolute top-1 left-1 bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded text-[10px] font-medium">
              Featured
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-1 right-1 bg-white/90 hover:bg-white p-1 h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              alert(`Added ${product.name} to wishlist!`);
            }}
          >
            <Heart className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="p-2 sm:p-3 flex-grow flex flex-col">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[10px] sm:text-xs text-gray-600 line-clamp-1 flex-grow">
              {merchantName}
            </span>
            {isVerified && (
              <div className="flex items-center gap-0.5 bg-green-100 text-green-800 text-[10px] px-1 py-0.5 rounded flex-shrink-0">
                <Check className="h-2.5 w-2.5" />
                <span className="hidden xs:inline">Verified</span>
              </div>
            )}
          </div>
          
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 text-xs sm:text-sm leading-tight min-h-[2rem]">
            {product.name}
          </h3>
          
          <div className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1 mb-2">
            <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <span className="line-clamp-1">{locationDisplay}</span>
          </div>
          
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-[10px] sm:text-xs font-medium ml-0.5">{product.rating || 0}</span>
            </div>
            <span className="text-[10px] sm:text-xs text-gray-500">({reviewCount})</span>
          </div>
          
          <div className="flex items-center gap-1 mb-3 mt-auto">
            <span className="text-sm sm:text-base font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          <Button 
            size="sm"
            className="w-full text-xs py-1 h-7"
            onClick={(e) => {
              e.stopPropagation();
              const productId = product._id || product.id;
              if (productId) {
                navigate(`/product/${productId}`);
              }
            }}
          >
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const AllProducts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  
  // Debounce search term (wait 500ms after user stops typing)
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Debounce price range (wait 300ms after user stops sliding)
  const debouncedPriceRange = useDebounce(priceRange, 300);
  
  // AbortController ref to cancel previous requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadProducts = async (page: number = 1, append: boolean = false) => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    // Only show loading if search term is meaningful (3+ characters) or initial load
    const showLoading = !debouncedSearchTerm || debouncedSearchTerm.length >= 3 || page === 1;
    
    if (showLoading) {
      setIsLoadingProducts(true);
    }

    try {
      const params: Record<string, string | number> = {
        page: page,
        limit: 12,
      };

      // Only include search if it has 3 or more characters
      if (debouncedSearchTerm.trim() && debouncedSearchTerm.trim().length >= 3) {
        params.search = debouncedSearchTerm.trim();
      }

      if (debouncedPriceRange[0] > 0) {
        params.minPrice = debouncedPriceRange[0];
      }
      if (debouncedPriceRange[1] < 200000) {
        params.maxPrice = debouncedPriceRange[1];
      }

      const response = await productsAPI.getProducts(params);
      
      const productsData = response.data.data || [];
      const paginationData = response.data.pagination || { total: 0 };
      
      if (append) {
        setProducts(prev => [...prev, ...productsData]);
      } else {
        setProducts(productsData);
      }
      
      setTotalProducts(paginationData.total);
      setHasMore(productsData.length > 0 && productsData.length === 12);
    } catch (error: any) {
      // Don't show error if request was aborted (user is still typing)
      if (error.name === 'AbortError' || error.message === 'canceled') {
        return;
      }
      
      console.error('Failed to fetch products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
      if (!append) {
        setProducts([]);
      }
      setTotalProducts(0);
    } finally {
      if (showLoading) {
        setIsLoadingProducts(false);
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
  }, [debouncedSearchTerm, debouncedPriceRange]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadProducts(nextPage, true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by debounced value
    // This is just for the search button click
    if (searchTerm.trim().length > 0 && searchTerm.trim().length < 3) {
      toast({
        title: "Search too short",
        description: "Please enter at least 3 characters to search.",
        variant: "default",
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 200000]);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const clearMinPrice = () => {
    setPriceRange([0, priceRange[1]]);
  };

  const clearMaxPrice = () => {
    setPriceRange([priceRange[0], 200000]);
  };

  const hasActiveFilters = searchTerm || priceRange[0] > 0 || priceRange[1] < 200000;

  // Show "minimum characters" hint when search is too short
  const showSearchHint = searchTerm.length > 0 && searchTerm.length < 3;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 mt-16">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search products... (min 3 characters)"
                  className="pl-10 pr-10 text-sm h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {showSearchHint && (
                  <div className="absolute top-full left-0 right-0 mt-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                    Enter at least 3 characters to search
                  </div>
                )}
              </div>

              <Button 
                onClick={handleSearch}
                size="sm"
                className="h-11 bg-primary hover:bg-primary/90 min-w-[100px]"
                disabled={isLoadingProducts || showSearchHint}
              >
                {isLoadingProducts ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-2">{isLoadingProducts ? 'Searching...' : 'Search'}</span>
              </Button>

              <Button 
                variant={showFilters ? "secondary" : "outline"}
                size="sm"
                className="h-11 min-w-[100px] border-gray-300"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                <span className="ml-2">Filters</span>
                <ChevronDown 
                  className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                    showFilters ? 'rotate-180' : ''
                  }`} 
                />
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </h3>
                  <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        Clear all
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Price Range</span>
                    <span className="text-xs text-primary font-medium">
                      KES {priceRange[0].toLocaleString()} - KES {priceRange[1].toLocaleString()}
                    </span>
                  </div>
                  
                  <Slider
                    defaultValue={[0, 200000]}
                    max={200000}
                    step={1000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="my-2"
                  />
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>KES 0</span>
                    <span>KES 200,000</span>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {searchTerm && searchTerm.length >= 3 && (
                        <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                          Search: "{searchTerm}"
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-primary/80" 
                            onClick={clearSearch}
                          />
                        </div>
                      )}
                      {priceRange[0] > 0 && (
                        <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                          Min: KES {priceRange[0].toLocaleString()}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-primary/80" 
                            onClick={clearMinPrice}
                          />
                        </div>
                      )}
                      {priceRange[1] < 200000 && (
                        <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                          Max: KES {priceRange[1].toLocaleString()}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-primary/80" 
                            onClick={clearMaxPrice}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mb-4 p-2">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Products
                {totalProducts > 0 && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    ({totalProducts.toLocaleString()})
                  </span>
                )}
              </h2>
              
              {hasActiveFilters && (
                <div className="hidden sm:flex items-center gap-1 text-xs text-gray-600">
                  <span>•</span>
                  <span>Filtered results</span>
                </div>
              )}
            </div>
            
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearFilters}
                className="text-xs h-8 text-gray-600 hover:text-gray-900 sm:hidden"
              >
                Clear all filters
              </Button>
            )}
          </div>

          {isLoadingProducts && products.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
              <span className="text-sm text-gray-600">Loading products...</span>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-6">
                {products.map((product, index) => (
                  <ProductCard key={product._id || product.id || index} product={product} />
                ))}
              </div>
              
              {hasMore && (
                <div className="text-center">
                  <Button 
                    onClick={handleLoadMore}
                    disabled={isLoadingProducts}
                    size="lg"
                    className="px-8 py-3 text-sm font-medium min-w-[140px]"
                    variant="outline"
                  >
                    {isLoadingProducts ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
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
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AllProducts;