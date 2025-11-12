import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
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
  Image as ImageIcon,
  Search,
  Filter,
  Grid3x3,
  List,
  Star,
  DollarSign,
  Tag,
  ArrowLeft,
  Sparkles
} from "lucide-react";

import { Product, ProductFormData  } from "@/interfaces/productmanagement";
import { CATEGORIES } from "@/data/productmanagement";

const ProductManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // View and filter states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
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

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || product.category === filterCategory;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "available" && product.available) ||
                         (filterStatus === "unavailable" && !product.available);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const productStats = {
    total: products.length,
    available: products.filter(p => p.available).length,
    unavailable: products.filter(p => !p.available).length,
    featured: products.filter(p => p.featured).length
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching products...');
      const response = await api.get("/merchants/dashboard/products");
      console.log('✅ Products fetched:', response.data);
      setProducts(response.data.data || []);
    } catch (err: any) {
      console.error('❌ Failed to fetch products:', err);
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

  // const handleDeleteExistingImage = async (imageUrl: string, productId: string) => {
  //   if (!confirm("Are you sure you want to delete this image?")) return;

  //   try {
  //     setDeletingImage(imageUrl);
  //     await axios.delete(`/api/merchants/dashboard/products/${productId}/images`, {
  //       data: { imageUrl }
  //     });
      
  //     setSuccess("Image deleted successfully");
  //     await fetchProducts();
      
  //     // Update preview if modal is open
  //     if (editingProduct && editingProduct._id === productId) {
  //       setPreviewImages(prev => prev.filter(img => img !== imageUrl));
  //     }
      
  //     setTimeout(() => setSuccess(""), 3000);
  //   } catch (err: any) {
  //     setError(err.response?.data?.message || "Failed to delete image");
  //   } finally {
  //     setDeletingImage(null);
  //   }
  // };

  const handleDeleteExistingImage = async (imageUrl: string, productId: string) => {
  if (!confirm("Are you sure you want to delete this image?")) return;

  try {
    setDeletingImage(imageUrl);
    
    // Get the current product
    const product = products.find(p => p._id === productId);
    if (!product) throw new Error("Product not found");

    // Remove the image from the product's images array
    const updatedImages = product.images.filter(img => img !== imageUrl);
    
    // Update the product with the new images array
    await api.put(`/merchants/dashboard/products/${productId}`, {
      ...formData,
      images: updatedImages
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

    let uploadedImageUrls: string[] = [];

    // Upload images first if there are new ones
    if (productImages.length > 0) {
      console.log('🔄 Uploading product images...');
      const imageFormData = new FormData();
      productImages.forEach(file => {
        imageFormData.append("images", file);
      });

      const uploadResponse = await api.post("/uploads/products", imageFormData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Accept": "application/json"
        },
        timeout: 60000, // 60 second timeout for file uploads
      });

      console.log('✅ Upload response:', uploadResponse.data);
      
      // Handle different response structures
      if (uploadResponse.data.files) {
        uploadedImageUrls = uploadResponse.data.files.map((file: any) => file.url);
      } else if (uploadResponse.data.data) {
        uploadedImageUrls = uploadResponse.data.data;
      }
      
      console.log('✅ Images uploaded:', uploadedImageUrls);
    }

    if (editingProduct) {
      // Update existing product
      const existingImages = previewImages.filter(img => img.startsWith('http'));
      const updateData = {
        ...formData,
        images: [...existingImages, ...uploadedImageUrls]
      };

      console.log('🔄 Updating product:', editingProduct._id);
      const updateResponse = await api.put(
        `/merchants/dashboard/products/${editingProduct._id}`, 
        updateData
      );
      console.log('✅ Product updated:', updateResponse.data);

      setSuccess("Product updated successfully");
    } else {
      // Create new product
      const productData = {
        ...formData,
        images: uploadedImageUrls
      };

      console.log('🔄 Creating new product with data:', productData);
      
      const response = await api.post(
        "/merchants/dashboard/products", 
        productData
      );
      
      console.log('✅ Product creation response:', response.data);
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error || "Failed to create product");
      }

      console.log('✅ Product created successfully');
      setSuccess("Product created successfully");
    }

    await fetchProducts();
    handleCloseProductModal();
    setTimeout(() => setSuccess(""), 3000);
  } catch (err: any) {
    console.error('❌ Product submission error:', err);
    console.error('❌ Error response:', err.response);
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
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
          <p className="text-gray-600">Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Modern Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={() => navigate("/merchant/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button 
              onClick={() => handleOpenProductModal()}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
          
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="h-8 w-8" />
              Product Management
            </h1>
            <p className="text-blue-100 text-lg">
              Manage your products and grow your business
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4" />
                <p className="text-xs uppercase tracking-wide text-blue-100">Total</p>
              </div>
              <p className="text-2xl font-bold">{productStats.total}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4" />
                <p className="text-xs uppercase tracking-wide text-blue-100">Available</p>
              </div>
              <p className="text-2xl font-bold">{productStats.available}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <EyeOff className="h-4 w-4" />
                <p className="text-xs uppercase tracking-wide text-blue-100">Hidden</p>
              </div>
              <p className="text-2xl font-bold">{productStats.unavailable}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4" />
                <p className="text-xs uppercase tracking-wide text-blue-100">Featured</p>
              </div>
              <p className="text-2xl font-bold">{productStats.featured}</p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <Alert variant="destructive" className="shadow-lg border-red-200">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-50 shadow-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800 font-medium">{success}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filter Bar */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500"
                />
              </div>

              {/* Category Filter */}
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-48 border-gray-200">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48 border-gray-200">
                  <Tag className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="flex-1 md:flex-none"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex-1 md:flex-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <Card className="shadow-lg border-0">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full p-6 mb-4">
                <Package className="h-16 w-16 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-800">
                {products.length === 0 ? "No products yet" : "No matching products"}
              </h3>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                {products.length === 0 
                  ? "Start building your catalog by adding your first product" 
                  : "Try adjusting your search or filters"}
              </p>
              {products.length === 0 && (
                <Button onClick={() => handleOpenProductModal()} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Product
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <Card key={product._id} className="group hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden">
                {/* Product Image with Overlay */}
                <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {product.featured && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 border-0 shadow-lg">
                        <Star className="h-3 w-3 mr-1 fill-white" />
                        Featured
                      </Badge>
                    )}
                    <Badge className={product.available ? "bg-green-500 border-0" : "bg-gray-500 border-0"}>
                      {product.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>

                  {/* Image Count */}
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    {product.images.length}/5
                  </div>
                </div>

                {/* Product Info */}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 text-lg">{product.name}</CardTitle>
                  </div>
                  <CardDescription className="line-clamp-2 text-sm">
                    {product.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Category & Price */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-blue-600 font-bold">
                      <DollarSign className="h-4 w-4" />
                      {product.price > 0 ? `${product.price.toLocaleString()}` : "Contact"}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
                      onClick={() => handleOpenProductModal(product)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    
                    <Button
                      variant={product.available ? "outline" : "default"}
                      size="sm"
                      className={product.available ? "" : "bg-green-600 hover:bg-green-700"}
                      onClick={() => handleToggleAvailability(product._id, product.available)}
                    >
                      {product.available ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:border-red-600"
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-3">
            {filteredProducts.map(product => (
              <Card key={product._id} className="hover:shadow-lg transition-shadow border-0">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{product.description}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs">{product.category}</Badge>
                            {product.featured && (
                              <Badge className="bg-yellow-500 text-xs">
                                <Star className="h-3 w-3 mr-1 fill-white" />
                                Featured
                              </Badge>
                            )}
                            <Badge className={product.available ? "bg-green-500 text-xs" : "bg-gray-500 text-xs"}>
                              {product.available ? "Available" : "Unavailable"}
                            </Badge>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <ImageIcon className="h-3 w-3" />
                              {product.images.length}/5
                            </span>
                          </div>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-xl font-bold text-blue-600">
                            {product.price > 0 ? `KES ${product.price.toLocaleString()}` : "Contact"}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenProductModal(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={product.available ? "outline" : "default"}
                              size="sm"
                              className={product.available ? "" : "bg-green-600 hover:bg-green-700"}
                              onClick={() => handleToggleAvailability(product._id, product.available)}
                            >
                              {product.available ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteProduct(product._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
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
    </div>
  );
};

export default ProductManagement;
