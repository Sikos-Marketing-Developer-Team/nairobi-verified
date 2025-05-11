"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaShoppingBag, 
  FaHeart, 
  FaCreditCard, 
  FaBell, 
  FaEdit, 
  FaCamera,
  FaSignOutAlt,
  FaChevronRight
} from "react-icons/fa";

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  profileImage: string;
  memberSince: string;
  orderCount: number;
  wishlistCount: number;
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: number;
}

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    // Simulate API call with mock data
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Mock profile data
        const profileData = {
          fullName: "John Doe",
          email: "john.doe@example.com",
          phone: "+254 712 345 678",
          address: "123 Kimathi Street, Nairobi CBD",
          profileImage: "/images/avatars/user1.jpg",
          memberSince: "June 2022",
          orderCount: 12,
          wishlistCount: 5
        };
        
        setProfile(profileData);
        setFormData({
          fullName: profileData.fullName,
          email: profileData.email,
          phone: profileData.phone,
          address: profileData.address
        });
        
        // Mock recent orders
        setRecentOrders([
          { id: "ORD-001", date: "2023-06-15", status: "Delivered", total: 3500, items: 2 },
          { id: "ORD-002", date: "2023-06-10", status: "Processing", total: 1200, items: 1 },
          { id: "ORD-003", date: "2023-06-05", status: "Delivered", total: 2800, items: 3 },
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would send the updated profile to the server
    setProfile({
      ...profile!,
      ...formData
    });
    
    setIsEditing(false);
  };

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      case "Shipped":
        return "bg-blue-100 text-blue-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="bg-gray-100 min-h-screen py-8">
          <div className="container mx-auto px-4">
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-orange-500"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/4 mb-4 md:mb-0 flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                    {profile?.profileImage ? (
                      <Image 
                        src={profile.profileImage} 
                        alt={profile.fullName} 
                        width={128} 
                        height={128} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaUser className="text-gray-400 text-4xl" />
                      </div>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700">
                    <FaCamera />
                  </button>
                </div>
              </div>
              
              <div className="md:w-3/4 text-center md:text-left md:pl-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile?.fullName}</h1>
                <p className="text-gray-600 mb-4">Member since {profile?.memberSince}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-500 text-sm">Orders</p>
                    <p className="text-gray-900 font-bold">{profile?.orderCount}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-500 text-sm">Wishlist</p>
                    <p className="text-gray-900 font-bold">{profile?.wishlistCount}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-500 text-sm">Reviews</p>
                    <p className="text-gray-900 font-bold">8</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-500 text-sm">Points</p>
                    <p className="text-gray-900 font-bold">250</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 justify-center md:justify-start">
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    <FaEdit className="mr-2" /> Edit Profile
                  </button>
                  <button className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                    <FaSignOutAlt className="mr-2" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Account</h2>
                
                <nav className="space-y-1">
                  <button 
                    onClick={() => setActiveTab("profile")}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === "profile" 
                        ? "text-orange-600 bg-orange-50" 
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FaUser className={`mr-3 ${activeTab === "profile" ? "text-orange-500" : "text-gray-400"}`} />
                    <span>Profile Information</span>
                  </button>
                  
                  <Link 
                    href="/orders"
                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    <FaShoppingBag className="mr-3 text-gray-400" />
                    <span>Orders</span>
                  </Link>
                  
                  <Link 
                    href="/wishlist"
                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    <FaHeart className="mr-3 text-gray-400" />
                    <span>Wishlist</span>
                  </Link>
                  
                  <Link 
                    href="/addresses"
                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    <FaMapMarkerAlt className="mr-3 text-gray-400" />
                    <span>Addresses</span>
                  </Link>
                  
                  <Link 
                    href="/payment-methods"
                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    <FaCreditCard className="mr-3 text-gray-400" />
                    <span>Payment Methods</span>
                  </Link>
                  
                  <Link 
                    href="/notifications"
                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    <FaBell className="mr-3 text-gray-400" />
                    <span>Notifications</span>
                  </Link>
                </nav>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Help & Support</h2>
                
                <nav className="space-y-1">
                  <Link 
                    href="/contact"
                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    <FaEnvelope className="mr-3 text-gray-400" />
                    <span>Contact Us</span>
                  </Link>
                </nav>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-2">
              {/* Profile Information */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h2>
                
                {isEditing ? (
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
                      <p className="text-gray-900">{profile?.fullName}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Email Address</h3>
                      <p className="text-gray-900">{profile?.email}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Phone Number</h3>
                      <p className="text-gray-900">{profile?.phone}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Address</h3>
                      <p className="text-gray-900">{profile?.address}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
                  <Link 
                    href="/orders"
                    className="text-sm font-medium text-orange-600 hover:text-orange-700"
                  >
                    View All
                  </Link>
                </div>
                
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium text-gray-900">{order.id}</p>
                          <p className="text-sm text-gray-500">{order.date}</p>
                        </div>
                        <div>
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">KES {order.total.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{order.items} items</p>
                        </div>
                        <Link 
                          href={`/orders/${order.id}`}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <FaChevronRight />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-gray-500">
                    You haven&apos;t placed any orders yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}