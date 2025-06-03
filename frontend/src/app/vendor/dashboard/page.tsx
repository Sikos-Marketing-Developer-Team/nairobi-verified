"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import { FaStore, FaBox, FaShoppingCart, FaStar, FaChartLine, FaPlus } from "react-icons/fa";

export default function VendorDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [vendorData, setVendorData] = useState({
    businessName: "",
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
  });

  useEffect(() => {
    // Simulate fetching vendor data
    const fetchVendorData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/auth/signin');
          return;
        }
        
        // Check if vendor is verified (in a real app, this would be part of the token or user data)
        // For demo purposes, we'll redirect to a message page if not verified
        const isVerified = localStorage.getItem('vendorVerified') === 'true';
        
        if (!isVerified) {
          // Redirect to a page explaining that the vendor account is under review
          router.push('/vendor/confirmation?businessName=Your%20Business');
          return;
        }
        
        // In a real app, you would fetch this data from your API
        // const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/vendor/dashboard`, {
        //   headers: {
        //     'Authorization': `Bearer ${token}`
        //   }
        // });
        // const data = await response.json();
        
        // Use real API calls
        const { apiService } = await import('@/lib/api');
        
        // Get merchant profile data
        const profileResponse = await apiService.merchant.getProfile();
        
        if (profileResponse.data) {
          // Get merchant orders
          const ordersResponse = await apiService.merchant.getOrders();
          
          // Get merchant products
          const productsResponse = await apiService.merchant.getProducts();
          
          // Calculate dashboard stats
          const orders = ordersResponse.data || [];
          const pendingOrders = orders.filter((order: any) => 
            order.status === 'pending' || order.status === 'processing'
          );
          
          // Calculate total revenue from completed orders
          const completedOrders = orders.filter((order: any) => order.status === 'completed');
          const totalRevenue = completedOrders.reduce((sum: number, order: any) => 
            sum + (order.total || 0), 0
          );
          
          setVendorData({
            businessName: profileResponse.data.companyName || "Your Business Name",
            totalProducts: productsResponse.data?.length || 0,
            totalOrders: orders.length || 0,
            pendingOrders: pendingOrders.length || 0,
            totalRevenue: totalRevenue || 0,
            averageRating: profileResponse.data.rating || 4.5,
          });
        } else {
          // Fallback if no data is available
          setVendorData({
            businessName: "Your Business Name",
            totalProducts: 0,
            totalOrders: 0,
            pendingOrders: 0,
            totalRevenue: 0,
            averageRating: 0,
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching vendor data:", error);
        setIsLoading(false);
      }
    };

    fetchVendorData();
  }, [router]);

  return (
    <MainLayout>
      <div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Vendor Dashboard</h1>
              <p className="text-gray-600">Welcome back to {vendorData.businessName || "your dashboard"}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => router.push('/vendor/products/add')}
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
              >
                <FaPlus className="mr-2" />
                Add New Product
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-orange-100 text-orange-500 mr-4">
                      <FaBox className="text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Total Products</p>
                      <p className="text-2xl font-bold text-gray-800">{vendorData.totalProducts}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                      <FaShoppingCart className="text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-800">{vendorData.totalOrders}</p>
                      <p className="text-xs text-gray-500">{vendorData.pendingOrders} pending</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                      <FaChartLine className="text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-800">KES {vendorData.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
                      <FaStar className="text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Average Rating</p>
                      <p className="text-2xl font-bold text-gray-800">{vendorData.averageRating.toFixed(1)}/5.0</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <a
                    href="/vendor/products"
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <FaBox className="text-orange-500 text-2xl mb-2" />
                    <span className="text-sm font-medium text-gray-700">Manage Products</span>
                  </a>
                  <a
                    href="/vendor/orders"
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <FaShoppingCart className="text-blue-500 text-2xl mb-2" />
                    <span className="text-sm font-medium text-gray-700">View Orders</span>
                  </a>
                  <a
                    href="/vendor/profile"
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <FaStore className="text-green-500 text-2xl mb-2" />
                    <span className="text-sm font-medium text-gray-700">Edit Profile</span>
                  </a>
                  <a
                    href="/vendor/analytics"
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <FaChartLine className="text-purple-500 text-2xl mb-2" />
                    <span className="text-sm font-medium text-gray-700">Analytics</span>
                  </a>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
                  <a href="/vendor/orders" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                    View All
                  </a>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Sample order data */}
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#ORD-001</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">John Doe</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-06-15</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">KES 3,500</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#ORD-002</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jane Smith</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-06-14</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">KES 1,200</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Processing
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#ORD-003</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Michael Johnson</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-06-13</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">KES 2,800</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Shipped
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}