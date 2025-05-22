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
import AdminLayout from "@/components/admin/AdminLayout";
import AnimatedStatCard from "@/components/admin/AnimatedStatCard";
import EnhancedChart from "@/components/admin/EnhancedChart";
import MerchantVerificationCard from "@/components/admin/MerchantVerificationCard";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { motion } from "framer-motion";

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
      <AdminLayout notificationCount={0}>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout notificationCount={notifications.length}>
      <div className="space-y-6">
        <Breadcrumbs />
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        </div>
        
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <AnimatedStatCard
                title="Total Users"
                value={stats?.userCount || 0}
                previousValue={stats?.userCount ? Math.round(stats.userCount * 0.9) : undefined}
                icon={<FaUsers className="h-6 w-6" />}
                iconBgColor="bg-blue-100"
                iconColor="text-blue-500"
              />
              
              <AnimatedStatCard
                title="Merchants"
                value={stats?.merchantCount || 0}
                previousValue={stats?.merchantCount ? Math.round(stats.merchantCount * 0.85) : undefined}
                icon={<FaStore className="h-6 w-6" />}
                iconBgColor="bg-green-100"
                iconColor="text-green-500"
              />
              
              <AnimatedStatCard
                title="Orders"
                value={stats?.orderCount || 0}
                previousValue={stats?.orderCount ? Math.round(stats.orderCount * 0.95) : undefined}
                icon={<FaShoppingCart className="h-6 w-6" />}
                iconBgColor="bg-purple-100"
                iconColor="text-purple-500"
              />
              
              <AnimatedStatCard
                title="Revenue"
                value={stats?.totalRevenue || 0}
                previousValue={stats?.totalRevenue ? stats.totalRevenue * 0.92 : undefined}
                icon={<FaMoneyBillWave className="h-6 w-6" />}
                iconBgColor="bg-yellow-100"
                iconColor="text-yellow-500"
                formatter={(val) => `$${val.toLocaleString()}`}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <EnhancedChart
                title="Monthly Revenue"
                type="bar"
                data={revenueChartData}
                height="300px"
                timeRanges={['30d', '90d', '1y', 'all']}
                onTimeRangeChange={(range) => {
                  console.log(`Changed time range to: ${range}`);
                  // Here you would fetch new data based on the time range
                }}
                onRefresh={() => {
                  console.log('Refreshing revenue chart data');
                  fetchDashboardStats();
                }}
                onDownload={(format) => {
                  console.log(`Downloading chart as ${format}`);
                  // Implement download functionality
                }}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                      ticks: {
                        callback: function(value: number) {
                          return '$' + value;
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
              
              <EnhancedChart
                title="User Distribution"
                type="doughnut"
                data={userDistributionData}
                height="300px"
                onRefresh={() => {
                  console.log('Refreshing user distribution data');
                  fetchDashboardStats();
                }}
                onDownload={(format) => {
                  console.log(`Downloading chart as ${format}`);
                  // Implement download functionality
                }}
                options={{
                  cutout: '60%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                    }
                  }
                }}
              />
            </div>

            {/* Pending Verifications Preview */}
            <motion.div 
              className="bg-white rounded-lg shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900">Recent Pending Verifications</h3>
                  {merchants.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                      {merchants.length}
                    </span>
                  )}
                </div>
                <motion.button 
                  onClick={() => setActiveTab("merchants")}
                  className="text-sm text-orange-600 hover:text-orange-800 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View All
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </div>
              
              {merchants.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-4 text-gray-500">No pending verifications at the moment</p>
                </div>
              ) : (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {merchants.slice(0, 6).map((merchant) => (
                      <MerchantVerificationCard
                        key={merchant.id}
                        merchant={merchant}
                        onVerify={(id) => handleVerification(id, "verify")}
                        onReject={(id) => handleVerification(id, "reject")}
                        onViewDetails={viewMerchantDetails}
                        onViewDocument={viewDocument}
                      />
                    ))}
                  </div>
                  
                  {merchants.length > 6 && (
                    <div className="mt-4 text-center">
                      <motion.button
                        onClick={() => setActiveTab("merchants")}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        View All {merchants.length} Pending Verifications
                      </motion.button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Merchants Tab */}
        {activeTab === "merchants" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Pending Merchant Verifications</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Review and verify merchant applications
                </p>
              </div>
              
              {merchants.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-4 text-gray-500">No pending verifications at the moment</p>
                </div>
              ) : (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {merchants.map((merchant) => (
                      <MerchantVerificationCard
                        key={merchant.id}
                        merchant={merchant}
                        onVerify={(id) => handleVerification(id, "verify")}
                        onReject={(id) => handleVerification(id, "reject")}
                        onViewDetails={viewMerchantDetails}
                        onViewDocument={viewDocument}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <NotificationList 
            notifications={notifications} 
            onClearAll={clearAllNotifications}
            onMarkAllRead={markAllNotificationsAsRead}
          />
        )}
      </div>

      {/* Merchant Details Modal */}
      {selectedMerchant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-lg shadow-xl overflow-hidden max-w-2xl w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Merchant Details</h3>
              <button 
                onClick={closeMerchantDetails}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Company Name</p>
                  <p className="text-base text-gray-900">{selectedMerchant.companyName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-base text-gray-900">{selectedMerchant.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base text-gray-900">{selectedMerchant.companyEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-base text-gray-900">{selectedMerchant.companyPhone}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Documents</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => viewDocument(selectedMerchant.documents.businessRegistration)}
                    className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                  >
                    <FaFileAlt className="mr-2" /> Business Registration
                  </button>
                  <button
                    onClick={() => viewDocument(selectedMerchant.documents.taxCertificate)}
                    className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                  >
                    <FaFileAlt className="mr-2" /> Tax Certificate
                  </button>
                  <button
                    onClick={() => viewDocument(selectedMerchant.documents.idDocument)}
                    className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                  >
                    <FaFileAlt className="mr-2" /> ID Document
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    handleVerification(selectedMerchant.id, "reject");
                    closeMerchantDetails();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    handleVerification(selectedMerchant.id, "verify");
                    closeMerchantDetails();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Verify
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Document Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Document Preview</h3>
              <button 
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="h-[70vh] flex items-center justify-center bg-gray-100 rounded-lg">
                {documentUrl.endsWith('.pdf') ? (
                  <iframe 
                    src={documentUrl} 
                    className="w-full h-full" 
                    title="Document Preview"
                  />
                ) : (
                  <img 
                    src={documentUrl} 
                    alt="Document Preview" 
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}