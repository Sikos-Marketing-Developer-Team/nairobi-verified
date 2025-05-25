"use client";

import { useState } from 'react';
import AdminLayout from "@/components/admin/AdminLayout";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import Modal from "@/components/admin/Modal";
import { useToast } from "@/context/ToastContext";
import { FaPlus, FaUsers, FaShoppingCart, FaMoneyBillWave, FaStore } from "react-icons/fa";
import AnimatedStatCard from "@/components/admin/AnimatedStatCard";
import Skeleton, { SkeletonCard, SkeletonTable, SkeletonText } from "@/components/admin/Skeleton";
import DataTable from "@/components/admin/DataTable";
import { useTheme } from "@/context/ThemeContext";

export default function ComponentsPage() {
  const { theme } = useTheme();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Sample data for DataTable
  const users = [
    { id: 1, name: 'Joseph Mwangi', email: 'njorojoe11173@gmail.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Sally Mugisha', email: 'sallymugisha@gmail.com', role: 'Admin', status: 'Active' },
    { id: 3, name: 'Jude Kimathi', email: 'jxkimathi@gmail.com', role: 'Admin', status: 'Inactive' },
    { id: 4, name: 'Mark Kamau', email: 'markkamau@gmail.com', role: 'Admin', status: 'Active' },
  ];
  
  // Columns for DataTable
  type User = { id: number; name: string; email: string; role: string; status: string; };
  const columns = [
    { header: 'ID', accessor: 'id' as const, sortable: true },
    { header: 'Name', accessor: 'name' as const, sortable: true },
    { header: 'Email', accessor: 'email' as const, sortable: true },
    { header: 'Role', accessor: 'role' as const, sortable: true },
    { 
      header: 'Status', 
      accessor: 'status' as const, 
      sortable: true,
      cell: (user: User) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          user.status === 'Active' 
            ? theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
            : theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
        }`}>
          {user.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (user: User) => (
        <div className="flex space-x-2">
          <button 
            className={`px-2 py-1 text-xs rounded ${
              theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
            }`}
            onClick={() => handleEdit(user)}
          >
            Edit
          </button>
          <button 
            className={`px-2 py-1 text-xs rounded ${
              theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
            }`}
            onClick={() => handleDelete(user)}
          >
            Delete
          </button>
        </div>
      )
    }
  ];
  
  // Handle edit user
  const handleEdit = (user: any) => {
    addToast('info', `Editing user: ${user.name}`, 'Edit User');
  };
  
  // Handle delete user
  const handleDelete = (user: any) => {
    addToast('warning', `Are you sure you want to delete ${user.name}?`, 'Delete User');
  };
  
  // Toggle loading state
  const toggleLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <Breadcrumbs 
          items={[
            { label: 'Dashboard', href: '/admin/dashboard' },
            { label: 'Components' }
          ]} 
        />
        
        <div className="flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Component Library
          </h1>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <FaPlus className="mr-2" /> Open Modal
          </button>
        </div>
        
        <div className={`p-6 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Toast Notifications
          </h2>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => addToast('success', 'Operation completed successfully!', 'Success')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Success Toast
            </button>
            
            <button
              onClick={() => addToast('error', 'An error occurred. Please try again.', 'Error')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Error Toast
            </button>
            
            <button
              onClick={() => addToast('warning', 'Please review your information before proceeding.', 'Warning')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Warning Toast
            </button>
            
            <button
              onClick={() => addToast('info', 'Your session will expire in 5 minutes.', 'Information')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Info Toast
            </button>
          </div>
        </div>
        
        <div className={`p-6 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Stat Cards
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatedStatCard
              title="Total Users"
              value={1250}
              previousValue={1100}
              icon={<FaUsers className="w-5 h-5" />}
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
              formatter={(val) => val.toLocaleString()}
            />
            
            <AnimatedStatCard
              title="Total Orders"
              value={856}
              previousValue={920}
              icon={<FaShoppingCart className="w-5 h-5" />}
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
              formatter={(val) => val.toLocaleString()}
            />
            
            <AnimatedStatCard
              title="Revenue"
              value={125000}
              previousValue={110000}
              icon={<FaMoneyBillWave className="w-5 h-5" />}
              iconBgColor="bg-yellow-100"
              iconColor="text-yellow-600"
              formatter={(val) => `$${val.toLocaleString()}`}
            />
            
            <AnimatedStatCard
              title="Vendors"
              value={48}
              previousValue={42}
              icon={<FaStore className="w-5 h-5" />}
              iconBgColor="bg-purple-100"
              iconColor="text-purple-600"
              formatter={(val) => val.toLocaleString()}
            />
          </div>
        </div>
        
        <div className={`p-6 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Skeletons
          </h2>
          
          <div className="mb-4">
            <button
              onClick={toggleLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isLoading ? 'Loading...' : 'Toggle Loading State'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading ? (
              <>
                <SkeletonCard hasImage={true} />
                <SkeletonCard hasImage={true} />
                <SkeletonCard hasImage={true} />
              </>
            ) : (
              <>
                <div className={`border rounded-lg overflow-hidden ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="h-48 bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">Image Placeholder</span>
                  </div>
                  <div className="p-4">
                    <h3 className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Card Title 1</h3>
                    <p className={`mt-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      This is a sample card with some content to demonstrate the skeleton loading state.
                    </p>
                  </div>
                </div>
                
                <div className={`border rounded-lg overflow-hidden ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="h-48 bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-medium">Image Placeholder</span>
                  </div>
                  <div className="p-4">
                    <h3 className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Card Title 2</h3>
                    <p className={`mt-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      This is a sample card with some content to demonstrate the skeleton loading state.
                    </p>
                  </div>
                </div>
                
                <div className={`border rounded-lg overflow-hidden ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="h-48 bg-yellow-100 flex items-center justify-center">
                    <span className="text-yellow-600 font-medium">Image Placeholder</span>
                  </div>
                  <div className="p-4">
                    <h3 className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Card Title 3</h3>
                    <p className={`mt-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      This is a sample card with some content to demonstrate the skeleton loading state.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-6">
            {isLoading ? (
              <SkeletonTable rows={5} columns={6} />
            ) : (
              <DataTable
                data={users}
                columns={columns}
                keyField="id"
                title="Users"
                subtitle="Manage system users"
                searchable={true}
                pagination={true}
                pageSize={10}
                actions={
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <FaPlus className="mr-2" /> Add User
                  </button>
                }
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Sample Modal"
        footer={
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark' 
                  ? 'bg-gray-600 text-white hover:bg-gray-500' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                addToast('success', 'Form submitted successfully!', 'Success');
                setIsModalOpen(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            This is a sample modal that demonstrates the Modal component. You can use this for forms, confirmations, or any other content that needs to be displayed in a modal.
          </p>
          
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Name
            </label>
            <input
              type="text"
              className={`block w-full rounded-md ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border-gray-300 text-gray-900'
              } focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Enter your name"
            />
          </div>
          
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email
            </label>
            <input
              type="email"
              className={`block w-full rounded-md ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border-gray-300 text-gray-900'
              } focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Enter your email"
            />
          </div>
          
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Message
            </label>
            <textarea
              rows={4}
              className={`block w-full rounded-md ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border-gray-300 text-gray-900'
              } focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Enter your message"
            />
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}