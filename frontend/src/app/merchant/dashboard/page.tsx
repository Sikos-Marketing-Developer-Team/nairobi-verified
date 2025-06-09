"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Button,
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  Badge,
  Alert, 
  AlertDescription, 
  AlertTitle
} from "@/components/ui";
import { 
  AlertCircle, 
  BarChart3, 
  CheckCircle, 
  Package, 
  Settings, 
  ShoppingBag, 
  Store, 
  Users 
} from "lucide-react";

// This is a placeholder for the merchant dashboard
// In a real application, this would be connected to a backend API

export default function MerchantDashboard() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate fetching merchant data
  useEffect(() => {
    // In a real application, this would be an API call to get the logged-in merchant
    // For demo purposes, we'll just use a mock merchant
    setTimeout(() => {
      const mockMerchant = {
        _id: "123456",
        fullName: "John Doe",
        email: "john@example.com",
        companyName: "Doe Enterprises",
        phone: "+254712345678",
        isVerified: true,
        isActive: true,
        verificationStatus: 'approved',
        category: "Electronics",
        website: "https://example.com",
        openingHours: "Mon-Fri: 9am-5pm",
        address: "123 Main St, Nairobi",
        description: "We sell high-quality electronics and provide repair services.",
        stats: {
          products: 24,
          orders: 156,
          revenue: "KSh 245,678",
          customers: 89
        }
      };
      
      setMerchant(mockMerchant);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Merchant Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {merchant.companyName}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Merchant Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={merchant.isVerified ? "success" : "outline"}>
                {merchant.isVerified ? "Verified" : "Unverified"}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => router.push('/merchant/profile')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push('/merchant/logout')}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Welcome back, {merchant.fullName}!</h2>
          
          {!merchant.isVerified && (
            <Alert variant="warning" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Verification Required</AlertTitle>
              <AlertDescription>
                Your business is not yet verified. Please complete the verification process to unlock all features.
                <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => router.push('/merchant/verification')}>
                  Complete Verification
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Products</p>
                  <h3 className="text-2xl font-bold mt-1">{merchant.stats.products}</h3>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full">
                  <Package className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Orders</p>
                  <h3 className="text-2xl font-bold mt-1">{merchant.stats.orders}</h3>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</p>
                  <h3 className="text-2xl font-bold mt-1">{merchant.stats.revenue}</h3>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                  <BarChart3 className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Customers</p>
                  <h3 className="text-2xl font-bold mt-1">{merchant.stats.customers}</h3>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Your Products</h3>
              <Button onClick={() => router.push('/merchant/products/add')}>
                Add New Product
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
                <CardDescription>
                  Manage your product catalog, update inventory, and set pricing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {merchant.stats.products > 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                      Your product list would appear here.
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                      This is a placeholder for demonstration purposes.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No products yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Start adding products to your store to attract customers.
                    </p>
                    <Button onClick={() => router.push('/merchant/products/add')}>
                      Add Your First Product
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>
                  View and manage customer orders, process shipments, and handle returns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    Your orders would appear here.
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    This is a placeholder for demonstration purposes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Analytics</CardTitle>
                <CardDescription>
                  Track your business performance, sales trends, and customer insights.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    Your analytics dashboard would appear here.
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    This is a placeholder for demonstration purposes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Settings</CardTitle>
                <CardDescription>
                  Manage your business profile, payment methods, and account settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    Your business settings would appear here.
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    This is a placeholder for demonstration purposes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}