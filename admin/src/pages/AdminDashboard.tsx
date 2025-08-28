import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Store, 
  CheckCircle, 
  Clock, 
  Package,
  ShoppingCart,
  Activity,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  MoreVertical,
  Eye,
  Settings,
  FileText,
  MessageSquare,
  Zap
} from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { adminAPI } from '../lib/api';
import { toast } from 'sonner';

interface DashboardStats {
  totalUsers: number;
  totalMerchants: number;
  verifiedMerchants: number;
  pendingVerifications: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentUsers: number;
  recentMerchants: number;
  userGrowth: number;
  merchantGrowth: number;
}

interface RecentActivity {
  id: string;
  type: 'user_signup' | 'merchant_registration' | 'merchant_verified' | 'product_added' | 'review_posted' | 'verification_request';
  description: string;
  timestamp: string;
  user?: string;
  details?: any;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Navigation functions
  // const navigateTo = (path: string) => { // Commented out for build optimization
  //   navigate(path);
  // };

  // Quick action functions
  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'refresh_all':
          await loadDashboardData();
          toast.success('Dashboard refreshed successfully');
          break;
        case 'view_pending_merchants':
          navigate('/merchants');
          break;
        case 'view_all_users':
          navigate('/users');
          break;
        case 'view_products':
          navigate('/products');
          break;
        case 'view_analytics':
          navigate('/analytics');
          break;
        case 'view_flash_sales':
          navigate('/flash-sales');
          break;
        case 'system_settings':
          navigate('/settings');
          break;
        default:
          toast.info(`${action} functionality will be implemented soon`);
      }
    } catch (error) {
      console.error('Quick action error:', error);
      toast.error('Action failed');
    }
  };

  // Activity action handler
  const handleActivityAction = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'user_signup':
        navigate('/users');
        break;
      case 'merchant_registration':
      case 'merchant_verified':
        navigate('/merchants');
        break;
      case 'product_added':
        navigate('/products');
        break;
      case 'review_posted':
        navigate('/reviews');
        break;
      default:
        toast.info('View detailed information');
    }
  };

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      const [statsResponse, activityResponse] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getRecentActivity(10)
      ]);

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      if (activityResponse.data.success) {
        setRecentActivity(activityResponse.data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_signup': return <Users className="h-4 w-4 text-blue-500" />;
      case 'merchant_registration': return <Store className="h-4 w-4 text-green-500" />;
      case 'merchant_verified': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'product_added': return <Package className="h-4 w-4 text-purple-500" />;
      case 'review_posted': return <MessageSquare className="h-4 w-4 text-yellow-500" />;
      case 'verification_request': return <FileText className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const StatCard = ({ title, value, icon: Icon, growth, color = "blue" }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    growth?: number;
    color?: string;
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {growth !== undefined && (
            <div className="flex items-center mt-2">
              {growth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(growth)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.firstName}! Here's what's happening with your platform.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Users"
          value={formatNumber(stats?.totalUsers || 0)}
          icon={Users}
          growth={stats?.userGrowth}
          color="blue"
        />
        <StatCard
          title="Total Merchants"
          value={formatNumber(stats?.totalMerchants || 0)}
          icon={Store}
          growth={stats?.merchantGrowth}
          color="green"
        />
        <StatCard
          title="Verified Merchants"
          value={formatNumber(stats?.verifiedMerchants || 0)}
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Pending Verifications"
          value={formatNumber(stats?.pendingVerifications || 0)}
          icon={Clock}
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Products"
          value={formatNumber(stats?.totalProducts || 0)}
          icon={Package}
          color="purple"
        />
        <StatCard
          title="Active Products"
          value={formatNumber(stats?.activeProducts || 0)}
          icon={Activity}
          color="indigo"
        />
        <StatCard
          title="Total Orders"
          value={formatNumber(stats?.totalOrders || 0)}
          icon={ShoppingCart}
          color="pink"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={DollarSign}
          color="yellow"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6 space-y-4">
              <button 
                onClick={() => handleQuickAction('view_pending_merchants')}
                className="w-full flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="font-medium text-green-900">Review Verifications</span>
                </div>
                <span className="bg-green-200 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {stats?.pendingVerifications || 0}
                </span>
              </button>
              
              <button 
                onClick={() => handleQuickAction('view_all_users')}
                className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium text-blue-900">Manage Users</span>
                </div>
                <span className="bg-blue-200 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {stats?.recentUsers || 0} new
                </span>
              </button>
              
              <button 
                onClick={() => handleQuickAction('view_products')}
                className="w-full flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center">
                  <Store className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="font-medium text-purple-900">Manage Products</span>
                </div>
                <span className="bg-purple-200 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {stats?.totalProducts || 0}
                </span>
              </button>
              
              <button 
                onClick={() => handleQuickAction('view_analytics')}
                className="w-full flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <div className="flex items-center">
                  <Zap className="h-5 w-5 text-orange-600 mr-3" />
                  <span className="font-medium text-orange-900">View Analytics</span>
                </div>
                <span className="bg-orange-200 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Live
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              <button 
                onClick={() => handleQuickAction('view_analytics')}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View all
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    onClick={() => handleActivityAction(activity)}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.timestamp}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <button className="text-gray-400 hover:text-gray-600">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Status</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-green-400 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">API Status</p>
                <p className="text-sm text-gray-500">All systems operational</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 bg-green-400 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className="text-sm text-gray-500">Connected and healthy</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 bg-yellow-400 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Email Service</p>
                <p className="text-sm text-gray-500">Minor delays</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
