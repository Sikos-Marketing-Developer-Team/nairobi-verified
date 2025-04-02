'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { FiActivity, FiEye, FiMousePointer, FiTruck, FiEdit, FiTrash2, FiMessageSquare, FiMap } from 'react-icons/fi';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Sample data for charts
const trafficData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Website Traffic',
      data: [1000, 1500, 1300, 1700, 1600, 1800],
      borderColor: 'rgb(239, 150, 7)',
      tension: 0.4,
    },
  ],
};

const clicksData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Website Clicks',
      data: [500, 700, 600, 800, 750, 900],
      backgroundColor: 'rgba(239, 150, 7, 0.5)',
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
};

export default function AdminDashboard() {
  const { theme } = useTheme();
  const [selectedShop, setSelectedShop] = useState(null);

  // Sample transactions data
  const transactions = [
    { id: 1, shop: 'Electronics Hub', amount: 1200, date: '2024-03-15', status: 'completed' },
    { id: 2, shop: 'Fashion Store', amount: 850, date: '2024-03-14', status: 'pending' },
    { id: 3, shop: 'Gadget World', amount: 2300, date: '2024-03-13', status: 'completed' },
  ];

  // Sample shops data
  const shops = [
    { id: 1, name: 'Electronics Hub', status: 'verified', location: 'Westlands' },
    { id: 2, name: 'Fashion Store', status: 'pending', location: 'Kilimani' },
    { id: 3, name: 'Gadget World', status: 'verified', location: 'Karen' },
  ];

  const stats = [
    { title: 'Total Transactions', value: '$15,426', icon: FiActivity, color: 'text-green-500' },
    { title: 'Total Views', value: '8,569', icon: FiEye, color: 'text-blue-500' },
    { title: 'Total Clicks', value: '4,287', icon: FiMousePointer, color: 'text-purple-500' },
    { title: 'Active Shipments', value: '156', icon: FiTruck, color: 'text-orange-500' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="dashboard-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="dashboard-card">
          <h3 className="text-xl font-semibold mb-4">Traffic Overview</h3>
          <div className="h-[300px]">
            <Line data={trafficData} options={chartOptions} />
          </div>
        </div>
        <div className="dashboard-card">
          <h3 className="text-xl font-semibold mb-4">Clicks Analysis</h3>
          <div className="h-[300px]">
            <Bar data={clicksData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="dashboard-card mt-8">
        <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{transaction.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{transaction.shop}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${transaction.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{transaction.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shops Management */}
      <div className="dashboard-card mt-8">
        <h3 className="text-xl font-semibold mb-4">Shops Management</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {shops.map((shop) => (
                <tr key={shop.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{shop.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{shop.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      shop.status === 'verified' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {shop.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <FiEdit className="w-5 h-5" />
                      </button>
                      <button className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integration Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Messaging Center</h3>
            <FiMessageSquare className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Send bulk SMS to vendors and users using Africa's Talking API
          </p>
          <button className="btn bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">
            Open Messaging Center
          </button>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Heat Map Analytics</h3>
            <FiMap className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            View website usage patterns with Datadog heat mapping
          </p>
          <button className="btn bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">
            View Heat Map
          </button>
        </div>
      </div>
    </div>
  );
} 