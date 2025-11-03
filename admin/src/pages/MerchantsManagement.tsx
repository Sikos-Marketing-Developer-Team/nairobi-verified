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
  RefreshCw,
  Edit,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Menu,
  ChevronDown
} from 'lucide-react';
import { adminAPI } from '../lib/api';
import { toast } from 'sonner';
import { scrollToTop } from '../hooks/useScrollToTop';
import { MerchantsManagementSkeleton } from '../components/ui/loading-skeletons';
import AddMerchantModal from '@/components/modals/addMerchantModal';
import DocumentsViewer from '@/components/DocumentsViewer';
import { Merchant } from '@/interfaces/MerchantsManagement';

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
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [showAddMerchantModal, setShowAddMerchantModal] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [merchantToDelete, setMerchantToDelete] = useState<string | null>(null);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // Reduced for mobile

  // READ - Load merchants
  useEffect(() => {
    loadMerchants();
  }, []);

  useEffect(() => {
    filterMerchants();
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [merchants, searchTerm, filterStatus]);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredMerchants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMerchants = filteredMerchants.slice(startIndex, endIndex);

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

  // Improved pagination handlers
  const goToNextPage = async () => {
    if (currentPage < totalPages && !isPageChanging) {
      setIsPageChanging(true);
      setCurrentPage(currentPage + 1);
      await new Promise(resolve => setTimeout(resolve, 200));
      scrollToTop('smooth');
      setIsPageChanging(false);
    }
  };

  const goToPrevPage = async () => {
    if (currentPage > 1 && !isPageChanging) {
      setIsPageChanging(true);
      setCurrentPage(currentPage - 1);
      await new Promise(resolve => setTimeout(resolve, 200));
      scrollToTop('smooth');
      setIsPageChanging(false);
    }
  };

  const goToPage = async (page: number) => {
    if (page >= 1 && page <= totalPages && !isPageChanging) {
      setIsPageChanging(true);
      setCurrentPage(page);
      await new Promise(resolve => setTimeout(resolve, 200));
      scrollToTop('smooth');
      setIsPageChanging(false);
    }
  };

  // Improved page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = window.innerWidth < 768 ? 5 : 7;
    const current = currentPage;
    const total = totalPages;

    if (total <= maxVisiblePages) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, current - 1);
      let end = Math.min(total - 1, current + 1);

      if (current <= 2) {
        end = 3;
      }

      if (current >= total - 1) {
        start = total - 2;
      }

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < total - 1) {
        pages.push('...');
      }

      if (total > 1) {
        pages.push(total);
      }
    }

    return pages;
  };

  // CREATE - Add new merchant
  const handleAddMerchant = async (newMerchantData: Omit<Merchant, '_id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    try {
      const response = await adminAPI.createMerchant(newMerchantData);
      if (response.data.success) {
        setMerchants(prev => [response.data.merchant, ...prev]);
        toast.success('Merchant added successfully!');
        setShowAddMerchantModal(false);
      }
    } catch (error) {
      console.error('Error adding merchant:', error);
      toast.error('Failed to add merchant. Please try again.');
    }
  };

  // UPDATE - Edit merchant (limited to status fields only)
  const handleEditMerchant = (merchant: Merchant) => {
    setEditingMerchant({...merchant});
  };

  const handleSaveEdit = async () => {
    if (!editingMerchant) return;

    try {
      if (editingMerchant.isActive !== merchants.find(m => m._id === editingMerchant._id)?.isActive) {
        await adminAPI.updateMerchantStatus(editingMerchant._id, editingMerchant.isActive);
      }

      setMerchants(prev => prev.map(merchant => 
        merchant._id === editingMerchant._id ? editingMerchant : merchant
      ));
      
      setEditingMerchant(null);
      toast.success('Merchant status updated successfully!');
    } catch (error) {
      console.error('Error updating merchant:', error);
      toast.error('Failed to update merchant. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingMerchant(null);
  };

  // UPDATE - Verify merchant
  const handleVerifyMerchant = async (merchantId: string): Promise<void> => {
    try {
      setMerchants(prev => prev.map(merchant => 
        merchant._id === merchantId 
          ? { ...merchant, verified: true, updatedAt: new Date().toISOString() }
          : merchant
      ));

      const response = await adminAPI.verifyMerchant(merchantId);
      if (response.data.success) {
        toast.success('Merchant verified successfully!');
      } else {
        throw new Error('Failed to verify merchant');
      }
    } catch (error) {
      console.error('Error verifying merchant:', error);
      setMerchants(prev => prev.map(merchant => 
        merchant._id === merchantId 
          ? { ...merchant, verified: false }
          : merchant
      ));
      toast.error('Failed to verify merchant. Please try again.');
    }
  };

  // UPDATE - Toggle merchant status
  const handleToggleStatus = async (merchantId: string, currentStatus: boolean): Promise<void> => {
    try {
      const newStatus = !currentStatus;
      
      setMerchants(prev => prev.map(merchant => 
        merchant._id === merchantId 
          ? { ...merchant, isActive: newStatus, updatedAt: new Date().toISOString() }
          : merchant
      ));

      const response = await adminAPI.updateMerchantStatus(merchantId, newStatus);
      if (response.data.success) {
        toast.success(`Merchant ${newStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        throw new Error('Failed to update merchant status');
      }
    } catch (error) {
      console.error('Error toggling merchant status:', error);
      setMerchants(prev => prev.map(merchant => 
        merchant._id === merchantId 
          ? { ...merchant, isActive: currentStatus }
          : merchant
      ));
      toast.error('Failed to update merchant status');
    }
  };

  // UPDATE - Toggle featured status
  const handleToggleFeatured = async (merchantId: string, currentFeatured: boolean): Promise<void> => {
    try {
      const newFeaturedStatus = !currentFeatured;
      
      setMerchants(prev => prev.map(merchant => 
        merchant._id === merchantId 
          ? { ...merchant, featured: newFeaturedStatus, updatedAt: new Date().toISOString() }
          : merchant
      ));

      const response = await adminAPI.setFeaturedStatus(merchantId, newFeaturedStatus);
      
      if (response.data.success) {
        toast.success(`Merchant ${newFeaturedStatus ? 'added to' : 'removed from'} featured list`);
      } else {
        throw new Error('Failed to update featured status');
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
      setMerchants(prev => prev.map(merchant => 
        merchant._id === merchantId 
          ? { ...merchant, featured: currentFeatured }
          : merchant
      ));
      toast.error('Failed to update featured status');
    }
  };

  // DELETE - Single merchant
  const handleDeleteMerchant = async (merchantId: string): Promise<void> => {
    try {
      const response = await adminAPI.deleteMerchant([merchantId]);
      if (response.data.success) {
        setMerchants(prev => prev.filter(merchant => merchant._id !== merchantId));
        toast.success('Merchant deleted successfully!');
        setShowDeleteConfirm(false);
        setMerchantToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting merchant:', error);
      toast.error('Failed to delete merchant. Please try again.');
    }
  };

  const confirmDelete = (merchantId: string) => {
    setMerchantToDelete(merchantId);
    setShowDeleteConfirm(true);
  };

  // Bulk Operations
  const handleBulkAction = async (action: 'verify' | 'activate' | 'deactivate' | 'delete' | 'feature' | 'unfeature') => {
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
          await adminAPI.updateMerchantStatus(selectedMerchants, true);
          toast.success(`${selectedMerchants.length} merchants activated successfully`);
          break;
        case 'deactivate':
          await adminAPI.updateMerchantStatus(selectedMerchants, false);
          toast.success(`${selectedMerchants.length} merchants deactivated successfully`);
          break;
        case 'feature':
          await adminAPI.bulkSetFeatured(selectedMerchants, true);
          setMerchants(prev => prev.map(merchant => 
            selectedMerchants.includes(merchant._id) 
              ? { ...merchant, featured: true, updatedAt: new Date().toISOString() }
              : merchant
          ));
          toast.success(`${selectedMerchants.length} merchants featured successfully`);
          break;
        case 'unfeature':
          await adminAPI.bulkSetFeatured(selectedMerchants, false);
          setMerchants(prev => prev.map(merchant => 
            selectedMerchants.includes(merchant._id) 
              ? { ...merchant, featured: false, updatedAt: new Date().toISOString() }
              : merchant
          ));
          toast.success(`${selectedMerchants.length} merchants unfeatured successfully`);
          break;
        case 'delete':
          await adminAPI.deleteMerchant(selectedMerchants);
          toast.success(`${selectedMerchants.length} merchants deleted successfully`);
          break;
      }
      
      setSelectedMerchants([]);
      setShowBulkActions(false);
      loadMerchants(true);
    } catch (error: any) {
      console.error(`Bulk ${action} error:`, error);
      toast.error(`Failed to ${action} merchants: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleSelectAll = () => {
    if (selectedMerchants.length === currentMerchants.length) {
      setSelectedMerchants([]);
    } else {
      setSelectedMerchants(currentMerchants.map(m => m._id));
    }
  };

  const handleSelectMerchant = (merchantId: string) => {
    setSelectedMerchants(prev => 
      prev.includes(merchantId) 
        ? prev.filter(id => id !== merchantId)
        : [...prev, merchantId]
    );
  };

  const getStatusColor = (merchant: Merchant) => {
    if (merchant.verified) return 'bg-green-100 text-green-800';
    if (!merchant.isActive) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusIcon = (merchant: Merchant) => {
    if (merchant.verified) return <CheckCircle className="w-3 h-3" />;
    if (!merchant.isActive) return <AlertTriangle className="w-3 h-3" />;
    return <Clock className="w-3 h-3" />;
  };

  const getStatusText = (merchant: Merchant) => {
    if (merchant.verified) return 'Verified';
    if (!merchant.isActive) return 'Inactive';
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
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      {/* Header */}
      <div className="bg-white p-4 md:p-0 md:bg-transparent">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Merchants Management</h1>
            <p className="mt-1 md:mt-2 text-sm text-gray-700">
              Manage merchant accounts, verification status, and documents
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-500">
              <span>Total: {merchants.length}</span>
              <span>•</span>
              <span>Selected: {selectedMerchants.length}</span>
              <span>•</span>
              <span>Filtered: {filteredMerchants.length}</span>
              <span>•</span>
              <span className="font-medium">
                Page {currentPage} of {totalPages} 
              </span>
            </div>
          </div>
          
          {/* Mobile Actions Button */}
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
            <div className="flex gap-2">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileActions(!showMobileActions)}
                className="md:hidden inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Menu className="w-4 h-4 mr-2" />
                Actions
              </button>

              {/* Desktop Bulk Actions */}
              {selectedMerchants.length > 0 && (
                <div className="hidden md:flex relative">
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
                        <button
                          onClick={() => handleBulkAction('feature')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Star className="w-4 h-4 inline mr-2" />
                          Feature Selected
                        </button>
                        <button
                          onClick={() => handleBulkAction('unfeature')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Star className="w-4 h-4 inline mr-2" />
                          Unfeature Selected
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
              <div className="hidden md:flex border border-gray-300 rounded-md">
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
                className="hidden md:inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
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
                className="inline-flex items-center px-3 md:px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-1 md:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Refresh</span>
              </button>
            </div>

            {/* Mobile Actions Dropdown */}
            {showMobileActions && (
              <div className="md:hidden bg-white border border-gray-200 rounded-lg shadow-lg p-2 space-y-1">
                {selectedMerchants.length > 0 && (
                  <>
                    <button
                      onClick={() => handleBulkAction('verify')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('activate')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Activate Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Selected
                    </button>
                    <hr />
                  </>
                )}
                <button
                  onClick={() => {
                    scrollToTop('smooth');
                    toast.info('Export feature coming soon');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                <div className="flex border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 px-3 py-2 text-sm font-medium ${
                      viewMode === 'list'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 px-3 py-2 text-sm font-medium ${
                      viewMode === 'grid'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Grid
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search merchants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>
          
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters & Sort
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Filters Row */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} md:flex flex-col md:flex-row gap-3`}>
            <div className="grid grid-cols-2 md:flex gap-2">
              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white text-sm"
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
                  className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white text-sm"
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
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>

              {/* Select All Checkbox */}
              <div className="flex items-center col-span-2 md:col-span-1">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={selectedMerchants.length === currentMerchants.length && currentMerchants.length > 0}
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {stats.map((stat, index) => (
          <div 
            key={stat.name} 
            className="bg-white p-4 md:p-6 rounded-lg shadow-sm border hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{stat.name}</p>
                  <p className="text-lg md:text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
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

      {/* Add Merchant Button */}
      <div className="flex justify-end px-2 md:px-0">
        <button
          onClick={() => setShowAddMerchantModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-all duration-200"
        >
          + Add Merchant
        </button>
      </div>

      {/* Merchants List */}
      <div className="bg-white shadow overflow-hidden rounded-lg md:rounded-md transition-all duration-300 ease-in-out">
        {currentMerchants.length === 0 ? (
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
          <>
            <ul className="divide-y divide-gray-200">
              {currentMerchants.map((merchant, index) => (
                <li 
                  key={merchant._id} 
                  className="px-3 md:px-6 py-4 hover:bg-gray-50 transition-colors duration-200 ease-in-out"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      {/* Selection Checkbox */}
                      <div className="flex-shrink-0 mr-3">
                        <input
                          type="checkbox"
                          checked={selectedMerchants.includes(merchant._id)}
                          onChange={() => handleSelectMerchant(merchant._id)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                      </div>
                      
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                          <Store className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                        </div>
                      </div>
                      
                      <div className="ml-3 md:ml-4 flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{merchant.businessName}</div>
                            <div className="text-sm text-gray-500 truncate">{merchant.ownerName}</div>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1">
                              <div className="flex items-center text-xs text-gray-500">
                                <Mail className="w-3 h-3 mr-1" />
                                <span className="truncate">{merchant.email}</span>
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <Phone className="w-3 h-3 mr-1" />
                                {merchant.phone}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between md:justify-end gap-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(merchant)}`}>
                              {getStatusIcon(merchant)}
                              <span className="ml-1 hidden sm:inline">{getStatusText(merchant)}</span>
                            </span>
                            
                            {/* Mobile Actions Dropdown */}
                            <div className="relative md:hidden">
                              <button
                                onClick={() => setShowMobileActions(!showMobileActions)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Desktop Action Buttons */}
                            <div className="hidden md:flex items-center space-x-1">
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
                                onClick={() => handleEditMerchant(merchant)}
                                className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-all duration-200"
                                title="Edit Status"
                              >
                                <Edit className="w-4 h-4" />
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
                              
                              <button
                                onClick={() => handleToggleFeatured(merchant._id, merchant.featured || false)}
                                className={`p-2 rounded-full transition-all duration-200 ${
                                  merchant.featured 
                                    ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50' 
                                    : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                                }`}
                                title={merchant.featured ? 'Remove from Featured' : 'Add to Featured'}
                              >
                                <Star className="w-4 h-4" />
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

                              <button
                                onClick={() => confirmDelete(merchant._id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                                title="Delete Merchant"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="md:hidden flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setSelectedMerchant(merchant);
                        setShowMerchantDetails(true);
                      }}
                      className="flex-1 inline-flex items-center justify-center px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleEditMerchant(merchant)}
                      className="flex-1 inline-flex items-center justify-center px-2 py-1 text-xs text-yellow-600 bg-yellow-50 rounded hover:bg-yellow-100"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMerchant(merchant);
                        setShowDocumentsModal(true);
                      }}
                      className="flex-1 inline-flex items-center justify-center px-2 py-1 text-xs text-green-600 bg-green-50 rounded hover:bg-green-100"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Docs
                    </button>
                    <button
                      onClick={() => handleToggleStatus(merchant._id, merchant.isActive)}
                      className={`flex-1 inline-flex items-center justify-center px-2 py-1 text-xs rounded ${
                        merchant.isActive 
                          ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                          : 'text-green-600 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      <UserCheck className="w-3 h-3 mr-1" />
                      {merchant.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-white px-3 md:px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between items-center sm:hidden">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1 || isPageChanging}
                    className={`relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1 || isPageChanging
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Prev
                  </button>
                  <div className="text-sm text-gray-700 px-2">
                    <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
                  </div>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages || isPageChanging}
                    className={`relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages || isPageChanging
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(endIndex, filteredMerchants.length)}</span> of{' '}
                      <span className="font-medium">{filteredMerchants.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={goToPrevPage}
                        disabled={currentPage === 1 || isPageChanging}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                          currentPage === 1 || isPageChanging
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                      </button>
                      
                      {/* Page numbers */}
                      {getPageNumbers().map((page, index) => (
                        <button
                          key={index}
                          onClick={() => typeof page === 'number' ? goToPage(page) : undefined}
                          disabled={page === '...' || isPageChanging}
                          className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-green-50 border-green-500 text-green-600'
                              : page === '...'
                              ? 'bg-white border-gray-300 text-gray-500 cursor-default'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } ${isPageChanging ? 'opacity-50' : ''}`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages || isPageChanging}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                          currentPage === totalPages || isPageChanging
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Fixed Position Modals */}
      <AddMerchantModal
        isOpen={showAddMerchantModal}
        onClose={() => setShowAddMerchantModal(false)}
        onAddMerchant={handleAddMerchant}
      />

      {editingMerchant && (
        <EditMerchantModal
          merchant={editingMerchant}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          onUpdateField={(field, value) => setEditingMerchant(prev => prev ? {...prev, [field]: value} : null)}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmationModal
          onConfirm={() => merchantToDelete && handleDeleteMerchant(merchantToDelete)}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setMerchantToDelete(null);
          }}
          merchantName={merchants.find(m => m._id === merchantToDelete)?.businessName || ''}
        />
      )}

      {showMerchantDetails && selectedMerchant && (
        <MerchantDetailsModal
          merchant={selectedMerchant}
          onClose={() => {
            setShowMerchantDetails(false);
            setSelectedMerchant(null);
            scrollToTop('smooth');
          }}
          onVerify={handleVerifyMerchant}
          onToggleStatus={handleToggleStatus}
          onEdit={handleEditMerchant}
          onDelete={confirmDelete}
          onToggleFeatured={handleToggleFeatured}
        />
      )}

      {showDocumentsModal && selectedMerchant && (
        <DocumentsViewer
          merchantId={selectedMerchant._id}
          merchantName={selectedMerchant.businessName}
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

// Edit Merchant Modal Component - Made responsive
interface EditMerchantModalProps {
  merchant: Merchant;
  onSave: () => void;
  onCancel: () => void;
  onUpdateField: (field: string, value: any) => void;
}

const EditMerchantModal: React.FC<EditMerchantModalProps> = ({ 
  merchant, 
  onSave, 
  onCancel, 
  onUpdateField 
}) => {
  useEffect(() => {
    scrollToTop('smooth');
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      <div className="flex min-h-full items-center justify-center p-2 md:p-4">
        <div className="relative bg-white rounded-lg p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out animate-modal-slide shadow-2xl">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Edit Merchant Status</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XCircle className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-3 md:mb-4">Business Information</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
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
              </div>
            </div>

            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-3 md:mb-4">Status Settings</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={merchant.verified}
                    onChange={(e) => onUpdateField('verified', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="verified" className="ml-2 text-sm text-gray-700">
                    Verified Merchant
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={merchant.isActive}
                    onChange={(e) => onUpdateField('isActive', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                    Active Account
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={merchant.featured || false}
                    onChange={(e) => onUpdateField('featured', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                    Featured Merchant
                  </label>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Note: Only status fields can be edited. Contact details require backend updates.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 md:pt-6 border-t">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors duration-200 order-1 sm:order-2"
            >
              <Save className="w-4 h-4 inline mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component - Made responsive
interface DeleteConfirmationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  merchantName: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  onConfirm, 
  onCancel, 
  merchantName 
}) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg p-4 md:p-6 w-full max-w-md transform transition-all duration-300 ease-out animate-modal-slide shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Confirm Deletion</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="text-center">
            <AlertTriangle className="mx-auto h-10 w-10 md:h-12 md:w-12 text-red-500 mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
              Delete {merchantName}?
            </h3>
            <p className="text-sm text-gray-500 mb-4 md:mb-6">
              This action cannot be undone. This will permanently delete the merchant account and all associated data.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-200 order-1 sm:order-2"
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Delete Merchant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Merchant Details Modal Component - Made responsive
interface MerchantDetailsModalProps {
  merchant: Merchant;
  onClose: () => void;
  onVerify: (merchantId: string) => void;
  onToggleStatus: (merchantId: string, currentStatus: boolean) => void;
  onEdit: (merchant: Merchant) => void;
  onDelete: (merchantId: string) => void;
  onToggleFeatured: (merchantId: string, currentFeatured: boolean) => void;
}

const MerchantDetailsModal: React.FC<MerchantDetailsModalProps> = ({ 
  merchant, 
  onClose, 
  onVerify, 
  onToggleStatus,
  onEdit,
  onDelete,
  onToggleFeatured
}) => {
  useEffect(() => {
    scrollToTop('smooth');
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      <div className="flex min-h-full items-center justify-center p-2 md:p-4">
        <div className="relative bg-white rounded-lg p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out animate-modal-slide shadow-2xl">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Merchant Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XCircle className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-3 md:mb-4">Business Information</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
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
                {merchant.businessType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business Type</label>
                    <p className="mt-1 text-sm text-gray-900">{merchant.businessType}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-3 md:mb-4">Status Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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
                  <label className="block text-sm font-medium text-gray-700">Featured</label>
                  <div className="mt-1 flex items-center">
                    {merchant.featured ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not Featured
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {merchant.updatedAt ? new Date(merchant.updatedAt).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profile Completeness</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {merchant.profileCompleteness || 0}%
                  </p>
                </div>
              </div>
            </div>

            {(merchant.productsCount !== undefined || merchant.totalSales !== undefined) && (
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                <h3 className="text-base md:text-lg font-medium text-gray-900 mb-3 md:mb-4">Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {merchant.productsCount !== undefined && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Products</label>
                      <p className="mt-1 text-xl md:text-2xl font-bold text-gray-900">{merchant.productsCount}</p>
                    </div>
                  )}
                  {merchant.totalSales !== undefined && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Sales</label>
                      <p className="mt-1 text-xl md:text-2xl font-bold text-gray-900">KSh {merchant.totalSales.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 md:space-x-3 pt-4 md:pt-6 border-t">
            <button
              onClick={onClose}
              className="px-3 md:px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200 order-5 sm:order-1"
            >
              Close
            </button>
            <button
              onClick={() => onEdit(merchant)}
              className="px-3 md:px-4 py-2 text-white bg-yellow-600 rounded-md hover:bg-yellow-700 transition-colors duration-200 order-1 sm:order-2"
            >
              <Edit className="w-4 h-4 inline mr-1 md:mr-2" />
              Edit
            </button>
            <button
              onClick={() => onToggleFeatured(merchant._id, merchant.featured || false)}
              className={`px-3 md:px-4 py-2 text-white rounded-md transition-colors duration-200 order-2 sm:order-3 ${
                merchant.featured 
                  ? 'bg-gray-600 hover:bg-gray-700' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              <Star className="w-4 h-4 inline mr-1 md:mr-2" />
              {merchant.featured ? 'Unfeature' : 'Feature'}
            </button>
            {!merchant.verified && (
              <button
                onClick={() => {
                  onVerify(merchant._id);
                  onClose();
                }}
                className="px-3 md:px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors duration-200 order-3 sm:order-4"
              >
                Verify
              </button>
            )}
            <button
              onClick={() => {
                onToggleStatus(merchant._id, merchant.isActive);
                onClose();
              }}
              className={`px-3 md:px-4 py-2 text-white rounded-md transition-colors duration-200 order-4 sm:order-5 ${
                merchant.isActive 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {merchant.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={() => {
                onDelete(merchant._id);
                onClose();
              }}
              className="px-3 md:px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-200 order-6"
            >
              <Trash2 className="w-4 h-4 inline mr-1 md:mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantsManagement;