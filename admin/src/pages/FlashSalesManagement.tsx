import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  Search, 
  Calendar, 
  DollarSign, 
  Eye, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Clock,
  TrendingUp,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '../lib/api';

interface FlashSaleProduct {
  productId: string;
  name: string;
  originalPrice: number;
  salePrice: number;
  discountPercentage: number;
  image: string;
  merchant: string;
  merchantId: string;
  stockQuantity: number;
  soldQuantity: number;
  maxQuantityPerUser: number;
}

interface FlashSale {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  products: FlashSaleProduct[];
  totalViews: number;
  totalSales: number;
  createdAt: string;
  updatedAt: string;
  isCurrentlyActive?: boolean;
}

interface FlashSaleFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  products: FlashSaleProduct[];
}

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  merchant: {
    _id: string;
    businessName: string;
  };
  stock: number;
  category: string;
  isActive: boolean;
}

const FlashSalesManagement: React.FC = () => {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [filteredFlashSales, setFilteredFlashSales] = useState<FlashSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFlashSale, setSelectedFlashSale] = useState<FlashSale | null>(null);
  const [formData, setFormData] = useState<FlashSaleFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    products: []
  });
  const [analytics, setAnalytics] = useState({
    totalFlashSales: 0,
    activeFlashSales: 0,
    totalRevenue: 0,
    totalViews: 0
  });
  
  // Product management state
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  useEffect(() => {
    loadFlashSales();
    loadAnalytics();
    loadProducts();
  }, []);

  useEffect(() => {
    filterFlashSales();
  }, [flashSales, searchTerm, statusFilter]);

  const loadFlashSales = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getFlashSales();
      if (response.data.success) {
        setFlashSales(response.data.data);
      }
    } catch (error: any) {
      console.error('Error loading flash sales:', error);
      toast.error('Failed to load flash sales');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await adminAPI.getFlashSalesAnalytics();
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error: any) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await adminAPI.getProducts({ isActive: true });
      if (response.data.success) {
        setAvailableProducts(response.data.products || []);
      }
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const addProductToFlashSale = (product: Product) => {
    const existingProduct = formData.products.find(p => p.productId === product._id);
    if (existingProduct) {
      toast.error('Product already added to this flash sale');
      return;
    }

    const flashSaleProduct: FlashSaleProduct = {
      productId: product._id,
      name: product.name,
      originalPrice: product.price,
      salePrice: product.price * 0.8, // Default 20% discount
      discountPercentage: 20,
      image: product.image,
      merchant: product.merchant.businessName,
      merchantId: product.merchant._id,
      stockQuantity: product.stock,
      soldQuantity: 0,
      maxQuantityPerUser: 5
    };

    setFormData(prev => ({
      ...prev,
      products: [...prev.products, flashSaleProduct]
    }));

    toast.success('Product added to flash sale');
  };

  const removeProductFromFlashSale = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.productId !== productId)
    }));
    toast.success('Product removed from flash sale');
  };

  const updateProductInFlashSale = (productId: string, updates: Partial<FlashSaleProduct>) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p => 
        p.productId === productId 
          ? { ...p, ...updates, discountPercentage: Math.round(((p.originalPrice - (updates.salePrice || p.salePrice)) / p.originalPrice) * 100) }
          : p
      )
    }));
  };

  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.merchant.businessName.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const filterFlashSales = () => {
    let filtered = flashSales;

    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(sale => {
        const startDate = new Date(sale.startDate);
        const endDate = new Date(sale.endDate);
        const isCurrentlyActive = sale.isActive && now >= startDate && now <= endDate;
        
        switch (statusFilter) {
          case 'active':
            return isCurrentlyActive;
          case 'scheduled':
            return sale.isActive && now < startDate;
          case 'expired':
            return now > endDate;
          case 'inactive':
            return !sale.isActive;
          default:
            return true;
        }
      });
    }

    setFilteredFlashSales(filtered);
  };

  const handleCreateFlashSale = async () => {
    try {
      if (!formData.title || !formData.description || !formData.startDate || !formData.endDate) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        toast.error('End date must be after start date');
        return;
      }

      if (formData.products.length === 0) {
        toast.error('Please add at least one product');
        return;
      }

      const response = await adminAPI.createFlashSale(formData);
      if (response.data.success) {
        toast.success('Flash sale created successfully');
        setShowCreateModal(false);
        resetForm();
        loadFlashSales();
        loadAnalytics();
      }
    } catch (error: any) {
      console.error('Error creating flash sale:', error);
      toast.error(error.response?.data?.message || 'Failed to create flash sale');
    }
  };

  const handleUpdateFlashSale = async () => {
    try {
      if (!selectedFlashSale) return;

      const response = await adminAPI.updateFlashSale(selectedFlashSale._id, formData);
      if (response.data.success) {
        toast.success('Flash sale updated successfully');
        setShowEditModal(false);
        setSelectedFlashSale(null);
        resetForm();
        loadFlashSales();
      }
    } catch (error: any) {
      console.error('Error updating flash sale:', error);
      toast.error(error.response?.data?.message || 'Failed to update flash sale');
    }
  };

  const handleToggleStatus = async (flashSaleId: string) => {
    try {
      const response = await adminAPI.toggleFlashSaleStatus(flashSaleId);
      if (response.data.success) {
        toast.success('Flash sale status updated');
        loadFlashSales();
        loadAnalytics();
      }
    } catch (error: any) {
      console.error('Error toggling flash sale status:', error);
      toast.error('Failed to update flash sale status');
    }
  };

  const handleDeleteFlashSale = async (flashSaleId: string) => {
    if (!confirm('Are you sure you want to delete this flash sale?')) return;

    try {
      const response = await adminAPI.deleteFlashSale(flashSaleId);
      if (response.data.success) {
        toast.success('Flash sale deleted successfully');
        loadFlashSales();
        loadAnalytics();
      }
    } catch (error: any) {
      console.error('Error deleting flash sale:', error);
      toast.error('Failed to delete flash sale');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      products: []
    });
  };

  const openEditModal = (flashSale: FlashSale) => {
    setSelectedFlashSale(flashSale);
    setFormData({
      title: flashSale.title,
      description: flashSale.description,
      startDate: new Date(flashSale.startDate).toISOString().slice(0, 16),
      endDate: new Date(flashSale.endDate).toISOString().slice(0, 16),
      products: flashSale.products
    });
    setShowEditModal(true);
  };

  const getStatusBadge = (flashSale: FlashSale) => {
    const now = new Date();
    const startDate = new Date(flashSale.startDate);
    const endDate = new Date(flashSale.endDate);
    const isCurrentlyActive = flashSale.isActive && now >= startDate && now <= endDate;

    if (!flashSale.isActive) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </span>;
    }

    if (isCurrentlyActive) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </span>;
    }

    if (now < startDate) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <Clock className="w-3 h-3 mr-1" />
        Scheduled
      </span>;
    }

    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
      <AlertCircle className="w-3 h-3 mr-1" />
      Expired
    </span>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
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

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flash Sales Management</h1>
          <p className="mt-2 text-sm text-gray-700">Manage flash sales and promotions</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Flash Sale
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Flash Sales</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.totalFlashSales}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Sales</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.activeFlashSales}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(analytics.totalRevenue)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Views</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.totalViews.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search flash sales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Flash Sales Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Flash Sales</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {filteredFlashSales.length} flash sale{filteredFlashSales.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {isLoading ? (
          <div className="px-4 py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading flash sales...</p>
          </div>
        ) : filteredFlashSales.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Zap className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No flash sales found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {flashSales.length === 0 ? 'Get started by creating a new flash sale.' : 'Try adjusting your search or filter criteria.'}
            </p>
            {flashSales.length === 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Flash Sale
                </button>
              </div>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredFlashSales.map((flashSale) => (
              <li key={flashSale._id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 truncate">
                          {flashSale.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {flashSale.description}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {getStatusBadge(flashSale)}
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center text-sm text-gray-500 space-x-6">
                      <div className="flex items-center">
                        <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        {formatDate(flashSale.startDate)} - {formatDate(flashSale.endDate)}
                      </div>
                      <div className="flex items-center">
                        <Package className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        {flashSale.products.length} product{flashSale.products.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center">
                        <Eye className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        {flashSale.totalViews.toLocaleString()} views
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        {formatCurrency(flashSale.totalSales)} sales
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleStatus(flashSale._id)}
                      className={`p-2 rounded-full ${
                        flashSale.isActive 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={flashSale.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {flashSale.isActive ? (
                        <ToggleRight className="h-5 w-5" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => openEditModal(flashSale)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteFlashSale(flashSale._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {showCreateModal ? 'Create Flash Sale' : 'Edit Flash Sale'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter flash sale title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter flash sale description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Products ({formData.products.length})
                  </label>
                  
                  {/* Selected Products */}
                  {formData.products.length > 0 && (
                    <div className="space-y-3 mb-3">
                      {formData.products.map((product) => (
                        <div key={product.productId} className="border border-gray-200 rounded-lg p-3 bg-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                                <p className="text-xs text-gray-500">{product.merchant}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeProductFromFlashSale(product.productId)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3 mt-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Original Price</label>
                              <input
                                type="number"
                                value={product.originalPrice}
                                readOnly
                                className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Sale Price</label>
                              <input
                                type="number"
                                value={product.salePrice}
                                onChange={(e) => updateProductInFlashSale(product.productId, { salePrice: parseFloat(e.target.value) })}
                                className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Max Qty/User</label>
                              <input
                                type="number"
                                value={product.maxQuantityPerUser}
                                onChange={(e) => updateProductInFlashSale(product.productId, { maxQuantityPerUser: parseInt(e.target.value) })}
                                className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-2 text-xs text-gray-500">
                            Discount: {product.discountPercentage}% | Stock: {product.stockQuantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Products Button */}
                  <button
                    type="button"
                    onClick={() => setShowProductModal(true)}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                  >
                    <Plus className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Add Products to Flash Sale</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedFlashSale(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={showCreateModal ? handleCreateFlashSale : handleUpdateFlashSale}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {showCreateModal ? 'Create' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Selection Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Select Products for Flash Sale</h3>
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    setProductSearchTerm('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              {/* Search Bar */}
              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products by name or merchant..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="ml-2 text-gray-600">Loading products...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {productSearchTerm ? 'Try adjusting your search terms.' : 'No active products available.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => {
                    const isAlreadyAdded = formData.products.some(p => p.productId === product._id);
                    
                    return (
                      <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-3">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                            <p className="text-xs text-gray-500 truncate">{product.merchant.businessName}</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">${product.price}</p>
                            <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          {isAlreadyAdded ? (
                            <button
                              disabled
                              className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-500 rounded-md cursor-not-allowed"
                            >
                              Already Added
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                addProductToFlashSale(product);
                                setShowProductModal(false);
                                setProductSearchTerm('');
                              }}
                              className="w-full px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                            >
                              Add to Flash Sale
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {formData.products.length} product{formData.products.length !== 1 ? 's' : ''} selected
                </p>
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    setProductSearchTerm('');
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashSalesManagement;
