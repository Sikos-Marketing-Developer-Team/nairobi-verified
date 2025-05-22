"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { 
  FaBell, 
  FaShoppingBag, 
  FaTag, 
  FaStore, 
  FaCheck, 
  FaTrash, 
  FaEnvelope 
} from "react-icons/fa";

interface Notification {
  id: number;
  type: "order" | "promotion" | "vendor" | "system";
  message: string;
  date: string;
  isRead: boolean;
  link?: string;
}

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with mock data
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Mock notifications data
        setNotifications([
          {
            id: 1,
            type: "order",
            message: "Your order #ORD-001 has been delivered",
            date: "2023-06-15",
            isRead: false,
            link: "/orders/ORD-001"
          },
          {
            id: 2,
            type: "promotion",
            message: "Flash sale on Electronics starting tomorrow!",
            date: "2023-06-14",
            isRead: true,
            link: "/flash-sales"
          },
          {
            id: 3,
            type: "vendor",
            message: "New shops added near your location",
            date: "2023-06-12",
            isRead: true,
            link: "/shops"
          },
          {
            id: 4,
            type: "order",
            message: "Your order #ORD-002 is being processed",
            date: "2023-06-10",
            isRead: false,
            link: "/orders/ORD-002"
          },
          {
            id: 5,
            type: "system",
            message: "Your account information has been updated successfully",
            date: "2023-06-08",
            isRead: true
          },
          {
            id: 6,
            type: "promotion",
            message: "Special offer: 20% off on all Fashion items this weekend!",
            date: "2023-06-05",
            isRead: true,
            link: "/products"
          }
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter notifications
  const filteredNotifications = filter
    ? notifications.filter(notification => notification.type === filter)
    : notifications;

  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
  };

  // Delete notification
  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <FaShoppingBag className="text-blue-500" />;
      case "promotion":
        return <FaTag className="text-green-500" />;
      case "vendor":
        return <FaStore className="text-purple-500" />;
      case "system":
        return <FaEnvelope className="text-gray-500" />;
      default:
        return <FaBell className="text-orange-500" />;
    }
  };

  // Get unread count
  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  return (
    <MainLayout>
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Notifications</h1>
            <p className="text-gray-600">Stay updated with your orders and offers</p>
          </div>

          {/* Filters and Actions */}
          <div className="mb-6 flex flex-col md:flex-row justify-between">
            <div className="flex overflow-x-auto mb-4 md:mb-0">
              <button
                onClick={() => setFilter(null)}
                className={`whitespace-nowrap px-4 py-2 rounded-full mr-2 ${
                  filter === null
                    ? "bg-orange-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("order")}
                className={`whitespace-nowrap px-4 py-2 rounded-full mr-2 ${
                  filter === "order"
                    ? "bg-orange-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setFilter("promotion")}
                className={`whitespace-nowrap px-4 py-2 rounded-full mr-2 ${
                  filter === "promotion"
                    ? "bg-orange-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Promotions
              </button>
              <button
                onClick={() => setFilter("vendor")}
                className={`whitespace-nowrap px-4 py-2 rounded-full mr-2 ${
                  filter === "vendor"
                    ? "bg-orange-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Vendors
              </button>
              <button
                onClick={() => setFilter("system")}
                className={`whitespace-nowrap px-4 py-2 rounded-full mr-2 ${
                  filter === "system"
                    ? "bg-orange-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                System
              </button>
            </div>
            
            <div className="flex">
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className={`flex items-center px-4 py-2 rounded-md mr-2 ${
                  unreadCount > 0
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <FaCheck className="mr-2" /> Mark All as Read
              </button>
              <button
                onClick={clearAllNotifications}
                disabled={notifications.length === 0}
                className={`flex items-center px-4 py-2 rounded-md ${
                  notifications.length > 0
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <FaTrash className="mr-2" /> Clear All
              </button>
            </div>
          </div>

          {/* Notifications List */}
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">
                  {filteredNotifications.length} {filteredNotifications.length === 1 ? 'Notification' : 'Notifications'}
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {unreadCount} Unread
                    </span>
                  )}
                </h2>
              </div>
              
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-6 ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}
                  >
                    <div className="flex">
                      <div className="flex-shrink-0 mr-4">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="mb-2 md:mb-0">
                            <p className={`text-gray-900 ${notification.isRead ? 'font-normal' : 'font-medium'}`}>
                              {notification.message}
                            </p>
                            <p className="text-sm text-gray-500">{notification.date}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {notification.link && (
                              <Link 
                                href={notification.link}
                                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                              >
                                View
                              </Link>
                            )}
                            
                            {!notification.isRead && (
                              <button 
                                onClick={() => markAsRead(notification.id)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                Mark as Read
                              </button>
                            )}
                            
                            <button 
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FaBell className="mx-auto text-gray-400 text-5xl mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600 mb-6">
                {filter
                  ? `You don't have any ${filter} notifications at the moment.`
                  : "You don't have any notifications at the moment."}
              </p>
              <Link 
                href="/"
                className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 inline-block"
              >
                Continue Shopping
              </Link>
            </div>
          )}
          
          {/* Notification Settings */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Notification Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Order Updates</h3>
                  <p className="text-sm text-gray-600">Receive notifications about your order status</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Promotions & Offers</h3>
                  <p className="text-sm text-gray-600">Receive notifications about sales and special offers</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Vendor Updates</h3>
                  <p className="text-sm text-gray-600">Receive notifications about new shops and vendor offers</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">System Notifications</h3>
                  <p className="text-sm text-gray-600">Receive important system updates and security alerts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
            </div>
            
            <div className="mt-6">
              <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}