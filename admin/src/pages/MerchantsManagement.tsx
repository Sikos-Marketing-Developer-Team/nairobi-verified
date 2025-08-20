import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Search, 
  Eye, 
  Edit, 
  CheckCircle, 
  X,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Filter,
  Download,
  FileText
} from 'lucide-react';
import { adminAPI } from '../lib/api';
import { toast } from 'sonner';
import MerchantDocuments from '../components/MerchantDocuments';

interface Merchant {
  _id: string;
  businessName: string;
  email: string;
  phone: string;
  category: string;
  location: {
    address: string;
    city: string;
  };
  verified: boolean;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  documents?: {
    businessRegistration?: string;
    idDocument?: string;
    utilityBill?: string;
    additionalDocs?: string[];
  };
}

const MerchantsManagement: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [filteredMerchants, setFilteredMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [documentStatusFilter, setDocumentStatusFilter] = useState<string>('all');
  const [selectedMerchantForDocs, setSelectedMerchantForDocs] = useState<string | null>(null);
  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);
  const [isBulkOperationLoading, setIsBulkOperationLoading] = useState(false);

  useEffect(() => {
    loadMerchants();
  }, []);

  useEffect(() => {
    filterMerchants();
  }, [merchants, searchTerm, statusFilter, categoryFilter, documentStatusFilter]);

  const loadMerchants = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getMerchants();
      if (response.data.success) {
        setMerchants(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load merchants:', error);
      toast.error('Failed to load merchants');
      // Set mock data for demonstration
      setMerchants([
        {
          _id: '1',
          businessName: 'Green Valley Grocers',
          email: 'contact@greenvalley.com',
          phone: '+254700123456',
          category: 'Grocery',
          location: {
            address: '123 Market Street',
            city: 'Nairobi'
          },
          verified: true,
          createdAt: '2024-01-15T10:30:00Z',
          status: 'approved'
        },
        {
          _id: '2',
          businessName: 'Urban Eats',
          email: 'info@urbaneats.com',
          phone: '+254701234567',
          category: 'Restaurant',
          location: {
            address: '456 Food Court',
            city: 'Nairobi'
          },
          verified: false,
          createdAt: '2024-01-18T09:15:00Z',
          status: 'pending'
        },
        {
          _id: '3',
          businessName: 'Tech Solutions Kenya',
          email: 'hello@techsolutions.com',
          phone: '+254702345678',
          category: 'Electronics',
          location: {
            address: '789 Tech Hub',
            city: 'Nairobi'
          },
          verified: false,
          createdAt: '2024-01-20T14:20:00Z',
          status: 'pending'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMerchants = () => {
    let filtered = merchants;

    if (searchTerm) {
      filtered = filtered.filter(merchant =>
        merchant.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        merchant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        merchant.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(merchant => merchant.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(merchant => merchant.category === categoryFilter);
    }

    // Document status filter
    if (documentStatusFilter !== 'all') {
      filtered = filtered.filter(merchant => {
        const hasBusinessReg = merchant.documents?.businessRegistration;
        const hasIdDoc = merchant.documents?.idDocument;
        const hasUtilityBill = merchant.documents?.utilityBill;
        const documentCount = [hasBusinessReg, hasIdDoc, hasUtilityBill].filter(Boolean).length;
        
        switch (documentStatusFilter) {
          case 'complete':
            return documentCount === 3;
          case 'incomplete':
            return documentCount > 0 && documentCount < 3;
          case 'pending_review':
            return documentCount === 3 && !merchant.verified;
          default:
            return true;
        }
      });
    }

    setFilteredMerchants(filtered);
  };

    const handleMerchantAction = async (action: string, merchantId: string) => {
    try {
      switch (action) {
        case 'approve':
          await adminAPI.updateMerchantStatus(merchantId, true);
          toast.success('Merchant approved successfully');
          loadMerchants();
          break;
        case 'reject':
          if (window.confirm('Are you sure you want to reject this merchant?')) {
            await adminAPI.updateMerchantStatus(merchantId, false);
            toast.success('Merchant rejected successfully');
            loadMerchants();
          }
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this merchant?')) {
            await adminAPI.deleteMerchant(merchantId);
            toast.success('Merchant deleted successfully');
            loadMerchants();
          }
          break;
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedMerchants.length === filteredMerchants.length) {
      setSelectedMerchants([]);
    } else {
      setSelectedMerchants(filteredMerchants.map(m => m._id));
    }
  };

  const handleSelectMerchant = (merchantId: string) => {
    setSelectedMerchants(prev => 
      prev.includes(merchantId)
        ? prev.filter(id => id !== merchantId)
        : [...prev, merchantId]
    );
  };

  const handleBulkAction = async (action: 'verify' | 'reject') => {
    if (selectedMerchants.length === 0) {
      toast.error('Please select merchants to perform bulk action');
      return;
    }

    const confirmMessage = action === 'verify' 
      ? `Are you sure you want to verify ${selectedMerchants.length} merchant(s)?`
      : `Are you sure you want to reject ${selectedMerchants.length} merchant(s)?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setIsBulkOperationLoading(true);
      const response = await adminAPI.bulkVerifyMerchants(selectedMerchants, action);
      
      if (response.data.success) {
        toast.success(`${response.data.data.modifiedCount} merchant(s) ${action === 'verify' ? 'verified' : 'rejected'} successfully`);
        setSelectedMerchants([]);
        loadMerchants();
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error(`Failed to ${action} merchants`);
    } finally {
      setIsBulkOperationLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const categories = ['All Categories', 'Grocery', 'Restaurant', 'Electronics', 'Fashion', 'Health', 'Services'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Merchants Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage merchant registrations and verifications
          </p>
          {selectedMerchants.length > 0 && (
            <p className="mt-1 text-sm text-blue-600">
              {selectedMerchants.length} merchant(s) selected
            </p>
          )}
        </div>
        <div className="mt-4 sm:mt-0 sm:flex-none">
          {selectedMerchants.length > 0 ? (
            <div className="flex gap-3">
              <button
                onClick={() => handleBulkAction('verify')}
                disabled={isBulkOperationLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {isBulkOperationLoading ? 'Processing...' : `Verify ${selectedMerchants.length}`}
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                disabled={isBulkOperationLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {isBulkOperationLoading ? 'Processing...' : `Reject ${selectedMerchants.length}`}
              </button>
              <button
                onClick={() => setSelectedMerchants([])}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Clear Selection
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Store className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Merchants</dt>
                  <dd className="text-lg font-medium text-gray-900">{merchants.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Verified</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {merchants.filter(m => m.verified).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Filter className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {merchants.filter(m => m.status === 'pending').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search merchants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category === 'All Categories' ? 'all' : category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Document Status Filter */}
            <div>
              <select
                value={documentStatusFilter}
                onChange={(e) => setDocumentStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Documents</option>
                <option value="complete">Complete</option>
                <option value="incomplete">Incomplete</option>
                <option value="pending_review">Pending Review</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-700">
              Showing {filteredMerchants.length} of {merchants.length} merchants
            </p>
          </div>
        </div>
      </div>

      {/* Merchants Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedMerchants.length === filteredMerchants.length && filteredMerchants.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applied
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMerchants.map((merchant) => (
              <tr key={merchant._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedMerchants.includes(merchant._id)}
                    onChange={() => handleSelectMerchant(merchant._id)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Store className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {merchant.businessName}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {merchant.location.address}, {merchant.location.city}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    {merchant.email}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {merchant.phone}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {merchant.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(merchant.status)}`}>
                      {merchant.status}
                    </span>
                    {merchant.verified && (
                      <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(merchant.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => console.log('View merchant:', merchant)}
                      className="text-green-600 hover:text-green-900"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSelectedMerchantForDocs(merchant._id)}
                      className="text-purple-600 hover:text-purple-900"
                      title="View Documents"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    {merchant.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleMerchantAction('approve', merchant._id)}
                          className="text-green-600 hover:text-green-900"
                          title="Approve Merchant"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleMerchantAction('reject', merchant._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Reject Merchant"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => console.log('Edit merchant:', merchant)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Merchant"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMerchants.length === 0 && (
          <div className="text-center py-12">
            <Store className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No merchants found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Documents Modal */}
      {selectedMerchantForDocs && (
        <MerchantDocuments
          merchantId={selectedMerchantForDocs}
          onClose={() => setSelectedMerchantForDocs(null)}
        />
      )}
    </div>
  );
};

export default MerchantsManagement;
