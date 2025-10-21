import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  Package,
  Image as ImageIcon
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  available: boolean;
  featured: boolean;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: number;
  available: boolean;
  featured: boolean;
}

const CATEGORIES = [
  "Beauty & Cosmetics",
  "Fashion & Apparel",
  "Food & Beverages",
  "Health & Wellness",
  "Home & Garden",
  "Electronics",
  "Services",
  "Other"
];

const ProductManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "",
    price: 0,
    available: true,
    featured: false
  });
  
  // Image upload state
  const [productImages, setProductImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/merchants/dashboard/products");
      setProducts(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        available: product.available,
        featured: product.featured
      });
      setPreviewImages(product.images);
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        category: "",
        price: 0,
        available: true,
        featured: false
      });
      setPreviewImages([]);
    }
    setProductImages([]);
    setShowProductModal(true);
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      category: "",
      price: 0,
      available: true,
      featured: false
    });
    setProductImages([]);
    setPreviewImages([]);
    setError("");
    setSuccess("");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith("image/")) {
        setError("Please select only image files");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image must be less than 5MB");
        return false;
      }
      return true;
    });

    // Limit to 5 images total
    const currentTotal = previewImages.length + productImages.length;
    const remaining = 5 - currentTotal;
    
    if (validFiles.length > remaining) {
      setError(`You can only upload ${remaining} more image(s). Maximum 5 images per product.`);
      return;
    }

    setProductImages([...productImages, ...validFiles]);

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveNewImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imageUrl: string, productId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      setDeletingImage(imageUrl);
      await axios.delete(`/api/merchants/dashboard/products/${productId}/images`, {
        data: { imageUrl }
      });
      
      setSuccess("Image deleted successfully");
      await fetchProducts();
      
      // Update preview if modal is open
      if (editingProduct && editingProduct._id === productId) {
        setPreviewImages(prev => prev.filter(img => img !== imageUrl));
      }
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete image");
    } finally {
      setDeletingImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.name || !formData.category || !formData.description) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.price < 0) {
      setError("Price must be a positive number");
      return;
    }

    try {
      setUploading(true);
      console.log('📦 Submitting product:', formData);

      if (editingProduct) {
        // Update existing product
        const updateResponse = await axios.put(`/api/merchants/dashboard/products/${editingProduct._id}`, formData);
        console.log('✅ Product updated:', updateResponse.data);
        
        // Upload new images if any
        if (productImages.length > 0) {
          const imageFormData = new FormData();
          productImages.forEach(file => {
            imageFormData.append("images", file);
          });
          
          const imageResponse = await axios.post(
            `/api/merchants/dashboard/products/${editingProduct._id}/images`,
            imageFormData,
            {
              headers: { "Content-Type": "multipart/form-data" }
            }
          );
          console.log('✅ Images uploaded:', imageResponse.data);
        }

        setSuccess("Product updated successfully");
      } else {
        // Create new product
        console.log('🔄 Creating new product...');
        const response = await axios.post("/api/merchants/dashboard/products", formData);
        console.log('✅ Product created:', response.data);
        const newProduct = response.data.data;
        
        if (!newProduct || !newProduct._id) {
          throw new Error("Product created but no product ID returned");
        }
        
        // Upload images if any
        if (productImages.length > 0) {
          console.log('🔄 Uploading images...');
          const imageFormData = new FormData();
          productImages.forEach(file => {
            imageFormData.append("images", file);
          });
          
          const imageResponse = await axios.post(
            `/api/merchants/dashboard/products/${newProduct._id}/images`,
            imageFormData,
            {
              headers: { "Content-Type": "multipart/form-data" }
            }
          );
          console.log('✅ Images uploaded:', imageResponse.data);
        }

        setSuccess("Product created successfully");
      }

      await fetchProducts();
      handleCloseProductModal();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error('❌ Product submission error:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to save product";
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleToggleAvailability = async (productId: string, currentStatus: boolean) => {
    try {
      await axios.patch(`/api/merchants/dashboard/products/${productId}/availability`, {
        available: !currentStatus
      });
      
      setSuccess(`Product ${!currentStatus ? "enabled" : "disabled"} successfully`);
      await fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update product availability");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(`/api/merchants/dashboard/products/${productId}`);
      setSuccess("Product deleted successfully");
      await fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete product");
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your products and services
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/merchant/dashboard")}>
            Back to Dashboard
          </Button>
          <Button onClick={() => handleOpenProductModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first product</p>
            <Button onClick={() => handleOpenProductModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <Card key={product._id} className="overflow-hidden">
              {/* Product Image */}
              <div className="relative h-48 bg-gray-200">
                {product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-2 right-2 flex gap-2">
                  {product.featured && (
                    <Badge className="bg-yellow-500">Featured</Badge>
                  )}
                  {!product.available && (
                    <Badge variant="secondary">Unavailable</Badge>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <CardHeader>
                <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {product.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <Badge variant="outline">{product.category}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold">
                      {product.price > 0 ? `KES ${product.price.toLocaleString()}` : "Contact for price"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Images:</span>
                    <span>{product.images.length}/5</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenProductModal(product)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    
                    <Button
                      variant={product.available ? "secondary" : "default"}
                      size="sm"
                      onClick={() => handleToggleAvailability(product._id, product.available)}
                    >
                      {product.available ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Product Form Modal */}
      <Dialog open={showProductModal} onOpenChange={handleCloseProductModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct 
                ? "Update your product information" 
                : "Add a new product or service to your catalog"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Name */}
            <div>
              <Label htmlFor="name">
                Product/Service Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Premium Hair Treatment"
                required
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your product or service..."
                rows={4}
                required
              />
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Price (KES)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0 for contact pricing"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave as 0 if customers should contact you for pricing
              </p>
            </div>

            {/* Availability and Featured */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="available" className="cursor-pointer">
                  Available for purchase
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  Feature this product
                </Label>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <Label>Product Images (Max 5)</Label>
              
              {/* Preview Grid */}
              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {previewImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (editingProduct && img.startsWith("http")) {
                            handleDeleteExistingImage(img, editingProduct._id);
                          } else {
                            handleRemoveNewImage(idx);
                          }
                        }}
                        disabled={deletingImage === img}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              {previewImages.length < 5 && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    id="product-images"
                  />
                  <Label
                    htmlFor="product-images"
                    className="flex items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Images ({previewImages.length}/5)
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    JPEG, PNG (Max 5MB each)
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseProductModal}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
