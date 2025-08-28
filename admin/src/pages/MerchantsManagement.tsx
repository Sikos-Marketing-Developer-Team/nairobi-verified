import React, { useState, useEffect, useCallback } from 'react';
import { 
  Store,
  FileText,
  XCircle,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Eye,
  UserCheck,
  AlertTriangle,
  Filter,
  Search,
  Download,
  MoreVertical,
  Trash2,
  Star,
  TrendingUp,
  TrendingDown,
  Activity,
  FileCheck,
  Clock3,
  RefreshCw
} from 'lucide-react';
import { adminAPI } from '../lib/api';
import { toast } from 'sonner';
import { scrollToTop } from '../hooks/useScrollToTop';
import { MerchantsManagementSkeleton } from '../components/ui/loading-skeletons';

interface Merchant {
  _id: string;
  businessName: string;
  ownerName?: string;
  email: string;
  phone: string;
  verified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  address?: string;
  location?: string;
  businessType?: string;
  category?: string;
  description?: string;
  website?: string;
  yearEstablished?: number;
  logo?: string;
  bannerImage?: string;
  gallery?: string[];
  rating?: number;
  reviews?: number;
  featured?: boolean;
  productsCount?: number;
  totalSales?: number;
  profileCompleteness?: number;
  documentsCompleteness?: number;
  lastLoginAt?: string;
  onboardingStatus?: 'credentials_sent' | 'account_setup' | 'documents_submitted' | 'under_review' | 'completed';
  documents?: {
    businessRegistration?: {
      path?: string;
      uploadedAt?: string;
      originalName?: string;
      fileSize?: number;
      mimeType?: string;
    };
    idDocument?: {
      path?: string;
      uploadedAt?: string;
      originalName?: string;
      fileSize?: number;
      mimeType?: string;
    };
    utilityBill?: {
      path?: string;
      uploadedAt?: string;
      originalName?: string;
      fileSize?: number;
      mimeType?: string;
    };
    additionalDocs?: Array<{
      path?: string;
      uploadedAt?: string;
      originalName?: string;
      fileSize?: number;
      mimeType?: string;
      description?: string;
    }>;
    documentReviewStatus?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'incomplete';
    verificationNotes?: string;
    documentsSubmittedAt?: string;
    documentsReviewedAt?: string;
  };
  verificationHistory?: Array<{
    action: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'resubmitted';
    performedBy?: string;
    performedAt: string;
    notes?: string;
    documentsInvolved?: string[];
  }>;
  // Enhanced fields for better UI
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
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending' | 'active' | 'inactive' | 'needs_review' | 'featured'>('all');
  const [showMerchantDetails, setShowMerchantDetails] = useState(false);

  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status' | 'completeness'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMerchants();
  }, []);

  useEffect(() => {
    filterMerchants();
  }, [merchants, searchTerm, filterStatus]);

  const loadMerchants = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      const response = await adminAPI.getMerchants();
      if (response.data.success) {
        setMerchants(response.data.merchants || []);
      }
    } catch (error: any) {
      console.error('Failed to load merchants:', error);
      toast.error('Failed to load merchants');
    } finally {
      requestAnimationFrame(() => {
        setIsLoading(false);
        setRefreshing(false);
      });
    }
  }, []);

  const filterMerchants = useCallback(() => {
    let filtered = merchants;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(merchant =>
        merchant.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (merchant.ownerName && merchant.ownerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        merchant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (merchant.businessType && merchant.businessType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (merchant.location && merchant.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(merchant => {
        switch (filterStatus) {
          case 'verified':
            return merchant.verified;
          case 'pending':
            return !merchant.verified;
          case 'active':
            return merchant.isActive;
          case 'inactive':
            return !merchant.isActive;
          case 'needs_review':
            return merchant.needsVerification || (merchant.isDocumentComplete && !merchant.verified);
          case 'featured':
            return merchant.featured;
          default:
            return true;
        }
      });
    }

    // Sort merchants
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.businessName.toLowerCase();
          bValue = b.businessName.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'status':
          aValue = a.verified ? 2 : (a.isActive ? 1 : 0);
          bValue = b.verified ? 2 : (b.isActive ? 1 : 0);
          break;
        case 'completeness':
          aValue = (a.profileCompleteness || 0) + (a.documentsCompleteness || 0);
          bValue = (b.profileCompleteness || 0) + (b.documentsCompleteness || 0);
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredMerchants(filtered);
  }, [merchants, searchTerm, filterStatus, sortBy, sortOrder]);

  const handleVerifyMerchant = async (merchantId: string) => {
    try {
      await adminAPI.verifyMerchant(merchantId);
      toast.success('Merchant verified successfully');
      loadMerchants();
    } catch (error: any) {
      toast.error('Failed to verify merchant');
    }
  };

  const handleToggleStatus = async (merchantId: string, isActive: boolean) => {
    try {
      await adminAPI.updateMerchantStatus(merchantId, !isActive);
      toast.success(`Merchant ${!isActive ? 'activated' : 'deactivated'} successfully`);
      loadMerchants(true);
    } catch (error: any) {
      toast.error('Failed to update merchant status');
    }
  };



  const handleBulkAction = async (action: 'verify' | 'activate' | 'deactivate' | 'delete') => {
    if (selectedMerchants.length === 0) {
      toast.error('Please select merchants first');
      return;
    }

    try {
      switch (action) {
        case 'verify':
          await adminAPI.bulkVerifyMerchants(selectedMerchants);
          toast.success(`${selectedMerchants.length} merchants verified successfully`);
          break;
        case 'activate':
          // Implement bulk activate
          toast.info('Bulk activate feature coming soon');
          break;
        case 'deactivate':
          // Implement bulk deactivate
          toast.info('Bulk deactivate feature coming soon');
          break;
        case 'delete':
          // Implement bulk delete
          toast.info('Bulk delete feature coming soon');
          break;
      }
      
      setSelectedMerchants([]);
      setShowBulkActions(false);
      loadMerchants(true);
    } catch (error: any) {
      toast.error(`Failed to ${action} merchants`);
    }
  };



  const handleSelectAll = () => {
    if (selectedMerchants.length === filteredMerchants.length) {
      setSelectedMerchants([]);
    } else {
      setSelectedMerchants(filteredMerchants.map(m => m._id));
    }
  };

  const getStatusColor = (merchant: Merchant) => {
    if (!merchant.isActive) return 'bg-red-100 text-red-800';
    if (merchant.verified) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusIcon = (merchant: Merchant) => {
    if (!merchant.isActive) return <AlertTriangle className="w-3 h-3" />;
    if (merchant.verified) return <CheckCircle className="w-3 h-3" />;
    return <Clock className="w-3 h-3" />;
  };

  const getStatusText = (merchant: Merchant) => {
    if (!merchant.isActive) return 'Inactive';
    if (merchant.verified) return 'Verified';
    return 'Pending';
  };

  if (isLoading) {
    return <MerchantsManagementSkeleton />;
  }

  const stats = [
    {
      name: 'Total Merchants',
      value: merchants.length,
      icon: Store,
      color: 'text-blue-600 bg-blue-100',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      name: 'Verified',
      value: merchants.filter(m => m.verified).length,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      name: 'Needs Review',
      value: merchants.filter(m => m.needsVerification || (m.isDocumentComplete && !m.verified)).length,
      icon: Clock3,
      color: 'text-orange-600 bg-orange-100',
      change: '-5%',
      changeType: 'negative' as const
    },
    {
      name: 'Featured',
      value: merchants.filter(m => m.featured).length,
      icon: Star,
      color: 'text-purple-600 bg-purple-100',
      change: '+3%',
      changeType: 'positive' as const
    },
    {
      name: 'Active',
      value: merchants.filter(m => m.isActive).length,
      icon: Activity,
      color: 'text-emerald-600 bg-emerald-100',
      change: '+15%',
      changeType: 'positive' as const
    },
    {
      name: 'Documents Complete',
      value: merchants.filter(m => m.isDocumentComplete).length,
      icon: FileCheck,
      color: 'text-indigo-600 bg-indigo-100',
      change: '+22%',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Merchants Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage merchant accounts, verification status, and documents
          </p>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <span>Total: {merchants.length}</span>
            <span>•</span>
            <span>Selected: {selectedMerchants.length}</span>
            <span>•</span>
            <span>Filtered: {filteredMerchants.length}</span>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {/* Bulk Actions */}
          {selectedMerchants.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
              >
                <MoreVertical className="w-4 h-4 mr-2" />
                Bulk Actions ({selectedMerchants.length})
              </button>
              {showBulkActions && (
                <div className="absolute right-0 mt-10 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleBulkAction('verify')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      Verify Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('activate')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <UserCheck className="w-4 h-4 inline mr-2" />
                      Activate Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('deactivate')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <XCircle className="w-4 h-4 inline mr-2" />
                      Deactivate Selected
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 inline mr-2" />
                      Delete Selected
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === 'grid'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Grid
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={() => {
              scrollToTop('smooth');
              toast.info('Export feature coming soon');
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => {
              scrollToTop('smooth');
              loadMerchants(true);
            }}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by business name, owner, email, type, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>
          
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="needs_review">Needs Review</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="featured">Featured</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white min-w-[120px]"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="status">Sort by Status</option>
                <option value="completeness">Sort by Completeness</option>
              </select>
            </div>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>

            {/* Select All Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="selectAll"
                checked={selectedMerchants.length === filteredMerchants.length && filteredMerchants.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="selectAll" className="ml-2 text-sm text-gray-700">
                Select All
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={stat.name} 
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 hover:scale-105"
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.4s ease-out forwards'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{stat.name}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`flex items-center text-xs font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'positive' ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {stat.change}
                </div>
                <p className="text-xs text-gray-500">vs last month</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Merchants List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md transition-all duration-300 ease-in-out">
        {filteredMerchants.length === 0 ? (
          <div className="text-center py-12">
            <Store className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm || filterStatus !== 'all' ? 'No merchants match your filters' : 'No merchants found'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter criteria.' : 'Merchants will appear here once they register.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredMerchants.map((merchant, index) => (
              <li 
                key={merchant._id} 
                className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200 ease-in-out"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.3s ease-out forwards'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center transition-all duration-200 hover:from-green-200 hover:to-green-300">
                        <Store className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{merchant.businessName}</div>
                          <div className="text-sm text-gray-500">{merchant.ownerName}</div>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center text-xs text-gray-500">
                              <Mail className="w-3 h-3 mr-1" />
                              {merchant.email}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Phone className="w-3 h-3 mr-1" />
                              {merchant.phone}
                            </div>
                            {merchant.address && (
                              <div className="flex items-center text-xs text-gray-500">
                                <MapPin className="w-3 h-3 mr-1" />
                                {merchant.address}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ${getStatusColor(merchant)}`}>
                            {getStatusIcon(merchant)}
                            <span className="ml-1">{getStatusText(merchant)}</span>
                          </span>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => {
                                setSelectedMerchant(merchant);
                                setShowMerchantDetails(true);
                                scrollToTop('smooth');
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => {
                                setSelectedMerchant(merchant);
                                setShowDocumentsModal(true);
                                scrollToTop('smooth');
                              }}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all duration-200"
                              title="View Documents"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            
                            {!merchant.verified && (
                              <button
                                onClick={() => handleVerifyMerchant(merchant._id)}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all duration-200"
                                title="Verify Merchant"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleToggleStatus(merchant._id, merchant.isActive)}
                              className={`p-2 rounded-full transition-all duration-200 ${
                                merchant.isActive 
                                  ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                              }`}
                              title={merchant.isActive ? 'Deactivate' : 'Activate'}
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Merchant Details Modal */}
      {showMerchantDetails && selectedMerchant && (
        <MerchantDetailsModal
          merchant={selectedMerchant}
          onClose={() => {
            setShowMerchantDetails(false);
            setSelectedMerchant(null);
            scrollToTop('smooth');
          }}
          onVerify={() => handleVerifyMerchant(selectedMerchant._id)}
          onToggleStatus={() => handleToggleStatus(selectedMerchant._id, selectedMerchant.isActive)}
        />
      )}

      {/* Documents Modal */}
      {showDocumentsModal && selectedMerchant && (
        <DocumentsModal
          merchant={selectedMerchant}
          onClose={() => {
            setShowDocumentsModal(false);
            setSelectedMerchant(null);
            scrollToTop('smooth');
          }}
        />
      )}
    </div>
  );
};

// Merchant Details Modal Component
interface MerchantDetailsModalProps {
  merchant: Merchant;
  onClose: () => void;
  onVerify: () => void;
  onToggleStatus: () => void;
}

const MerchantDetailsModal: React.FC<MerchantDetailsModalProps> = ({ 
  merchant, 
  onClose, 
  onVerify, 
  onToggleStatus 
}) => {
  useEffect(() => {
    scrollToTop('smooth');
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out animate-slideInUp shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Merchant Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Business Name</label>
                <p className="mt-1 text-sm text-gray-900">{merchant.businessName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                <p className="mt-1 text-sm text-gray-900">{merchant.ownerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{merchant.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{merchant.phone}</p>
              </div>
              {merchant.address && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-sm text-gray-900">{merchant.address}</p>
                </div>
              )}
              {merchant.category && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <p className="mt-1 text-sm text-gray-900">{merchant.category}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Verification Status</label>
                <div className="mt-1 flex items-center">
                  {merchant.verified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Status</label>
                <div className="mt-1 flex items-center">
                  {merchant.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Inactive
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Member Since</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(merchant.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {(merchant.productsCount !== undefined || merchant.totalSales !== undefined) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {merchant.productsCount !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Products</label>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{merchant.productsCount}</p>
                  </div>
                )}
                {merchant.totalSales !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Sales</label>
                    <p className="mt-1 text-2xl font-bold text-gray-900">KSh {merchant.totalSales.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
          >
            Close
          </button>
          {!merchant.verified && (
            <button
              onClick={() => {
                onVerify();
                onClose();
              }}
              className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors duration-200"
            >
              Verify Merchant
            </button>
          )}
          <button
            onClick={() => {
              onToggleStatus();
              onClose();
            }}
            className={`px-4 py-2 text-white rounded-md transition-colors duration-200 ${
              merchant.isActive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {merchant.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Documents Modal Component
interface DocumentsModalProps {
  merchant: Merchant;
  onClose: () => void;
}

const DocumentsModal: React.FC<DocumentsModalProps> = ({ merchant, onClose }) => {
  useEffect(() => {
    scrollToTop('smooth');
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg transform transition-all duration-300 ease-out animate-slideInUp shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Merchant Documents</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{merchant.businessName}</h3>
            <p className="mt-1 text-sm text-gray-500">Document verification for {merchant.ownerName}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Document Management</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Document verification and management features are being developed.</p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Business License Verification</li>
                    <li>ID Document Verification</li>
                    <li>Tax Certificate Review</li>
                    <li>Address Proof Validation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
          >
            Close
          </button>
          <button
            onClick={() => {
              toast.info('Document management feature coming soon');
              onClose();
            }}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Manage Documents
          </button>
        </div>
      </div>
    </div>
  );
};

export default MerchantsManagement;
