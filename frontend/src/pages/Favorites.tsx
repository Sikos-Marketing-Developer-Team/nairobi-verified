import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Star, Phone, Mail, ExternalLink, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { favoritesAPI, merchantsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';

const Favorites = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { updateFavoritesCount } = useFavorites();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Fetch favorites data
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const favoritesRes = await favoritesAPI.getFavorites();
        const favoritesData = favoritesRes.data.data;
        
        // If favorites are populated with merchant data, use it directly
        if (favoritesData.length > 0 && favoritesData[0].businessName) {
          setFavorites(favoritesData);
        } else {
          // If favorites are just IDs, fetch merchant details
          const merchantPromises = favoritesData.map((fav: any) => 
            merchantsAPI.getMerchant(fav._id || fav)
          );
          const merchantsRes = await Promise.all(merchantPromises);
          setFavorites(merchantsRes.map(res => res.data.data));
        }
        
        setError(null);
      } catch (error: any) {
        setError(error.response?.data?.error || 'Failed to load favorites');
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isAuthenticated]);

  // Handle remove from favorites
  const handleRemoveFavorite = async (merchantId: string, merchantName: string) => {
    try {
      setRemovingId(merchantId);
      await favoritesAPI.removeFavorite(merchantId);
      
      // Update local state
      setFavorites(prev => prev.filter(merchant => merchant._id !== merchantId));
      
      // Update global favorites count
      updateFavoritesCount();
      
      toast({
        title: 'Removed from favorites',
        description: `${merchantName} has been removed from your favorites`,
        variant: 'destructive',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to remove from favorites',
        variant: 'destructive',
      });
    } finally {
      setRemovingId(null);
    }
  };

  // Handle clear all favorites
  const handleClearAll = async () => {
    try {
      // Remove each favorite individually
      const removePromises = favorites.map(merchant => 
        favoritesAPI.removeFavorite(merchant._id)
      );
      
      await Promise.all(removePromises);
      
      // Clear local state
      setFavorites([]);
      
      // Update global favorites count
      updateFavoritesCount();
      
      toast({
        title: 'Cleared all favorites',
        description: 'All merchants have been removed from your favorites',
        variant: 'destructive',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to clear favorites',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-8">Please sign in to view your favorites</p>
          <Link to="/auth">
            <Button className="bg-primary hover:bg-primary-dark">
              Sign In
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Error Loading Favorites</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
              <p className="text-gray-600 mt-2">
                {favorites.length} {favorites.length === 1 ? 'merchant' : 'merchants'} saved
              </p>
            </div>
            
            {favorites.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleClearAll}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Favorites Grid */}
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h2>
            <p className="text-gray-600 mb-6">Start exploring and add your favorite merchants!</p>
            <Link to="/merchants">
              <Button className="bg-primary hover:bg-primary-dark">
                Browse Merchants
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((merchant) => (
              <Card key={merchant._id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-0">
                  {/* Merchant Image */}
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={merchant.bannerImage || merchant.logo}
                      alt={merchant.businessName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Remove Button */}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-3 right-3"
                      onClick={() => handleRemoveFavorite(merchant._id, merchant.businessName)}
                      disabled={removingId === merchant._id}
                    >
                      {removingId === merchant._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                    
                    {/* Merchant Logo */}
                    <div className="absolute bottom-3 left-3">
                      <img
                        src={merchant.logo}
                        alt={merchant.businessName}
                        className="w-12 h-12 rounded-lg border-2 border-white shadow-lg object-cover"
                      />
                    </div>
                  </div>

                  {/* Merchant Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                        {merchant.businessName}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{merchant.rating}</span>
                      <span className="text-gray-500 text-sm">({merchant.reviews} reviews)</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{merchant.location}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {merchant.description}
                    </p>
                    
                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      {merchant.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a href={`tel:${merchant.phone}`} className="text-primary hover:underline">
                            {merchant.phone}
                          </a>
                        </div>
                      )}
                      
                      {merchant.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <a href={`mailto:${merchant.email}`} className="text-primary hover:underline line-clamp-1">
                            {merchant.email}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link 
                        to={`/merchant/${merchant._id}`} 
                        className="flex-1"
                      >
                        <Button className="w-full bg-primary hover:bg-primary-dark">
                          View Details
                        </Button>
                      </Link>
                      
                      {merchant.website && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(merchant.website, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Favorites;