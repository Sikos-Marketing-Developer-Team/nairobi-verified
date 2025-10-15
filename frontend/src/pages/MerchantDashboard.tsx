// src/pages/merchant/MerchantDashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  Eye, Edit, Users, Clock, CheckCircle, AlertCircle, MessageSquare, 
  BarChart3, TrendingUp, Phone, MapPin, Heart, Calendar, Settings, 
  Bell, Package, CreditCard, Star, Mail, Shield, Download, Award,
  RefreshCw, Store, Activity, DollarSign, ArrowUpRight, ArrowDownRight,
  Plus, Image, Share2, Target, Zap, Sparkles
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

  // Handle View Profile - Open in new tab with proper authentication
  const handleViewProfile = () => {
    if (!overview) return;
    
    // Create a new tab with the merchant public URL
    const publicUrl = `/merchant/${overview.merchant.id}`;
    window.open(publicUrl, '_blank', 'noopener,noreferrer');
    
    toast({
      title: 'Opening Public Profile',
      description: 'Your public profile is opening in a new tab',
    });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header with Gradient */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h1 className="text-3xl font-bold">
                    Welcome back, {overview.merchant.businessName}!
                  </h1>
                </div>
                <p className="text-blue-100 text-lg">Manage your business and grow your success</p>
                <div className="flex items-center gap-6 mt-4 text-blue-100">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span>{overview.merchant.rating} rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>{overview.merchant.totalReviews} reviews</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Member since {new Date(overview.merchant.memberSince).getFullYear()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleSendCredentials} 
                  variant="secondary" 
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Credentials
                </Button>
                <Button 
                  onClick={handleRefresh} 
                  variant="secondary" 
                  disabled={refreshing}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Verification Status */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${
                    overview.verificationStatus.isVerified 
                      ? 'bg-gradient-to-br from-green-400 to-green-600' 
                      : 'bg-gradient-to-br from-amber-400 to-orange-500'
                  } shadow-lg`}>
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">
                      {overview.verificationStatus.verificationBadge}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {overview.verificationStatus.statusMessage}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {overview.verificationStatus.isFeatured && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 mb-2">
                      <Award className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Completion */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900">Profile Completion</h3>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 h-4 rounded-full transition-all duration-500 shadow-lg"
                        style={{ width: `${overview.profileCompletion.percentage}%` }}
                      ></div>
                    </div>
                    <span className="absolute right-0 -top-8 text-sm font-semibold text-purple-600">
                      {overview.profileCompletion.percentage}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    {overview.profileCompletion.percentage}% complete • {overview.profileCompletion.nextSteps.length} steps remaining
                  </p>
                </div>
                <Link to="/merchant/profile/edit">
                  <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Actions Section - FIXED */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Edit Profile */}
          <Link to="/merchant/profile/edit">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Edit Profile</h3>
                    <p className="text-blue-100 text-sm mt-1">Update your business info</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                    <Edit className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* View Profile - FIXED: Using onClick handler */}
          <Card 
            onClick={handleViewProfile}
            className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">View Profile</h3>
                  <p className="text-green-100 text-sm mt-1">See your public page</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                  <Eye className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Products - FIXED: Added proper link */}
          <Link to="/merchant/products">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Add Products</h3>
                    <p className="text-purple-100 text-sm mt-1">Showcase your items</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                    <Plus className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Upload Photos - FIXED: Added proper link */}
          <Link to="/merchant/gallery">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Upload Photos</h3>
                    <p className="text-orange-100 text-sm mt-1">Add business images</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                    <Image className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Analytics Section */}
        {analytics && (
          <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Performance Analytics
                </CardTitle>
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
                <div className="text-center p-6 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-xl shadow-lg">
                  <div className="p-3 bg-white/20 rounded-xl mx-auto w-fit mb-3">
                    <Star className="h-8 w-8" />
                  </div>
                  <p className="text-3xl font-bold mb-1">
                    {analytics.analytics.reviews.recent}
                  </p>
                  <p className="text-blue-100">New Reviews</p>
                  <p className="text-sm bg-white/20 px-2 py-1 rounded-full mt-2 inline-block">
                    {analytics.analytics.reviews.growth}
                  </p>
                  <p className="text-blue-100 mt-2">
                    Total: {analytics.analytics.reviews.total}
                  </p>
                </div>

                {/* Products Analytics */}
                {analytics.analytics.products && (
                  <div className="text-center p-6 bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-xl shadow-lg">
                    <div className="p-3 bg-white/20 rounded-xl mx-auto w-fit mb-3">
                      <Package className="h-8 w-8" />
                    </div>
                    <p className="text-3xl font-bold mb-1">
                      {analytics.analytics.products.active}
                    </p>
                    <p className="text-green-100">Active Products</p>
                    <p className="text-sm bg-white/20 px-2 py-1 rounded-full mt-2 inline-block">
                      {analytics.analytics.products.growth}
                    </p>
                    <p className="text-green-100 mt-2">
                      Total: {analytics.analytics.products.total}
                    </p>
                  </div>
                )}

                {/* Orders Analytics */}
                {analytics.analytics.orders && (
                  <div className="text-center p-6 bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-xl shadow-lg">
                    <div className="p-3 bg-white/20 rounded-xl mx-auto w-fit mb-3">
                      <CreditCard className="h-8 w-8" />
                    </div>
                    <p className="text-3xl font-bold mb-1">
                      {analytics.analytics.orders.recent}
                    </p>
                    <p className="text-purple-100">Recent Orders</p>
                    <p className="text-sm bg-white/20 px-2 py-1 rounded-full mt-2 inline-block">
                      {analytics.analytics.orders.growth}
                    </p>
                    <p className="text-purple-100 mt-2">
                      Revenue: {analytics.analytics.orders.revenue.current.toLocaleString()} {analytics.analytics.orders.revenue.currency}
                    </p>
                  </div>
                )}
              </div>

              {/* Enhanced Chart Placeholder */}
              <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 h-64 flex items-center justify-center border border-gray-200">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl mx-auto w-fit mb-4">
                    <BarChart3 className="h-12 w-12 text-white" />
                  </div>
                  <p className="text-gray-600 font-medium">Performance Chart</p>
                  <p className="text-gray-500 text-sm">Detailed analytics for {analytics.period.toLowerCase()}</p>
                  <Button className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                    View Detailed Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.length > 0 ? (
                    activities.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl shadow-md ${
                            activity.type === 'review' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                            activity.type === 'product' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                            activity.type === 'order' ? 'bg-gradient-to-br from-purple-400 to-purple-600' : 'bg-gradient-to-br from-gray-400 to-gray-600'
                          }`}>
                            {activity.type === 'review' && <Star className="h-5 w-5 text-white" />}
                            {activity.type === 'product' && <Package className="h-5 w-5 text-white" />}
                            {activity.type === 'order' && <CreditCard className="h-5 w-5 text-white" />}
                          </div>
                          <div>
                            <span className="text-gray-900 font-medium">{activity.description}</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">{activity.timestamp}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="p-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl mx-auto w-fit mb-4">
                        <Activity className="h-12 w-12 text-white" />
                      </div>
                      <p className="text-gray-500 font-medium">No recent activity</p>
                      <p className="text-gray-400 text-sm">Your activities will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.length > 0 ? (
                  quickActions.map((action) => (
                    <Link key={action.id} to={action.link}>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 border-gray-200 hover:border-blue-300 transition-all duration-300"
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
                  <div className="text-center py-6">
                    <div className="p-3 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl mx-auto w-fit mb-3">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-gray-500 text-sm">No quick actions available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Notifications */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-purple-600" />
                    Notifications
                  </span>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <Badge className="bg-gradient-to-r from-red-400 to-red-600 text-white">
                      {notifications.filter(n => !n.read).length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 4).map((notification) => (
                      <div key={notification.id} className={`p-4 rounded-xl transition-all duration-300 ${
                        !notification.read 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500' 
                          : 'bg-gradient-to-r from-gray-50 to-gray-100'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            notification.type === 'success' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                            notification.type === 'warning' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                            'bg-gradient-to-br from-blue-400 to-blue-600'
                          }`}>
                            {getIconComponent(notification.icon)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-3 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl mx-auto w-fit mb-3">
                        <Bell className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-gray-500 font-medium">No notifications</p>
                      <p className="text-gray-400 text-xs">We'll notify you of important updates</p>
                    </div>
                  )}
                </div>
                {notifications.length > 4 && (
                  <Button variant="outline" className="w-full mt-4 text-sm">
                    View All Notifications
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Profile Completion Tips */}
            {overview.profileCompletion.nextSteps.length > 0 && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-400 to-pink-500 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Complete Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-white/20 rounded-lg p-3">
                      <p className="text-sm font-medium">
                        {overview.profileCompletion.percentage}% Complete
                      </p>
                      <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-500"
                          style={{ width: `${overview.profileCompletion.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {overview.profileCompletion.nextSteps.slice(0, 3).map((step, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                    <Link to="/merchant/profile/edit">
                      <Button className="w-full mt-4 bg-white text-orange-600 hover:bg-gray-100 font-medium">
                        Complete Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
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