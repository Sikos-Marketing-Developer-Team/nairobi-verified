import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, MapPin, Star, Heart, Filter, Search, ChevronDown, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { productsAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

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

  // Get the display image
  const displayImage = product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop';
  
  // Get merchant name and verification status
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
        {/* Image Section */}
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
        
        {/* Content Section */}
        <div className="p-2 sm:p-3 flex-grow flex flex-col">
          {/* Merchant & Verified Badge */}
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
          
          {/* Product Name */}
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 text-xs sm:text-sm leading-tight min-h-[2rem]">
            {product.name}
          </h3>
          
          {/* Location */}
          <div className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1 mb-2">
            <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <span className="line-clamp-1">{locationDisplay}</span>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-[10px] sm:text-xs font-medium ml-0.5">{product.rating || 0}</span>
            </div>
            <span className="text-[10px] sm:text-xs text-gray-500">({reviewCount})</span>
          </div>
          
          {/* Price */}
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
          
          {/* View Button */}
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

  const loadProducts = async (page: number = 1, append: boolean = false) => {
    setIsLoadingProducts(true);
    try {
      const params: Record<string, string | number> = {
        page: page,
        limit: 12, // Reduced for better mobile performance
      };

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (priceRange[0] > 0) {
        params.minPrice = priceRange[0];
      }
      if (priceRange[1] < 200000) {
        params.maxPrice = priceRange[1];
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
    } catch (error) {
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
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts(1, false);
  }, [searchTerm, priceRange]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadProducts(nextPage, true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts(1, false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 200000]);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Header Section - Mobile Optimized */}
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              All Products
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-2xl mx-auto px-2">
              Discover products from verified merchants
            </p>
          </div>

          {/* Search and Filters Section - Mobile Optimized */}
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3">
              <div className="relative flex-grow">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="pl-6 sm:pl-10 text-xs sm:text-sm h-9 sm:h-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit"
                  size="sm"
                  className="flex items-center gap-1 text-xs h-9 flex-1"
                >
                  <Search className="h-3 w-3" />
                  <span className="hidden xs:inline">Search</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1 text-xs h-9"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-3 w-3" />
                  <span className="hidden xs:inline">Filters</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </form>

            {showFilters && (
              <div className="border-t pt-3">
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mb-3">
                  <h3 className="font-medium text-sm">Price Range</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs h-7"
                  >
                    Clear filters
                  </Button>
                </div>
                <div className="px-1">
                  <Slider
                    defaultValue={[0, 200000]}
                    max={200000}
                    step={1000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-3"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>KES {priceRange[0].toLocaleString()}</span>
                    <span>KES {priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Products Count - Mobile Optimized */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm sm:text-lg font-semibold text-gray-900">
              Products
            </h2>
            <span className="text-xs sm:text-sm text-gray-600">
              {totalProducts.toLocaleString()} found
            </span>
          </div>

          {/* Products Grid - Mobile Optimized */}
          {isLoadingProducts && products.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mr-2" />
              <span className="text-sm sm:text-base">Loading products...</span>
            </div>
          ) : products.length > 0 ? (
            <>
              {/* Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-6">
                {products.map((product, index) => (
                  <ProductCard key={product._id || product.id || index} product={product} />
                ))}
              </div>
              
              {/* Load More Button - Mobile Optimized */}
              {hasMore && (
                <div className="text-center">
                  <Button 
                    onClick={handleLoadMore}
                    disabled={isLoadingProducts}
                    size="sm"
                    className="px-4 py-2 text-xs sm:text-sm"
                    variant="outline"
                  >
                    {isLoadingProducts ? (
                      <>
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1" />
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
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <div className="max-w-md mx-auto px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                </div>
                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1">No products found</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  {searchTerm || priceRange[0] > 0 || priceRange[1] < 200000 
                    ? "Try adjusting your search or filters"
                    : "No products available"
                  }
                </p>
                {(searchTerm || priceRange[0] > 0 || priceRange[1] < 200000) && (
                  <Button 
                    onClick={clearFilters}
                    size="sm"
                    className="text-xs"
                  >
                    Clear filters
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