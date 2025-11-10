import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, MapPin, Star, Heart, Filter, Search, ChevronDown, Loader2, X, Grid3X3, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { productsAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

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

const ProductCard = ({ product, viewMode }: { product: Product; viewMode: 'grid' | 'list' }) => {
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

  if (viewMode === 'list') {
    return (
      <Card 
        className="cursor-pointer border-0 shadow-sm hover:shadow-md overflow-hidden group transition-all duration-200 bg-white"
        onClick={handleCardClick}
      >
        <CardContent className="p-0 h-full">
          <div className="flex">
            {/* Image Section */}
            <div className="relative w-48 flex-shrink-0">
              <img
                src={displayImage}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              {product.featured && (
                <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-medium">
                  Featured
                </div>
              )}
            </div>
            
            {/* Content Section */}
            <div className="p-6 flex-grow flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-grow">
                  {/* Merchant & Verified Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-600">
                      {merchantName}
                    </span>
                    {isVerified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  {/* Product Name */}
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  
                  {/* Location */}
                  <div className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{locationDisplay}</span>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium ml-1">{product.rating || 0}</span>
                    </div>
                    <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  {/* Price */}
                  <div className="text-right">
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="p-2 h-9 w-9"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Added ${product.name} to wishlist!`);
                      }}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm"
                      className="px-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        const productId = product._id || product.id;
                        if (productId) {
                          navigate(`/product/${productId}`);
                        }
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (original layout)
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const { toast } = useToast();

  const productsPerPage = 12;

  const loadProducts = async (page: number = 1, append: boolean = false) => {
    setIsLoadingProducts(true);
    try {
      const params: Record<string, string | number> = {
        page: page,
        limit: productsPerPage,
        sort: sortBy,
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
      setHasMore(productsData.length > 0 && productsData.length === productsPerPage);
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
  }, [searchTerm, priceRange, sortBy]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadProducts(page, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const clearSearch = () => {
    setSearchTerm('');
  };

  const clearMinPrice = () => {
    setPriceRange([0, priceRange[1]]);
  };

  const clearMaxPrice = () => {
    setPriceRange([priceRange[0], 200000]);
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const visiblePages = 5;
  const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
  const endPage = Math.min(totalPages, startPage + visiblePages - 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              All Products
            </h1>
          </div>

          {/* Enhanced Search and Filters Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-grow max-w-2xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search products by name, category, or merchant..."
                  className="pl-12 pr-4 text-base h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                />
                {searchTerm && (
                  <X 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 cursor-pointer hover:text-gray-600"
                    onClick={clearSearch}
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleSearch}
                  size="lg"
                  className="flex items-center gap-2 px-6 bg-primary hover:bg-primary/90"
                >
                  <Search className="h-5 w-5" />
                  <span className="text-base">Search</span>
                </Button>
                
                <Button 
                  variant={showFilters ? "secondary" : "outline"}
                  size="lg"
                  className="flex items-center gap-2 px-6 border-gray-300"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-5 w-5" />
                  <span>Filters</span>
                  <ChevronDown 
                    className={`h-5 w-5 transition-transform duration-200 ${
                      showFilters ? 'rotate-180' : ''
                    }`} 
                  />
                </Button>
              </div>
            </div>

            {/* Enhanced Filters Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 animate-in fade-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                    <Filter className="h-5 w-5" />
                    Filter Products
                  </h3>
                  <div className="flex items-center gap-3">
                    {(searchTerm || priceRange[0] > 0 || priceRange[1] < 200000) && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={clearFilters}
                        className="text-sm h-9 text-gray-600 hover:text-gray-900"
                      >
                        Clear all filters
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                      className="h-9 w-9 p-0"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Price Range Filter */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium text-gray-700">Price Range (KES)</span>
                      <span className="text-sm text-primary font-medium">
                        {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()}
                      </span>
                    </div>
                    
                    <Slider
                      defaultValue={[0, 200000]}
                      max={200000}
                      step={1000}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="my-4"
                    />
                    
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>0</span>
                      <span>50,000</span>
                      <span>100,000</span>
                      <span>150,000</span>
                      <span>200,000</span>
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div className="space-y-4">
                    <label className="text-base font-medium text-gray-700">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active Filters Badges */}
                {(searchTerm || priceRange[0] > 0 || priceRange[1] < 200000) && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Active Filters:</h4>
                    <div className="flex flex-wrap gap-2">
                      {searchTerm && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary px-3 py-1.5 text-sm">
                          Search: "{searchTerm}"
                          <X 
                            className="h-3 w-3 ml-1.5 cursor-pointer" 
                            onClick={clearSearch}
                          />
                        </Badge>
                      )}
                      {priceRange[0] > 0 && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary px-3 py-1.5 text-sm">
                          Min: KES {priceRange[0].toLocaleString()}
                          <X 
                            className="h-3 w-3 ml-1.5 cursor-pointer" 
                            onClick={clearMinPrice}
                          />
                        </Badge>
                      )}
                      {priceRange[1] < 200000 && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary px-3 py-1.5 text-sm">
                          Max: KES {priceRange[1].toLocaleString()}
                          <X 
                            className="h-3 w-3 ml-1.5 cursor-pointer" 
                            onClick={clearMaxPrice}
                          />
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Products Header with Count and Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">
                Products
                {totalProducts > 0 && (
                  <span className="text-lg font-semibold text-primary ml-2">
                    ({totalProducts.toLocaleString()} {totalProducts === 1 ? 'item' : 'items'})
                  </span>
                )}
              </h2>
              
              {isLoadingProducts && (
                <div className="flex items-center text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Loading...
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Items per page selector */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>View:</span>
                <span className="font-medium">{productsPerPage} per page</span>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          {isLoadingProducts && products.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin mr-3 text-primary" />
              <span className="text-lg text-gray-600">Loading products...</span>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
                  : "space-y-6 mb-8"
              }>
                {products.map((product, index) => (
                  <ProductCard 
                    key={product._id || product.id || index} 
                    product={product} 
                    viewMode={viewMode}
                  />
                ))}
              </div>
              
              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * productsPerPage + 1} to {Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts.toLocaleString()} products
                  </div>
                  
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="max-w-md mx-auto px-4">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No products found</h3>
                <p className="text-base text-gray-600 mb-6">
                  {searchTerm || priceRange[0] > 0 || priceRange[1] < 200000 
                    ? "Try adjusting your search criteria or filters to find more products."
                    : "No products are currently available. Please check back later."
                  }
                </p>
                {(searchTerm || priceRange[0] > 0 || priceRange[1] < 200000) && (
                  <Button 
                    onClick={clearFilters}
                    size="lg"
                    className="px-8"
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