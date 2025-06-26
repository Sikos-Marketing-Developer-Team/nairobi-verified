import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, TrendingUp, Eye, ShoppingCart } from 'lucide-react';

interface FlashSalesMetrics {
  totalSales: number;
  totalViews: number;
  activeSales: number;
  recentSales: number;
  topPerformingSales: Array<{
    _id: string;
    title: string;
    totalSales: number;
    totalViews: number;
  }>;
}

const FlashSalesMetrics = () => {
  const [metrics, setMetrics] = useState<FlashSalesMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/flash-sales/admin/analytics', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('Error fetching flash sales metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-500" />
            Flash Sales Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-500" />
            Flash Sales Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Unable to load metrics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-red-500" />
          Flash Sales Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Flame className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{metrics.activeSales}</p>
            <p className="text-sm text-gray-600">Active Sales</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{metrics.totalSales.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Sales</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{metrics.totalViews.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Views</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">{metrics.recentSales}</p>
            <p className="text-sm text-gray-600">This Week</p>
          </div>
        </div>

        {metrics.topPerformingSales.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Top Performing Sales</h4>
            <div className="space-y-2">
              {metrics.topPerformingSales.slice(0, 3).map((sale, index) => (
                <div key={sale._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="text-sm font-medium truncate">{sale.title}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{sale.totalSales} sales</p>
                    <p className="text-xs text-gray-500">{sale.totalViews} views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FlashSalesMetrics;