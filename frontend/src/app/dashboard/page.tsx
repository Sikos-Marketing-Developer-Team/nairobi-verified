"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import { FaShoppingBag, FaHeart, FaHistory, FaUser, FaStore, FaSearch } from "react-icons/fa";

export default function ClientDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    recentOrders: [],
    savedVendors: [],
  });

  useEffect(() => {
    // Check for verification message
    const verified = searchParams.get("verified");
    if (verified === "true") {
      setMessage("Email verified successfully!");
      router.replace("/dashboard");
    }

    // Simulate fetching user data
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/auth/signin');
          return;
        }
        
        // In a real app, you would fetch this data from your API
        // For demo purposes, we'll use mock data
        setTimeout(() => {
          setUserData({
            fullName: "John Doe",
            email: "john.doe@example.com",
            recentOrders: [
              { id: "ORD-001", date: "2023-06-15", status: "Delivered", total: 3500 },
              { id: "ORD-002", date: "2023-06-10", status: "Processing", total: 1200 },
              { id: "ORD-003", date: "2023-06-05", status: "Delivered", total: 2800 },
            ],
            savedVendors: [
              { id: 1, name: "Electronics Hub", category: "Electronics" },
              { id: 2, name: "Fashion World", category: "Fashion" },
              { id: 3, name: "Fresh Groceries", category: "Grocery" },
            ],
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router, searchParams]);

  return (
    <MainLayout>
      <div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {message && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
              <p>{message}</p>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
              <p className="text-gray-600">Welcome back, {userData.fullName || "Guest"}</p>
            </div>
            <div className="mt-4 md:mt-0 relative">
              <div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden">
                <input
                  type="text"
                  placeholder="Search for vendors or products..."
                  className="py-2 px-4 w-64 focus:outline-none"
                />
                <button className="bg-orange-600 text-white p-2">
                  <FaSearch />
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <>
              {/* Quick Links */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <a
                  href="/marketplace"
                  className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
                >
                  <div className="p-3 rounded-full bg-orange-100 text-orange-500 mb-4">
                    <FaStore className="text-xl" />
                  </div>
                  <h3 className="font-medium text-gray-800">Marketplace</h3>
                  <p className="text-sm text-gray-500 mt-1">Explore verified vendors</p>
                </a>

                <a
                  href="/orders"
                  className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
                >
                  <div className="p-3 rounded-full bg-blue-100 text-blue-500 mb-4">
                    <FaShoppingBag className="text-xl" />
                  </div>
                  <h3 className="font-medium text-gray-800">My Orders</h3>
                  <p className="text-sm text-gray-500 mt-1">Track your purchases</p>
                </a>

                <a
                  href="/favorites"
                  className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
                >
                  <div className="p-3 rounded-full bg-red-100 text-red-500 mb-4">
                    <FaHeart className="text-xl" />
                  </div>
                  <h3 className="font-medium text-gray-800">Favorites</h3>
                  <p className="text-sm text-gray-500 mt-1">Your saved vendors</p>
                </a>

                <a
                  href="/profile"
                  className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
                >
                  <div className="p-3 rounded-full bg-green-100 text-green-500 mb-4">
                    <FaUser className="text-xl" />
                  </div>
                  <h3 className="font-medium text-gray-800">My Profile</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage your account</p>
                </a>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
                  <a href="/orders" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                    View All
                  </a>
                </div>
                {userData.recentOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {userData.recentOrders.map((order, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                                order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              KES {order.total.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">You haven't placed any orders yet.</p>
                )}
              </div>

              {/* Saved Vendors */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Saved Vendors</h2>
                  <a href="/favorites" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                    View All
                  </a>
                </div>
                {userData.savedVendors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {userData.savedVendors.map((vendor, index) => (
                      <a
                        key={index}
                        href={`/vendor/${vendor.id}`}
                        className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                      >
                        <h3 className="font-medium text-gray-800">{vendor.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{vendor.category}</p>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">You haven't saved any vendors yet.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}