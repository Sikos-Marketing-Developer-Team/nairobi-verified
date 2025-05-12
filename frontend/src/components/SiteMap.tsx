import React from 'react';
import Link from 'next/link';

interface RouteGroup {
  title: string;
  routes: Route[];
}

interface Route {
  path: string;
  name: string;
  description?: string;
}

const SiteMap: React.FC = () => {
  const routeGroups: RouteGroup[] = [
    {
      title: 'Main Pages',
      routes: [
        { path: '/', name: 'Home', description: 'Main landing page' },
        { path: '/join', name: 'Join', description: 'Choose account type' },
        { path: '/contact', name: 'Contact', description: 'Get in touch with us' },
        { path: '/help-center', name: 'Help Center', description: 'Find answers to common questions' },
        { path: '/map', name: 'Map', description: 'Find locations on the map' },
      ],
    },
    {
      title: 'Authentication',
      routes: [
        { path: '/auth/signin', name: 'Sign In', description: 'Login to your account' },
        { path: '/auth/signup', name: 'Sign Up', description: 'Create a new account' },
        { path: '/auth/register/client', name: 'Client Registration', description: 'Register as a client' },
        { path: '/auth/register/customer', name: 'Customer Registration', description: 'Register as a customer' },
        { path: '/auth/register/merchant', name: 'Merchant Registration', description: 'Register as a merchant' },
        { path: '/auth/forgot-password', name: 'Forgot Password', description: 'Reset your password' },
      ],
    },
    {
      title: 'User Account',
      routes: [
        { path: '/profile', name: 'Profile', description: 'View your profile' },
        { path: '/settings', name: 'Settings', description: 'Manage account settings' },
        { path: '/account/edit-profile', name: 'Edit Profile', description: 'Update your profile information' },
        { path: '/account/change-password', name: 'Change Password', description: 'Update your password' },
        { path: '/account/addresses', name: 'Addresses', description: 'Manage your addresses' },
        { path: '/account/payment-methods', name: 'Payment Methods', description: 'Manage payment methods' },
        { path: '/notifications', name: 'Notifications', description: 'View your notifications' },
      ],
    },
    {
      title: 'Shopping',
      routes: [
        { path: '/products', name: 'Products', description: 'Browse all products' },
        { path: '/categories', name: 'Categories', description: 'Browse product categories' },
        { path: '/shops', name: 'Shops', description: 'Browse all shops' },
        { path: '/cart', name: 'Cart', description: 'View your shopping cart' },
        { path: '/wishlist', name: 'Wishlist', description: 'View your wishlist' },
        { path: '/favorites', name: 'Favorites', description: 'View your favorite items' },
        { path: '/orders', name: 'Orders', description: 'View your orders' },
        { path: '/track-order', name: 'Track Order', description: 'Track your order status' },
      ],
    },
    {
      title: 'Special Offers',
      routes: [
        { path: '/flash-sales', name: 'Flash Sales', description: 'Limited-time sales' },
        { path: '/flash-deals', name: 'Flash Deals', description: 'Special flash deals' },
        { path: '/hot-deals', name: 'Hot Deals', description: 'Hot deals and offers' },
        { path: '/featured', name: 'Featured', description: 'Featured products' },
      ],
    },
    {
      title: 'Merchant Portal',
      routes: [
        { path: '/merchant/profile', name: 'Merchant Profile', description: 'View merchant profile' },
        { path: '/merchant/subscriptions', name: 'Subscriptions', description: 'Manage subscriptions' },
      ],
    },
    {
      title: 'Admin Portal',
      routes: [
        { path: '/admin/dashboard', name: 'Admin Dashboard', description: 'Admin control panel' },
        { path: '/admin/subscriptions', name: 'Manage Subscriptions', description: 'Manage all subscriptions' },
      ],
    },
    {
      title: 'Legal',
      routes: [
        { path: '/privacy-policy', name: 'Privacy Policy', description: 'Our privacy policy' },
        { path: '/terms-conditions', name: 'Terms & Conditions', description: 'Terms and conditions' },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Nairobi Verified Site Map</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {routeGroups.map((group, groupIndex) => (
          <div 
            key={groupIndex} 
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="bg-blue-600 px-4 py-3">
              <h2 className="text-xl font-semibold text-white">{group.title}</h2>
            </div>
            <ul className="divide-y divide-gray-200">
              {group.routes.map((route, routeIndex) => (
                <li key={routeIndex} className="hover:bg-gray-50">
                  <Link href={route.path}>
                    <div className="px-4 py-3 flex flex-col cursor-pointer">
                      <span className="text-blue-600 font-medium">{route.name}</span>
                      <span className="text-sm text-gray-500">{route.path}</span>
                      {route.description && (
                        <span className="text-xs text-gray-400 mt-1">{route.description}</span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SiteMap;