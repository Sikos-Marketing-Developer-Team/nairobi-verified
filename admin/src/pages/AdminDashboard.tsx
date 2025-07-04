import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Store, 
  CheckCircle, 
  Clock, 
  Package,
  ShoppingCart,
  Activity,
  DollarSign,
  LogOut,
  Bell,
  RefreshCw
} from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { adminAPI } from '../lib/api';
import { DashboardStats, VerificationRequest, User, Merchant } from '../types';
import { toast } from 'sonner';

// Utility functions
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(amount);
};

const getPercentageColor = (percentage: number) => {
  return percentage >= 0 ? 'text-green-600' : 'text-red-600';
};

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentVerifications, setRecentVerifications] = useState<VerificationRequest[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentMerchants, setRecentMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, verificationsResponse, usersResponse, merchantsResponse] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getPendingVerifications(),
        adminAPI.getUsers({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        adminAPI.getMerchants({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })
      ]);

      setStats(statsResponse.data.data);
      setRecentVerifications(verificationsResponse.data.data.slice(0, 5));
      setRecentUsers(usersResponse.data.data);
      setRecentMerchants(merchantsResponse.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader user={user} onLogout={logout} />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} onLogout={logout} onRefresh={handleRefresh} refreshing={refreshing} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.firstName}! Here's what's happening with your platform.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            growth={stats?.userGrowth}
            icon={Users}
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
          />
          <StatCard
            title="Total Merchants"
            value={stats?.totalMerchants || 0}
            growth={stats?.merchantGrowth}
            icon={Store}
            iconColor="text-green-600"
            iconBg="bg-green-100"
          />
          <StatCard
            title="Verified Merchants"
            value={stats?.verifiedMerchants || 0}
            icon={CheckCircle}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-100"
          />
          <StatCard
            title="Pending Verifications"
            value={stats?.pendingVerifications || 0}
            icon={Clock}
            iconColor="text-amber-600"
            iconBg="bg-amber-100"
          />
          <StatCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            icon={Package}
            iconColor="text-purple-600"
            iconBg="bg-purple-100"
          />
          <StatCard
            title="Active Flash Sales"
            value={stats?.activeFlashSales || 0}
            icon={Activity}
            iconColor="text-red-600"
            iconBg="bg-red-100"
          />
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            icon={ShoppingCart}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-100"
          />
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(stats?.monthlyRevenue || 0)}
            icon={DollarSign}
            iconColor="text-green-600"
            iconBg="bg-green-100"
          />
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Verifications */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Verifications</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {recentVerifications.map((verification) => (
                  <div key={verification.id} className="p-6 flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{verification.merchant.businessName}</h4>
                      <p className="text-sm text-gray-500">
                        Submitted {new Date(verification.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        verification.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : verification.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {verification.status}
                      </span>
                      <button className="text-sm font-medium text-green-600 hover:text-green-500">
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        New user registered
                      </p>
                    </div>
                  </div>
                ))}
                {recentMerchants.map((merchant) => (
                  <div key={merchant.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Store className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {merchant.businessName}
                      </p>
                      <p className="text-xs text-gray-500">
                        New merchant registered
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number | string;
  growth?: {
    current: number;
    previous: number;
    percentage: number;
  };
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, growth, icon: Icon, iconColor, iconBg }) => {
  const formatValue = (val: number | string) => {
    if (typeof val === 'number') {
      return formatNumber(val);
    }
    return val;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{formatValue(value)}</p>
          {growth && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${getPercentageColor(growth.percentage)}`}>
                {growth.percentage > 0 ? '+' : ''}{growth.percentage.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-2">from last month</span>
            </div>
          )}
        </div>
        <div className={`${iconBg} p-3 rounded-full`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

interface AdminHeaderProps {
  user: any;
  onLogout: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ user, onLogout, onRefresh, refreshing }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Admin</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
            
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Bell className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminDashboard;
