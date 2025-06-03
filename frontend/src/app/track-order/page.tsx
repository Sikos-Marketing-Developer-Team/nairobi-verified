"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiTruck, FiCheckCircle, FiAlertCircle, FiSearch } from 'react-icons/fi';
import MainLayout from '@/components/MainLayout';

// Mock order data for demonstration
const mockOrders = {
  'NV12345678': {
    orderId: 'NV12345678',
    status: 'delivered',
    customer: 'John Doe',
    orderDate: '2023-05-15',
    deliveryDate: '2023-05-18',
    items: [
      { name: 'Wireless Headphones', quantity: 1, price: 79.99 },
      { name: 'Phone Case', quantity: 2, price: 19.99 }
    ],
    total: 119.97,
    shippingAddress: '123 Main St, Nairobi, Kenya',
    trackingHistory: [
      { status: 'Order Placed', date: '2023-05-15 10:30 AM', description: 'Your order has been placed successfully.' },
      { status: 'Payment Confirmed', date: '2023-05-15 11:45 AM', description: 'Payment has been received and confirmed.' },
      { status: 'Processing', date: '2023-05-16 09:15 AM', description: 'Your order is being processed and prepared for shipping.' },
      { status: 'Shipped', date: '2023-05-16 03:30 PM', description: 'Your order has been shipped and is on its way.' },
      { status: 'Out for Delivery', date: '2023-05-18 08:45 AM', description: 'Your order is out for delivery and will arrive today.' },
      { status: 'Delivered', date: '2023-05-18 02:20 PM', description: 'Your order has been delivered successfully.' }
    ]
  },
  'NV87654321': {
    orderId: 'NV87654321',
    status: 'shipped',
    customer: 'Jane Smith',
    orderDate: '2023-05-20',
    estimatedDelivery: '2023-05-24',
    items: [
      { name: 'Smart Watch', quantity: 1, price: 199.99 },
      { name: 'Watch Band', quantity: 1, price: 29.99 }
    ],
    total: 229.98,
    shippingAddress: '456 Park Ave, Nairobi, Kenya',
    trackingHistory: [
      { status: 'Order Placed', date: '2023-05-20 02:15 PM', description: 'Your order has been placed successfully.' },
      { status: 'Payment Confirmed', date: '2023-05-20 02:30 PM', description: 'Payment has been received and confirmed.' },
      { status: 'Processing', date: '2023-05-21 10:45 AM', description: 'Your order is being processed and prepared for shipping.' },
      { status: 'Shipped', date: '2023-05-22 11:20 AM', description: 'Your order has been shipped and is on its way.' }
    ]
  },
  'NV54321678': {
    orderId: 'NV54321678',
    status: 'processing',
    customer: 'Robert Johnson',
    orderDate: '2023-05-22',
    estimatedDelivery: '2023-05-26',
    items: [
      { name: 'Bluetooth Speaker', quantity: 1, price: 89.99 }
    ],
    total: 89.99,
    shippingAddress: '789 Oak St, Nairobi, Kenya',
    trackingHistory: [
      { status: 'Order Placed', date: '2023-05-22 09:10 AM', description: 'Your order has been placed successfully.' },
      { status: 'Payment Confirmed', date: '2023-05-22 09:25 AM', description: 'Payment has been received and confirmed.' },
      { status: 'Processing', date: '2023-05-23 11:30 AM', description: 'Your order is being processed and prepared for shipping.' }
    ]
  }
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setOrder(null);

    if (orderNumber.trim() === '') {
      setError('Please enter an order number');
      setIsLoading(false);
      return;
    }

    try {
      // Use real API calls
      const { apiService } = await import('@/lib/api');
      
      // Get order data
      const orderResponse = await apiService.user.getOrderById(orderNumber);
      if (orderResponse.data) {
        setOrder(orderResponse.data);
      } else {
        setError('Order not found. Please check the order number and try again.');
      }
    } catch (err) {
      console.error('Error fetching order data:', err);
      setError('Failed to retrieve order information. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-500';
      case 'shipped':
      case 'out for delivery':
        return 'bg-blue-500';
      case 'processing':
      case 'payment confirmed':
        return 'bg-yellow-500';
      case 'order placed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <FiCheckCircle className="w-6 h-6" />;
      case 'shipped':
      case 'out for delivery':
        return <FiTruck className="w-6 h-6" />;
      case 'processing':
      case 'payment confirmed':
      case 'order placed':
        return <FiPackage className="w-6 h-6" />;
      default:
        return <FiPackage className="w-6 h-6" />;
    }
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Your Order</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Enter your order number to track the status and delivery of your purchase.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6 mb-8"
          >
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Order Number
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  placeholder="e.g., NV12345678"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="self-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full md:w-auto px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Tracking...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <FiSearch className="mr-2" />
                      Track Order
                    </span>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
                <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-500">
              <p>For demonstration, try these order numbers: NV12345678, NV87654321, NV54321678</p>
            </div>
          </motion.div>

          {order && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* Order Summary */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Order #{order.orderId}</h2>
                    <p className="text-gray-600">Placed on {order.orderDate}</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${
                      order.status === 'delivered' ? 'bg-green-500' :
                      order.status === 'shipped' ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Shipping Address</h3>
                    <p className="text-gray-900">{order.shippingAddress}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      {order.status === 'delivered' ? 'Delivered On' : 'Estimated Delivery'}
                    </h3>
                    <p className="text-gray-900">
                      {order.status === 'delivered' ? order.deliveryDate : order.estimatedDelivery}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking History</h3>
                <div className="space-y-6">
                  {order.trackingHistory.map((event: any, index: number) => (
                    <div key={index} className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className={`rounded-full p-2 ${getStatusColor(event.status)} text-white`}>
                          {getStatusIcon(event.status)}
                        </div>
                        {index < order.trackingHistory.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-300 my-1"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-md font-medium text-gray-900">{event.status}</h4>
                        <time className="text-sm text-gray-500">{event.date}</time>
                        <p className="mt-1 text-gray-600">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="divide-y divide-gray-200">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="py-3 flex justify-between">
                      <div>
                        <p className="text-gray-900 font-medium">{item.name}</p>
                        <p className="text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <p className="text-gray-900">${item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                  <p className="font-medium text-gray-900">Total</p>
                  <p className="font-bold text-gray-900">${order.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-50 p-6 flex flex-col sm:flex-row gap-3 justify-end">
                <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
                  Need Help?
                </button>
                {order.status !== 'delivered' && (
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors">
                    Contact Seller
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Help Section */}
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">How do I track my order?</h3>
                <p className="text-gray-600 mt-1">Enter your order number in the tracking field above. You can find your order number in the confirmation email you received after placing your order.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">How long will it take to receive my order?</h3>
                <p className="text-gray-600 mt-1">Delivery times vary depending on your location and the seller. Typically, orders within Nairobi are delivered within 1-3 business days.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">What if I haven't received my order by the estimated delivery date?</h3>
                <p className="text-gray-600 mt-1">If your order hasn't arrived by the estimated delivery date, please contact our customer support team or the seller directly through your account.</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <a href="/contact" className="text-orange-600 hover:underline">Need more help? Contact our support team</a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}