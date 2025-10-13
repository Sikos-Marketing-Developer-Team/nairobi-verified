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
  useEffect(() => {
    console.log('🔍 MERCHANT DASHBOARD DEBUG:', {
      user: Users,
      isAuthenticated: isAuthenticated,
      userRole: user?.role,
      userEmail: user?.email,
      userId: user?.id,
      isMerchant: user?.isMerchant,
      businessName: user?.businessName,
      // Check if user has merchant properties
      hasMerchantProps: user && (user.businessName || user.isMerchant)
    });
  }, [user, isAuthenticated]);
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [overview, setOverview] = useState<MerchantOverview | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ADDED: Debug logging to see user context
  useEffect(() => {
    console.log('🔍 MerchantDashboard User Context:', {
      user,
      isAuthenticated,
      userRole: user?.role,
      userEmail: user?.email,
      userBusinessName: user?.businessName
    });
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, timeRange]);

  // FIXED: Using your actual API endpoints with proper fetch calls
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🚀 Starting to fetch dashboard data from API endpoints...');
      
      await Promise.all([
        fetchOverview(),
        fetchAnalytics(),
        fetchActivity(),
        fetchNotifications(),
        fetchQuickActions()
      ]);
      
      console.log('✅ All dashboard data fetched successfully');
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
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

  // FIXED: Using your actual /api/merchants/dashboard/overview endpoint
  const fetchOverview = async () => {
    try {
      console.log('🔄 Fetching overview from /api/merchants/dashboard/overview...');
      
      const response = await fetch('/api/merchants/dashboard/overview', {
        method: 'GET',
        credentials: 'include' // Important for session cookies
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Overview API response:', result);

      if (result.success && result.data) {
        setOverview(result.data);
        console.log('📊 Overview data set:', result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch merchant data');
      }
    } catch (error: any) {
      console.error('💥 Overview fetch failed:', error);
      
      // Check if it's a "no merchant found" scenario
      if (error.message?.includes('not found') || error.message?.includes('404')) {
        console.log('👤 No merchant account found for user');
        setOverview(null);
      } else {
        throw error;
      }
    }
  };

  // FIXED: Using your actual /api/merchants/dashboard/analytics endpoint
  const fetchAnalytics = async () => {
    try {
      console.log('🔄 Fetching analytics from /api/merchants/dashboard/analytics...');
      
      const response = await fetch(`/api/merchants/dashboard/analytics?period=${timeRange}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Analytics API response:', result);

      if (result.success) {
        setAnalytics(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('💥 Analytics fetch failed:', error);
      // Set empty analytics if not available
      setAnalytics({
        period: `Last ${timeRange} days`,
        analytics: {
          reviews: { total: 0, recent: 0, growth: '0%' }
        }
      });
    }
  };

  // FIXED: Using your actual /api/merchants/dashboard/activity endpoint
  const fetchActivity = async () => {
    try {
      console.log('🔄 Fetching activity from /api/merchants/dashboard/activity...');
      
      const response = await fetch('/api/merchants/dashboard/activity?limit=5', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Activity API response:', result);

      if (result.success) {
        setActivities(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch activity');
      }
    } catch (error) {
      console.error('💥 Activity fetch failed:', error);
      setActivities([]);
    }
  };

  // FIXED: Using your actual /api/merchants/dashboard/notifications endpoint
  const fetchNotifications = async () => {
    try {
      console.log('🔄 Fetching notifications from /api/merchants/dashboard/notifications...');
      
      const response = await fetch('/api/merchants/dashboard/notifications', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Notifications API response:', result);

      if (result.success) {
        setNotifications(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('💥 Notifications fetch failed:', error);
      setNotifications([]);
    }
  };

  // FIXED: Using your actual /api/merchants/dashboard/quick-actions endpoint
  const fetchQuickActions = async () => {
    try {
      console.log('🔄 Fetching quick actions from /api/merchants/dashboard/quick-actions...');
      
      const response = await fetch('/api/merchants/dashboard/quick-actions', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Quick actions API response:', result);

      if (result.success) {
        setQuickActions(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch quick actions');
      }
    } catch (error) {
      console.error('💥 Quick actions fetch failed:', error);
      // Create fallback quick actions
      const fallbackActions: QuickAction[] = [
        {
          id: 'edit_profile',
          label: 'Edit Profile',
          icon: 'edit',
          link: '/merchant/profile/edit',
          enabled: true,
          badge: overview?.profileCompletion.percentage === 100 ? 'Complete' : 'Incomplete',
          badgeColor: overview?.profileCompletion.percentage === 100 ? 'green' : 'red'
        },
        {
          id: 'verification',
          label: 'Verification',
          icon: 'shield',
          link: '/merchant/verification',
          enabled: true,
          badge: overview?.verificationStatus.isVerified ? 'Verified' : 'Pending',
          badgeColor: overview?.verificationStatus.isVerified ? 'green' : 'red'
        }
      ];
      setQuickActions(fallbackActions);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleSendCredentials = async () => {
    if (!overview) return;
    
    try {
      toast({
        title: 'Info',
        description: 'This feature is coming soon!',
      });
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
            <Button onClick={() => window.location.href = '/auth'}>
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
          <div className="text-center max-w-2xl mx-auto">
            <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Merchant Account Found</h1>
            <p className="text-gray-600 mb-6">
              {user?.role === 'merchant' || user?.role === 'admin' 
                ? "Your account has merchant privileges but no merchant profile has been created yet."
                : "You need to create a merchant account to access the dashboard."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = '/auth/register/merchant'}
                className="bg-primary hover:bg-primary-dark"
              >
                Create Merchant Account
              </Button>
              <Button 
                variant="outline"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Again
              </Button>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
              <h3 className="font-semibold text-blue-900 mb-2">Troubleshooting Tips:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Make sure you're logged in with the correct account</li>
                <li>• Refresh the page to check for recent account changes</li>
                <li>• Contact support if you believe this is an error</li>
              </ul>
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
                              action.badgeColor === 'orange' ? 'bg-orange-100 text-orange-800' :
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

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-sm z-50">
            <h4 className="font-bold mb-2">Dashboard Debug Info:</h4>
            <p>User Role: {user?.role}</p>
            <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p>Merchant Data: {overview ? 'Loaded' : 'Not Found'}</p>
            <p>Analytics: {analytics ? 'Loaded' : 'Not Loaded'}</p>
            <button 
              onClick={() => {
                console.log('Full dashboard debug info:', { 
                  user, 
                  overview, 
                  analytics,
                  activities,
                  notifications,
                  quickActions
                });
              }}
              className="mt-2 bg-blue-500 px-2 py-1 rounded text-xs"
            >
              Log Details
            </button>
          </div>
        )}
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
    case 'clock': return <Clock {...iconProps} />;
    case 'calendar': return <Calendar {...iconProps} />;
    case 'message-square': return <MessageSquare {...iconProps} />;
    case 'package': return <Package {...iconProps} />;
    case 'credit-card': return <CreditCard {...iconProps} />;
    case 'settings': return <Settings {...iconProps} />;
    case 'bell': return <Bell {...iconProps} />;
    case 'shield': return <Shield {...iconProps} />;
    case 'download': return <Download {...iconProps} />;
    case 'help-circle': return <AlertCircle {...iconProps} />;
    case 'alert-circle': return <AlertCircle {...iconProps} />;
    case 'info': return <AlertCircle {...iconProps} />;
    case 'star': return <Star {...iconProps} />;
    case 'file-text': return <Edit {...iconProps} />;
    default: return <Settings {...iconProps} />;
  }
};

// Loading Skeleton (keep your existing skeleton)
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