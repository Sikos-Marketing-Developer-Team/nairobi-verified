import { useState, useEffect } from 'react';
import { User, Package, Heart, MapPin, Settings, LogOut, ShoppingBag, Star, Loader2, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { ordersAPI, favoritesAPI, addressesAPI } from '@/lib/api';
import { Order, Merchant, Address } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import UserSettings from '@/components/UserSettings';
import { usePageLoading } from '@/hooks/use-loading';
import { DashboardSkeleton, ProfileSkeleton, PageSkeleton, TableSkeleton } from '@/components/ui/loading-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Merchant[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [wishlistError, setWishlistError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const isPageLoading = usePageLoading(500);

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  useEffect(() => {
    if (isAuthenticated && user && activeTab === 'orders') {
      const fetchOrders = async () => {
        setIsLoadingOrders(true);
        try {
          const response = await ordersAPI.getOrders();
          setOrders(response.data.data);
        } catch (err) {
          console.error('Error fetching orders:', err);
          setOrderError('Failed to load orders.');
        } finally {
          setIsLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab, isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user && activeTab === 'wishlist') {
      const fetchWishlist = async () => {
        setIsLoadingWishlist(true);
        try {
          const response = await favoritesAPI.getFavorites();
          setWishlistItems(response.data.data); // Assuming this returns Merchant array
        } catch (err) {
          console.error('Error fetching wishlist:', err);
          setWishlistError('Failed to load wishlist.');
        } finally {
          setIsLoadingWishlist(false);
        }
      };
      fetchWishlist();
    }
  }, [activeTab, isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user && activeTab === 'addresses') {
      const fetchAddresses = async () => {
        setIsLoadingAddresses(true);
        try {
          const response = await addressesAPI.getAddresses();
          setAddresses(response.data.data);
        } catch (err) {
          console.error('Error fetching addresses:', err);
          setAddressError('Failed to load addresses.');
        } finally {
          setIsLoadingAddresses(false);
        }
      };
      fetchAddresses();
    }
  }, [activeTab, isAuthenticated, user]);

  const removeFavorite = async (merchantId: string) => {
    try {
      await favoritesAPI.removeFavorite(merchantId);
      toast({
        title: 'Favorite Removed',
        description: 'Merchant successfully removed from your favorites.',
      });
      // Refresh wishlist after removal
      if (isAuthenticated && user) {
        const response = await favoritesAPI.getFavorites();
        setWishlistItems(response.data.data);
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
      toast({
        title: 'Error',
        description: 'Failed to remove favorite. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddAddress = () => {
    console.log('Add New Address clicked');
    toast({
      title: 'Coming Soon',
      description: 'Address addition functionality will be implemented shortly.',
    });
    // Implement modal or form for adding a new address
  };

  const handleEditAddress = (addressId: string) => {
    console.log('Edit Address clicked for ID:', addressId);
    toast({
      title: 'Coming Soon',
      description: 'Address editing functionality will be implemented shortly.',
    });
    // Implement modal or form for editing an existing address
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await addressesAPI.deleteAddress(addressId);
      toast({
        title: 'Address Deleted',
        description: 'Address successfully removed.',
      });
      // Refresh addresses after deletion
      if (isAuthenticated && user) {
        const response = await addressesAPI.getAddresses();
        setAddresses(response.data.data);
      }
    } catch (err) {
      console.error('Error deleting address:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete address. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (authLoading || isPageLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <PageSkeleton>
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Tabs */}
            <div className="flex space-x-8 border-b border-gray-200">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-2 pb-4">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>

            {/* Content based on active tab */}
            {activeTab === 'profile' || activeTab === 'settings' ? (
              <ProfileSkeleton />
            ) : activeTab === 'orders' || activeTab === 'wishlist' || activeTab === 'addresses' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <DashboardSkeleton />
            )}
          </div>
        </PageSkeleton>
        
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600">Manage your account settings and orders</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 mt-10">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <div className="p-6 border-b pl-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-6 w-6  text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{user?.firstName} {user?.lastName}</h3>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <nav className="p-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gray-100 ${
                        activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-gray-700'
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  ))}
                  <button 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gray-100 text-red-600"
                    onClick={logout}
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingOrders ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="ml-2 text-gray-600">Loading orders...</p>
                      </div>
                    ) : orderError ? (
                      <p className="text-red-600 text-center p-8">{orderError}</p>
                    ) : orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">Order #{order._id.substring(0, 8)}...</h4>
                                <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">Merchant ID: {order.merchant}</p>
                                <p className="text-sm text-gray-600">{order.products.reduce((acc, product) => acc + product.quantity, 0)} item(s)</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-primary">{formatPrice(order.totalAmount)}</p>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-2"
                                  onClick={() => console.log('View Order Details for:', order._id)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders found</h3>
                        <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                        <Link to="/merchants">
                          <Button className="bg-primary hover:bg-primary-dark">
                            Start Shopping
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

          {activeTab === 'wishlist' && (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>My Wishlist</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingWishlist ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-gray-600">Loading wishlist...</p>
          </div>
        ) : wishlistError ? (
           <div className="text-center py-8">
                        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No items found</h3>
                        <p className="text-gray-500 mb-6">You haven't added any items to your wishlist yet.</p>
                        <Link to="/merchants">
                          <Button className="bg-primary hover:bg-primary-dark">
                            Browse Items
                          </Button>
                        </Link>
                      </div>
        ) : wishlistItems.length > 0 ? (
          <div className="space-y-4">
            {wishlistItems.map((item) => (
              <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-4">
                    <img
                      src={item.logo}
                      alt={item.businessName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-semibold">{item.businessName}</h4>
                      <p className="text-sm text-gray-600">{item.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFavorite(item._id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No items in wishlist</h3>
            <p className="text-gray-500 mb-6">Start exploring and save merchants you love</p>
            <Link to="/merchants">
              <Button className="bg-primary hover:bg-primary-dark">
                Discover Merchants
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
)}

            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Saved Addresses</CardTitle>
            
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAddresses ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="ml-2 text-gray-600">Loading addresses...</p>
                      </div>
                    ) : addressError ? (
                      <p className="text-red-600 text-center p-8">{addressError}</p>
                    ) : addresses.length > 0 ? (
                      <div className="space-y-4">
                        {addresses.map((address) => (
                          <div key={address._id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{address.type}</h4>
                                  {address.isDefault && (
                                    <span className="bg-primary text-white text-xs px-2 py-1 rounded">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-600">{address.address}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditAddress(address._id)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />Edit
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600"
                                  onClick={() => handleDeleteAddress(address._id)}
                                >
                                  <Trash className="h-4 w-4 mr-1" />Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No saved addresses</h3>
                        <p className="text-gray-500 mb-6">Add your frequently used addresses for faster checkout.</p>
                        <Button className="bg-primary hover:bg-primary-dark" onClick={handleAddAddress}>
                          Add New Address
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* UserProfile component is directly integrated here */}
                {/* For a clean separation, you might extract this into a separate component. */}
                {/* The UserProfile component already handles its own data fetching and editing. */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Profile management is handled in the dedicated UserProfile page.</p>
                    <Link to="/profile">
                      <Button className="mt-4 bg-primary hover:bg-primary-dark">
                        Go to Profile Page
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <UserSettings />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
