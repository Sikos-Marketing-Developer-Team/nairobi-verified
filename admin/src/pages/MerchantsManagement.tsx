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
  FileText,
  AlertCircle,
  XCircle,
  Clock,
  Plus,
  Trash2,
  MoreVertical,
  ExternalLink,
  Shield,
  Star,
  TrendingUp,
  Users
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { toast } from 'sonner';

interface MerchantDocument {
  businessRegistration?: string;
  idDocument?: string;
  utilityBill?: string;
  additionalDocs?: string[];
}

interface Merchant {
  _id: string;
  businessName: string;
  email: string;
  phone: string;
  businessType: string;
  location: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  documents?: MerchantDocument;
  rating?: number;
  totalReviews?: number;
  totalProducts?: number;
  isActive?: boolean;
  description?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  businessHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  documentStatus?: {
    businessRegistration: boolean;
    idDocument: boolean;
    utilityBill: boolean;
    additionalDocs: boolean;
  };
  documentCompleteness?: number;
  isDocumentComplete?: boolean;
  needsVerification?: boolean;
}

const MerchantsManagement: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [filteredMerchants, setFilteredMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [documentFilter, setDocumentFilter] = useState<string>('all');
  const [totalMerchants, setTotalMerchants] = useState(0);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [bulkActions, setBulkActions] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Business type categories for filtering
  const categories = [
    'All Categories',
    'Restaurant',
    'Retail',
    'Electronics',
    'Fashion',
    'Grocery',
    'Services',
    'Health & Beauty',
    'Automotive',
    'Home & Garden',
    'Sports & Recreation',
    'Other'
  ];

  useEffect(() => {
    loadMerchants();
  }, [statusFilter, categoryFilter, documentFilter]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== '') {
        loadMerchants();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  useEffect(() => {
    filterMerchants();
  }, [merchants, searchTerm, statusFilter, categoryFilter, documentFilter]);

  const loadMerchants = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getMerchants({
        page: 1,
        limit: 100,
        verified: statusFilter === 'verified' ? true : statusFilter === 'pending' ? false : undefined,
        businessType: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: searchTerm || undefined,
        documentStatus: documentFilter !== 'all' ? documentFilter : undefined
      });
      
      if (response.data.success) {
        setMerchants(response.data.data.merchants || []);
        setTotalMerchants(response.data.data.total || 0);
      }
    } catch (error: any) {
      console.error('Failed to load merchants:', error);
      toast.error('Failed to load merchants');
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
        merchant.businessType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        merchant.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'verified') {
        filtered = filtered.filter(merchant => merchant.verified);
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(merchant => !merchant.verified);
      }
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(merchant => merchant.businessType === categoryFilter);
    }

    if (documentFilter !== 'all') {
      filtered = filtered.filter(merchant => {
        switch (documentFilter) {
          case 'complete':
            return merchant.isDocumentComplete;
          case 'incomplete':
            return !merchant.isDocumentComplete;
          case 'pending_review':
            return merchant.needsVerification;
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
        case 'verify':
          const verifyResponse = await adminAPI.put(`/dashboard/merchants/${merchantId}/status`, {
            verified: true
          });
          if (verifyResponse.data.success) {
            toast.success('Merchant verified successfully');
            loadMerchants();
          }
          break;
        case 'unverify':
          const unverifyResponse = await adminAPI.put(`/dashboard/merchants/${merchantId}/status`, {
            verified: false
          });
          if (unverifyResponse.data.success) {
            toast.success('Merchant verification removed');
            loadMerchants();
          }
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this merchant? This action cannot be undone.')) {
            const deleteResponse = await adminAPI.delete(`/dashboard/merchants/${merchantId}`);
            if (deleteResponse.data.success) {
              toast.success('Merchant deleted successfully');
              loadMerchants();
            }
          }
          break;
        case 'view_documents':
          const merchant = merchants.find(m => m._id === merchantId);
          if (merchant) {
            setSelectedMerchant(merchant);
            setShowDocumentsModal(true);
          }
          break;
        case 'view_details':
          const merchantDetails = merchants.find(m => m._id === merchantId);
          if (merchantDetails) {
            setSelectedMerchant(merchantDetails);
            setShowDetailsModal(true);
          }
          break;
      }
    } catch (error: any) {
      console.error('Action failed:', error);
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleBulkVerify = async () => {
    if (bulkActions.length === 0) {
      toast.error('Please select merchants to verify');
      return;
    }

    try {
      const response = await adminAPI.post('/dashboard/merchants/bulk-verify', {
        merchantIds: bulkActions
      });
      
      if (response.data.success) {
        toast.success(`${bulkActions.length} merchants verified successfully`);
        setBulkActions([]);
        setShowBulkActions(false);
        loadMerchants();
      }
    } catch (error: any) {
      console.error('Bulk verify failed:', error);
      toast.error('Bulk verification failed');
    }
  };

  const exportMerchants = async () => {
    try {
      const response = await adminAPI.get('/dashboard/export/merchants', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `merchants-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Merchants data exported successfully');
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error('Failed to export merchants data');
    }
  };

  const getStatusBadge = (merchant: Merchant) => {
    if (merchant.verified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    }
  };

  const getDocumentStatusBadge = (merchant: Merchant) => {
    if (merchant.isDocumentComplete) {
      if (merchant.needsVerification) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Review Needed
          </span>
        );
      } else {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Complete
          </span>
        );
      }
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Incomplete
        </span>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRating = (rating?: number) => {
    if (!rating) return 'No rating';
    return `${rating.toFixed(1)}★`;
  };

  const businessTypes = [
    'All Categories',
    'Retail',
    'Restaurant',
    'Electronics',
    'Fashion',
    'Health & Beauty',
    'Services',
    'Automotive',
    'Home & Garden',
    'Sports & Recreation',
    'Books & Media',
    'Grocery',
    'Other'
  ];

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
        </div>
        <div className="mt-4 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
    </div>
  );
};

export default MerchantsManagement;
