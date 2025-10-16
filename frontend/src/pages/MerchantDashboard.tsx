// src/pages/merchant/MerchantDashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  Eye, Edit, Plus, Upload, CheckCircle, AlertCircle, 
  BarChart3, Package, CreditCard, Star, Mail, Award,
  RefreshCw, Store, ExternalLink, Users, Calendar, MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// REAL API endpoints that we know exist
const merchantAPI = {
  // This endpoint we know exists from MerchantProfileEdit
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/api/merchants/profile/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Fallback: Get merchant by ID if profile endpoint fails
  getMerchantById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/merchants/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
};

interface MerchantData {
  _id: string;
  businessName: string;
  email: string;
  phone: string;
  businessType: string;
  description: string;
  address: string;
  isActive: boolean;
  verified: boolean;
  memberSince: string;
  rating?: number;
  totalReviews?: number;
  slug?: string;
  website?: string;
}

const MerchantDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMerchantData();
    }
  }, [isAuthenticated, user]);

  const fetchMerchantData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching merchant data...');

      // Try the main profile endpoint first
      try {
        const profileResponse = await merchantAPI.getProfile();
        if (profileResponse.success && profileResponse.data) {
          console.log('✅ Merchant profile loaded:', profileResponse.data);
          setMerchantData(profileResponse.data);
          return;
        }
      } catch (profileError) {
        console.warn('Profile endpoint failed, trying alternatives...', profileError);
      }

      // If profile endpoint fails, try to get merchant by user ID
      if (user?.id) {
        try {
          const merchantResponse = await merchantAPI.getMerchantById(user.id);
          if (merchantResponse.success && merchantResponse.data) {
            console.log('✅ Merchant data loaded by ID:', merchantResponse.data);
            setMerchantData(merchantResponse.data);
            return;
          }
        } catch (idError) {
          console.warn('Merchant by ID also failed:', idError);
        }
      }

      // If all API calls fail, check if user has merchant role but no data
      if (user?.isMerchant) {
        setError('Merchant account exists but data cannot be loaded. Please contact support.');
      } else {
        setError('No merchant account found. Please create a merchant account.');
      }

    } catch (error) {
      console.error('💥 Error fetching merchant data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load merchant data';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMerchantData();
  };

  // Calculate profile completion based on filled fields
  const calculateProfileCompletion = (merchant: MerchantData): number => {
    const requiredFields = [
      'businessName',
      'email', 
      'phone',
      'businessType',
      'description',
      'address'
    ];
    
    const completedFields = requiredFields.filter(field => {
      const value = merchant[field as keyof MerchantData];
      return value && value.toString().trim().length > 0;
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  // Get next steps for profile completion
  const getNextSteps = (merchant: MerchantData): string[] => {
    const steps = [];
    
    if (!merchant.businessName || merchant.businessName.trim().length === 0) {
      steps.push('Add your business name');
    }
    
    if (!merchant.description || merchant.description.trim().length === 0) {
      steps.push('Write a business description');
    }
    
    if (!merchant.address || merchant.address.trim().length === 0) {
      steps.push('Add your business address');
    }
    
    if (!merchant.phone || merchant.phone.trim().length === 0) {
      steps.push('Add your phone number');
    }
    
    if (steps.length === 0) {
      steps.push('Your profile is complete! Consider adding more details');
    }
    
    return steps.slice(0, 2);
  };

  // Get shop URL for View Shop button
  const getShopUrl = (): string => {
    if (merchantData?.slug) {
      return `/merchant/${merchantData.slug}`;
    }
    if (merchantData?._id) {
      return `/merchant/${merchantData._id}`;
    }
    return '/merchants';
  };

  // Mock data for demonstration (remove in production)
  const getMockAnalytics = () => ({
    reviews: { total: 0, recent: 0, growth: '0%' },
    products: { total: 0, active: 0, inactive: 0, recent: 0, growth: '0%' }
  });

  // Mock activities for demonstration
  const getMockActivities = () => [
    {
      type: 'info',
      description: 'Welcome to your merchant dashboard!',
      timestamp: 'Just now',
      date: new Date().toISOString()
    }
  ];

  // Check authentication and redirect if needed
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-6">
              Please sign in to access the merchant dashboard.
            </p>
            <Button onClick={() => navigate('/auth/merchant')}>
              Sign In as Merchant
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error && !merchantData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error.includes('No merchant account') ? 'Merchant Account Required' : 'Account Setup Required'}
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/auth/register/merchant')}>
                Create Merchant Account
              </Button>
              <Button variant="outline" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!merchantData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Data</h1>
            <p className="text-gray-600 mb-6">
              There was a problem loading your merchant data. Please try again or contact support.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleRefresh}>
                Retry
              </Button>
              <Button variant="outline" onClick={() => navigate('/contact')}>
                Contact Support
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const profileCompletion = calculateProfileCompletion(merchantData);
  const nextSteps = getNextSteps(merchantData);
  const mockAnalytics = getMockAnalytics();
  const mockActivities = getMockActivities();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {merchantData.businessName || 'Merchant'}!
              </h1>
              <p className="text-gray-600 mt-2">Manage your business profile and track performance</p>
              <p className="text-sm text-gray-500 mt-1">
                Merchant ID: {merchantData._id}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Shop Button */}
              <Link to={getShopUrl()} target="_blank">
                <Button variant="outline" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View Shop
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
              
              <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription>
              {error} Some demo data is being shown.
            </AlertDescription>
          </Alert>
        )}

        {/* Verification Status */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${
                  merchantData.verified ? 'bg-green-100' : 'bg-amber-100'
                }`}>
                  <CheckCircle className={`h-6 w-6 ${
                    merchantData.verified ? 'text-green-600' : 'text-amber-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {merchantData.verified ? 'Verified Business' : 'Pending Verification'}
                  </h3>
                  <p className="text-gray-600">
                    {merchantData.verified 
                      ? 'Your business is verified and visible to customers' 
                      : 'Complete verification to unlock all features'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Shop URL: {window.location.origin}{getShopUrl()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/merchant/verification">
                  <Button variant="outline">
                    {merchantData.verified ? 'View Status' : 'Get Verified'}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Completion */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Profile Completion</h3>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {profileCompletion}% complete
                </p>
                {nextSteps.length > 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    Next: {nextSteps[0]}
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-6">
                <Link to="/merchant/profile/edit">
                  <Button className="bg-primary hover:bg-primary-dark">
                    {profileCompletion === 100 ? 'Update Profile' : 'Complete Profile'}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Analytics Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your business quickly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to={getShopUrl()} target="_blank">
                  <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Store className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">View Shop</p>
                        <p className="text-xs text-gray-500">See how customers view your shop</p>
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link to="/merchant/products/add">
                  <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Plus className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Add Products</p>
                        <p className="text-xs text-gray-500">Showcase your items</p>
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link to="/merchant/profile/edit">
                  <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Edit className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Edit Profile</p>
                        <p className="text-xs text-gray-500">Update business information</p>
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link to="/merchant/verification">
                  <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Award className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Get Verified</p>
                        <p className="text-xs text-gray-500">Increase customer trust</p>
                      </div>
                    </div>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Analytics & Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Analytics Section */}
            <Card>
              <CardHeader>
                <CardTitle>Business Overview</CardTitle>
                <CardDescription>Your business at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {mockAnalytics.reviews.total}
                    </p>
                    <p className="text-sm text-gray-600">Total Reviews</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Build your reputation
                    </p>
                  </div>

                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {mockAnalytics.products.total}
                    </p>
                    <p className="text-sm text-gray-600">Products</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Showcase your offerings
                    </p>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4 h-32 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Analytics coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest business activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-100">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-gray-900">{activity.description}</span>
                      </div>
                      <span className="text-sm text-gray-500 whitespace-nowrap">{activity.timestamp}</span>
                    </div>
                  ))}
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">More activity will appear here as you use the platform</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Loading Skeleton
const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MerchantDashboard;