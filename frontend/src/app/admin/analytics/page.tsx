"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, 
  ArrowDown, 
  ArrowUp, 
  Calendar, 
  Download, 
  Loader2, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Store 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsData {
  revenue: {
    daily: number[];
    weekly: number[];
    monthly: number[];
    yearly: number[];
    total: number;
    previousPeriod: number;
    percentChange: number;
  };
  orders: {
    daily: number[];
    weekly: number[];
    monthly: number[];
    yearly: number[];
    total: number;
    previousPeriod: number;
    percentChange: number;
  };
  users: {
    daily: number[];
    weekly: number[];
    monthly: number[];
    yearly: number[];
    total: number;
    previousPeriod: number;
    percentChange: number;
    byType: {
      clients: number;
      merchants: number;
      admins: number;
    };
  };
  products: {
    total: number;
    active: number;
    byCategory: {
      name: string;
      count: number;
    }[];
    topViewed: {
      id: string;
      name: string;
      views: number;
    }[];
    topPurchased: {
      id: string;
      name: string;
      sales: number;
    }[];
  };
  merchants: {
    total: number;
    active: number;
    topPerforming: {
      id: string;
      name: string;
      sales: number;
    }[];
  };
}

export default function AdminAnalyticsPage() {
  const { toast } = useToast();
  
  // State for analytics data
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [chartView, setChartView] = useState<string>("daily");
  
  // Fetch analytics data
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, fetchAnalyticsData]);
  
 const fetchAnalyticsData = useCallback(async () => {
  try {
    setIsLoading(true);
    setError(null);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/analytics?timeRange=${timeRange}`,
      { credentials: 'include' }
    );

    if (!response.ok) throw new Error("Failed to fetch analytics data");

    const data = await response.json();
    setAnalyticsData(data);
  } catch (err: any) {
    setError(err.message || "Something went wrong");
    toast({
      title: "Error",
      description: err.message,
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
}, [timeRange, toast]);

useEffect(() => {
  fetchAnalyticsData();
}, [fetchAnalyticsData]);
  
  const handleExportData = async (format: string) => {
    try {
      // This endpoint needs to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/analytics/export?timeRange=${timeRange}&format=${format}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to export data as ${format.toUpperCase()}`);
      }
      
      // Create a download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: `Analytics data has been exported as ${format.toUpperCase()}.`
      });
    } catch (err: any) {
      console.error(`Error exporting data as ${format}:`, err);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: err.message || `Failed to export data as ${format.toUpperCase()}.`
      });
    }
  };
  
  // Prepare chart data based on selected view
  const getChartData = (type: 'revenue' | 'orders' | 'users') => {
    if (!analyticsData) return null;
    
    let labels: string[] = [];
    let data: number[] = [];
    
    switch (chartView) {
      case 'daily':
        labels = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - 29 + i);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        data = analyticsData[type].daily;
        break;
      case 'weekly':
        labels = Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - 11 * 7 + i * 7);
          return `Week ${i + 1}`;
        });
        data = analyticsData[type].weekly;
        break;
      case 'monthly':
        labels = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        data = analyticsData[type].monthly;
        break;
      case 'yearly':
        const currentYear = new Date().getFullYear();
        labels = Array.from({ length: 5 }, (_, i) => (currentYear - 4 + i).toString());
        data = analyticsData[type].yearly;
        break;
    }
    
    return {
      labels,
      datasets: [
        {
          label: type.charAt(0).toUpperCase() + type.slice(1),
          data,
          borderColor: type === 'revenue' 
            ? 'rgb(59, 130, 246)' 
            : type === 'orders' 
              ? 'rgb(16, 185, 129)' 
              : 'rgb(249, 115, 22)',
          backgroundColor: type === 'revenue' 
            ? 'rgba(59, 130, 246, 0.1)' 
            : type === 'orders' 
              ? 'rgba(16, 185, 129, 0.1)' 
              : 'rgba(249, 115, 22, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: type === 'revenue' 
            ? 'rgb(59, 130, 246)' 
            : type === 'orders' 
              ? 'rgb(16, 185, 129)' 
              : 'rgb(249, 115, 22)',
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  };
  
  const getPercentChangeColor = (percentChange: number) => {
    if (percentChange > 0) return 'text-green-600';
    if (percentChange < 0) return 'text-red-600';
    return 'text-gray-600';
  };
  
  const getPercentChangeIcon = (percentChange: number) => {
    if (percentChange > 0) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (percentChange < 0) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return null;
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };
  
  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '7d':
        return 'Last 7 days';
      case '30d':
        return 'Last 30 days';
      case '90d':
        return 'Last 90 days';
      case '1y':
        return 'Last year';
      case 'all':
        return 'All time';
      default:
        return 'Last 30 days';
    }
  };
  
  // Prepare user distribution chart data
  const getUserDistributionData = () => {
    if (!analyticsData) return null;
    
    return {
      labels: ['Clients', 'Merchants', 'Admins'],
      datasets: [
        {
          data: [
            analyticsData.users.byType.clients,
            analyticsData.users.byType.merchants,
            analyticsData.users.byType.admins,
          ],
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(249, 115, 22, 0.7)',
            'rgba(16, 185, 129, 0.7)',
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(249, 115, 22)',
            'rgb(16, 185, 129)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Prepare product categories chart data
  const getProductCategoriesData = () => {
    if (!analyticsData) return null;
    
    return {
      labels: analyticsData.products.byCategory.map(category => category.name),
      datasets: [
        {
          label: 'Products by Category',
          data: analyticsData.products.byCategory.map(category => category.count),
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(249, 115, 22, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(217, 70, 239, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(6, 182, 212, 0.7)',
            'rgba(248, 113, 113, 0.7)',
            'rgba(124, 58, 237, 0.7)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Analytics & Reporting</h1>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => fetchAnalyticsData()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Select onValueChange={handleExportData}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Export Data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">Export as CSV</SelectItem>
                <SelectItem value="excel">Export as Excel</SelectItem>
                <SelectItem value="pdf">Export as PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        ) : analyticsData ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                      <h3 className="text-2xl font-bold mt-1">{formatCurrency(analyticsData.revenue.total)}</h3>
                      <div className="flex items-center mt-1">
                        <span className={`text-sm ${getPercentChangeColor(analyticsData.revenue.percentChange)}`}>
                          {analyticsData.revenue.percentChange > 0 ? '+' : ''}
                          {analyticsData.revenue.percentChange.toFixed(1)}%
                        </span>
                        {getPercentChangeIcon(analyticsData.revenue.percentChange)}
                        <span className="text-xs text-gray-500 ml-1">vs previous period</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-full bg-blue-100">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Orders</p>
                      <h3 className="text-2xl font-bold mt-1">{formatNumber(analyticsData.orders.total)}</h3>
                      <div className="flex items-center mt-1">
                        <span className={`text-sm ${getPercentChangeColor(analyticsData.orders.percentChange)}`}>
                          {analyticsData.orders.percentChange > 0 ? '+' : ''}
                          {analyticsData.orders.percentChange.toFixed(1)}%
                        </span>
                        {getPercentChangeIcon(analyticsData.orders.percentChange)}
                        <span className="text-xs text-gray-500 ml-1">vs previous period</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-full bg-green-100">
                      <ShoppingBag className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Users</p>
                      <h3 className="text-2xl font-bold mt-1">{formatNumber(analyticsData.users.total)}</h3>
                      <div className="flex items-center mt-1">
                        <span className={`text-sm ${getPercentChangeColor(analyticsData.users.percentChange)}`}>
                          {analyticsData.users.percentChange > 0 ? '+' : ''}
                          {analyticsData.users.percentChange.toFixed(1)}%
                        </span>
                        {getPercentChangeIcon(analyticsData.users.percentChange)}
                        <span className="text-xs text-gray-500 ml-1">vs previous period</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-full bg-orange-100">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Active Merchants</p>
                      <h3 className="text-2xl font-bold mt-1">{formatNumber(analyticsData.merchants.active)}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500">
                          of {formatNumber(analyticsData.merchants.total)} total
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-full bg-purple-100">
                      <Store className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts */}
            <div className="space-y-6">
              <Tabs defaultValue="revenue">
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                  </TabsList>
                  
                  <Select value={chartView} onValueChange={setChartView}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="View by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <TabsContent value="revenue" className="mt-0">Revenue Trends</TabsContent>
                      <TabsContent value="orders" className="mt-0">Order Trends</TabsContent>
                      <TabsContent value="users" className="mt-0">User Growth</TabsContent>
                    </CardTitle>
                    <CardDescription>{getTimeRangeLabel()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <TabsContent value="revenue" className="h-full mt-0">
                        {getChartData('revenue') && <Line data={getChartData('revenue')!} options={{ maintainAspectRatio: false }} />}
                      </TabsContent>
                      <TabsContent value="orders" className="h-full mt-0">
                        {getChartData('orders') && <Line data={getChartData('orders')!} options={{ maintainAspectRatio: false }} />}
                      </TabsContent>
                      <TabsContent value="users" className="h-full mt-0">
                        {getChartData('users') && <Line data={getChartData('users')!} options={{ maintainAspectRatio: false }} />}
                      </TabsContent>
                    </div>
                  </CardContent>
                </Card>
              </Tabs>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Distribution</CardTitle>
                    <CardDescription>Breakdown of users by type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      {getUserDistributionData() && <Doughnut data={getUserDistributionData()!} options={{ maintainAspectRatio: false }} />}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Products by Category</CardTitle>
                    <CardDescription>Distribution of products across categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      {getProductCategoriesData() && <Bar data={getProductCategoriesData()!} options={{ maintainAspectRatio: false }} />}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Merchants</CardTitle>
                    <CardDescription>By sales volume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.merchants.topPerforming.map((merchant, index) => (
                        <div key={merchant.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                              <span className="font-medium text-orange-600">{index + 1}</span>
                            </div>
                            <span className="font-medium">{merchant.name}</span>
                          </div>
                          <span className="font-medium">{formatCurrency(merchant.sales)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                    <CardDescription>By number of sales</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.products.topPurchased.map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <span className="font-medium text-blue-600">{index + 1}</span>
                            </div>
                            <span className="font-medium">{product.name}</span>
                          </div>
                          <span className="font-medium">{formatNumber(product.sales)} sales</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}