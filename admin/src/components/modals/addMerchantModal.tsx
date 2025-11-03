// components/modals/AddMerchantModal.tsx - ENHANCED VERSION WITH PRODUCTS
import { useState, ChangeEvent, FormEvent } from 'react';
import { X, Store, MapPin, Globe, Calendar, Package, Plus, Trash2, Upload } from 'lucide-react';

interface ProductFormData {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  originalPrice: string;
  stockQuantity: string;
  images: File[];
  imagePreviewUrls: string[];
}

interface MerchantFormData {
  businessName: string;
  email: string;
  phone: string;
  businessType: string;      // REQUIRED by backend
  description: string;        // REQUIRED by backend
  address: string;            // REQUIRED by backend
  location: string;           // REQUIRED by backend
  website: string;
  yearEstablished: string;
  autoVerify: boolean;
  products: ProductFormData[];
}

interface AddMerchantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMerchant: (merchant: any) => Promise<void>;
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
  'Fashion & Clothing',
  'Food & Beverages',
  'Home & Garden',
  'Sports & Outdoors',
  'Beauty & Personal Care',
  'Books & Stationery',
  'Toys & Games',
  'Automotive',
  'Health & Wellness',
  'Services',
  'Other'
];

const AddMerchantModal = ({ isOpen, onClose, onAddMerchant }: AddMerchantModalProps) => {
  const [formData, setFormData] = useState<MerchantFormData>({
    businessName: '',
    email: '',
    phone: '',
    businessType: '',
    description: '',
    address: '',
    location: '',
    website: '',
    yearEstablished: '',
    autoVerify: false,
    products: []
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Add new product to list
  const addProduct = () => {
    const newProduct: ProductFormData = {
      id: Date.now().toString(),
      name: '',
      description: '',
      category: '',
      price: '',
      originalPrice: '',
      stockQuantity: '',
      images: [],
      imagePreviewUrls: []
    };
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }));
  };

  // Remove product from list
  const removeProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId)
    }));
  };

  // Update product field
  const updateProduct = (productId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p => 
        p.id === productId ? { ...p, [field]: value } : p
      )
    }));
  };

  // Handle product image uploads
  const handleProductImageChange = (productId: string, e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));

    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            images: [...p.images, ...newFiles],
            imagePreviewUrls: [...p.imagePreviewUrls, ...newPreviewUrls]
          };
        }
        return p;
      })
    }));
  };

  // Remove product image
  const removeProductImage = (productId: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p => {
        if (p.id === productId) {
          // Revoke the URL to free memory
          URL.revokeObjectURL(p.imagePreviewUrls[index]);
          return {
            ...p,
            images: p.images.filter((_, i) => i !== index),
            imagePreviewUrls: p.imagePreviewUrls.filter((_, i) => i !== index)
          };
        }
        return p;
      })
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field validations
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.businessType) {
      newErrors.businessType = 'Business type is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    // Optional field validations
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    if (formData.yearEstablished) {
      const year = parseInt(formData.yearEstablished);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear) {
        newErrors.yearEstablished = `Year must be between 1900 and ${currentYear}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('❌ Validation failed:', errors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add merchant data
      formDataToSend.append('businessName', formData.businessName.trim());
      formDataToSend.append('email', formData.email.trim().toLowerCase());
      formDataToSend.append('phone', formData.phone.trim());
      formDataToSend.append('businessType', formData.businessType);
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('address', formData.address.trim());
      formDataToSend.append('location', formData.location.trim());
      if (formData.website.trim()) {
        formDataToSend.append('website', formData.website.trim());
      }
      if (formData.yearEstablished) {
        formDataToSend.append('yearEstablished', formData.yearEstablished);
      }
      formDataToSend.append('autoVerify', formData.autoVerify.toString());

      // Add products if any
      if (formData.products.length > 0) {
        const productsData = formData.products.map((product) => ({
          name: product.name,
          description: product.description,
          category: product.category,
          price: parseFloat(product.price) || 0,
          originalPrice: parseFloat(product.originalPrice) || parseFloat(product.price) || 0,
          stockQuantity: parseInt(product.stockQuantity) || 0,
          imageCount: product.images.length
        }));
        
        formDataToSend.append('products', JSON.stringify(productsData));

        // Add product images
        formData.products.forEach((product, productIndex) => {
          product.images.forEach((image, imageIndex) => {
            formDataToSend.append(`product_${productIndex}_image_${imageIndex}`, image);
          });
        });
      }

      console.log('📤 Submitting merchant with products...');
      
      await onAddMerchant(formDataToSend);
      handleClose();
    } catch (error: any) {
      console.error('❌ Error adding merchant:', error);
      
      // Display backend error to user
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (): void => {
    // Cleanup image preview URLs
    formData.products.forEach(product => {
      product.imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    });

    setFormData({
      businessName: '',
      email: '',
      phone: '',
      businessType: '',
      description: '',
      address: '',
      location: '',
      website: '',
      yearEstablished: '',
      autoVerify: false,
      products: []
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Store className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Add New Merchant</h2>
              <p className="text-sm text-gray-500">Fill in all required fields</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
            disabled={isLoading}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Error Alert */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Required Fields Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Fields marked with <span className="text-red-500">*</span> are required
            </p>
          </div>

          {/* Business Name */}
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              required
              value={formData.businessName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.businessName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Nairobi Tech Solutions"
              disabled={isLoading}
            />
            {errors.businessName && (
              <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="merchant@example.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+254 712 345 678"
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Business Type */}
          <div>
            <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
              Business Type <span className="text-red-500">*</span>
            </label>
            <select
              id="businessType"
              name="businessType"
              required
              value={formData.businessType}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.businessType ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              <option value="">Select business type</option>
              {BUSINESS_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.businessType && (
              <p className="mt-1 text-sm text-red-600">{errors.businessType}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Business Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe the business (minimum 20 characters)..."
              disabled={isLoading}
            />
            <div className="flex justify-between mt-1">
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {formData.description.length} characters
              </p>
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              Physical Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              required
              value={formData.address}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="123 Main Street, Building Name"
              disabled={isLoading}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location/Area <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              value={formData.location}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nairobi CBD, Westlands, Karen, etc."
              disabled={isLoading}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
          </div>

          {/* Optional Fields Divider */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Optional Information</h3>
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Globe className="h-4 w-4 mr-1" />
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.website ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://example.com"
              disabled={isLoading}
            />
            {errors.website && (
              <p className="mt-1 text-sm text-red-600">{errors.website}</p>
            )}
          </div>

          {/* Year Established */}
          <div>
            <label htmlFor="yearEstablished" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Year Established
            </label>
            <input
              type="number"
              id="yearEstablished"
              name="yearEstablished"
              value={formData.yearEstablished}
              onChange={handleInputChange}
              min="1900"
              max={new Date().getFullYear()}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.yearEstablished ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="2020"
              disabled={isLoading}
            />
            {errors.yearEstablished && (
              <p className="mt-1 text-sm text-red-600">{errors.yearEstablished}</p>
            )}
          </div>

          {/* Products Section */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center">
                <Package className="h-4 w-4 mr-1" />
                Initial Products (Optional)
              </h3>
              <button
                type="button"
                onClick={addProduct}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-300 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Product
              </button>
            </div>

            {formData.products.length > 0 && (
              <div className="space-y-4 mt-3">
                {formData.products.map((product, productIndex) => (
                  <div key={product.id} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-800">Product {productIndex + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        disabled={isLoading}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Product Name */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="e.g., Premium Coffee Beans"
                          disabled={isLoading}
                        />
                      </div>

                      {/* Product Description */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <textarea
                          value={product.description}
                          onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Describe the product..."
                          disabled={isLoading}
                        />
                      </div>

                      {/* Category and Prices */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Category *
                          </label>
                          <select
                            value={product.category}
                            onChange={(e) => updateProduct(product.id, 'category', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            disabled={isLoading}
                          >
                            <option value="">Select category</option>
                            {PRODUCT_CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Stock Quantity
                          </label>
                          <input
                            type="number"
                            value={product.stockQuantity}
                            onChange={(e) => updateProduct(product.id, 'stockQuantity', e.target.value)}
                            min="0"
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="0"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Price (KES) *
                          </label>
                          <input
                            type="number"
                            value={product.price}
                            onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                            min="0"
                            step="0.01"
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="0.00"
                            disabled={isLoading}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Original Price (KES)
                          </label>
                          <input
                            type="number"
                            value={product.originalPrice}
                            onChange={(e) => updateProduct(product.id, 'originalPrice', e.target.value)}
                            min="0"
                            step="0.01"
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="0.00"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      {/* Product Images */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Product Images (Unlimited)
                        </label>
                        
                        {/* Image Preview Grid */}
                        {product.imagePreviewUrls.length > 0 && (
                          <div className="grid grid-cols-4 gap-2 mb-2">
                            {product.imagePreviewUrls.map((url, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={url}
                                  alt={`Product ${index + 1}`}
                                  className="w-full h-20 object-cover rounded border border-gray-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeProductImage(product.id, index)}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  disabled={isLoading}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Upload Button */}
                        <label className="flex items-center justify-center px-3 py-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-green-500 transition-colors">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleProductImageChange(product.id, e)}
                            className="hidden"
                            disabled={isLoading}
                          />
                          <Upload className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-xs text-gray-600">
                            {product.images.length > 0 
                              ? `${product.images.length} image(s) selected - Click to add more` 
                              : 'Upload Images'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.products.length === 0 && (
              <p className="text-xs text-gray-500 mt-2">
                No products added yet. Click "Add Product" to add initial products for this merchant.
              </p>
            )}
          </div>

          {/* Auto Verify Checkbox */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="autoVerify"
              name="autoVerify"
              checked={formData.autoVerify}
              onChange={handleInputChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="autoVerify" className="text-sm text-gray-700">
              Auto-verify this merchant (skip document verification)
            </label>
          </div>

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Note:</strong> A temporary password will be automatically generated and sent to the merchant's email. 
              They must change it within 24 hours.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Merchant...
                </>
              ) : (
                'Add Merchant'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMerchantModal;