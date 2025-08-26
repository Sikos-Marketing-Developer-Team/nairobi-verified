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
  AlertCircle,
  XCircle,
  Clock,
  FileText
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
  category?: string;
  status?: string;
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
        // Handle different response structures
        const merchants = response.data.data?.merchants || response.data.merchants || [];
        const total = response.data.data?.total || response.data.total || merchants.length;
        setMerchants(merchants);
        setTotalMerchants(total);
      } else {
        // Handle case where success is false but we still have data
        const merchants = response.data.merchants || [];
        setMerchants(merchants);
        setTotalMerchants(merchants.length);
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
          const verifyResponse = await adminAPI.updateMerchantStatus(merchantId, true);
          if (verifyResponse.data.success) {
            toast.success('Merchant verified successfully');
            loadMerchants();
          }
          break;
        case 'unverify':
          const unverifyResponse = await adminAPI.updateMerchantStatus(merchantId, false);
          if (unverifyResponse.data.success) {
            toast.success('Merchant verification removed');
            loadMerchants();
          }
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this merchant? This action cannot be undone.')) {
            const deleteResponse = await adminAPI.deleteMerchant(merchantId);
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
      const response = await adminAPI.bulkVerifyMerchants(bulkActions);
      
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
      const response = await adminAPI.exportMerchants();
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `merchants-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Merchants exported successfully');
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
            onClick={exportMerchants}
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
                    {merchants.filter(m => m.status === 'pending' || !m.verified).length}
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
                {businessTypes.map((category) => (
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
                        {merchant.location}
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
                    {merchant.category || merchant.businessType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(merchant.status || (merchant.verified ? 'verified' : 'pending'))}`}>
                      {merchant.status || (merchant.verified ? 'verified' : 'pending')}
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
                      onClick={() => handleMerchantAction('view_details', merchant._id)}
                      className="text-green-600 hover:text-green-900"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMerchantAction('view_documents', merchant._id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Documents"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    {(merchant.status === 'pending' || !merchant.verified) && (
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
      {showDocumentsModal && selectedMerchant && (
        <DocumentsModal
          merchant={selectedMerchant}
          onClose={() => {
            setShowDocumentsModal(false);
            setSelectedMerchant(null);
          }}
        />
      )}
    </div>
  );
};

// Documents Modal Component
interface DocumentsModalProps {
  merchant: Merchant;
  onClose: () => void;
}

const DocumentsModal: React.FC<DocumentsModalProps> = ({ merchant, onClose }) => {
  const [documents, setDocuments] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const response = await adminAPI.getMerchantDocuments(merchant._id);
        setDocuments(response.data);
      } catch (error) {
        console.error('Failed to fetch documents:', error);
        toast.error('Failed to load merchant documents');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [merchant._id]);

  const handleViewDocument = async (docType: string) => {
    try {
      const response = await adminAPI.viewMerchantDocument(merchant._id, docType);
      
      // Create blob URL and open in new tab
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up the URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Failed to view document:', error);
      toast.error('Failed to view document');
    }
  };

  const getDocumentStatus = (docType: string) => {
    if (!documents?.documents) return 'Not uploaded';
    
    const docInfo = documents.documents[docType];
    if (docInfo && docInfo.path) {
      return 'Uploaded';
    }
    return 'Not uploaded';
  };

  const getDocumentIcon = (status: string) => {
    switch (status) {
      case 'Uploaded':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Documents for {merchant.businessName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Document Analysis Summary */}
            {documents?.analysis && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Document Status Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Required Documents:</span>
                    <span className="ml-2 font-medium">
                      {documents.analysis.requiredDocsSubmitted}/{documents.analysis.totalRequiredDocs}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Completion:</span>
                    <span className="ml-2 font-medium">{documents.analysis.completionPercentage}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Can be verified:</span>
                    <span className={`ml-2 font-medium ${documents.analysis.canBeVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {documents.analysis.canBeVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Merchant Status:</span>
                    <span className={`ml-2 font-medium ${merchant.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {merchant.verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Document List */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Required Documents</h3>
              
              {/* Business Registration */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getDocumentIcon(getDocumentStatus('businessRegistration'))}
                    <div>
                      <h4 className="font-medium text-gray-900">Business Registration Certificate</h4>
                      <p className="text-sm text-gray-600">Status: {getDocumentStatus('businessRegistration')}</p>
                    </div>
                  </div>
                  {getDocumentStatus('businessRegistration') === 'Uploaded' && (
                    <button
                      onClick={() => handleViewDocument('businessRegistration')}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  )}
                </div>
              </div>

              {/* ID Document */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getDocumentIcon(getDocumentStatus('idDocument'))}
                    <div>
                      <h4 className="font-medium text-gray-900">ID Document</h4>
                      <p className="text-sm text-gray-600">Status: {getDocumentStatus('idDocument')}</p>
                    </div>
                  </div>
                  {getDocumentStatus('idDocument') === 'Uploaded' && (
                    <button
                      onClick={() => handleViewDocument('idDocument')}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Utility Bill */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getDocumentIcon(getDocumentStatus('utilityBill'))}
                    <div>
                      <h4 className="font-medium text-gray-900">Utility Bill</h4>
                      <p className="text-sm text-gray-600">Status: {getDocumentStatus('utilityBill')}</p>
                    </div>
                  </div>
                  {getDocumentStatus('utilityBill') === 'Uploaded' && (
                    <button
                      onClick={() => handleViewDocument('utilityBill')}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Additional Documents */}
              {documents?.documents?.additionalDocs && documents.documents.additionalDocs.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Additional Documents</h4>
                  <div className="space-y-2">
                    {documents.documents.additionalDocs.map((doc: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{doc.originalName || `Additional Document ${index + 1}`}</span>
                        </div>
                        <button
                          onClick={() => handleViewDocument(`additionalDocs[${index}]`)}
                          className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Close
              </button>
              {documents?.analysis?.canBeVerified && !merchant.verified && (
                <button
                  onClick={() => {
                    // Handle verification action
                    toast.success('Merchant verification initiated');
                    onClose();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Verify Merchant
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantsManagement;
