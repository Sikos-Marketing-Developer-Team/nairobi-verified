import React, { useState } from 'react';
import { Users, Store, CheckCircle, AlertCircle, Clock, Trash2, Database, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';
import { Link } from 'react-router-dom';
import { adminAPI } from '@/lib/api';
import { usePageLoading } from '@/hooks/use-loading';
import { DashboardSkeleton, PageSkeleton } from '@/components/ui/loading-skeletons';

const AdminDashboard = () => {
  // State for mock data removal dialog
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeSuccess, setRemoveSuccess] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  
  // State for specific mock data type removal
  const [selectedDataType, setSelectedDataType] = useState<string | null>(null);
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const isLoading = usePageLoading(500);
  
  // Mock data - in a real app, this would come from API
  const stats = {
    totalMerchants: 156,
    verifiedMerchants: 124,
    pendingVerifications: 8,
    totalUsers: 2847,
    newThisWeek: 23,
    activeToday: 145
  };

  const recentVerifications = [
    { id: '60d0fe4f5311236168a10101', name: 'Savannah Electronics', status: 'pending', date: '2024-01-15' },
    { id: '60d0fe4f5311236168a10102', name: 'CBD Fashion House', status: 'approved', date: '2024-01-14' },
    { id: '60d0fe4f5311236168a10103', name: 'Nairobi Tech Solutions', status: 'pending', date: '2024-01-14' },
    { id: '60d0fe4f5311236168a10104', name: 'Kimathi Street Pharmacy', status: 'pending', date: '2024-01-13' }
  ];
  
  // Mock data types that can be removed individually
  const mockDataTypes = [
    { id: 'merchants', name: 'Merchants', count: stats.totalMerchants },
    { id: 'users', name: 'Users', count: stats.totalUsers },
    { id: 'products', name: 'Products', count: 1245 },
    { id: 'categories', name: 'Categories', count: 24 },
    { id: 'reviews', name: 'Reviews', count: 876 },
    { id: 'orders', name: 'Orders', count: 342 }
  ];
  
  // Function to remove all mock data
  const handleRemoveAllMockData = async () => {
    setIsRemoving(true);
    setRemoveSuccess(false);
    setRemoveError(null);
    
    try {
      await adminAPI.removeMockData();
      setRemoveSuccess(true);
      // In a real app, you would refresh the data here
    } catch (error) {
      console.error('Failed to remove mock data:', error);
      setRemoveError('Failed to remove mock data. Please try again.');
    } finally {
      setIsRemoving(false);
    }
  };
  
  // Function to remove specific mock data type
  const handleRemoveMockDataType = async () => {
    if (!selectedDataType) return;
    
    setIsRemoving(true);
    setRemoveSuccess(false);
    setRemoveError(null);
    
    try {
      await adminAPI.removeMockDataByType(selectedDataType);
      setRemoveSuccess(true);
      // In a real app, you would refresh the data here
    } catch (error) {
      console.error(`Failed to remove ${selectedDataType} mock data:`, error);
      setRemoveError(`Failed to remove ${selectedDataType} mock data. Please try again.`);
    } finally {
      setIsRemoving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <PageSkeleton>
          <DashboardSkeleton />
        </PageSkeleton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage merchants, verifications, and platform settings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Merchants</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalMerchants}</p>
                </div>
                <Store className="h-12 w-12 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified</p>
                  <p className="text-3xl font-bold text-green-600">{stats.verifiedMerchants}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.pendingVerifications}</p>
                </div>
                <Clock className="h-12 w-12 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                </div>
                <Users className="h-12 w-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Verification Queue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pending Verifications</span>
                <Link to="/admin/verifications">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentVerifications.map((merchant) => (
                  <div key={merchant.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{merchant.name}</h4>
                      <p className="text-sm text-gray-500">Submitted: {merchant.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        merchant.status === 'pending' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {merchant.status === 'pending' ? 'Pending' : 'Approved'}
                      </span>
                      {merchant.status === 'pending' && (
                        <Button size="sm" className="bg-primary hover:bg-primary-dark">
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/admin/merchants/add">
                <Button className="w-full bg-primary hover:bg-primary-dark">
                  <Store className="h-4 w-4 mr-2" />
                  Add New Merchant
                </Button>
              </Link>
              
              <Link to="/admin/verifications">
                <Button variant="outline" className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Review Verifications
                </Button>
              </Link>
              
              <Link to="/admin/merchants">
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Merchants
                </Button>
              </Link>
              
              <Link to="/admin/users">
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              
              <hr className="my-2" />
              
              <Button 
                variant="outline" 
                className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                onClick={() => setIsTypeDialogOpen(true)}
              >
                <Database className="h-4 w-4 mr-2" />
                Manage Mock Data
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => setIsRemoveDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove All Mock Data
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border-l-4 border-green-500 bg-green-50">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">CBD Fashion House verified</p>
                  <p className="text-sm text-gray-600">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 border-l-4 border-blue-500 bg-blue-50">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">23 new user registrations this week</p>
                  <p className="text-sm text-gray-600">6 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 border-l-4 border-amber-500 bg-amber-50">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium">Savannah Electronics submitted verification</p>
                  <p className="text-sm text-gray-600">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Remove All Mock Data Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Remove All Mock Data
            </DialogTitle>
            <DialogDescription>
              This action will remove all mock data from the system. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {removeError && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{removeError}</AlertDescription>
            </Alert>
          )}
          
          {removeSuccess && (
            <Alert className="mt-4 bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>All mock data has been successfully removed.</AlertDescription>
            </Alert>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsRemoveDialogOpen(false)}
              disabled={isRemoving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveAllMockData}
              disabled={isRemoving || removeSuccess}
            >
              {isRemoving ? 'Removing...' : 'Remove All Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Remove Specific Mock Data Type Dialog */}
      <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-amber-500" />
              Manage Mock Data
            </DialogTitle>
            <DialogDescription>
              Select a data type to remove from the system.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-3 py-4">
            {mockDataTypes.map((type) => (
              <Button
                key={type.id}
                variant="outline"
                className={`justify-between ${
                  selectedDataType === type.id ? 'border-primary text-primary' : ''
                }`}
                onClick={() => setSelectedDataType(type.id)}
              >
                <span>{type.name}</span>
                <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                  {type.count}
                </span>
              </Button>
            ))}
          </div>
          
          {removeError && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{removeError}</AlertDescription>
            </Alert>
          )}
          
          {removeSuccess && (
            <Alert className="mt-4 bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {selectedDataType ? `${selectedDataType.charAt(0).toUpperCase() + selectedDataType.slice(1)} mock data has been successfully removed.` : 'Mock data has been successfully removed.'}
              </AlertDescription>
            </Alert>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsTypeDialogOpen(false);
                setSelectedDataType(null);
                setRemoveSuccess(false);
                setRemoveError(null);
              }}
              disabled={isRemoving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMockDataType}
              disabled={isRemoving || removeSuccess || !selectedDataType}
            >
              {isRemoving ? 'Removing...' : 'Remove Selected Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
