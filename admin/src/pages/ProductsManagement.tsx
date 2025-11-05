import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  Plus,
  Download,
  Star,
  DollarSign,
  XCircle,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '../lib/api';
import { Product } from '../interfaces/ProductsManagement';

const ProductsManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [merchantFilter] = useState<string>('all');
  const [stockFilter] = useState<string>('all');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getProducts({
        page: 1,
        limit: 100,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
        inStock: stockFilter === 'in_stock' ? true : stockFilter === 'out_of_stock' ? false : undefined,
        merchant: merchantFilter !== 'all' ? merchantFilter : undefined,
        search: searchTerm || undefined
      });
      
      if (response.data.success) {
        const products = response.data.data?.products || response.data.products || [];
        setProducts(products);
      }
    } catch (error: any) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.merchant.businessName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(product => product.isActive);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(product => !product.isActive);
      } else if (statusFilter === 'out-of-stock') {
        filtered = filtered.filter(product => !product.inStock);
      }
    }

    setFilteredProducts(filtered);
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminAPI.deleteProduct(productId);
      toast.success('Product deleted successfully');
      loadProducts(); // Reload the products list
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      await adminAPI.updateProduct(productId, { isActive: !currentStatus });
      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      loadProducts(); // Reload the products list
    } catch (error: any) {
      console.error('Failed to update product status:', error);
      toast.error('Failed to update product status');
    }
  };

  const handleToggleFeatured = async (productId: string, currentStatus: boolean) => {
    try {
      await adminAPI.updateProduct(productId, { featured: !currentStatus });
      toast.success(`Product ${!currentStatus ? 'featured' : 'unfeatured'} successfully`);
      loadProducts(); // Reload the products list
    } catch (error: any) {
      console.error('Failed to update product featured status:', error);
      toast.error('Failed to update product featured status');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const categories = ['All Categories', 'Grocery', 'Food', 'Electronics', 'Fashion', 'Health'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="mt-1 sm:mt-2 text-sm text-gray-700">
            Manage all products across the platform
          </p>
        </div>
        <div className="flex space-x-2 sm:space-x-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:px-4"
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddProductModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 sm:px-4"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <div className="ml-2 sm:ml-3 flex-1 min-w-0">
              <dl>
                <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total</dt>
                <dd className="text-sm sm:text-lg font-medium text-gray-900">{products.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
            </div>
            <div className="ml-2 sm:ml-3 flex-1 min-w-0">
              <dl>
                <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Active</dt>
                <dd className="text-sm sm:text-lg font-medium text-gray-900">
                  {products.filter(p => p.isActive).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
            </div>
            <div className="ml-2 sm:ml-3 flex-1 min-w-0">
              <dl>
                <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Out of Stock</dt>
                <dd className="text-sm sm:text-lg font-medium text-gray-900">
                  {products.filter(p => !p.inStock).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
            </div>
            <div className="ml-2 sm:ml-3 flex-1 min-w-0">
              <dl>
                <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Avg Rating</dt>
                <dd className="text-sm sm:text-lg font-medium text-gray-900">
                  {products.length > 0 ? (products.reduce((acc, p) => acc + (p.rating || 0), 0) / products.length).toFixed(1) : '0.0'}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 sm:p-6">
          {/* Mobile Filter Toggle */}
          <div className="sm:hidden mb-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showMobileFilters ? ' ▲' : ' ▼'}
            </button>
          </div>

          <div className={`grid grid-cols-1 gap-4 ${showMobileFilters ? 'block' : 'hidden'}sm:grid-cols-1 md:grid-cols-4 sm:gap-4 sm:block`}>
            {/* Search - Full width on mobile */}
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-9 sm:pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs text-gray-500 mb-1 sm:hidden">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category === 'All Categories' ? 'all' : category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs text-gray-500 mb-1 sm:hidden">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-700">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="aspect-w-1 aspect-h-1 w-full bg-gray-200">
              <img
                src={product.images[0] || 'https://via.placeholder.com/300'}
                alt={product.name}
                className="w-full h-40 sm:h-48 object-cover"
              />
            </div>
            <div className="p-3 sm:p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1 mr-2">{product.name}</h3>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    onClick={() => window.open(`/products/${product._id}`, '_blank')}
                    className="text-green-600 hover:text-green-700 p-1"
                    title="View product"
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(product._id, product.featured)}
                    className={`p-1 ${product.featured ? 'text-yellow-600 hover:text-yellow-700' : 'text-gray-400 hover:text-gray-600'}`}
                    title={product.featured ? 'Remove from featured' : 'Mark as featured'}
                  >
                    <Star className={`h-3 w-3 sm:h-4 sm:w-4 ${product.featured ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleToggleActive(product._id, product.isActive)}
                    className={`p-1 ${product.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
                    title={product.isActive ? 'Deactivate product' : 'Activate product'}
                  >
                    {product.isActive ? <XCircle className="h-3 w-3 sm:h-4 sm:w-4" /> : <Edit className="h-3 w-3 sm:h-4 sm:w-4" />}
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product._id, product.name)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Delete product"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <DollarSign className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 ml-1">{formatPrice(product.price)}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600 ml-1">{product.rating}</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mb-3 truncate">
                By {product.merchant.businessName}
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
                
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  product.inStock ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              
              <div className="text-xs text-gray-500">
                Added {formatDate(product.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <AddProductModal
          onClose={() => setShowAddProductModal(false)}
          onProductAdded={() => {
            setShowAddProductModal(false);
            loadProducts();
          }}
        />
      )}
    </div>
  );
};

// Add Product Modal Component - Mobile Optimized
interface AddProductModalProps {
  onClose: () => void;
  onProductAdded: () => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    subcategory: '',
    merchantId: '',
    stock: '',
    tags: '',
    specifications: '',
    isActive: true
  });
  const [merchants, setMerchants] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMerchants, setIsLoadingMerchants] = useState(true);

  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    try {
      setIsLoadingMerchants(true);
      const response = await adminAPI.getMerchants({ limit: 100, verified: true });
      setMerchants(response.data.merchants || []);
    } catch (error) {
      console.error('Failed to load merchants:', error);
      toast.error('Failed to load merchants');
    } finally {
      setIsLoadingMerchants(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.price || !formData.category || !formData.merchantId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        merchant: formData.merchantId,
        stock: formData.stock ? parseInt(formData.stock) : 0,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        specifications: formData.specifications ? JSON.parse(formData.specifications) : {},
        isActive: formData.isActive,
        inStock: true
      };

      const response = await adminAPI.createProduct(productData);
      
      if (response.data.success) {
        toast.success('Product created successfully');
        onProductAdded();
      }
    } catch (error: any) {
      console.error('Failed to create product:', error);
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const categories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports & Outdoors',
    'Health & Beauty',
    'Books & Media',
    'Food & Beverages',
    'Automotive',
    'Baby & Kids',
    'Other'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add New Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Basic Information */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter product description"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Classification & Assignment */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Classification & Assignment</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Merchant *
                </label>
                <select
                  name="merchantId"
                  value={formData.merchantId}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select a merchant</option>
                  {isLoadingMerchants ? (
                    <option disabled>Loading merchants...</option>
                  ) : (
                    merchants.map((merchant) => (
                      <option key={merchant._id} value={merchant._id}>
                        {merchant.businessName}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter subcategory"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specifications (JSON)
                </label>
                <textarea
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleInputChange}
                  rows={3}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder='{"color": "blue", "size": "large"}'
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Active (visible to customers)
                </label>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-blue-800">
              <strong>Note:</strong> Product images can be added after creation through the product edit interface.
              Make sure all required fields are filled correctly before submitting.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-6 py-2 text-white rounded text-sm sm:text-base ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductsManagement;