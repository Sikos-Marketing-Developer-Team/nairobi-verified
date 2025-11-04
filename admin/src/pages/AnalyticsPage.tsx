import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Store, 
  Package, 
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Star,
  MapPin,
  ChevronDown,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '../lib/api';
import { AnalyticsData, DashboardStats } from '@/interfaces/AnalyticsPage';

const AnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    loadAnalytics();
    loadDashboardStats();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getAnalytics({ period: selectedPeriod });
      if (response.data.success) {
        setAnalyticsData(response.data.data);
      }
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      if (response.data.success) {
        setDashboardStats(response.data.data);
      }
    } catch (error: any) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadAnalytics(), loadDashboardStats()]);
    setIsRefreshing(false);
    toast.success('Analytics data refreshed');
  };

  const exportData = async (type: string) => {
    try {
      const response = await adminAPI.exportAnalytics(type);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-analytics-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`${type} data exported successfully`);
      setShowExportMenu(false);
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-green-500" />;
    } else if (growth < 0) {
      return <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4 text-red-500" />;
    }
    return <Activity className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading && !analyticsData) {
    return (
      <div className="px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-sm md:text-base text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg mb-4 md:mb-8 md:bg-transparent md:p-0">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-gray-700">Platform analytics and insights</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline ml-2">Refresh</span>
              </button>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => exportData('merchants')}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Store className="w-4 h-4 mr-2" />
                      Export Merchants
                    </button>
                    <button
                      onClick={() => exportData('users')}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Export Users
                    </button>
                    <button
                      onClick={() => exportData('analytics')}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Export Analytics
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      {dashboardStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-4 md:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Store className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
                </div>
                <div className="ml-3 md:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs md:text-sm font-medium text-gray-500 truncate">Merchants</dt>
                    <dd className="flex items-baseline">
                      <div className="text-lg md:text-2xl font-semibold text-gray-900">
                        {formatNumber(dashboardStats.totalMerchants)}
                      </div>
                      <div className={`ml-1 md:ml-2 flex items-baseline text-xs md:text-sm font-semibold ${getGrowthColor(dashboardStats.growth.merchantGrowth)}`}>
                        {getGrowthIcon(dashboardStats.growth.merchantGrowth)}
                        <span className="sr-only">
                          {dashboardStats.growth.merchantGrowth > 0 ? 'Increased' : 'Decreased'} by
                        </span>
                        {formatPercentage(dashboardStats.growth.merchantGrowth)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-4 md:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-green-400" />
                </div>
                <div className="ml-3 md:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs md:text-sm font-medium text-gray-500 truncate">Users</dt>
                    <dd className="flex items-baseline">
                      <div className="text-lg md:text-2xl font-semibold text-gray-900">
                        {formatNumber(dashboardStats.totalUsers)}
                      </div>
                      <div className={`ml-1 md:ml-2 flex items-baseline text-xs md:text-sm font-semibold ${getGrowthColor(dashboardStats.growth.userGrowth)}`}>
                        {getGrowthIcon(dashboardStats.growth.userGrowth)}
                        {formatPercentage(dashboardStats.growth.userGrowth)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-4 md:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-5 w-5 md:h-6 md:w-6 text-purple-400" />
                </div>
                <div className="ml-3 md:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs md:text-sm font-medium text-gray-500 truncate">Products</dt>
                    <dd className="flex items-baseline">
                      <div className="text-lg md:text-2xl font-semibold text-gray-900">
                        {formatNumber(dashboardStats.totalProducts)}
                      </div>
                      <div className="ml-1 md:ml-2 text-xs md:text-sm text-gray-500">
                        {dashboardStats.activeProducts} active
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-4 md:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Star className="h-5 w-5 md:h-6 md:w-6 text-yellow-400" />
                </div>
                <div className="ml-3 md:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs md:text-sm font-medium text-gray-500 truncate">Reviews</dt>
                    <dd className="flex items-baseline">
                      <div className="text-lg md:text-2xl font-semibold text-gray-900">
                        {formatNumber(dashboardStats.totalReviews)}
                      </div>
                      <div className={`ml-1 md:ml-2 flex items-baseline text-xs md:text-sm font-semibold ${getGrowthColor(dashboardStats.growth.reviewGrowth)}`}>
                        {getGrowthIcon(dashboardStats.growth.reviewGrowth)}
                        {formatPercentage(dashboardStats.growth.reviewGrowth)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-4 md:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-green-400" />
                </div>
                <div className="ml-3 md:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs md:text-sm font-medium text-gray-500 truncate">Verification Rate</dt>
                    <dd className="text-lg md:text-2xl font-semibold text-gray-900">
                      {dashboardStats.metrics.verificationRate}%
                    </dd>
                    <dd className="text-xs md:text-sm text-gray-500 mt-1">
                      {dashboardStats.verifiedMerchants} of {dashboardStats.totalMerchants} verified
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-4 md:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Star className="h-5 w-5 md:h-6 md:w-6 text-yellow-400" />
                </div>
                <div className="ml-3 md:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs md:text-sm font-medium text-gray-500 truncate">Average Rating</dt>
                    <dd className="text-lg md:text-2xl font-semibold text-gray-900">
                      {dashboardStats.metrics.averageRating.toFixed(1)}
                    </dd>
                    <dd className="text-xs md:text-sm text-gray-500 mt-1">
                      Based on {dashboardStats.totalReviews} reviews
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-4 md:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-5 w-5 md:h-6 md:w-6 text-purple-400" />
                </div>
                <div className="ml-3 md:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs md:text-sm font-medium text-gray-500 truncate">Products per Merchant</dt>
                    <dd className="text-lg md:text-2xl font-semibold text-gray-900">
                      {dashboardStats.metrics.productUploadRate}
                    </dd>
                    <dd className="text-xs md:text-sm text-gray-500 mt-1">
                      Average products uploaded
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts and Detailed Analytics */}
      {analyticsData && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Business Type Distribution */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-4 md:px-5 md:py-5 sm:p-6">
              <h3 className="text-base md:text-lg leading-6 font-medium text-gray-900 mb-3 md:mb-4">
                Business Type Distribution
              </h3>
              <div className="space-y-2 md:space-y-3">
                {analyticsData.businessTypeDistribution.map((item, index) => {
                  const total = analyticsData.businessTypeDistribution.reduce((sum, i) => sum + i.count, 0);
                  const percentage = ((item.count / total) * 100).toFixed(1);
                  const colors = ['bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-yellow-400', 'bg-red-400', 'bg-indigo-400'];
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full mr-2 md:mr-3 ${colors[index % 6]}`}></div>
                        <span className="text-xs md:text-sm font-medium text-gray-900 truncate">
                          {item._id || 'Other'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <span className="text-xs md:text-sm text-gray-500">{percentage}%</span>
                        <span className="text-xs md:text-sm font-medium text-gray-900">{item.count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-4 md:px-5 md:py-5 sm:p-6">
              <h3 className="text-base md:text-lg leading-6 font-medium text-gray-900 mb-3 md:mb-4">
                Geographic Distribution
              </h3>
              <div className="space-y-2 md:space-y-3">
                {analyticsData.geographicDistribution.slice(0, 8).map((item, index) => {
                  const total = analyticsData.geographicDistribution.reduce((sum, i) => sum + i.count, 0);
                  const percentage = ((item.count / total) * 100).toFixed(1);
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center min-w-0 flex-1">
                        <MapPin className="w-3 h-3 md:w-4 md:h-4 text-gray-400 mr-2" />
                        <span className="text-xs md:text-sm font-medium text-gray-900 truncate">
                          {item._id || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <span className="text-xs md:text-sm text-gray-500">{percentage}%</span>
                        <span className="text-xs md:text-sm font-medium text-gray-900">{item.count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Analytics */}
      {analyticsData && (
        <div className="bg-white shadow rounded-lg mb-6 md:mb-8">
          <div className="px-4 py-4 md:px-5 md:py-5 sm:p-6">
            <h3 className="text-base md:text-lg leading-6 font-medium text-gray-900 mb-3 md:mb-4">
              Review Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">Rating Distribution</h4>
                <div className="space-y-1 md:space-y-2">
                  {analyticsData.reviewAnalytics.ratingDistribution.map((rating) => {
                    const percentage = ((rating.count / analyticsData.reviewAnalytics.totalReviews) * 100).toFixed(1);
                    return (
                      <div key={rating._id} className="flex items-center">
                        <span className="text-xs md:text-sm font-medium text-gray-900 w-6 md:w-8">
                          {rating._id}★
                        </span>
                        <div className="flex-1 mx-2 md:mx-3">
                          <div className="bg-gray-200 rounded-full h-1.5 md:h-2">
                            <div 
                              className="bg-yellow-400 h-1.5 md:h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-xs md:text-sm text-gray-500 w-8 md:w-12 text-right">
                          {rating.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">Review Summary</h4>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs md:text-sm text-gray-500">Total Reviews</span>
                    <span className="text-xs md:text-sm font-medium text-gray-900">
                      {formatNumber(analyticsData.reviewAnalytics.totalReviews)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs md:text-sm text-gray-500">Average Rating</span>
                    <span className="text-xs md:text-sm font-medium text-gray-900">
                      {analyticsData.reviewAnalytics.averageRating.toFixed(1)}★
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-4 md:px-5 md:py-5 sm:p-6">
          <h3 className="text-base md:text-lg leading-6 font-medium text-gray-900 mb-3 md:mb-4">
            Export Data
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <button
              onClick={() => exportData('merchants')}
              className="inline-flex items-center justify-center px-3 md:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-xs md:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Store className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Export Merchants
            </button>
            <button
              onClick={() => exportData('users')}
              className="inline-flex items-center justify-center px-3 md:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-xs md:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Users className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Export Users
            </button>
            <button
              onClick={() => exportData('analytics')}
              className="inline-flex items-center justify-center px-3 md:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-xs md:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <BarChart3 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Export Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;