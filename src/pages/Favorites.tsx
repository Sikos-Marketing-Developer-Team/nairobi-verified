import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Star, X, ArrowUpDown, SortAsc, SortDesc, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { favoritesAPI, merchantsAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Merchant } from '@/types';
import { usePageLoading } from '@/hooks/use-loading';
import { MerchantGridSkeleton, PageSkeleton } from '@/components/ui/loading-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

const Favorites = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isPageLoading = usePageLoading(500);
  
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'rating'>('recent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchFavorites = async () => {
    if (!isAuthenticated || !user?._id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await favoritesAPI.getFavorites();
      // Assuming the response data contains an array of merchant objects directly
      setFavorites(response.data.data);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load favorites.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [isAuthenticated, user]);

  const removeFavorite = async (merchantId: string) => {
    try {
      await favoritesAPI.removeFavorite(merchantId);
      toast({
        title: 'Favorite Removed',
        description: 'Merchant successfully removed from your favorites.',
      });
      fetchFavorites(); // Refresh the list
    } catch (err) {
      console.error('Error removing favorite:', err);
      toast({
        title: 'Error',
        description: 'Failed to remove favorite. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Sort favorites based on selected criteria
  const sortedFavorites = [...favorites].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'recent') {
      // Assuming createdAt is available and is a valid date string
      comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'name') {
      comparison = a.businessName.localeCompare(b.businessName);
    } else if (sortBy === 'rating') {
      comparison = a.rating - b.rating;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-gray-600">Loading favorites...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your favorites.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold inter text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-600">Your saved merchants for easy access</p>
        </div>

        {favorites.length > 0 ? (
          <>
            {/* Sorting Controls */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <Select value={sortBy} onValueChange={(value: 'recent' | 'name' | 'rating') => setSortBy(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Date Added</SelectItem>
                    <SelectItem value="name">Merchant Name</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center gap-1"
                >
                  {sortOrder === 'asc' ? (
                    <>
                      <SortAsc className="h-4 w-4" />
                      <span>Ascending</span>
                    </>
                  ) : (
                    <>
                      <SortDesc className="h-4 w-4" />
                      <span>Descending</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedFavorites.map((merchant) => (
              <Card key={merchant._id} className="hover-scale cursor-pointer border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={merchant.logo}
                      alt={merchant.businessName}
                      className="w-full h-48 object-cover"
                    />
                    {merchant.verified && (
                      <div className="absolute top-4 right-4 flex gap-2">
                        <div className="verified-badge bg-white">
                          <span className="text-green-600">✓</span>
                          Verified
                        </div>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent navigating to merchant detail page
                        removeFavorite(merchant._id);
                      }}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {merchant.businessType}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-xl text-gray-900 mb-2">
                      {merchant.businessName}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{merchant.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium ml-1">{merchant.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({merchant.reviews} reviews)</span>
                    </div>
                    
                    <Link to={`/merchant/${merchant._id}`}>
                      <Button className="w-full bg-primary hover:bg-primary-dark text-white">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-6">Start exploring and save merchants you love</p>
            <Link to="/merchants">
              <Button className="bg-primary hover:bg-primary-dark">
                Discover Merchants
              </Button>
            </Link>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Favorites;
