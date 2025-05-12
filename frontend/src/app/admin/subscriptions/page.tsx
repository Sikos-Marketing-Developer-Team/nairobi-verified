'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertCircle, 
  CheckCircle, 
  ChevronDown, 
  Clock, 
  Edit, 
  Loader2, 
  MoreHorizontal, 
  Plus, 
  RefreshCw, 
  Trash, 
  XCircle 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SubscriptionPackage {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  durationUnit: string;
  features: string[];
  productLimit: number;
  featuredProductsLimit: number;
  isActive: boolean;
  createdAt: string;
}

interface VendorSubscription {
  _id: string;
  vendor: {
    _id: string;
    fullName: string;
    email: string;
    companyName?: string;
  };
  package: {
    _id: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  autoRenew: boolean;
  createdAt: string;
}

export default function AdminSubscriptionsPage() {
  const { toast } = useToast();
  
  // State for packages tab
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [packagesError, setPackagesError] = useState<string | null>(null);
  
  // State for subscriptions tab
  const [subscriptions, setSubscriptions] = useState<VendorSubscription[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
  const [subscriptionsError, setSubscriptionsError] = useState<string | null>(null);
  
  // State for package form
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackage | null>(null);
  const [packageFormData, setPackageFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 1,
    durationUnit: 'month',
    features: [''],
    productLimit: 10,
    featuredProductsLimit: 2,
    isActive: true
  });
  const [submittingPackage, setSubmittingPackage] = useState(false);
  
  // State for checking expiring subscriptions
  const [checkingExpiring, setCheckingExpiring] = useState(false);
  
  // Fetch subscription packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoadingPackages(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/packages`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscription packages');
        }
        
        const data = await response.json();
        setPackages(data.packages);
        setPackagesError(null);
      } catch (err) {
        console.error('Error fetching subscription packages:', err);
        setPackagesError('Failed to load subscription packages. Please try again later.');
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchPackages();
  }, []);
  
  // Fetch vendor subscriptions
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoadingSubscriptions(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/all`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch vendor subscriptions');
        }
        
        const data = await response.json();
        setSubscriptions(data.subscriptions);
        setSubscriptionsError(null);
      } catch (err) {
        console.error('Error fetching vendor subscriptions:', err);
        setSubscriptionsError('Failed to load vendor subscriptions. Please try again later.');
      } finally {
        setLoadingSubscriptions(false);
      }
    };

    fetchSubscriptions();
  }, []);
  
  // Handle package form input change
  const handlePackageInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setPackageFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else if (type === 'number') {
      setPackageFormData(prev => ({
        ...prev,
        [name]: parseFloat(value)
      }));
    } else {
      setPackageFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle feature input change
  const handleFeatureChange = (index: number, value: string) => {
    setPackageFormData(prev => {
      const updatedFeatures = [...prev.features];
      updatedFeatures[index] = value;
      return {
        ...prev,
        features: updatedFeatures
      };
    });
  };
  
  // Add new feature input
  const addFeature = () => {
    setPackageFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };
  
  // Remove feature input
  const removeFeature = (index: number) => {
    setPackageFormData(prev => {
      const updatedFeatures = [...prev.features];
      updatedFeatures.splice(index, 1);
      return {
        ...prev,
        features: updatedFeatures
      };
    });
  };
  
  // Open package dialog for editing
  const openEditPackageDialog = (pkg: SubscriptionPackage) => {
    setEditingPackage(pkg);
    setPackageFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      duration: pkg.duration,
      durationUnit: pkg.durationUnit,
      features: pkg.features.length > 0 ? pkg.features : [''],
      productLimit: pkg.productLimit,
      featuredProductsLimit: pkg.featuredProductsLimit,
      isActive: pkg.isActive
    });
    setIsPackageDialogOpen(true);
  };
  
  // Open package dialog for creating
  const openCreatePackageDialog = () => {
    setEditingPackage(null);
    setPackageFormData({
      name: '',
      description: '',
      price: 0,
      duration: 1,
      durationUnit: 'month',
      features: [''],
      productLimit: 10,
      featuredProductsLimit: 2,
      isActive: true
    });
    setIsPackageDialogOpen(true);
  };
  
  // Submit package form
  const handlePackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmittingPackage(true);
      
      // Filter out empty features
      const filteredFeatures = packageFormData.features.filter(feature => feature.trim() !== '');
      
      const requestBody = {
        ...packageFormData,
        features: filteredFeatures
      };
      
      const url = editingPackage
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/packages/${editingPackage._id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/packages`;
      
      const method = editingPackage ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save subscription package');
      }
      
      const data = await response.json();
      
      // Update packages list
      if (editingPackage) {
        setPackages(prev => prev.map(pkg => pkg._id === editingPackage._id ? data.package : pkg));
        toast({
          title: "Package updated",
          description: "The subscription package has been updated successfully."
        });
      } else {
        setPackages(prev => [...prev, data.package]);
        toast({
          title: "Package created",
          description: "The subscription package has been created successfully."
        });
      }
      
      // Close dialog
      setIsPackageDialogOpen(false);
    } catch (err: any) {
      console.error('Error saving subscription package:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An error occurred while saving the subscription package."
      });
    } finally {
      setSubmittingPackage(false);
    }
  };
  
  // Delete package
  const handleDeletePackage = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/packages/${packageId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete subscription package');
      }
      
      // Update packages list
      setPackages(prev => prev.filter(pkg => pkg._id !== packageId));
      
      toast({
        title: "Package deleted",
        description: "The subscription package has been deleted successfully."
      });
    } catch (err: any) {
      console.error('Error deleting subscription package:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An error occurred while deleting the subscription package."
      });
    }
  };
  
  // Toggle package active status
  const handleTogglePackageStatus = async (packageId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/packages/${packageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update package status');
      }
      
      const data = await response.json();
      
      // Update packages list
      setPackages(prev => prev.map(pkg => pkg._id === packageId ? data.package : pkg));
      
      toast({
        title: `Package ${!currentStatus ? 'activated' : 'deactivated'}`,
        description: `The subscription package has been ${!currentStatus ? 'activated' : 'deactivated'} successfully.`
      });
    } catch (err: any) {
      console.error('Error updating package status:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An error occurred while updating the package status."
      });
    }
  };
  
  // Update subscription status
  const handleUpdateSubscriptionStatus = async (subscriptionId: string, newStatus: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update subscription status');
      }
      
      const data = await response.json();
      
      // Update subscriptions list
      setSubscriptions(prev => prev.map(sub => sub._id === subscriptionId ? data.subscription : sub));
      
      toast({
        title: "Status updated",
        description: `The subscription status has been updated to ${newStatus}.`
      });
    } catch (err: any) {
      console.error('Error updating subscription status:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An error occurred while updating the subscription status."
      });
    }
  };
  
  // Check for expiring subscriptions
  const handleCheckExpiringSubscriptions = async () => {
    try {
      setCheckingExpiring(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/check-expiring`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to check expiring subscriptions');
      }
      
      const data = await response.json();
      
      toast({
        title: "Check completed",
        description: data.message || "Expiring subscriptions have been checked and notifications sent."
      });
    } catch (err: any) {
      console.error('Error checking expiring subscriptions:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An error occurred while checking expiring subscriptions."
      });
    } finally {
      setCheckingExpiring(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'expired':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };
  
  // Get payment status badge variant
  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'unpaid':
        return 'outline';
      case 'refunded':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Subscription Management</h1>
      
      <Tabs defaultValue="packages" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="packages">Subscription Packages</TabsTrigger>
          <TabsTrigger value="subscriptions">Vendor Subscriptions</TabsTrigger>
        </TabsList>
        
        {/* Packages Tab */}
        <TabsContent value="packages" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Subscription Packages</h2>
            <Button onClick={openCreatePackageDialog}>
              <Plus className="mr-2 h-4 w-4" /> Add Package
            </Button>
          </div>
          
          {loadingPackages ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : packagesError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{packagesError}</AlertDescription>
            </Alert>
          ) : packages.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Packages</CardTitle>
                <CardDescription>
                  There are no subscription packages available. Click the "Add Package" button to create one.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-4">
              {packages.map((pkg) => (
                <Card key={pkg._id} className={pkg.isActive ? '' : 'opacity-70'}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{pkg.name}</CardTitle>
                        <CardDescription>{pkg.description}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditPackageDialog(pkg)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTogglePackageStatus(pkg._id, pkg.isActive)}>
                            {pkg.isActive ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" /> Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" /> Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeletePackage(pkg._id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Price</h3>
                        <p className="font-medium">KES {pkg.price.toLocaleString()}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Duration</h3>
                        <p className="font-medium">{pkg.duration} {pkg.durationUnit}{pkg.duration > 1 ? 's' : ''}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                        <Badge variant={pkg.isActive ? 'default' : 'secondary'}>
                          {pkg.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-primary mr-2" />
                          <span className="text-sm">Up to {pkg.productLimit} products</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-primary mr-2" />
                          <span className="text-sm">Up to {pkg.featuredProductsLimit} featured products</span>
                        </div>
                        {pkg.features.map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-primary mr-2" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Package Form Dialog */}
          <Dialog open={isPackageDialogOpen} onOpenChange={setIsPackageDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingPackage ? 'Edit Package' : 'Create Package'}</DialogTitle>
                <DialogDescription>
                  {editingPackage 
                    ? 'Update the details of this subscription package.' 
                    : 'Create a new subscription package for merchants.'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handlePackageSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Package Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={packageFormData.name}
                      onChange={handlePackageInputChange}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      name="description"
                      value={packageFormData.description}
                      onChange={handlePackageInputChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">Price (KES)</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={packageFormData.price}
                        onChange={handlePackageInputChange}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="duration">Duration</Label>
                      <div className="flex gap-2">
                        <Input
                          id="duration"
                          name="duration"
                          type="number"
                          min="1"
                          value={packageFormData.duration}
                          onChange={handlePackageInputChange}
                          required
                          className="w-1/2"
                        />
                        <select
                          id="durationUnit"
                          name="durationUnit"
                          value={packageFormData.durationUnit}
                          onChange={handlePackageInputChange}
                          className="w-1/2 rounded-md border border-input bg-background px-3 py-2"
                        >
                          <option value="day">Day(s)</option>
                          <option value="week">Week(s)</option>
                          <option value="month">Month(s)</option>
                          <option value="year">Year(s)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="productLimit">Product Limit</Label>
                      <Input
                        id="productLimit"
                        name="productLimit"
                        type="number"
                        min="1"
                        value={packageFormData.productLimit}
                        onChange={handlePackageInputChange}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="featuredProductsLimit">Featured Products Limit</Label>
                      <Input
                        id="featuredProductsLimit"
                        name="featuredProductsLimit"
                        type="number"
                        min="0"
                        value={packageFormData.featuredProductsLimit}
                        onChange={handlePackageInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Features</Label>
                    {packageFormData.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          placeholder={`Feature ${index + 1}`}
                        />
                        {packageFormData.features.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeFeature(index)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addFeature}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Feature
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={packageFormData.isActive}
                      onChange={handlePackageInputChange}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={submittingPackage}>
                    {submittingPackage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {submittingPackage ? 'Saving...' : 'Save Package'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Vendor Subscriptions</h2>
            <Button 
              onClick={handleCheckExpiringSubscriptions} 
              disabled={checkingExpiring}
              variant="outline"
            >
              {checkingExpiring ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {checkingExpiring ? 'Checking...' : 'Check Expiring Subscriptions'}
            </Button>
          </div>
          
          {loadingSubscriptions ? (
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ) : subscriptionsError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{subscriptionsError}</AlertDescription>
            </Alert>
          ) : subscriptions.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Subscriptions</CardTitle>
                <CardDescription>
                  There are no vendor subscriptions available.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Merchant</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Auto-Renew</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((subscription) => (
                      <TableRow key={subscription._id}>
                        <TableCell>
                          <div className="font-medium">
                            {subscription.vendor.companyName || subscription.vendor.fullName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {subscription.vendor.email}
                          </div>
                        </TableCell>
                        <TableCell>{subscription.package.name}</TableCell>
                        <TableCell>
                          <div>{formatDate(subscription.startDate)}</div>
                          <div>to</div>
                          <div>{formatDate(subscription.endDate)}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(subscription.status)}>
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPaymentStatusBadgeVariant(subscription.paymentStatus)}>
                            {subscription.paymentStatus.charAt(0).toUpperCase() + subscription.paymentStatus.slice(1)}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            via {subscription.paymentMethod === 'mpesa' ? 'M-Pesa' : 
                                 subscription.paymentMethod === 'card' ? 'Card' : 
                                 subscription.paymentMethod === 'admin' ? 'Admin' : 
                                 subscription.paymentMethod}
                          </div>
                        </TableCell>
                        <TableCell>
                          {subscription.autoRenew ? (
                            <span className="flex items-center text-green-600 text-sm">
                              <CheckCircle className="h-4 w-4 mr-1" /> Enabled
                            </span>
                          ) : (
                            <span className="flex items-center text-muted-foreground text-sm">
                              <XCircle className="h-4 w-4 mr-1" /> Disabled
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <span>Actions</span>
                                <ChevronDown className="ml-2 h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {subscription.status !== 'active' && (
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateSubscriptionStatus(subscription._id, 'active')}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" /> Mark as Active
                                </DropdownMenuItem>
                              )}
                              {subscription.status !== 'expired' && (
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateSubscriptionStatus(subscription._id, 'expired')}
                                >
                                  <Clock className="mr-2 h-4 w-4" /> Mark as Expired
                                </DropdownMenuItem>
                              )}
                              {subscription.status !== 'cancelled' && (
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateSubscriptionStatus(subscription._id, 'cancelled')}
                                >
                                  <XCircle className="mr-2 h-4 w-4" /> Mark as Cancelled
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}