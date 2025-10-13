// src/pages/merchant/MerchantDashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  Eye, Edit, Users, Clock, CheckCircle, AlertCircle, MessageSquare, 
  BarChart3, TrendingUp, Phone, MapPin, Heart, Calendar, Settings, 
  Bell, Package, CreditCard, Star, Mail, Shield, Download, Award,
  RefreshCw, Store
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

const API_BASE_URL = import.meta.env.VITE_API_URL;

// API service functions
const dashboardAPI = {
  getOverview: async () => {
    const response = await fetch(`${API_BASE_URL}/merchants/dashboard/overview`, {
      method: 'GET',
      credentials: 'include'
    });
    return response.json();
  },

  getAnalytics: async (period: string = '30') => {
    const response = await fetch(`${API_BASE_URL}/merchants/dashboard/analytics?period=${period}`, {
      method: 'GET',
      credentials: 'include'
    });
    return response.json();
  },

  getActivity: async (limit: number = 10) => {
    const response = await fetch(`${API_BASE_URL}/merchants/dashboard/activity?limit=${limit}`, {
      method: 'GET',
      credentials: 'include'
    });
    return response.json();
  },

  getNotifications: async () => {
    const response = await fetch(`${API_BASE_URL}/merchants/dashboard/notifications`, {
      method: 'GET',
      credentials: 'include'
    });
    return response.json();
  },

  getQuickActions: async () => {
    const response = await fetch(`${API_BASE_URL}/merchants/dashboard/quick-actions`, {
      method: 'GET',
      credentials: 'include'
    });
    return response.json();
  }
};

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
      await Promise.all([
        fetchOverview(),
        fetchAnalytics(),
        fetchActivity(),
        fetchNotifications(),
        fetchQuickActions()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchOverview = async () => {
    const response = await dashboardAPI.getOverview();
    if (response.success) {
      setOverview(response.data);
    } else {
      throw new Error(response.error);
    }
  };

  const fetchAnalytics = async () => {
    const response = await dashboardAPI.getAnalytics(timeRange);
    if (response.success) {
      setAnalytics(response.data);
    } else {
      throw new Error(response.error);
    }
  };

  const fetchActivity = async () => {
    const response = await dashboardAPI.getActivity(5);
    if (response.success) {
      setActivities(response.data);
    } else {
      throw new Error(response.error);
    }
  };

  const fetchNotifications = async () => {
    const response = await dashboardAPI.getNotifications();
    if (response.success) {
      setNotifications(response.data);
    } else {
      throw new Error(response.error);
    }
  };

  const fetchQuickActions = async () => {
    const response = await dashboardAPI.getQuickActions();
    if (response.success) {
      setQuickActions(response.data);
    } else {
      throw new Error(response.error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleSendCredentials = async () => {
    if (!overview) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/merchants/send-credentials`, {
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
            <Button onClick={() => window.location.href = '/register/merchant'}>
              Create Merchant Account
            </Button>
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

        {/* Analytics Section */}
        {analytics && (
          <Card className="mb-8">
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
                    {analytics.analytics.reviews.recent}
                  </p>
                  <p className="text-sm text-gray-600">New Reviews</p>
                  <p className="text-xs text-green-600 mt-1">
                    {analytics.analytics.reviews.growth}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Total: {analytics.analytics.reviews.total}
                  </p>
                </div>

                {/* Products Analytics */}
                {analytics.analytics.products && (
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.analytics.products.active}
                    </p>
                    <p className="text-sm text-gray-600">Active Products</p>
                    <p className="text-xs text-green-600 mt-1">
                      {analytics.analytics.products.growth}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Total: {analytics.analytics.products.total}
                    </p>
                  </div>
                )}

                {/* Orders Analytics */}
                {analytics.analytics.orders && (
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <CreditCard className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.analytics.orders.recent}
                    </p>
                    <p className="text-sm text-gray-600">Recent Orders</p>
                    <p className="text-xs text-green-600 mt-1">
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
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
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
                          <span className="text-gray-900">{activity.description}</span>
                        </div>
                        <span className="text-sm text-gray-500">{activity.timestamp}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Notifications */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.length > 0 ? (
                  quickActions.map((action) => (
                    <Link key={action.id} to={action.link}>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        disabled={!action.enabled}
                      >
                        {getIconComponent(action.icon)}
                        {action.label}
                        {action.badge && (
                          <Badge 
                            variant="secondary" 
                            className={`ml-auto ${
                              action.badgeColor === 'green' ? 'bg-green-100 text-green-800' :
                              action.badgeColor === 'red' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {action.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-2">No quick actions available</p>
                )}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
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
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Helper function to get icon components
const getIconComponent = (iconName: string) => {
  const iconProps = { className: "h-4 w-4 mr-2" };
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
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-6 w-32" />
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
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