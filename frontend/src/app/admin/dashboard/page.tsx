"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import { FaUsers, FaStore, FaShoppingCart, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaEye, FaFileAlt, FaSignOutAlt, FaChartLine } from "react-icons/fa";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useSocket } from "@/context/SocketContext";
import NotificationBadge from "@/components/admin/NotificationBadge";
import NotificationList from "@/components/admin/NotificationList";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface Merchant {
  id: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  location: string;
  isVerified: boolean;
  documents: {
    businessRegistration: string;
    taxCertificate: string;
    idDocument: string;
  };
  createdAt: string;
}

interface DashboardStats {
  userCount: number;
  merchantCount: number;
  clientCount: number;
  productCount: number;
  orderCount: number;
  pendingVerificationCount: number;
  activeSubscriptionsCount: number;
  totalRevenue: number;
  monthlyRevenue: number[];
}

export default function AdminDashboard() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState<{id: string, message: string, time: Date}[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentUrl, setDocumentUrl] = useState("");
  const router = useRouter();
  const { socket, isConnected } = useSocket();

  // Function to fetch merchants
  const fetchMerchants = useCallback(async () => {
    try {
      const response = await apiService.admin.getPendingVerifications();
      setMerchants(response.data.merchants || []);
    } catch (error) {
      console.error("Error fetching merchants:", error);
      setError("Failed to load merchants. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await apiService.admin.getDashboardStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  }, []);

  // Initialize data fetching
  useEffect(() => {
    fetchMerchants();
    fetchDashboardStats();
  }, [fetchMerchants, fetchDashboardStats]);

  // Set up socket listeners
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    // Listen for new merchant registrations
    socket.on('newMerchantRegistration', (merchant: Merchant) => {
      setMerchants(prev => [merchant, ...prev]);
      
      // Add notification
      const notification = {
        id: Date.now().toString(),
        message: `New merchant registration: ${merchant.companyName}`,
        time: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          pendingVerificationCount: stats.pendingVerificationCount + 1,
          merchantCount: stats.merchantCount + 1
        });
      }
    });
    
    // Listen for merchant verification
    socket.on('merchantVerified', (data: { id: string, companyName: string, email: string }) => {
      // Remove merchant from list
      setMerchants(prev => prev.filter(m => m.id !== data.id));
      
      // Add notification
      const notification = {
        id: Date.now().toString(),
        message: `Merchant ${data.companyName} has been verified`,
        time: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          pendingVerificationCount: Math.max(0, stats.pendingVerificationCount - 1)
        });
      }
    });
    
    // Listen for merchant rejection
    socket.on('merchantRejected', (data: { id: string, companyName: string, email: string, reason: string }) => {
      // Remove merchant from list
      setMerchants(prev => prev.filter(m => m.id !== data.id));
      
      // Add notification
      const notification = {
        id: Date.now().toString(),
        message: `Merchant ${data.companyName} has been rejected: ${data.reason}`,
        time: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          pendingVerificationCount: Math.max(0, stats.pendingVerificationCount - 1)
        });
      }
    });

    // Clean up socket listeners
    return () => {
      socket.off('newMerchantRegistration');
      socket.off('merchantVerified');
      socket.off('merchantRejected');
    };
  }, [socket, isConnected, stats]);

  // Handle merchant verification
  const handleVerification = async (merchantId: string, action: "verify" | "reject") => {
    try {
      await apiService.admin.processMerchantVerification(
        merchantId, 
        action, 
        action === "reject" ? "Rejected by admin" : ""
      );

      setSuccess(`Merchant ${action === "verify" ? "verified" : "rejected"} successfully`);
      
      // Update local state to reflect the change
      setMerchants(prev => prev.filter(merchant => merchant.id !== merchantId));
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          pendingVerificationCount: stats.pendingVerificationCount - 1
        });
      }
      
      // Add notification
      const merchant = merchants.find(m => m.id === merchantId);
      const notification = {
        id: Date.now().toString(),
        message: `Merchant ${merchant?.companyName} ${action === "verify" ? "verified" : "rejected"}`,
        time: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
      
    } catch (error) {
      console.error("Error updating merchant status:", error);
      setError("Failed to update merchant status. Please try again later.");
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await apiService.auth.logout();
      router.push("/auth/signin");
    } catch (error) {
      console.error("Logout failed:", error);
      setError("Logout failed. Please try again.");
    }
  };

  // View document in modal
  const viewDocument = (url: string) => {
    setDocumentUrl(url);
    setShowDocumentModal(true);
  };

  // View merchant details
  const viewMerchantDetails = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
  };

  // Close merchant details
  const closeMerchantDetails = () => {
    setSelectedMerchant(null);
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };
  
  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Prepare chart data
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: stats?.monthlyRevenue || Array(12).fill(0),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      },
    ],
  };

  const userDistributionData = {
    labels: ['Clients', 'Merchants', 'Pending Verification'],
    datasets: [
      {
        data: stats ? [stats.clientCount, stats.merchantCount - stats.pendingVerificationCount, stats.pendingVerificationCount] : [0, 0, 0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <NotificationBadge 
                onClick={() => setActiveTab(activeTab === "notifications" ? "overview" : "notifications")}
                count={notifications.length}
              />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("overview")}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("merchants")}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "merchants"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pending Verifications
              {merchants.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                  {merchants.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "notifications"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Notifications
              {notifications.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                  {notifications.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaTimesCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaCheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                    <FaUsers className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats?.userCount || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                    <FaStore className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Merchants</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats?.merchantCount || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
                    <FaShoppingCart className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats?.orderCount || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
                    <FaMoneyBillWave className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue</h3>
                <div className="h-64">
                  <Bar 
                    data={revenueChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                        title: {
                          display: false,
                        },
                      },
                    }} 
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Distribution</h3>
                <div className="h-64 flex items-center justify-center">
                  <Doughnut 
                    data={userDistributionData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                        },
                      },
                    }} 
                  />
                </div>
              </div>
            </div>

            {/* Pending Verifications Preview */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Recent Pending Verifications</h3>
                <button 
                  onClick={() => setActiveTab("merchants")}
                  className="text-sm text-orange-600 hover:text-orange-800"
                >
                  View All
                </button>
              </div>
              
              {merchants.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No pending verifications at the moment
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {merchants.slice(0, 5).map((merchant) => (
                        <tr key={merchant.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {merchant.companyName}
                            </div>
                            <div className="text-sm text-gray-500">{merchant.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{merchant.companyEmail}</div>
                            <div className="text-sm text-gray-500">{merchant.companyPhone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => viewMerchantDetails(merchant)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <FaEye className="inline mr-1" /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Merchants Tab */}
        {activeTab === "merchants" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Pending Merchant Verifications</h3>
              <p className="mt-1 text-sm text-gray-500">
                Review and verify merchant applications
              </p>
            </div>
            
            {merchants.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No pending verifications at the moment
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documents
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {merchants.map((merchant) => (
                      <tr key={merchant.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {merchant.companyName}
                          </div>
                          <div className="text-sm text-gray-500">{merchant.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{merchant.companyEmail}</div>
                          <div className="text-sm text-gray-500">{merchant.companyPhone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-x-2">
                            {Object.entries(merchant.documents).map(([type, url]) => (
                              <button
                                key={type}
                                onClick={() => viewDocument(url as string)}
                                className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
                              >
                                <FaFileAlt className="mr-1" />
                                {type.replace(/([A-Z])/g, " $1").trim()}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="space-x-2">
                            <button
                              onClick={() => handleVerification(merchant.id, "verify")}
                              className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                            >
                              <FaCheckCircle className="inline mr-1" /> Verify
                            </button>
                            <button
                              onClick={() => handleVerification(merchant.id, "reject")}
                              className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                            >
                              <FaTimesCircle className="inline mr-1" /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <NotificationList 
            notifications={notifications}
            onClearAll={clearAllNotifications}
            onMarkAllRead={markAllNotificationsAsRead}
          />
        )}
      </main>

      {/* Merchant Details Modal */}
      {selectedMerchant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Merchant Details</h3>
              <button 
                onClick={closeMerchantDetails}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Company Name</h4>
                  <p className="text-base text-gray-900">{selectedMerchant.companyName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Location</h4>
                  <p className="text-base text-gray-900">{selectedMerchant.location}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p className="text-base text-gray-900">{selectedMerchant.companyEmail}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                  <p className="text-base text-gray-900">{selectedMerchant.companyPhone}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Registration Date</h4>
                  <p className="text-base text-gray-900">
                    {new Date(selectedMerchant.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <p className="text-base text-gray-900">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(selectedMerchant.documents).map(([type, url]) => (
                    <div key={type} className="border border-gray-200 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">
                        {type.replace(/([A-Z])/g, " $1").trim()}
                      </h5>
                      <button
                        onClick={() => viewDocument(url as string)}
                        className="w-full px-3 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 flex items-center justify-center"
                      >
                        <FaEye className="mr-2" /> View Document
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    handleVerification(selectedMerchant.id, "reject");
                    closeMerchantDetails();
                  }}
                  className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 flex items-center"
                >
                  <FaTimesCircle className="mr-2" /> Reject
                </button>
                <button
                  onClick={() => {
                    handleVerification(selectedMerchant.id, "verify");
                    closeMerchantDetails();
                  }}
                  className="px-4 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 flex items-center"
                >
                  <FaCheckCircle className="mr-2" /> Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Document Viewer</h3>
              <button 
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-6 overflow-auto">
              <iframe 
                src={documentUrl} 
                className="w-full h-full min-h-[500px] border border-gray-200 rounded"
                title="Document Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}