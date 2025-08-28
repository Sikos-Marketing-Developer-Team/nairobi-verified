import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserPlus,
  XCircle,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone
} from 'lucide-react';
import { adminAPI } from '../lib/api';
import { toast } from 'sonner';
import { UsersManagementSkeleton } from '../components/ui/loading-skeletons';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}

const scrollToTop = (behavior: ScrollBehavior = 'auto') => {
  window.scrollTo({ top: 0, behavior });
};

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getUsers();
      if (response.data.success) {
        setUsers(response.data.users || []);
      }
      // Add a small delay for better UX
      setTimeout(() => {
        requestAnimationFrame(() => setIsLoading(false));
      }, 300);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
      requestAnimationFrame(() => setIsLoading(false));
    }
  }, []);

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      loadUsers();
      setShowDeleteConfirm(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await adminAPI.updateUserStatus(userId, !isActive);
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'} successfully`);
      loadUsers();
    } catch (error: any) {
      console.error('Failed to update user status:', error);
      toast.error('Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="mt-2 text-sm text-gray-700">Manage user accounts and permissions</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowAddUserModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Users List */}
      {isLoading ? (
        <UsersManagementSkeleton />
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md transition-all duration-300 ease-in-out">
          {users.length === 0 ? (
            <div className="text-center py-12 animate-fadeIn">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding a new user.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {users.map((user, index) => (
                <li 
                  key={user._id} 
                  className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200 ease-in-out"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeInUp 0.3s ease-out forwards'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center transition-all duration-200 hover:from-blue-200 hover:to-blue-300">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.phone && (
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Phone className="w-3 h-3 mr-1" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ${
                              user.role === 'admin' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                              user.role === 'merchant' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                              'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}>
                              {user.role}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ${
                              user.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {user.isEmailVerified && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Mail className="w-3 h-3 mr-1" />
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDetails(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                        className={`p-2 rounded-full transition-all duration-200 ${
                          user.isActive 
                            ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={user.isActive ? 'Deactivate User' : 'Activate User'}
                      >
                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => {
            setShowAddUserModal(false);
            scrollToTop('smooth');
          }}
          onUserAdded={() => {
            setShowAddUserModal(false);
            loadUsers();
            scrollToTop('smooth');
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg p-6 w-full max-w-md transform transition-all duration-300 ease-out animate-slideInUp shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Confirm Delete</h2>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action cannot be undone. All user data will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser._id)}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl transform transition-all duration-300 ease-out animate-slideInUp shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
              <button
                onClick={() => {
                  setShowUserDetails(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedUser.role === 'admin' ? 'bg-red-100 text-red-800' :
                      selectedUser.role === 'merchant' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedUser.role}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Contact Information</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-500">{selectedUser.email}</p>
                      </div>
                    </div>
                    
                    {selectedUser.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Phone</p>
                          <p className="text-sm text-gray-500">{selectedUser.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Account Information</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Account Status</p>
                      <p className={`text-sm ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email Verification</p>
                      <p className={`text-sm ${selectedUser.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedUser.isEmailVerified ? 'Verified' : 'Not Verified'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900">Member Since</p>
                      <p className="text-sm text-gray-500">
                        {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => handleToggleUserStatus(selectedUser._id, selectedUser.isActive)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    selectedUser.isActive
                      ? 'text-red-700 bg-red-100 hover:bg-red-200'
                      : 'text-green-700 bg-green-100 hover:bg-green-200'
                  }`}
                >
                  {selectedUser.isActive ? 'Deactivate User' : 'Activate User'}
                </button>
                
                {selectedUser.role !== 'admin' && (
                  <button
                    onClick={() => {
                      setShowUserDetails(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded text-sm font-medium transition-colors"
                  >
                    Delete User
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add User Modal Component
interface AddUserModalProps {
  onClose: () => void;
  onUserAdded: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await adminAPI.createUser(formData);
      
      if (response.data.success) {
        toast.success('User created successfully');
        onUserAdded();
      }
    } catch (error: any) {
      console.error('Failed to create user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg p-6 w-full max-w-md transform transition-all duration-300 ease-out animate-slideInUp shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Add New User</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Enter email address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="user">User</option>
              <option value="merchant">Merchant</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> A temporary password will be generated and sent to the user's email address.
              The user will be required to change it on first login.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-white rounded transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsersManagement;