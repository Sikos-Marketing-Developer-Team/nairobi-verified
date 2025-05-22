"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { FaShoppingBag, FaSearch, FaFilter, FaChevronRight } from "react-icons/fa";

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: number;
  products: {
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  vendor: string;
  paymentMethod: string;
  deliveryAddress: string;
  trackingNumber?: string;
}

export default function OrdersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Simulate API call with mock data
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Mock orders data
        setOrders([
          {
            id: "ORD-001",
            date: "2023-06-15",
            status: "Delivered",
            total: 3500,
            items: 2,
            products: [
              {
                name: "Wireless Headphones",
                quantity: 1,
                price: 2500,
                image: "/images/products/headphones.jpg"
              },
              {
                name: "Phone Case",
                quantity: 1,
                price: 1000,
                image: "/images/products/phone-case.jpg"
              }
            ],
            vendor: "Electronics Hub",
            paymentMethod: "M-Pesa",
            deliveryAddress: "123 Kimathi Street, Nairobi CBD",
            trackingNumber: "TRK123456789"
          },
          {
            id: "ORD-002",
            date: "2023-06-10",
            status: "Processing",
            total: 1200,
            items: 1,
            products: [
              {
                name: "Men's T-Shirt",
                quantity: 1,
                price: 1200,
                image: "/images/products/tshirt.jpg"
              }
            ],
            vendor: "Fashion World",
            paymentMethod: "Credit Card",
            deliveryAddress: "456 Moi Avenue, Nairobi CBD"
          },
          {
            id: "ORD-003",
            date: "2023-06-05",
            status: "Delivered",
            total: 2800,
            items: 3,
            products: [
              {
                name: "Coffee Maker",
                quantity: 1,
                price: 1800,
                image: "/images/products/coffee-maker.jpg"
              },
              {
                name: "Coffee Beans",
                quantity: 2,
                price: 500,
                image: "/images/products/coffee-beans.jpg"
              }
            ],
            vendor: "Home Essentials",
            paymentMethod: "M-Pesa",
            deliveryAddress: "789 Kenyatta Avenue, Nairobi CBD",
            trackingNumber: "TRK987654321"
          },
          {
            id: "ORD-004",
            date: "2023-05-28",
            status: "Cancelled",
            total: 5999,
            items: 1,
            products: [
              {
                name: "Smartphone Pro",
                quantity: 1,
                price: 5999,
                image: "/images/products/smartphone.jpg"
              }
            ],
            vendor: "Electronics Hub",
            paymentMethod: "Bank Transfer",
            deliveryAddress: "321 Tom Mboya Street, Nairobi CBD"
          },
          {
            id: "ORD-005",
            date: "2023-05-20",
            status: "Shipped",
            total: 4500,
            items: 2,
            products: [
              {
                name: "Women's Handbag",
                quantity: 1,
                price: 3500,
                image: "/images/products/handbag.jpg"
              },
              {
                name: "Sunglasses",
                quantity: 1,
                price: 1000,
                image: "/images/products/sunglasses.jpg"
              }
            ],
            vendor: "Fashion World",
            paymentMethod: "M-Pesa",
            deliveryAddress: "654 Biashara Street, Nairobi CBD",
            trackingNumber: "TRK456789123"
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

  // Filter orders by status and search query
  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus ? order.status === selectedStatus : true;
    const matchesSearch = searchQuery 
      ? order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        order.products.some(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesStatus && matchesSearch;
  });

  // Get unique statuses for filter
  const statuses = Array.from(new Set(orders.map(order => order.status)));

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

  return (
    <MainLayout>
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Orders</h1>
            <p className="text-gray-600">Track and manage your orders</p>
          </div>

          {/* Search and Filter */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:w-3/4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search orders by ID or product name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="md:w-1/4">
                <select
                  value={selectedStatus || ""}
                  onChange={(e) => setSelectedStatus(e.target.value || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  {statuses.map((status, index) => (
                    <option key={index} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Order Header */}
                  <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <div className="flex items-center">
                        <FaShoppingBag className="text-gray-500 mr-2" />
                        <h3 className="font-medium text-gray-900">Order {order.id}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Placed on {order.date}</p>
                    </div>
                    <div className="mt-2 md:mt-0 flex flex-col md:flex-row md:items-center">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <Link 
                        href={`/orders/${order.id}`}
                        className="mt-2 md:mt-0 md:ml-4 text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center"
                      >
                        View Details <FaChevronRight className="ml-1" size={12} />
                      </Link>
                    </div>
                  </div>
                  
                  {/* Order Summary */}
                  <div className="p-4">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="mb-4 md:mb-0">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Order Summary</h4>
                        <p className="text-sm text-gray-600">{order.items} item(s) • KES {order.total.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 mt-1">Vendor: {order.vendor}</p>
                      </div>
                      
                      <div className="mb-4 md:mb-0">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Payment Method</h4>
                        <p className="text-sm text-gray-600">{order.paymentMethod}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Delivery Address</h4>
                        <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                      </div>
                    </div>
                    
                    {/* Tracking Info (if available) */}
                    {order.trackingNumber && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Tracking Number</h4>
                            <p className="text-sm text-gray-600">{order.trackingNumber}</p>
                          </div>
                          <Link 
                            href={`/track-order?id=${order.id}`}
                            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 text-sm"
                          >
                            Track Order
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FaShoppingBag className="mx-auto text-gray-400 text-5xl mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedStatus
                  ? "No orders match your search criteria. Try adjusting your filters."
                  : "You haven't placed any orders yet."}
              </p>
              <Link 
                href="/products"
                className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 inline-block"
              >
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}