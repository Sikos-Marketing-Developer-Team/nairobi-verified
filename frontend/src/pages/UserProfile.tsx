// Test comment to check if edits are being applied
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Heart, Clock, Edit, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, favoritesAPI, reviewsAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { usePageLoading } from '@/hooks/use-loading';
import { ProfileSkeleton, PageSkeleton } from '@/components/ui/loading-skeletons';

interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

const UserProfile = () => {
  const { user, isLoading: authLoading, isAuthenticated, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserProfileData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '' // Assuming 'address' is a field in your User type
  });
  const [isSaving, setIsSaving] = useState(false);
  const [favoriteMerchants, setFavoriteMerchants] = useState([]);
  const [recentlyReviewed, setRecentlyReviewed] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const isPageLoading = usePageLoading(500);

  useEffect(() => {
    if (user) {
      setUserData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  // Fetch user's favorite merchants
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
      fetchRecentReviews();
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    setIsLoadingFavorites(true);
    try {
      const response = await favoritesAPI.getFavorites();
      setFavoriteMerchants(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      setFavoriteMerchants([]);
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const fetchRecentReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const response = await reviewsAPI.getUserReviews({ limit: 4, sort: '-createdAt' });
      setRecentlyReviewed(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch recent reviews:', error);
      setRecentlyReviewed([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await userAPI.updateProfile(userData);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
      });
      const refreshed = await refreshUser(); // Refresh user data in AuthContext
      if (!refreshed) {
        toast({
          title: "Warning",
          description: "Profile updated but couldn't refresh user data.",
          variant: "destructive",
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving user data:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isPageLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <PageSkeleton>
          <ProfileSkeleton />
        </PageSkeleton>
        
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Profile Information</CardTitle>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {user?.firstName || ''} {user?.lastName || ''}
                  </h3>
                  <p className="text-gray-600">Platform User</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    {isEditing ? (
                      <Input
                        type="text"
                        name="firstName"
                        value={userData.firstName}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-gray-900">{user?.firstName || 'No info'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    {isEditing ? (
                      <Input
                        type="text"
                        name="lastName"
                        value={userData.lastName}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-gray-900">{user?.lastName || 'No info'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{user?.email || 'No info'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        name="phone"
                        value={userData.phone}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{user?.phone || 'No info'}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    {isEditing ? (
                      <Input
                        type="text"
                        name="address"
                        value={userData.address}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{user?.address || 'No info'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSave}
                      className="flex-1"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Favorite Merchants */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Favorite Merchants ({favoriteMerchants.length})
                  </CardTitle>
                  <Link to="/favorites">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingFavorites ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading favorites...</span>
                  </div>
                ) : favoriteMerchants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favoriteMerchants.map((merchant) => (
                      <Link to={`/merchant/${merchant._id}`} key={merchant._id}>
                        <Card className="hover-scale cursor-pointer">
                          <CardContent className="p-4 flex items-center gap-4">
                            <img
                              src={merchant.logo || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop'}
                              alt={merchant.businessName}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <div>
                              <h4 className="font-medium text-gray-900 line-clamp-1">{merchant.businessName}</h4>
                              <p className="text-sm text-gray-600 line-clamp-1">{merchant.address || merchant.location}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No favorite merchants added yet.</p>
                    <p className="text-sm text-gray-500 mt-2">Start exploring merchants and add them to your favorites!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recently Reviewed */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Recently Reviewed ({recentlyReviewed.length})
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingReviews ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading reviews...</span>
                  </div>
                ) : recentlyReviewed.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentlyReviewed.map((review) => (
                      <Link to={`/merchant/${review.merchantId}`} key={review._id}>
                        <Card className="hover-scale cursor-pointer">
                          <CardContent className="p-4 flex items-center gap-4">
                            <img
                              src={review.merchant?.logo || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop'}
                              alt={review.merchant?.businessName}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <div>
                              <h4 className="font-medium text-gray-900 line-clamp-1">{review.merchant?.businessName}</h4>
                              <p className="text-sm text-gray-600 line-clamp-1">Rating: {review.rating}/5</p>
                              <p className="text-xs text-gray-500 line-clamp-2">{review.comment}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No reviews written yet.</p>
                    <p className="text-sm text-gray-500 mt-2">Visit merchants and share your experience!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UserProfile;
