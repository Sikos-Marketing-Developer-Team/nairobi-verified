
import React, { useState, useEffect } from 'react';
import { Eye, Edit, Users, Clock, CheckCircle, AlertCircle, MessageSquare, 
         BarChart3, TrendingUp, Phone, MapPin, Heart, Calendar, Settings, 
         Bell, Package, CreditCard, Star, Mail, Shield, Download, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';
import { Link } from 'react-router-dom';
import { usePageLoading } from '@/hooks/use-loading';
import { DashboardSkeleton, PageSkeleton } from '@/components/ui/loading-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

const MerchantDashboard = () => {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days'>('30days');
  const [merchantData, setMerchantData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLoading = usePageLoading(600);

  useEffect(() => {
    fetchMerchantData();
  }, []);

  const fetchMerchantData = async () => {
    try {
      // In a real app, this would fetch from the API
      // For now, we'll simulate with enhanced mock data
      setTimeout(() => {
        setMerchantData({
          businessName: 'TechHub Kenya',
          email: 'info@techhublenya.com',
          phone: '+254712345678',
          verificationStatus: 'verified',
          subscriptionPlan: 'premium',
          subscriptionExpiry: '2024-12-31',
          profileCompletion: 92,
          rating: 4.8,
          totalReviews: 157,
          featured: true,
          profileViews: {
            total: 1247,
            today: 42,
            week: 287,
            month: 1247,
            trend: '+15%'
          },
          searchAppearances: {
            total: 3568,
            today: 115,
            week: 876,
            month: 3568,
            trend: '+8%'
          },
          contactClicks: {
            total: 45,
            today: 3,
            week: 18,
            month: 45,
            trend: '+22%'
          },
          directionsRequests: {
            total: 78,
            today: 5,
            week: 32,
            month: 78,
            trend: '+12%'
          },
          favorites: {
            total: 23,
            today: 2,
            week: 8,
            month: 23,
            trend: '+35%'
          },
          revenue: {
            total: 45000,
            today: 1200,
            week: 8500,
            month: 45000,
            trend: '+18%'
          },
          orders: {
            total: 89,
            pending: 5,
            completed: 84,
            cancelled: 3
          },
          products: {
            total: 24,
            active: 22,
            inactive: 2,
            outOfStock: 1
          },
          dailyViews: [12, 18, 22, 15, 35, 42, 38],
          weeklyViews: [145, 132, 164, 187, 213, 287, 254],
          monthlyViews: [320, 354, 412, 387, 476, 523, 612, 587, 642, 721, 834, 1247],
          topReferrers: [
            { source: 'Direct Search', count: 523 },
            { source: 'Category Browse', count: 312 },
            { source: 'Map View', count: 245 },
            { source: 'Featured Section', count: 167 }
          ],
          upcomingTasks: [
            { task: 'Update inventory', priority: 'high', dueDate: '2024-01-15' },
            { task: 'Respond to customer reviews', priority: 'medium', dueDate: '2024-01-16' },
            { task: 'Renew subscription', priority: 'high', dueDate: '2024-01-20' }
          ]
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load merchant data');
      setLoading(false);
    }
  };

  const handleSendCredentials = async () => {
    try {
      const response = await fetch('/api/merchants/send-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: merchantData.email,
          businessName: merchantData.businessName
        })
      });
      
      if (response.ok) {
        alert('Login credentials sent to your email successfully!');
      } else {
        alert('Failed to send credentials. Please try again.');
      }
    } catch (error) {
      alert('Error sending credentials. Please try again.');
    }
  };

  const notifications = [
    {
      id: 1,
      type: 'info',
      message: 'Your profile has been viewed 15 times today',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'success',
      message: 'Verification completed successfully!',
      time: '1 day ago'
    },
    {
      id: 3,
      type: 'warning',
      message: 'Consider adding more photos to your profile',
      time: '3 days ago'
    }
  ];

  const recentActivity = [
    { action: 'Profile viewed by customer', time: '30 minutes ago' },
    { action: 'Directions requested', time: '1 hour ago' },
    { action: 'Contact information clicked', time: '2 hours ago' },
    { action: 'Added to favorites', time: '3 hours ago' }
  ];

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <PageSkeleton>
          <DashboardSkeleton />
        </PageSkeleton>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!merchantData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>Loading merchant data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {merchantData.businessName}!
              </h1>
              <p className="text-gray-600 mt-2">Manage your business profile and track performance</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleSendCredentials} variant="outline" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Send Login Credentials
              </Button>
              <Button asChild>
                <Link to="/merchant/profile/edit">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
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
                  merchantData.verificationStatus === 'verified' 
                    ? 'bg-green-100' 
                    : 'bg-amber-100'
                }`}>
                  <CheckCircle className={`h-6 w-6 ${
                    merchantData.verificationStatus === 'verified' 
                      ? 'text-green-600' 
                      : 'text-amber-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {merchantData.verificationStatus === 'verified' ? 'Verified Business' : 'Verification Pending'}
                  </h3>
                  <p className="text-gray-600">
                    {merchantData.verificationStatus === 'verified' 
                      ? 'Your business is verified and visible to customers' 
                      : 'Your verification is being reviewed by our team'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {merchantData.featured && (
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
                    style={{ width: `${merchantData.profileCompletion}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {merchantData.profileCompletion}% complete
                </p>
              </div>
              <Link to="/merchant/profile/edit">
                <Button className="ml-6 bg-primary hover:bg-primary-dark">
                  Complete Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Tabs */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Performance Analytics</CardTitle>
              <Select value={timeRange} onValueChange={(value: '7days' | '30days' | '90days') => setTimeRange(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              Track your business performance and customer engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="views">Profile Views</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="referrals">Traffic Sources</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {timeRange === '7days' ? merchantData.profileViews.week : 
                       timeRange === '30days' ? merchantData.profileViews.month : 
                       merchantData.profileViews.total}
                    </p>
                    <p className="text-sm text-gray-600">Profile Views</p>
                    <p className="text-xs text-green-600 mt-1">{merchantData.profileViews.trend}</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Phone className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {timeRange === '7days' ? merchantData.contactClicks.week : 
                       timeRange === '30days' ? merchantData.contactClicks.month : 
                       merchantData.contactClicks.total}
                    </p>
                    <p className="text-sm text-gray-600">Contact Clicks</p>
                    <p className="text-xs text-green-600 mt-1">{merchantData.contactClicks.trend}</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {timeRange === '7days' ? merchantData.directionsRequests.week : 
                       timeRange === '30days' ? merchantData.directionsRequests.month : 
                       merchantData.directionsRequests.total}
                    </p>
                    <p className="text-sm text-gray-600">Directions</p>
                    <p className="text-xs text-green-600 mt-1">{merchantData.directionsRequests.trend}</p>
                  </div>
                  
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {timeRange === '7days' ? merchantData.favorites.week : 
                       timeRange === '30days' ? merchantData.favorites.month : 
                       merchantData.favorites.total}
                    </p>
                    <p className="text-sm text-gray-600">Favorites</p>
                    <p className="text-xs text-green-600 mt-1">{merchantData.favorites.trend}</p>
                  </div>
                </div>
                
                {/* Chart Placeholder */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Profile views over time</p>
                    <p className="text-sm text-gray-400">
                      {timeRange === '7days' ? 'Last 7 days' : 
                       timeRange === '30days' ? 'Last 30 days' : 
                       'Last 90 days'}
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              {/* Profile Views Tab */}
              <TabsContent value="views">
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Total Profile Views</h3>
                      <p className="text-sm text-gray-600">People who viewed your business profile</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">
                        {timeRange === '7days' ? merchantData.profileViews.week : 
                         timeRange === '30days' ? merchantData.profileViews.month : 
                         merchantData.profileViews.total}
                      </p>
                      <p className="text-sm text-green-600">{merchantData.profileViews.trend} from previous period</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Search Appearances</h3>
                      <p className="text-sm text-gray-600">Times your business appeared in search results</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">
                        {timeRange === '7days' ? merchantData.searchAppearances.week : 
                         timeRange === '30days' ? merchantData.searchAppearances.month : 
                         merchantData.searchAppearances.total}
                      </p>
                      <p className="text-sm text-green-600">{merchantData.searchAppearances.trend} from previous period</p>
                    </div>
                  </div>
                  
                  {/* Chart Placeholder */}
                  <div className="bg-gray-50 rounded-lg p-4 h-64 flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Profile views trend</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Engagement Tab */}
              <TabsContent value="engagement">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <Phone className="h-6 w-6 text-green-600 mb-2" />
                    <h3 className="font-medium text-gray-900">Contact Clicks</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {timeRange === '7days' ? merchantData.contactClicks.week : 
                       timeRange === '30days' ? merchantData.contactClicks.month : 
                       merchantData.contactClicks.total}
                    </p>
                    <p className="text-sm text-green-600 mt-1">{merchantData.contactClicks.trend}</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <MapPin className="h-6 w-6 text-purple-600 mb-2" />
                    <h3 className="font-medium text-gray-900">Direction Requests</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {timeRange === '7days' ? merchantData.directionsRequests.week : 
                       timeRange === '30days' ? merchantData.directionsRequests.month : 
                       merchantData.directionsRequests.total}
                    </p>
                    <p className="text-sm text-green-600 mt-1">{merchantData.directionsRequests.trend}</p>
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg mb-6">
                  <Heart className="h-6 w-6 text-red-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Saved to Favorites</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {timeRange === '7days' ? merchantData.favorites.week : 
                     timeRange === '30days' ? merchantData.favorites.month : 
                     merchantData.favorites.total}
                  </p>
                  <p className="text-sm text-green-600 mt-1">{merchantData.favorites.trend}</p>
                </div>
                
                {/* Chart Placeholder */}
                <div className="bg-gray-50 rounded-lg p-4 h-48 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Engagement metrics comparison</p>
                  </div>
                </div>
              </TabsContent>
              
              {/* Traffic Sources Tab */}
              <TabsContent value="referrals">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Top Traffic Sources</h3>
                  
                  {merchantData.topReferrers.map((referrer, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{referrer.source}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{referrer.count} views</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${(referrer.count / merchantData.topReferrers[0].count) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Chart Placeholder */}
                  <div className="bg-gray-50 rounded-lg p-4 h-64 flex items-center justify-center mt-6">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Traffic sources distribution</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900">{activity.action}</span>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </div>
                  ))}
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
                <Link to="/merchant/profile/edit">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
                
                <Link to={`/merchant/${merchantData.businessName}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    View Public Profile
                  </Button>
                </Link>
                
                <Link to="/merchant/verification">
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verification Status
                  </Button>
                </Link>
                
                <Link to="/merchant/calendar">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Manage Calendar
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-3 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className={`p-1 rounded-full ${
                          notification.type === 'success' ? 'bg-green-100' :
                          notification.type === 'warning' ? 'bg-amber-100' :
                          'bg-blue-100'
                        }`}>
                          {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {notification.type === 'warning' && <AlertCircle className="h-4 w-4 text-amber-600" />}
                          {notification.type === 'info' && <Eye className="h-4 w-4 text-blue-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;
