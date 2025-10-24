import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Grid, List, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { merchantsAPI } from '@/lib/api';
import { Merchant } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePageLoading } from '@/hooks/use-loading';
import { Skeleton } from '@/components/ui/skeleton';

const categories = ['All', 'Electronics', 'Fashion', 'Photography', 'Sports', 'Business Services'];
const ITEMS_PER_PAGE = 24; // Show 24 merchants per page

type ViewMode = 'grid' | 'list';

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const Merchants = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const isPageLoading = usePageLoading(600);

  // Load search params and page from URL
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || 'All';
    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    
    setSearchTerm(urlSearch);
    setSelectedCategory(urlCategory);
    setCurrentPage(urlPage);
  }, [searchParams]);

  // Fetch merchants with pagination
  const fetchMerchants = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page,
        limit: ITEMS_PER_PAGE
      };

      // Add search and category filters
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }

      console.log('Fetching merchants with params:', params);
      const response = await merchantsAPI.getMerchants(params);
      
      console.log('API Response:', response.data);

      const merchantsData = response.data.data || [];
      const paginationData = response.data.pagination || {};
      const count = response.data.count || 0;

      setMerchants(merchantsData);

      // Calculate total pages
      const total = count;
      const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

      setPagination({
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        hasNext: !!paginationData.next,
        hasPrev: !!paginationData.prev
      });

      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load merchants. Please try again.');
      setMerchants([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch merchants when page, search, or category changes
  useEffect(() => {
    fetchMerchants(currentPage);
  }, [currentPage, searchTerm, selectedCategory]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (selectedCategory !== 'All') params.append('category', selectedCategory);
    params.append('page', '1'); // Reset to page 1 on new search
    setSearchParams(params);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setCurrentPage(1);
    setSearchParams({});
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (selectedCategory !== 'All') params.append('category', selectedCategory);
    params.append('page', page.toString());
    setSearchParams(params);
    setCurrentPage(page);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const { currentPage: current, totalPages } = pagination;

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current > 3) {
        pages.push('ellipsis-start');
      }

      // Show pages around current
      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < totalPages - 2) {
        pages.push('ellipsis-end');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  // Loading state
  if (loading || isPageLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-8 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-44 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
            <div className="text-center py-12">
              <div className="text-red-500 text-lg font-medium mb-2">{error}</div>
              <Button onClick={() => fetchMerchants(currentPage)} className="mt-4">
                Try Again
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-16 pb-5">
        {/* Search and Filter Section */}
        <div className="mb-6 mt-16 sm:mt-12 pt-8">
          <div className="flex flex-col gap-3">
            {/* Search Input and Button */}
            <div className="flex flex-row items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search merchants by name, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9 h-9 text-[13px] sm:h-10 sm:text-sm w-full"
                  aria-label="Search merchants"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-primary hover:bg-primary-dark h-9 px-2 text-[11px] sm:h-10 sm:px-3 sm:text-sm"
                aria-label="Perform search"
              >
                <Search className="h-3 w-3 mr-1 sm:h-3.5 sm:w-3.5" />
                Search
              </Button>
            </div>
            
            {/* Filter and View Mode */}
            <div className="flex gap-2 items-center">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-28 h-8 text-[11px] sm:w-[140px] sm:h-10 sm:text-sm" aria-label="Filter by category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-[11px] sm:text-sm">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 sm:h-10 sm:w-10"
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                >
                  <Grid className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 sm:h-10 sm:w-10"
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                >
                  <List className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </Button>
              </div>

              {(searchTerm || selectedCategory !== 'All') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-8 text-[11px] sm:h-10 sm:text-sm ml-auto"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            {pagination.totalItems} {pagination.totalItems === 1 ? 'merchant' : 'merchants'} found
            {pagination.totalPages > 1 && (
              <span className="text-xs text-gray-500 ml-2">
                (Page {pagination.currentPage} of {pagination.totalPages})
              </span>
            )}
            {(searchTerm || selectedCategory !== 'All') && (
              <span className="text-xs text-gray-500 ml-2">
                {searchTerm && `for "${searchTerm}"`}
                {searchTerm && selectedCategory !== 'All' && ' in '}
                {selectedCategory !== 'All' && `category: ${selectedCategory}`}
              </span>
            )}
          </div>
        </div>

        {/* Empty State */}
        {merchants.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No merchants found</div>
            <p className="text-gray-400 text-sm mb-4">
              {searchTerm || selectedCategory !== 'All' 
                ? 'Try adjusting your search terms or filters'
                : 'No merchants are currently available'
              }
            </p>
            {(searchTerm || selectedCategory !== 'All') && (
              <Button onClick={handleClearFilters} variant="outline">
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Merchants Grid/List */}
        <div className={`grid gap-3 sm:gap-4 ${
          viewMode === 'grid'
            ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
        }`}>
          {merchants.map((merchant) => (
            <Card 
              key={merchant._id} 
              className="hover:scale-[1.02] transition-transform duration-200 cursor-pointer border-0 shadow-md overflow-hidden hover:shadow-lg"
            >
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={merchant.logo || 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=No+Logo'}
                    alt={`${merchant.businessName} logo`}
                    className={`w-full object-cover bg-gray-100 ${
                      viewMode === 'grid' ? 'h-28 sm:h-36' : 'h-24 sm:h-28'
                    }`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=No+Logo';
                    }}
                    loading="lazy"
                  />
                  {merchant.verified && (
                    <div 
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm"
                      title="Verified Merchant"
                      aria-label="Verified Merchant"
                    >
                      <Check className="h-2.5 w-2.5 text-primary sm:h-3 sm:w-3" />
                    </div>
                  )}
                </div>
                <div className="p-2 sm:p-3">
                  <div className="flex items-center gap-1 mb-1 sm:mb-2 flex-wrap">
                    <span className="text-[9px] sm:text-xs px-1 py-0.5 bg-primary/10 text-primary rounded-full whitespace-nowrap">
                      {merchant.businessType || 'Uncategorized'}
                    </span>
                    {merchant.yearEstablished && (
                      <span className="text-[9px] sm:text-xs text-gray-500 whitespace-nowrap">
                        Est. {merchant.yearEstablished}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-[13px] sm:text-base text-gray-900 mb-1 line-clamp-1">
                    {merchant.businessName || 'Unnamed Business'}
                  </h3>
                  <p className="text-gray-600 text-[11px] sm:text-sm mb-2 sm:mb-3 line-clamp-2 min-h-[2.5rem]">
                    {merchant.description || 'No description available.'}
                  </p>
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400 flex-shrink-0" />
                    <span className="text-[9px] sm:text-xs text-gray-500 line-clamp-1">
                      {merchant.location || 'Location not specified'}
                    </span>
                  </div>
                  
                  {/* View Profile Links */}
                  <div className="block sm:hidden">
                    <Link
                      to={`/business/${merchant._id}`}
                      className="text-orange-500 text-[11px] underline hover:no-underline block text-center"
                      aria-label={`View profile for ${merchant.businessName}`}
                    >
                      View Profile
                    </Link>
                  </div>
                  <div className="hidden sm:flex sm:justify-end">
                    <Link to={`/business/${merchant._id}`} className="w-full">
                      <Button 
                        className="bg-primary hover:bg-primary-dark text-white text-xs h-8 px-3 w-full"
                        aria-label={`View profile for ${merchant.businessName}`}
                      >
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 mb-4">
            <Pagination>
              <PaginationContent>
                {/* Previous Button */}
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.hasPrev) {
                        handlePageChange(currentPage - 1);
                      }
                    }}
                    className={!pagination.hasPrev ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {/* Page Numbers */}
                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={`${page}-${index}`}>
                    {typeof page === 'number' ? (
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    ) : (
                      <PaginationEllipsis />
                    )}
                  </PaginationItem>
                ))}

                {/* Next Button */}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.hasNext) {
                        handlePageChange(currentPage + 1);
                      }
                    }}
                    className={!pagination.hasNext ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Merchants;