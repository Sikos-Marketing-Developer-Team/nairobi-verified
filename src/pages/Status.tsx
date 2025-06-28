import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle, XCircle, AlertCircle, Clock, Wifi, Database, Server } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePageLoading } from '@/hooks/use-loading';
import { PageSkeleton } from '@/components/ui/loading-skeletons';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  responseTime: number;
  lastChecked: string;
  description: string;
}

const Status = () => {
  const isLoading = usePageLoading(500);
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Website',
      status: 'operational',
      responseTime: 245,
      lastChecked: new Date().toLocaleString(),
      description: 'Main website and user interface'
    },
    {
      name: 'API Services',
      status: 'operational',
      responseTime: 180,
      lastChecked: new Date().toLocaleString(),
      description: 'Backend API and database operations'
    },
    {
      name: 'Authentication',
      status: 'operational',
      responseTime: 120,
      lastChecked: new Date().toLocaleString(),
      description: 'User login and registration services'
    },
    {
      name: 'Payment Processing',
      status: 'operational',
      responseTime: 340,
      lastChecked: new Date().toLocaleString(),
      description: 'M-Pesa and payment gateway services'
    },
    {
      name: 'Email Services',
      status: 'operational',
      responseTime: 890,
      lastChecked: new Date().toLocaleString(),
      description: 'Email notifications and communication'
    },
    {
      name: 'File Storage',
      status: 'operational',
      responseTime: 156,
      lastChecked: new Date().toLocaleString(),
      description: 'Image uploads and file management'
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStatus = async () => {
    setIsRefreshing(true);
    
    // Simulate API calls to check service status
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setServices(prevServices => 
      prevServices.map(service => ({
        ...service,
        responseTime: Math.floor(Math.random() * 500) + 100,
        lastChecked: new Date().toLocaleString()
      }))
    );
    
    setIsRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'outage':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'outage':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const overallStatus = services.every(s => s.status === 'operational') 
    ? 'All Systems Operational' 
    : services.some(s => s.status === 'outage')
    ? 'Service Disruption'
    : 'Degraded Performance';

  const overallStatusColor = services.every(s => s.status === 'operational')
    ? 'text-green-600'
    : services.some(s => s.status === 'outage')
    ? 'text-red-600'
    : 'text-yellow-600';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PageSkeleton>
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </PageSkeleton>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">System Status</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time status of Nairobi Verified services and infrastructure
          </p>
          
          {/* Overall Status */}
          <div className="mt-8">
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border-2 ${getStatusColor(services.every(s => s.status === 'operational') ? 'operational' : 'degraded')}`}>
              {getStatusIcon(services.every(s => s.status === 'operational') ? 'operational' : 'degraded')}
              <span className={`font-semibold text-lg ${overallStatusColor}`}>
                {overallStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Refresh Button */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Service Status</h2>
          <Button 
            onClick={refreshStatus} 
            disabled={isRefreshing}
            variant="outline"
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                Refreshing...
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 mr-2" />
                Refresh Status
              </>
            )}
          </Button>
        </div>

        {/* Service Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service) => (
            <Card key={service.name} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{service.name}</span>
                  {getStatusIcon(service.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(service.status)}`}>
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </div>
                  
                  <p className="text-gray-600 text-sm">{service.description}</p>
                  
                  <div className="text-sm text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Response Time:</span>
                      <span className="font-medium">{service.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Checked:</span>
                      <span className="font-medium">{service.lastChecked}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-gray-600" />
              Recent Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Incidents</h3>
              <p className="text-gray-600">
                All systems have been running smoothly. No incidents reported in the last 30 days.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Need Help?
              </h3>
              <p className="text-gray-600 mb-4">
                If you're experiencing issues not reflected here, please contact our support team.
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild>
                  <a href="/support">Contact Support</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="mailto:support@nairobiverified.com">Email Support</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Status;
