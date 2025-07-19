import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Upload, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePageLoading } from '@/hooks/use-loading';
import { PageSkeleton } from '@/components/ui/loading-skeletons';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link, useNavigate } from 'react-router-dom';

interface Product {
  productId: string;
  name: string;
  originalPrice: number;
  salePrice: number;
  image: string;
  merchant: string;
  merchantId: string;
  stockQuantity: number;
  maxQuantityPerUser: number;
}

const AdminCreateFlashSale = () => {
  const isLoading = usePageLoading(600);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  const [products, setProducts] = useState<Product[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addProduct = () => {
    const newProduct: Product = {
      productId: `product_${Date.now()}`,
      name: '',
      originalPrice: 0,
      salePrice: 0,
      image: '',
      merchant: '',
      merchantId: '',
      stockQuantity: 0,
      maxQuantityPerUser: 5
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (index: number, field: keyof Product, value: string | number) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };
    setProducts(updatedProducts);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (products.length === 0) {
      alert('Please add at least one product');
      return;
    }

    // Validate products
    for (const product of products) {
      if (!product.name || !product.originalPrice || !product.salePrice || !product.merchant) {
        alert('Please fill in all product details');
        return;
      }
      if (product.salePrice >= product.originalPrice) {
        alert('Sale price must be less than original price');
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch('/api/flash-sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          products
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Flash sale created successfully!');
        navigate('/admin/flash-sales');
      } else {
        alert(data.error || 'Failed to create flash sale');
      }
    } catch (error) {
      console.error('Error creating flash sale:', error);
      alert('Error creating flash sale');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = (original: number, sale: number) => {
    if (original <= 0 || sale <= 0) return 0;
    return Math.round(((original - sale) / original) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PageSkeleton>
          <div className="space-y-8">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </PageSkeleton>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin/flash-sales" className="inline-flex items-center text-primary hover:text-primary-dark mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Flash Sales
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Flash Sale</h1>
          <p className="text-gray-600">Set up a new flash sale campaign</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Weekend Electronics Sale"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your flash sale..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date & Time *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date & Time *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Products ({products.length})</CardTitle>
                <Button type="button" onClick={addProduct} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No products added yet</p>
                  <Button type="button" onClick={addProduct} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Product
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {products.map((product, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Product {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeProduct(index)}
                          className="text-red-600 hover:text-red-700 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Product Name *</Label>
                          <Input
                            value={product.name}
                            onChange={(e) => updateProduct(index, 'name', e.target.value)}
                            placeholder="Product name"
                            required
                          />
                        </div>

                        <div>
                          <Label>Merchant *</Label>
                          <Input
                            value={product.merchant}
                            onChange={(e) => updateProduct(index, 'merchant', e.target.value)}
                            placeholder="Merchant name"
                            required
                          />
                        </div>

                        <div>
                          <Label>Original Price (KES) *</Label>
                          <Input
                            type="number"
                            value={product.originalPrice || ''}
                            onChange={(e) => updateProduct(index, 'originalPrice', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>

                        <div>
                          <Label>Sale Price (KES) *</Label>
                          <Input
                            type="number"
                            value={product.salePrice || ''}
                            onChange={(e) => updateProduct(index, 'salePrice', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            required
                          />
                          {product.originalPrice > 0 && product.salePrice > 0 && (
                            <p className="text-sm text-green-600 mt-1">
                              {calculateDiscount(product.originalPrice, product.salePrice)}% discount
                            </p>
                          )}
                        </div>

                        <div>
                          <Label>Stock Quantity *</Label>
                          <Input
                            type="number"
                            value={product.stockQuantity || ''}
                            onChange={(e) => updateProduct(index, 'stockQuantity', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            required
                          />
                        </div>

                        <div>
                          <Label>Max Per User</Label>
                          <Input
                            type="number"
                            value={product.maxQuantityPerUser || ''}
                            onChange={(e) => updateProduct(index, 'maxQuantityPerUser', parseInt(e.target.value) || 5)}
                            placeholder="5"
                            min="1"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label>Product Image URL</Label>
                          <Input
                            value={product.image}
                            onChange={(e) => updateProduct(index, 'image', e.target.value)}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>

                      {/* Product Preview */}
                      {product.name && product.originalPrice > 0 && product.salePrice > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h5 className="font-medium text-sm text-gray-700 mb-2">Preview:</h5>
                          <div className="flex items-center gap-4">
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-600">{product.merchant}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-red-500 font-bold">{formatPrice(product.salePrice)}</span>
                                <span className="text-gray-500 line-through text-sm">{formatPrice(product.originalPrice)}</span>
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">
                                  -{calculateDiscount(product.originalPrice, product.salePrice)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            <Link to="/admin/flash-sales">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Flash Sale'}
            </Button>
          </div>
        </form>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminCreateFlashSale;