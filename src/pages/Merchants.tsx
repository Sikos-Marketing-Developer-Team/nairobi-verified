import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { MerchantGridSkeleton, PageSkeleton } from '@/components/ui/loading-skeletons';
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
  const isPageLoading = usePageLoading(600);

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

    fetchMerchants();
  }, []);

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
      
      {/* Add padding-top to the container after the Header */}
      <div className="pt-16">
        <PageSkeleton>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8">
              {/* Search and Filter Section Skeleton */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Skeleton className="h-12 w-full" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-24" />
                    <Skeleton className="h-12 w-10" />
                    <Skeleton className="h-12 w-10" />
                  </div>
                </div>
                
                {/* Categories Filter Skeleton */}
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-24" />
                  ))}
                </div>
              </div>

              {/* Results Header Skeleton */}
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-32" />
              </div>

              {/* Merchants Grid Skeleton */}
              <MerchantGridSkeleton />
            </div>
          </div>
        </PageSkeleton>
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
    
    {/* Add padding-top to the main element */}
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16">
      {/* Search and Filter Section */}
      <div className="mb-8 mt-20 pt-10 lg:pt-0">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search merchants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Merchants Grid/List */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {filteredMerchants.map((merchant) => (
          <Card key={merchant._id} className="hover-scale cursor-pointer border-0 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={merchant.logo}
                  alt={merchant.businessName}
                  className={`w-full object-cover ${viewMode === 'grid' ? 'h-48' : 'h-32'}`}
                />
                {merchant.verified && (
                  <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {merchant.businessType}
                  </span>
                  <span className="text-sm text-gray-500">Est. {merchant.yearEstablished}</span>
                </div>
                
                <h3 className="font-bold text-xl text-gray-900 mb-2">
                  {merchant.businessName}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {merchant.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{merchant.location}</span>
                  </div>
                  
                  <Link to={`/merchant/${merchant._id}`}>
                    <Button className="bg-primary hover:bg-primary-dark text-white">
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