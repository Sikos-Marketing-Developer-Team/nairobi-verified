import React, { useState, useEffect } from 'react';
import { 
  Eye, Edit, Users, Clock, CheckCircle, AlertCircle, MessageSquare, 
  BarChart3, TrendingUp, Phone, MapPin, Heart, Calendar, Settings, 
  Bell, Package, CreditCard, Star, Mail, Shield, Download, Award,
  RefreshCw, Store, Plus, Upload, Image
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { merchantsAPI } from '@/lib/api';

interface MerchantOverview {
  merchant: {
    id: string;
    businessName: string;
    email: string;
    phone: string;
    rating: number;
    totalReviews: number;
    memberSince: string;
  };
  verificationStatus: {
    isVerified: boolean;
    isFeatured: boolean;
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

interface AnalyticsData {
  period: string;
  analytics: {
    reviews: {
      total: number;
      recent: number;
      growth: string;
    };
    products?: {
      total: number;
      active: number;
      inactive: number;
      recent: number;
      growth: string;
    } | null;
    orders?: {
      total: number;
      recent: number;
      growth: string;
      revenue: {
        current: number;
        previous: number;
        growth: string;
        currency: string;
      };
    } | null;
  };
}

interface ActivityItem {
  type: string;
  description: string;
  timestamp: string;
  date: string;
  data: any;
}

interface Notification {
  id: string;
  type: string;
  icon: string;
  title: string;
  timestamp: string;
  date: string;
  read: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  link: string;
  enabled: boolean;
  badge: string | null;
  badgeColor: string | null;
}

const MerchantDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [overview, setOverview] = useState<MerchantOverview | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use centralized API service
      const results = await Promise.allSettled([
        merchantsAPI.getDashboardOverview(),
        merchantsAPI.getDashboardAnalytics(timeRange),
        merchantsAPI.getDashboardActivity(5),
        merchantsAPI.getDashboardNotifications(),
        merchantsAPI.getDashboardQuickActions()
      ]);

      // Process results
      const [overviewResult, analyticsResult, activityResult, notificationsResult, quickActionsResult] = results;

      // Handle overview
      if (overviewResult.status === 'fulfilled' && overviewResult.value.data.success) {
        setOverview(overviewResult.value.data.data);
      } else {
        console.error('Overview failed:', overviewResult.status === 'rejected' ? overviewResult.reason : overviewResult.value);
      }

      // Handle analytics
      if (analyticsResult.status === 'fulfilled' && analyticsResult.value.data.success) {
        setAnalytics(analyticsResult.value.data.data);
      } else {
        console.error('Analytics failed:', analyticsResult.status === 'rejected' ? analyticsResult.reason : analyticsResult.value);
      }

      // Handle activity
      if (activityResult.status === 'fulfilled' && activityResult.value.data.success) {
        setActivities(activityResult.value.data.data);
      } else {
        console.error('Activity failed:', activityResult.status === 'rejected' ? activityResult.reason : activityResult.value);
      }

      // Handle notifications
      if (notificationsResult.status === 'fulfilled' && notificationsResult.value.data.success) {
        setNotifications(notificationsResult.value.data.data);
      } else {
        console.error('Notifications failed:', notificationsResult.status === 'rejected' ? notificationsResult.reason : notificationsResult.value);
      }

      // Handle quick actions
      if (quickActionsResult.status === 'fulfilled' && quickActionsResult.value.data.success) {
        setQuickActions(quickActionsResult.value.data.data);
      } else {
        console.error('Quick actions failed:', quickActionsResult.status === 'rejected' ? quickActionsResult.reason : quickActionsResult.value);
      }

      // Check if all requests failed
      const failedCount = results.filter(result => 
        result.status === 'rejected' || 
        (result.status === 'fulfilled' && !result.value.data.success)
      ).length;

      if (failedCount === results.length) {
        throw new Error('All dashboard data failed to load');
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleSendCredentials = async () => {
    if (!overview) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/merchants/send-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: overview.merchant.email,
          businessName: overview.merchant.businessName
        })
      });
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Login credentials sent to your email successfully!',
        });
      } else {
        throw new Error('Failed to send credentials');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send credentials. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Debug function to check API responses
  const debugAPI = async () => {
    try {
      console.log('🔍 Debugging API calls...');
      
      const testEndpoints = [
        merchantsAPI.getDashboardOverview(),
        merchantsAPI.getDashboardAnalytics('30'),
        merchantsAPI.getDashboardActivity(5)
      ];

      const results = await Promise.allSettled(testEndpoints);
      
      results.forEach((result, index) => {
        const endpointNames = ['Overview', 'Analytics', 'Activity'];
        console.log(`--- ${endpointNames[index]} ---`);
        if (result.status === 'fulfilled') {
          console.log('✅ Success:', result.value);
        } else {
          console.log('❌ Error:', result.reason);
        }
      });
    } catch (error) {
      console.error('Debug error:', error);
    }
  };

  // Check authentication
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
            <Button onClick={() => window.location.href = '/login'}>
              Sign In
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

  if (!overview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Merchant Account Found</h1>
            <p className="text-gray-600 mb-6">
              You don't have a merchant account associated with your profile.
            </p>
            <div className="space-y-4">
              <Button onClick={() => window.location.href = '/register/merchant'}>
                Create Merchant Account
              </Button>
              <div>
                <Button variant="outline" onClick={debugAPI} className="mt-4">
                  Debug API
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {overview.merchant.businessName}!
              </h1>
              <p className="text-gray-600 mt-2">Manage your business profile and track performance</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleSendCredentials} variant="outline" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Send Login Credentials
              </Button>
              <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={debugAPI} variant="outline" className="text-xs">
                Debug
              </Button>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${
                  overview.verificationStatus.isVerified 
                    ? 'bg-green-100' 
                    : 'bg-amber-100'
                }`}>
                  <CheckCircle className={`h-6 w-6 ${
                    overview.verificationStatus.isVerified 
                      ? 'text-green-600' 
                      : 'text-amber-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {overview.verificationStatus.verificationBadge}
                  </h3>
                  <p className="text-gray-600">
                    {overview.verificationStatus.statusMessage}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {overview.verificationStatus.isFeatured && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Award className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <Link to="/merchant/verification">
                  <Button variant="outline">
                    View Status
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
                    style={{ width: `${overview.profileCompletion.percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {overview.profileCompletion.percentage}% complete
                </p>
                {overview.profileCompletion.nextSteps.length > 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    Next: {overview.profileCompletion.nextSteps[0]}
                  </p>
                )}
              </div>
              <Link to="/merchant/profile/edit">
                <Button className="ml-6 bg-primary hover:bg-primary-dark">
                  Complete Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your business quickly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.length > 0 ? (
                  <>
                    {/* Add Products Action */}
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

                    {/* Upload Photos Action */}
                    <Link to="/merchant/photos/upload">
                      <Button variant="outline" className="w-full justify-start h-auto py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Upload className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900">Upload Photos</p>
                            <p className="text-xs text-gray-500">Upload business images</p>
                          </div>
                        </div>
                      </Button>
                    </Link>

                    {/* Existing Quick Actions */}
                    {quickActions.map((action) => (
                      <Link key={action.id} to={action.link}>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start h-auto py-3"
                          disabled={!action.enabled}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              action.badgeColor === 'green' ? 'bg-green-100' :
                              action.badgeColor === 'red' ? 'bg-red-100' :
                              'bg-gray-100'
                            }`}>
                              {getIconComponent(action.icon)}
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-gray-900">{action.label}</p>
                              {action.badge && (
                                <Badge 
                                  variant="secondary" 
                                  className={`mt-1 ${
                                    action.badgeColor === 'green' ? 'bg-green-100 text-green-800' :
                                    action.badgeColor === 'red' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {action.badge}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Button>
                      </Link>
                    ))}
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-2">No quick actions available</p>
                )}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Latest updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className={`p-3 border rounded-lg ${
                        !notification.read ? 'bg-blue-50 border-blue-200' : ''
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`p-1 rounded-full ${
                            notification.type === 'success' ? 'bg-green-100' :
                            notification.type === 'warning' ? 'bg-amber-100' :
                            'bg-blue-100'
                          }`}>
                            {getIconComponent(notification.icon)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No notifications</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Analytics & Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Analytics Section */}
            {analytics && analytics.analytics ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Performance Analytics</CardTitle>
                    <Select value={timeRange} onValueChange={(value: '7' | '30' | '90') => setTimeRange(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <CardDescription>
                    {analytics.period} - Track your business performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Reviews Analytics */}
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics.analytics.reviews?.recent || 0}
                      </p>
                      <p className="text-sm text-gray-600">New Reviews</p>
                      <p className={`text-xs mt-1 ${
                        analytics.analytics.reviews?.growth?.startsWith('+') 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {analytics.analytics.reviews?.growth || '0%'}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Total: {analytics.analytics.reviews?.total || 0}
                      </p>
                    </div>

                    {/* Products Analytics - only show if data exists */}
                    {analytics.analytics.products && (
                      <div className="text-center p-6 bg-green-50 rounded-lg">
                        <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.analytics.products.active}
                        </p>
                        <p className="text-sm text-gray-600">Active Products</p>
                        <p className={`text-xs mt-1 ${
                          analytics.analytics.products.growth?.startsWith('+') 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {analytics.analytics.products.growth}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Total: {analytics.analytics.products.total}
                        </p>
                      </div>
                    )}

                    {/* Orders Analytics - only show if data exists */}
                    {analytics.analytics.orders && (
                      <div className="text-center p-6 bg-purple-50 rounded-lg">
                        <CreditCard className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.analytics.orders.recent}
                        </p>
                        <p className="text-sm text-gray-600">Recent Orders</p>
                        <p className={`text-xs mt-1 ${
                          analytics.analytics.orders.growth?.startsWith('+') 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {analytics.analytics.orders.growth}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Revenue: {analytics.analytics.orders.revenue.current.toLocaleString()} {analytics.analytics.orders.revenue.currency}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Chart Placeholder */}
                  <div className="mt-6 bg-gray-50 rounded-lg p-4 h-48 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Performance overview for {analytics.period.toLowerCase()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Analytics data not available</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest business activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities.length > 0 ? (
                    activities.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            activity.type === 'review' ? 'bg-blue-100' :
                            activity.type === 'product' ? 'bg-green-100' :
                            activity.type === 'order' ? 'bg-purple-100' : 'bg-gray-100'
                          }`}>
                            {activity.type === 'review' && <Star className="h-4 w-4 text-blue-600" />}
                            {activity.type === 'product' && <Package className="h-4 w-4 text-green-600" />}
                            {activity.type === 'order' && <CreditCard className="h-4 w-4 text-purple-600" />}
                          </div>
                          <div>
                            <span className="text-gray-900 block">{activity.description}</span>
                            {activity.data?.rating && (
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < activity.data.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap">{activity.timestamp}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                  )}
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

// Helper function to get icon components
const getIconComponent = (iconName: string) => {
  const iconProps = { className: "h-4 w-4" };
  switch (iconName) {
    case 'edit': return <Edit {...iconProps} />;
    case 'eye': return <Eye {...iconProps} />;
    case 'check-circle': return <CheckCircle {...iconProps} />;
    case 'calendar': return <Calendar {...iconProps} />;
    case 'message-square': return <MessageSquare {...iconProps} />;
    case 'package': return <Package {...iconProps} />;
    case 'credit-card': return <CreditCard {...iconProps} />;
    case 'settings': return <Settings {...iconProps} />;
    case 'bell': return <Bell {...iconProps} />;
    case 'shield': return <Shield {...iconProps} />;
    case 'download': return <Download {...iconProps} />;
    case 'plus': return <Plus {...iconProps} />;
    case 'upload': return <Upload {...iconProps} />;
    case 'image': return <Image {...iconProps} />;
    default: return <Settings {...iconProps} />;
  }
};

// Loading Skeleton
const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          {/* Verification Status Skeleton */}
          <Skeleton className="h-24 w-full" />

          {/* Profile Completion Skeleton */}
          <Skeleton className="h-24 w-full" />

          {/* Analytics Skeleton */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-48 w-full" />
          </div>

          {/* Activity & Actions Skeleton */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
              <div className="pt-4">
                <Skeleton className="h-6 w-32 mb-2" />
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full mb-2" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-6 w-32" />
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MerchantDashboard;