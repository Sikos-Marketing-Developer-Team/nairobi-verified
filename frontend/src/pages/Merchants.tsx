import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Grid, List, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { merchantsAPI } from '@/lib/api';
import { Merchant } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePageLoading } from '@/hooks/use-loading';
import { Skeleton } from '@/components/ui/skeleton';

const categories = ['All', 'Electronics', 'Fashion', 'Photography', 'Sports', 'Business Services'];

type ViewMode = 'grid' | 'list';

const Merchants = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchParams, setSearchParams] = useSearchParams();
  const isPageLoading = usePageLoading(600);

  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || 'All';
    setSearchTerm(urlSearch);
    setSelectedCategory(urlCategory);
    if (urlSearch || urlCategory !== 'All') {
      performSearch(urlSearch, urlCategory);
    }
  }, [searchParams]);

  const performSearch = async (search: string = searchTerm, category: string = selectedCategory) => {
    try {
      setLoading(true);
      const response = await merchantsAPI.searchMerchants(search, category);
      setMerchants(response.data.data);
    } catch (err) {
      setError('Failed to search merchants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const response = await merchantsAPI.getMerchants();
        setMerchants(response.data.data);
      } catch (err) {
        setError('Failed to load merchants');
      } finally {
        setLoading(false);
      }
    };
    if (!searchParams.get('search') && !searchParams.get('category')) {
      fetchMerchants();
    }
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (selectedCategory !== 'All') params.append('category', selectedCategory);
    setSearchParams(params);
    performSearch();
  };

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch =
      merchant.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.businessType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || merchant.businessType === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading || isPageLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
            <div className="space-y-6">
              {/* Search and Filter Section Skeleton */}
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
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-16" />
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              {/* Merchants Grid Skeleton - 2 columns on mobile */}
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

  if (error) {
    return <div>{error}</div>;
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
          placeholder="Search merchants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="pl-9 h-9 text-[13px] sm:h-10 sm:text-sm w-full"
        />
      </div>
      <Button
        onClick={handleSearch}
        className="bg-primary hover:bg-primary-dark h-9 px-2 text-[11px] sm:h-10 sm:px-3 sm:text-sm"
      >
        <Search className="h-3 w-3 mr-1 sm:h-3.5 sm:w-3.5" />
        Search
      </Button>
    </div>
    {/* Filter and View Mode */}
    <div className="flex gap-2">
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className="w-28 h-8 text-[11px] sm:w-[140px] sm:h-10 sm:text-sm">
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
        >
          <Grid className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setViewMode('list')}
          className="h-8 w-8 sm:h-10 sm:w-10"
        >
          <List className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </Button>
      </div>
    </div>
  </div>
</div>

        {/* Merchants Grid/List - 2 columns on mobile for grid view */}
        <div className={`grid gap-3 sm:gap-4 ${
          viewMode === 'grid'
            ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
        }`}>
          {filteredMerchants.map((merchant) => (
            <Card key={merchant._id} className="hover-scale cursor-pointer border-0 shadow-md overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={merchant.logo}
                    alt={merchant.businessName}
                    className={`w-full object-cover ${viewMode === 'grid' ? 'h-28 sm:h-36' : 'h-24 sm:h-28'}`}
                  />
                  {merchant.verified && (
                    <div className="absolute top-1 right-1 bg-white rounded-full p-1">
                      <Check className="h-2.5 w-2.5 text-primary sm:h-3 sm:w-3" />
                    </div>
                  )}
                </div>
                <div className="p-2 sm:p-3">
                  <div className="flex items-center gap-1 mb-1 sm:mb-2">
                    <span className="text-[9px] sm:text-xs px-1 py-0.5 bg-primary/10 text-primary rounded-full">
                      {merchant.businessType}
                    </span>
                    <span className="text-[9px] sm:text-xs text-gray-500">Est. {merchant.yearEstablished}</span>
                  </div>
                  <h3 className="font-semibold text-[13px] sm:text-base text-gray-900 mb-1">
                    {merchant.businessName}
                  </h3>
                  <p className="text-gray-600 text-[11px] sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                    {merchant.description}
                  </p>
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                    <span className="text-[9px] sm:text-xs text-gray-500">{merchant.location}</span>
                  </div>
                  {/* Conditionally render Link for mobile, Button for desktop */}
                  <div className="block sm:hidden">
                    <Link
                      to={`/merchant/${merchant._id}`}
                      className="text-orange-500 text-[11px] underline hover:no-underline block"
                      aria-label={`View profile for ${merchant.businessName}`}
                    >
                      View Profile
                    </Link>
                  </div>
                  <div className="hidden sm:flex sm:justify-end">
                    <Link to={`/merchant/${merchant._id}`}>
                      <Button className="bg-primary hover:bg-primary-dark text-white text-xs h-8 px-3">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Merchants;