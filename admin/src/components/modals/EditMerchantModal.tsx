// components/modals/EditMerchantModal.tsx - Edit existing merchant with products
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { X, Store, MapPin, Globe, Calendar, Package, Plus, Trash2, Upload } from 'lucide-react';
import { Merchant } from '@/interfaces/MerchantsManagement';

interface ProductFormData {
  _id?: string;
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: string;
  originalPrice: string;
  stockQuantity: string;
  images: File[];
  imagePreviewUrls: string[];
  existingImages?: string[]; // For images already on server
}

interface MerchantFormData {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType: string;
  description: string;
  address: string;
  location: string;
  website: string;
  yearEstablished: string;
  verified: boolean;
  isActive: boolean;
  featured: boolean;
  products: ProductFormData[];
}

interface EditMerchantModalProps {
  isOpen: boolean;
  merchant: Merchant;
  onClose: () => void;
  onUpdateMerchant: (merchantId: string, data: any) => Promise<void>;
}

const BUSINESS_TYPES = [
  'Restaurant',
  'Retail Store',
  'Service Provider',
  'Technology',
  'Healthcare',
  'Education',
  'Entertainment',
  'Real Estate',
  'Automotive',
  'Beauty & Wellness',
  'Professional Services',
  'Other'
];

const PRODUCT_CATEGORIES = [
  'Electronics',
  'Fashion & Apparel',
  'Health & Beauty',
  'Home & Garden',
  'Books & Media',
  'Sports & Fitness',
  'Transport & Mobility',
  'Printing & Stationery',
  'Events & Decorations',
  'Household & Kitchen',
  'Medical & Wellness',
  'Beauty & Personal Care',
  'Business Services',
  'Automotive',
  'Food & Beverages',
  'Other'
];



const SUBCATEGORIES: Record<string, string[]> = {
  // EXISTING SUBCATEGORIES
  'Electronics': ['Phones & Tablets', 'Computers', 'Audio', 'Cameras', 'Gaming', 'Accessories', 'Other'],
  'Fashion & Apparel': ['Men', 'Women', 'Kids', 'Shoes', 'Accessories', 'Jewelry', 'Other'],
  'Home & Garden': ['Furniture', 'Decor', 'Kitchen', 'Garden', 'Tools', 'Bedding', 'Other'],
  'Sports & Fitness': ['Fitness', 'Outdoor', 'Team Sports', 'Water Sports', 'Cycling', 'Equipment', 'Other'],
  'Books & Media': ['Fiction', 'Non-Fiction', 'Educational', 'Children', 'Comics', 'Magazines', 'Other'],
  'Health & Beauty': ['Skincare', 'Makeup', 'Haircare', 'Fragrance', 'Personal Care', 'Tools', 'Other'],
  'Automotive': ['Parts', 'Accessories', 'Tools', 'Care', 'Electronics', 'Tires', 'Other'],
  'Food & Beverages': ['Fresh', 'Packaged', 'Beverages', 'Snacks', 'Frozen', 'Organic', 'Other'],
  
  // NEW SUBCATEGORIES - ORGANIZED
  'Transport & Mobility': [
    'Bike Hire & Rental',
    'Motorcycle Accessories',
    'Safety Gear',
    'Bike Maintenance',
    'Scooters',
    'Other Mobility Services'
  ],
  
  'Printing & Stationery': [
    'Printing Materials',
    'Office Stationery',
    'Educational Books',
    'Art Supplies',
    'Packaging Materials',
    'Business Cards & Printing'
  ],
    
  'Events & Decorations': [
    'Party Decorations',
    'Event Planning',
    'Balloons & Supplies',
    'Catering Equipment',
    'Venue Decor',
    'Wedding Supplies'
  ],
  
  'Household & Kitchen': [
    'Household Items',
    'Kitchenware',
    'Baking Supplies',
    'Cleaning Products',
    'Storage Solutions',
    'Home Organization'
  ],
  
  'Medical & Wellness': [
    'Medical Supplies',
    'Therapy Services',
    'Wellness Products',
    'First Aid',
    'Healthcare Equipment',
    'Pharmaceuticals'
  ],
  
  'Beauty & Personal Care': [
    'Nail Care & Polishes',
    'Hair Products',
    'Skin Treatments',
    'Cosmetics',
    'Personal Grooming',
    'Beauty Services'
  ],
  
  'Business Services': [
    'Packaging Services',
    'Printing Services',
    'Business Consulting',
    'Professional Services',
    'Office Supplies',
    'Corporate Gifts'
  ]
};

const EditMerchantModal = ({ isOpen, merchant, onClose, onUpdateMerchant }: EditMerchantModalProps) => {
  const [formData, setFormData] = useState<MerchantFormData>({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    businessType: '',
    description: '',
    address: '',
    location: '',
    website: '',
    yearEstablished: '',
    verified: false,
    isActive: true,
    featured: false,
    products: []
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load merchant data when modal opens
  useEffect(() => {
    if (merchant && isOpen) {
      setFormData({
        businessName: merchant.businessName || '',
        ownerName: merchant.ownerName || '',
        email: merchant.email || '',
        phone: merchant.phone || '',
        businessType: merchant.businessType || '',
        description: merchant.description || '',
        address: merchant.address || '',
        location: merchant.location || '',
        website: merchant.website || '',
        yearEstablished: merchant.yearEstablished?.toString() || '',
        verified: merchant.verified || false,
        isActive: merchant.isActive !== undefined ? merchant.isActive : true,
        featured: merchant.featured || false,
        products: []
      });
    }
  }, [merchant, isOpen]);

  // Add new product to list
  const addProduct = () => {
    const newProduct: ProductFormData = {
      id: Date.now().toString(),
      name: '',
      description: '',
      category: '',
      subcategory: '',
      price: '',
      originalPrice: '',
      stockQuantity: '',
      images: [],
      imagePreviewUrls: [],
      existingImages: []
    };
    setFormData(prev => ({ ...prev, products: [...prev.products, newProduct] }));
  };

  // Remove product from list
  const removeProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId)
    }));
  };

  // Update product field
  const updateProductField = (productId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p =>
        p.id === productId ? { ...p, [field]: value } : p
      )
    }));
  };

  // Handle product image upload
  const handleProductImageUpload = (productId: string, e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p => {
        if (p.id === productId) {
          const newImages = [...p.images, ...files];
          const newPreviewUrls = [...p.imagePreviewUrls, ...files.map(file => URL.createObjectURL(file))];
          return { ...p, images: newImages, imagePreviewUrls: newPreviewUrls };
        }
        return p;
      })
    }));
  };

  // Remove product image
  const removeProductImage = (productId: string, imageIndex: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p => {
        if (p.id === productId) {
          // Revoke object URL to prevent memory leaks
          if (p.imagePreviewUrls[imageIndex]) {
            URL.revokeObjectURL(p.imagePreviewUrls[imageIndex]);
          }
          return {
            ...p,
            images: p.images.filter((_, i) => i !== imageIndex),
            imagePreviewUrls: p.imagePreviewUrls.filter((_, i) => i !== imageIndex)
          };
        }
        return p;
      })
    }));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.businessType) newErrors.businessType = 'Business type is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';

    // Validate email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Validate products
    formData.products.forEach((product, index) => {
      if (!product.name.trim()) {
        newErrors[`product_${index}_name`] = 'Product name is required';
      }
      if (!product.category) {
        newErrors[`product_${index}_category`] = 'Product category is required';
      }
      if (!product.price || parseFloat(product.price) < 0) {
        newErrors[`product_${index}_price`] = 'Valid price is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Append merchant data
      formDataToSend.append('businessName', formData.businessName);
      formDataToSend.append('ownerName', formData.ownerName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('businessType', formData.businessType);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('website', formData.website);
      formDataToSend.append('yearEstablished', formData.yearEstablished);
      formDataToSend.append('verified', formData.verified.toString());
      formDataToSend.append('isActive', formData.isActive.toString());
      formDataToSend.append('featured', formData.featured.toString());

      // Append products data
      if (formData.products.length > 0) {
        const productsData = formData.products.map(p => ({
          name: p.name,
          description: p.description,
          category: p.category,
          subcategory: p.subcategory,
          price: parseFloat(p.price),
          originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : parseFloat(p.price),
          stockQuantity: parseInt(p.stockQuantity) || 0
        }));
        formDataToSend.append('products', JSON.stringify(productsData));

        // Append product images
        formData.products.forEach((product, productIndex) => {
          product.images.forEach((file, fileIndex) => {
            formDataToSend.append(`product_${productIndex}_image_${fileIndex}`, file);
          });
        });
      }

      await onUpdateMerchant(merchant._id, formDataToSend);
      handleClose();
    } catch (error) {
      console.error('Error updating merchant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Revoke all object URLs to prevent memory leaks
    formData.products.forEach(product => {
      product.imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    });
    
    setFormData({
      businessName: '',
      ownerName: '',
      email: '',
      phone: '',
      businessType: '',
      description: '',
      address: '',
      location: '',
      website: '',
      yearEstablished: '',
      verified: false,
      isActive: true,
      featured: false,
      products: []
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl transform transition-all z-[10000]">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Merchant</h2>
              <p className="text-sm text-gray-500 mt-1">Update merchant information and add products</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Business Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <Store className="w-6 h-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.businessName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter business name"
                    />
                    {errors.businessName && (
                      <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Name
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter owner name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="merchant@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+254 700 000 000"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Type *
                    </label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.businessType ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select type</option>
                      {BUSINESS_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.businessType && (
                      <p className="text-red-500 text-xs mt-1">{errors.businessType}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Globe className="w-4 h-4 inline mr-1" />
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Year Established
                    </label>
                    <input
                      type="number"
                      name="yearEstablished"
                      value={formData.yearEstablished}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="2020"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Describe the business..."
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <MapPin className="w-6 h-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Street address"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location/City *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nairobi"
                    />
                    {errors.location && (
                      <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Settings */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="verified"
                      name="verified"
                      checked={formData.verified}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="verified" className="ml-2 text-sm text-gray-700">
                      Verified Merchant
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                      Active Account
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                      Featured Merchant
                    </label>
                  </div>
                </div>
              </div>

              {/* Products Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Package className="w-6 h-6 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Products (Optional)</h3>
                  </div>
                  <button
                    type="button"
                    onClick={addProduct}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Product
                  </button>
                </div>

                {formData.products.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No products added yet. Click "Add Product" to add products.</p>
                ) : (
                  <div className="space-y-6">
                    {formData.products.map((product, index) => (
                      <div key={product.id} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-md font-semibold text-gray-900">Product {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeProduct(product.id)}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Product Name *
                            </label>
                            <input
                              type="text"
                              value={product.name}
                              onChange={(e) => updateProductField(product.id, 'name', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                errors[`product_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Product name"
                            />
                            {errors[`product_${index}_name`] && (
                              <p className="text-red-500 text-xs mt-1">{errors[`product_${index}_name`]}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Category *
                            </label>
                            <select
                              value={product.category}
                              onChange={(e) => updateProductField(product.id, 'category', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                errors[`product_${index}_category`] ? 'border-red-500' : 'border-gray-300'
                              }`}
                            >
                              <option value="">Select category</option>
                              {PRODUCT_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                            {errors[`product_${index}_category`] && (
                              <p className="text-red-500 text-xs mt-1">{errors[`product_${index}_category`]}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Subcategory
                            </label>
                            <select
                              value={product.subcategory}
                              onChange={(e) => updateProductField(product.id, 'subcategory', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              disabled={!product.category}
                            >
                              <option value="">Select subcategory</option>
                              {product.category && SUBCATEGORIES[product.category]?.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Price (KES) *
                            </label>
                            <input
                              type="number"
                              value={product.price}
                              onChange={(e) => updateProductField(product.id, 'price', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                errors[`product_${index}_price`] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="0"
                              min="0"
                              step="0.01"
                            />
                            {errors[`product_${index}_price`] && (
                              <p className="text-red-500 text-xs mt-1">{errors[`product_${index}_price`]}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Original Price (KES)
                            </label>
                            <input
                              type="number"
                              value={product.originalPrice}
                              onChange={(e) => updateProductField(product.id, 'originalPrice', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="0"
                              min="0"
                              step="0.01"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Stock Quantity
                            </label>
                            <input
                              type="number"
                              value={product.stockQuantity}
                              onChange={(e) => updateProductField(product.id, 'stockQuantity', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="0"
                              min="0"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={product.description}
                              onChange={(e) => updateProductField(product.id, 'description', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Product description"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Product Images
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-green-400 transition-colors">
                              <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                                    <span>Upload images</span>
                                    <input
                                      type="file"
                                      multiple
                                      accept="image/*"
                                      onChange={(e) => handleProductImageUpload(product.id, e)}
                                      className="sr-only"
                                    />
                                  </label>
                                  <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                              </div>
                            </div>

                            {/* Image Previews */}
                            {product.imagePreviewUrls.length > 0 && (
                              <div className="mt-4 grid grid-cols-3 gap-4">
                                {product.imagePreviewUrls.map((url, imgIndex) => (
                                  <div key={imgIndex} className="relative">
                                    <img
                                      src={url}
                                      alt={`Product ${index + 1} Image ${imgIndex + 1}`}
                                      className="h-24 w-full object-cover rounded-md"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeProductImage(product.id, imgIndex)}
                                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                'Update Merchant'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMerchantModal;
