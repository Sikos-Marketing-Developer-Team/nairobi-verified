import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, Edit, Eye, Plus, MessageSquare, Star, TrendingUp, 
  Package, Image as ImageIcon, Shield, PhoneCall, MessageCircle, BarChart3,
  AlertCircle, CheckCircle, Clock, Users, LogOut
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface DashboardData {
  merchant: {
    id: string;
    businessName: string;
    email: string;
    phone: string;
    rating: number;
    totalReviews: number;
    totalProducts: number;
    memberSince: string;
    logo?: string;
    banner?: string;
  };
  verificationStatus: {
    isVerified: boolean;
    isFeatured: boolean;
    verificationLevel: string;
    verificationBadge: string;
    statusMessage: string;
    verifiedDate: string | null;
  };
  profileCompletion: {
    percentage: number;
    documentsPercentage: number;
    nextSteps: string[];
  };
}

interface Analytics {
  period: string;
  reviews: {
    total: number;
    recent: number;
    averageRating: number;
  };
  products: {
    total: number;
    active: number;
    inactive: number;
  };
}

interface Activity {
  type: string;
  description: string;
  timestamp: string;
  data: any;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  read: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  link: string;
  enabled: boolean;
}

const MerchantDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'merchant') {
      navigate('/merchant/login');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, user, timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [overviewRes, analyticsRes, activityRes, notificationsRes, quickActionsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/merchants/dashboard/overview`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/merchants/dashboard/analytics?period=${timeRange}`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/merchants/dashboard/activity?limit=10`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/merchants/dashboard/notifications`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/merchants/dashboard/quick-actions`, { withCredentials: true })
      ]);

      if (overviewRes.data.success) {
        setDashboardData(overviewRes.data.data);
      }

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      }

      if (activityRes.data.success) {
        setActivities(activityRes.data.data);
      }

      if (notificationsRes.data.success) {
        setNotifications(notificationsRes.data.data);
      }

      if (quickActionsRes.data.success) {
        setQuickActions(quickActionsRes.data.data);
      }

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: any = {
      edit: Edit,
      plus: Plus,
      eye: Eye,
      message: MessageSquare
    };
    return icons[iconName] || Store;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load dashboard data. Please refresh the page.</AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {dashboardData.merchant.businessName}!
          </h1>
          <p className="text-gray-600">
            Manage your business profile, products, and customer engagement
          </p>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {notifications.map((notification) => (
              <Alert key={notification.id} className="bg-blue-50 border-blue-200">
                <MessageCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  {notification.title}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Verification Status */}
        <Card className={`mb-6 ${
          dashboardData.verificationStatus.isVerified 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {dashboardData.verificationStatus.isVerified ? (
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                ) : (
                  <Clock className="h-6 w-6 text-yellow-600 mt-1" />
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">
                      {dashboardData.verificationStatus.verificationBadge}
                    </h3>
                    <Badge variant={dashboardData.verificationStatus.isVerified ? 'default' : 'secondary'}>
                      {dashboardData.verificationStatus.verificationLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">
                    {dashboardData.verificationStatus.statusMessage}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/merchant/verification')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Manage Verification
              </Button>
            </div>

            {/* Profile Completion */}
            {dashboardData.profileCompletion.percentage < 100 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Profile Completion</span>
                  <span className="text-sm text-gray-600">
                    {dashboardData.profileCompletion.percentage}%
                  </span>
                </div>
                <Progress value={dashboardData.profileCompletion.percentage} className="mb-3" />
                
                {dashboardData.profileCompletion.nextSteps.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">Next Steps:</p>
                    {dashboardData.profileCompletion.nextSteps.map((step, index) => (
                      <p key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                        {step}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
            onClick={() => navigate('/merchant/profile/edit')}
          >
            <CardContent className="pt-6 text-center">
              <Edit className="h-8 w-8 mx-auto mb-3 text-blue-600" />
              <p className="font-medium text-sm">Edit Profile</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-500"
            onClick={() => navigate('/merchant/products')}
          >
            <CardContent className="pt-6 text-center">
              <Package className="h-8 w-8 mx-auto mb-3 text-green-600" />
              <p className="font-medium text-sm">Manage Products</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-500"
            onClick={() => navigate('/merchant/reviews')}
          >
            <CardContent className="pt-6 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-3 text-purple-600" />
              <p className="font-medium text-sm">Manage Reviews</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-pink-500"
            onClick={() => navigate('/merchant/gallery')}
          >
            <CardContent className="pt-6 text-center">
              <ImageIcon className="h-8 w-8 mx-auto mb-3 text-pink-600" />
              <p className="font-medium text-sm">Photo Gallery</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-yellow-500"
            onClick={() => navigate('/merchant/verification')}
          >
            <CardContent className="pt-6 text-center">
              <Shield className="h-8 w-8 mx-auto mb-3 text-yellow-600" />
              <p className="font-medium text-sm">Verification</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-orange-500"
            onClick={() => navigate('/merchant/engagement')}
          >
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-orange-600" />
              <p className="font-medium text-sm">Engagement Stats</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-indigo-500"
            onClick={() => window.open(`/merchants/${dashboardData.merchant._id}`, '_blank')}
          >
            <CardContent className="pt-6 text-center">
              <Eye className="h-8 w-8 mx-auto mb-3 text-indigo-600" />
              <p className="font-medium text-sm">View Public Page</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-red-500"
            onClick={() => {
              // Logout functionality
              localStorage.removeItem('token');
              navigate('/merchant/login');
            }}
          >
            <CardContent className="pt-6 text-center">
              <LogOut className="h-8 w-8 mx-auto mb-3 text-red-600" />
              <p className="font-medium text-sm">Logout</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Reviews</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.merchant.totalReviews}</div>
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span>{dashboardData.merchant.rating.toFixed(1)} average rating</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.merchant.totalProducts}</div>
              {analytics && (
                <p className="text-sm text-gray-600 mt-1">
                  {analytics.products.active} active, {analytics.products.inactive} inactive
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Recent Reviews</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.reviews.recent || 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">Last {timeRange} days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Profile Views</CardTitle>
              <Eye className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-sm text-gray-600 mt-1">Coming soon</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Business Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Your basic business details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Business Name</p>
                    <p className="font-medium">{dashboardData.merchant.businessName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{dashboardData.merchant.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{dashboardData.merchant.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="font-medium">
                      {new Date(dashboardData.merchant.memberSince).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => navigate('/merchant/profile')}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                  <CardDescription>Manage your business</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/merchant/products')}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Manage Products
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/merchant/reviews')}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Manage Reviews
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/merchant/gallery')}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Photo Gallery
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/merchant/engagement')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Customer Engagement
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest business activities</CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No recent activity</p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0">
                        <div className="mt-1">
                          {activity.type === 'review' ? (
                            <Star className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <Package className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Track your business performance</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Reviews Summary</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold">{analytics.reviews.total}</p>
                          <p className="text-sm text-gray-600">Total Reviews</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold">{analytics.reviews.recent}</p>
                          <p className="text-sm text-gray-600">Recent</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold">{analytics.reviews.averageRating.toFixed(1)}</p>
                          <p className="text-sm text-gray-600">Avg Rating</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Products Summary</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold">{analytics.products.total}</p>
                          <p className="text-sm text-gray-600">Total Products</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{analytics.products.active}</p>
                          <p className="text-sm text-gray-600">Active</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <p className="text-2xl font-bold text-red-600">{analytics.products.inactive}</p>
                          <p className="text-sm text-gray-600">Inactive</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No analytics data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default MerchantDashboard;
