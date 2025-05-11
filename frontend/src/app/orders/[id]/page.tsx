"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { 
  FaShoppingBag, 
  FaArrowLeft, 
  FaTruck, 
  FaMapMarkerAlt, 
  FaCreditCard, 
  FaStore,
  FaCheckCircle,
  FaSpinner,
  FaBox,
  FaTimesCircle,
  FaFileInvoice,
  FaHeadset
} from "react-icons/fa";

interface OrderParams {
  params: {
    id: string;
  };
}

interface OrderProduct {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: number;
  products: OrderProduct[];
  vendor: string;
  vendorId: number;
  paymentMethod: string;
  deliveryAddress: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  timeline?: {
    ordered: string;
    processing?: string;
    shipped?: string;
    delivered?: string;
    cancelled?: string;
  };
}

// Mock orders data
const ordersData: Record<string, Order> = {
  "ORD-001": {
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
    vendorId: 1,
    paymentMethod: "M-Pesa",
    deliveryAddress: "123 Kimathi Street, Nairobi CBD",
    trackingNumber: "TRK123456789",
    estimatedDelivery: "2023-06-18",
    timeline: {
      ordered: "2023-06-15 09:30 AM",
      processing: "2023-06-15 11:45 AM",
      shipped: "2023-06-16 02:15 PM",
      delivered: "2023-06-17 10:20 AM"
    }
  },
  "ORD-002": {
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
    vendorId: 2,
    paymentMethod: "Credit Card",
    deliveryAddress: "456 Moi Avenue, Nairobi CBD",
    estimatedDelivery: "2023-06-20",
    timeline: {
      ordered: "2023-06-10 03:45 PM",
      processing: "2023-06-11 09:30 AM"
    }
  },
  "ORD-003": {
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
    vendorId: 3,
    paymentMethod: "M-Pesa",
    deliveryAddress: "789 Kenyatta Avenue, Nairobi CBD",
    trackingNumber: "TRK987654321",
    estimatedDelivery: "2023-06-10",
    timeline: {
      ordered: "2023-06-05 10:15 AM",
      processing: "2023-06-05 02:30 PM",
      shipped: "2023-06-06 11:45 AM",
      delivered: "2023-06-08 09:20 AM"
    }
  },
  "ORD-004": {
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
    vendorId: 1,
    paymentMethod: "Bank Transfer",
    deliveryAddress: "321 Tom Mboya Street, Nairobi CBD",
    timeline: {
      ordered: "2023-05-28 04:20 PM",
      processing: "2023-05-29 10:15 AM",
      cancelled: "2023-05-30 09:30 AM"
    }
  },
  "ORD-005": {
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
    vendorId: 2,
    paymentMethod: "M-Pesa",
    deliveryAddress: "654 Biashara Street, Nairobi CBD",
    trackingNumber: "TRK456789123",
    estimatedDelivery: "2023-05-25",
    timeline: {
      ordered: "2023-05-20 11:30 AM",
      processing: "2023-05-20 03:45 PM",
      shipped: "2023-05-22 10:15 AM"
    }
  }
};

export default function OrderDetailPage({ params }: OrderParams) {
  const { id } = params;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with mock data
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Find order by ID
        const foundOrder = ordersData[id];
        if (foundOrder) {
          setOrder(foundOrder);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered":
        return <FaCheckCircle className="text-green-500" />;
      case "Processing":
        return <FaSpinner className="text-yellow-500" />;
      case "Shipped":
        return <FaTruck className="text-blue-500" />;
      case "Cancelled":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaBox className="text-gray-500" />;
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

  if (!order) {
    return (
      <MainLayout>
        <div className="bg-gray-100 min-h-screen py-8">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FaShoppingBag className="mx-auto text-gray-400 text-5xl mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Order Not Found</h3>
              <p className="text-gray-600 mb-6">
                The order you are looking for does not exist or has been removed.
              </p>
              <Link 
                href="/orders"
                className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 inline-block"
              >
                Back to Orders
              </Link>
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
          {/* Back Button */}
          <div className="mb-6">
            <Link 
              href="/orders"
              className="inline-flex items-center text-gray-600 hover:text-orange-600"
            >
              <FaArrowLeft className="mr-2" /> Back to Orders
            </Link>
          </div>

          {/* Order Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <div className="flex items-center">
                  <FaShoppingBag className="text-gray-500 mr-2" />
                  <h1 className="text-xl font-bold text-gray-900">Order {order.id}</h1>
                </div>
                <p className="text-gray-600 mt-1">Placed on {order.date}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="ml-2">{order.status}</span>
                </span>
              </div>
            </div>
            
            {/* Order Timeline */}
            {order.timeline && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Timeline</h2>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  {/* Timeline Events */}
                  <div className="space-y-6">
                    <div className="flex">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center z-10">
                        <FaCheckCircle className="text-white text-xs" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">Order Placed</h3>
                        <p className="text-sm text-gray-500">{order.timeline.ordered}</p>
                      </div>
                    </div>
                    
                    {order.timeline.processing && (
                      <div className="flex">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-yellow-500 flex items-center justify-center z-10">
                          <FaSpinner className="text-white text-xs" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">Processing</h3>
                          <p className="text-sm text-gray-500">{order.timeline.processing}</p>
                        </div>
                      </div>
                    )}
                    
                    {order.timeline.shipped && (
                      <div className="flex">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center z-10">
                          <FaTruck className="text-white text-xs" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">Shipped</h3>
                          <p className="text-sm text-gray-500">{order.timeline.shipped}</p>
                          {order.trackingNumber && (
                            <p className="text-sm text-gray-500">Tracking: {order.trackingNumber}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {order.timeline.delivered && (
                      <div className="flex">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center z-10">
                          <FaCheckCircle className="text-white text-xs" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">Delivered</h3>
                          <p className="text-sm text-gray-500">{order.timeline.delivered}</p>
                        </div>
                      </div>
                    )}
                    
                    {order.timeline.cancelled && (
                      <div className="flex">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center z-10">
                          <FaTimesCircle className="text-white text-xs" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">Cancelled</h3>
                          <p className="text-sm text-gray-500">{order.timeline.cancelled}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {order.products.map((product, index) => (
                    <div key={index} className="p-6 flex">
                      <div className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No image</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-6 flex-1">
                        <h3 className="text-base font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">Quantity: {product.quantity}</p>
                        <div className="mt-2 flex justify-between">
                          <span className="text-sm font-medium text-gray-900">KES {product.price.toLocaleString()}</span>
                          <span className="text-sm font-medium text-gray-900">KES {(product.price * product.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order Summary */}
                <div className="p-6 bg-gray-50">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal</span>
                      <span className="text-sm font-medium text-gray-900">KES {order.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Shipping</span>
                      <span className="text-sm font-medium text-gray-900">Free</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex justify-between">
                      <span className="text-base font-medium text-gray-900">Total</span>
                      <span className="text-base font-medium text-gray-900">KES {order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                {order.status === "Delivered" && (
                  <button className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center justify-center">
                    <FaFileInvoice className="mr-2" /> Download Invoice
                  </button>
                )}
                
                <button className="flex-1 bg-white text-gray-800 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 flex items-center justify-center">
                  <FaHeadset className="mr-2" /> Contact Support
                </button>
                
                {order.status === "Processing" && (
                  <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center">
                    <FaTimesCircle className="mr-2" /> Cancel Order
                  </button>
                )}
              </div>
            </div>
            
            {/* Order Info Sidebar */}
            <div className="md:col-span-1">
              {/* Shipping Info */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center mb-4">
                  <FaMapMarkerAlt className="text-gray-500 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Shipping Information</h2>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p className="mb-2">{order.deliveryAddress}</p>
                  
                  {order.estimatedDelivery && order.status !== "Delivered" && order.status !== "Cancelled" && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-900">Estimated Delivery</p>
                      <p className="text-sm text-gray-600">{order.estimatedDelivery}</p>
                    </div>
                  )}
                  
                  {order.trackingNumber && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-900">Tracking Number</p>
                      <p className="text-sm text-gray-600">{order.trackingNumber}</p>
                      
                      <Link 
                        href={`/track-order?id=${order.id}`}
                        className="mt-2 inline-block text-orange-600 hover:text-orange-700 text-sm font-medium"
                      >
                        Track Package
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Payment Info */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center mb-4">
                  <FaCreditCard className="text-gray-500 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Payment Information</h2>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Payment Method: {order.paymentMethod}</p>
                  <p>Payment Status: <span className="text-green-600 font-medium">Paid</span></p>
                </div>
              </div>
              
              {/* Vendor Info */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <FaStore className="text-gray-500 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Vendor Information</h2>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p className="mb-2">{order.vendor}</p>
                  
                  <Link 
                    href={`/shops/${order.vendorId}`}
                    className="mt-2 inline-block text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    Visit Store
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}