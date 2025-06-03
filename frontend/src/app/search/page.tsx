"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MainLayout from '../../components/MainLayout';
import { apiService } from '../../lib/api';
import { Product } from '../../types/api';
import ProductCard from '../../components/ProductCard';
import FilterSidebar from '../../components/FilterSidebar';
import { FiFilter, FiGrid, FiList, FiSearch, FiSliders, FiStar } from 'react-icons/fi';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const categoryId = searchParams?.get('category') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryId ? [categoryId] : []
  );
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  
  // Fetch products based on search parameters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const params: Record<string, any> = {
          page: currentPage,
          limit: 20,
        };
        
        if (query) {
          params.query = query;
        }
        
        if (selectedCategories.length > 0) {
          params.categories = selectedCategories.join(',');
        }
        
        if (selectedRatings.length > 0) {
          params.minRating = Math.min(...selectedRatings);
        }
        
        if (priceRange[0] > 0 || priceRange[1] < 100000) {
          params.minPrice = priceRange[0];
          params.maxPrice = priceRange[1];
        }
        
        // Add sorting
        if (sortBy === 'price_asc') {
          params.sort = 'price';
          params.order = 'asc';
        } else if (sortBy === 'price_desc') {
          params.sort = 'price';
          params.order = 'desc';
        } else if (sortBy === 'newest') {
          params.sort = 'createdAt';
          params.order = 'desc';
        } else if (sortBy === 'rating') {
          params.sort = 'rating';
          params.order = 'desc';
        }
        
        // Make API call
        const response = await apiService.products.search(query, params);
        const data = response.data.data;
        
        setProducts(data.items);
        setTotalResults(data.meta.totalItems);
        setTotalPages(data.meta.totalPages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to load search results. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [query, currentPage, sortBy, selectedCategories, selectedRatings, priceRange]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };
  
  // Handle filter changes
  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range);
    setCurrentPage(1);
  };
  
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
    setCurrentPage(1);
  };
  
  const handleRatingChange = (rating: number, checked: boolean) => {
    if (checked) {
      setSelectedRatings(prev => [...prev, rating]);
    } else {
      setSelectedRatings(prev => prev.filter(r => r !== rating));
    }
    setCurrentPage(1);
  };
  
  const clearAllFilters = () => {
    setPriceRange([0, 100000]);
    setSelectedCategories([]);
    setSelectedRatings([]);
    setCurrentPage(1);
  };
  
  // Generate pagination
  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
    );
    
    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 rounded-md border border-gray-300"
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="px-2">...</span>);
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md ${
            i === currentPage
              ? 'bg-orange-500 text-white'
              : 'border border-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="px-2">...</span>);
      }
      
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 rounded-md border border-gray-300"
        >
          {totalPages}
        </button>
      );
    }
    
    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    );
    
    return pages;
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {query ? `Search Results for "${query}"` : 'All Products'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {loading ? 'Searching...' : `${totalResults} products found`}
          </p>
        </div>
        
        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 py-2 px-4 rounded-md"
          >
            <FiFilter />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter Sidebar */}
          <div 
            className={`${
              showFilters ? 'block' : 'hidden'
            } md:block w-full md:w-64 flex-shrink-0`}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Filters
                </h2>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-orange-500 hover:text-orange-600"
                >
                  Clear All
                </button>
              </div>
              
              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                  Price Range
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceRangeChange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Min"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange([priceRange[0], parseInt(e.target.value) || 0])}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Max"
                  />
                </div>
                <button
                  onClick={() => handlePriceRangeChange([priceRange[0], priceRange[1]])}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded-md text-sm"
                >
                  Apply
                </button>
              </div>
              
              {/* Category Filter - This would be populated from API */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                  Categories
                </h3>
                <div className="space-y-2">
                  {/* This would be dynamically populated from API */}
                  {['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty'].map((category, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${index}`}
                        checked={selectedCategories.includes(String(index + 1))}
                        onChange={(e) => handleCategoryChange(String(index + 1), e.target.checked)}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`category-${index}`}
                        className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Rating Filter */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                  Rating
                </h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`rating-${rating}`}
                        checked={selectedRatings.includes(rating)}
                        onChange={(e) => handleRatingChange(rating, e.target.checked)}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`rating-${rating}`}
                        className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center"
                      >
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FiStar
                            key={i}
                            className={`${
                              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-1">{rating === 1 ? '& Up' : ''}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Grid */}
          <div className="flex-1">
            {/* Sort and View Options */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <div className="flex items-center">
                <label htmlFor="sort" className="text-sm text-gray-700 dark:text-gray-300 mr-2">
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${
                    viewMode === 'grid'
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <FiGrid />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${
                    viewMode === 'list'
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <FiList />
                </button>
              </div>
            </div>
            
            {/* Loading State */}
            {loading && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
              </div>
            )}
            
            {/* Error State */}
            {error && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <p className="text-red-500">{error}</p>
              </div>
            )}
            
            {/* No Results */}
            {!loading && !error && products.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No products found. Try adjusting your search or filters.
                </p>
              </div>
            )}
            
            {/* Product Grid */}
            {!loading && !error && products.length > 0 && (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
              }>
                {products.map(product => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={() => {}}
                    onAddToWishlist={() => {}}
                  />
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="mt-8 flex justify-center space-x-2">
                {renderPagination()}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <p>Loading search results...</p>
          </div>
        </div>
      </MainLayout>
    }>
      <SearchContent />
    </Suspense>
  );
}