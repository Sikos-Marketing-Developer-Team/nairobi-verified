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
import { userAPI } from '@/lib/api';
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

  // Mock favorite merchants and recently viewed
  const favoriteMerchants = [
    {
      _id: '60d0fe4f5311236168a10101',
      businessName: 'TechHub Kenya',
      businessType: 'Electronics',
      location: 'Kimathi Street',
      verified: true,
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop'
    },
    {
      _id: '60d0fe4f5311236168a10102',
      businessName: 'CBD Fashion House',
      businessType: 'Fashion',
      location: 'Tom Mboya Street',
      verified: true,
      logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop'
    },
    {
      _id: '60d0fe4f5311236168a10103',
      businessName: 'Nairobi Pharmacy',
      businessType: 'Healthcare',
      location: 'Kenyatta Avenue',
      verified: true,
      logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=200&fit=crop'
    }
  ];

  const recentlyViewed = [
    {
      _id: '60d0fe4f5311236168a10104',
      businessName: 'Savannah Electronics',
      businessType: 'Electronics',
      location: 'Moi Avenue',
      verified: false,
      logo: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=300&h=200&fit=crop'
    },
    {
      _id: '60d0fe4f5311236168a10105',
      businessName: 'City Books',
      businessType: 'Books & Stationery',
      location: 'Biashara Street',
      verified: true,
      logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop'
    }
  ];

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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Edit className="h-4 w-4 mr-2" />
                    )}
                    {isEditing ? (isSaving ? 'Saving...' : 'Edit') : 'Edit'}
                  </Button>
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
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
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
                {favoriteMerchants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favoriteMerchants.map((merchant) => (
                      <Link to={`/merchant/${merchant._id}`} key={merchant._id}>
                        <Card className="hover-scale cursor-pointer">
                          <CardContent className="p-4 flex items-center gap-4">
                            <img
                              src={merchant.logo}
                              alt={merchant.businessName}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <div>
                              <h4 className="font-medium text-gray-900 line-clamp-1">{merchant.businessName}</h4>
                              <p className="text-sm text-gray-600 line-clamp-1">{merchant.location}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No favorite merchants added yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Recently Viewed */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Recently Viewed
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentlyViewed.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentlyViewed.map((merchant) => (
                      <Link to={`/merchant/${merchant._id}`} key={merchant._id}>
                        <Card className="hover-scale cursor-pointer">
                          <CardContent className="p-4 flex items-center gap-4">
                            <img
                              src={merchant.logo}
                              alt={merchant.businessName}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <div>
                              <h4 className="font-medium text-gray-900 line-clamp-1">{merchant.businessName}</h4>
                              <p className="text-sm text-gray-600 line-clamp-1">{merchant.location}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No recently viewed merchants.</p>
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
