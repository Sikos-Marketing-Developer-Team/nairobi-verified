"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiService } from "@/lib/api";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertCircle, 
  CheckCircle, 
  ChevronDown, 
  Edit, 
  Eye, 
  Loader2, 
  MoreHorizontal, 
  Search, 
  Star, 
  Trash, 
  XCircle 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: {
    _id: string;
    name: string;
  };
  merchant: {
    _id: string;
    companyName: string;
  };
  stock: number;
  status: string;
  featured: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export default function AdminProductsPage() {
  const { toast } = useToast();
  
  // State for products
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [merchantFilter, setMerchantFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // State for bulk actions
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>("");
  
  // State for product details dialog
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
  
  // State for categories and merchants (for filters)
  const [categories, setCategories] = useState<{_id: string, name: string}[]>([]);
  const [merchants, setMerchants] = useState<{_id: string, companyName: string}[]>([]);
  
  // Fetch products
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchMerchants();
  }, [currentPage, categoryFilter, statusFilter, merchantFilter]);
  
  // Apply search filter
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.merchant.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);
  
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // This endpoint needs to be implemented in the backend
      const params: any = {
        page: currentPage,
        limit: 10,
      };
      
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (merchantFilter) params.merchant = merchantFilter;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/products?${new URLSearchParams(params)}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      
      const data = await response.json();
      
      setProducts(data.products);
      setFilteredProducts(data.products);
      setTotalPages(data.totalPages);
      setTotalProducts(data.total);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to load products. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const response = await apiService.categories.getAll();
      setCategories(response.data.categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };
  
  const fetchMerchants = async () => {
    try {
      const response = await apiService.merchants.getAll();
      setMerchants(response.data.merchants);
    } catch (err) {
      console.error("Error fetching merchants:", err);
    }
  };
  
  const handleViewProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDetailsOpen(true);
  };
  
  const handleToggleProductStatus = async (productId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      // This endpoint needs to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/products/${productId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to update product status");
      }
      
      // Update product in state
      setProducts(prev => 
        prev.map(p => 
          p._id === productId ? { ...p, status: newStatus } : p
        )
      );
      setFilteredProducts(prev => 
        prev.map(p => 
          p._id === productId ? { ...p, status: newStatus } : p
        )
      );
      
      toast({
        title: "Status updated",
        description: `Product status has been updated to ${newStatus}.`
      });
    } catch (err: any) {
      console.error("Error updating product status:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update product status."
      });
    }
  };
  
  const handleToggleFeatured = async (productId: string, currentFeatured: boolean) => {
    try {
      // This endpoint needs to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/products/${productId}/featured`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !currentFeatured }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to update featured status");
      }
      
      // Update product in state
      setProducts(prev => 
        prev.map(p => 
          p._id === productId ? { ...p, featured: !currentFeatured } : p
        )
      );
      setFilteredProducts(prev => 
        prev.map(p => 
          p._id === productId ? { ...p, featured: !currentFeatured } : p
        )
      );
      
      toast({
        title: currentFeatured ? "Removed from featured" : "Added to featured",
        description: `Product has been ${currentFeatured ? 'removed from' : 'added to'} featured products.`
      });
    } catch (err: any) {
      console.error("Error updating featured status:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update featured status."
      });
    }
  };
  
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }
    
    try {
      // This endpoint needs to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete product");
      }
      
      // Remove product from state
      setProducts(prev => prev.filter(p => p._id !== productId));
      setFilteredProducts(prev => prev.filter(p => p._id !== productId));
      
      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully."
      });
    } catch (err: any) {
      console.error("Error deleting product:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete product."
      });
    }
  };
  
  const handleSelectAllProducts = (checked: boolean) => {
    if (checked) {
      setSelectedProductIds(filteredProducts.map(p => p._id));
    } else {
      setSelectedProductIds([]);
    }
  };
  
  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProductIds(prev => [...prev, productId]);
    } else {
      setSelectedProductIds(prev => prev.filter(id => id !== productId));
    }
  };
  
  const handleBulkAction = async () => {
    if (selectedProductIds.length === 0) {
      toast({
        variant: "destructive",
        title: "No products selected",
        description: "Please select at least one product to perform this action."
      });
      return;
    }
    
    try {
      // This endpoint needs to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/products/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productIds: selectedProductIds,
          action: bulkAction
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${bulkAction} products`);
      }
      
      // Update products in state based on action
      if (bulkAction === 'delete') {
        setProducts(prev => prev.filter(p => !selectedProductIds.includes(p._id)));
        setFilteredProducts(prev => prev.filter(p => !selectedProductIds.includes(p._id)));
      } else {
        const newStatus = bulkAction === 'activate' ? 'active' : 'inactive';
        setProducts(prev => 
          prev.map(p => 
            selectedProductIds.includes(p._id) ? { ...p, status: newStatus } : p
          )
        );
        setFilteredProducts(prev => 
          prev.map(p => 
            selectedProductIds.includes(p._id) ? { ...p, status: newStatus } : p
          )
        );
      }
      
      // Reset selection
      setSelectedProductIds([]);
      setIsBulkActionDialogOpen(false);
      
      toast({
        title: "Bulk action completed",
        description: `Successfully ${bulkAction}d ${selectedProductIds.length} products.`
      });
    } catch (err: any) {
      console.error(`Error performing bulk ${bulkAction}:`, err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || `Failed to ${bulkAction} products.`
      });
    }
  };
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Product Management</h1>
          <div className="flex gap-2">
            {selectedProductIds.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setIsBulkActionDialogOpen(true)}
              >
                Bulk Actions ({selectedProductIds.length})
              </Button>
            )}
          </div>
        </div>
        
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={merchantFilter} onValueChange={(value) => setMerchantFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Merchants" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Merchants</SelectItem>
                    {merchants.map(merchant => (
                      <SelectItem key={merchant._id} value={merchant._id}>
                        {merchant.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                  setStatusFilter("all");
                  setMerchantFilter("all");
                  setCurrentPage(1);
                }}>
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Showing {filteredProducts.length} of {totalProducts} total products
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products found matching your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox 
                          checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                          onCheckedChange={handleSelectAllProducts}
                        />
                      </TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Merchant</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedProductIds.includes(product._id)}
                            onCheckedChange={(checked) => handleSelectProduct(product._id, !!checked)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            {product.images && product.images.length > 0 ? (
                              <img 
                                src={product.images[0]} 
                                alt={product.name} 
                                className="h-10 w-10 rounded object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 text-xs">No img</span>
                              </div>
                            )}
                            <div>
                              <div>{product.name}</div>
                              <div className="text-sm text-gray-500">
                                Stock: {product.stock} | Rating: {product.rating.toFixed(1)} ({product.reviewCount})
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.category.name}</TableCell>
                        <TableCell>{product.merchant.companyName}</TableCell>
                        <TableCell>
                          <div className="font-medium">${product.price.toFixed(2)}</div>
                          {product.discountPrice && (
                            <div className="text-sm text-gray-500 line-through">
                              ${product.discountPrice.toFixed(2)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(product.status)}>
                            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product.featured ? (
                            <Badge className="bg-purple-100 text-purple-800">
                              <Star className="h-3 w-3 mr-1" /> Featured
                            </Badge>
                          ) : (
                            <span className="text-gray-500 text-sm">No</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewProductDetails(product)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleProductStatus(product._id, product.status)}>
                                {product.status === 'active' ? (
                                  <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleFeatured(product._id, product.featured)}>
                                <Star className="mr-2 h-4 w-4" />
                                {product.featured ? 'Remove from Featured' : 'Add to Featured'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteProduct(product._id)}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Product
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Product Details Dialog */}
      <Dialog open={isProductDetailsOpen} onOpenChange={setIsProductDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <div className="aspect-square overflow-hidden rounded-lg">
                      <img 
                        src={selectedProduct.images[0]} 
                        alt={selectedProduct.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">No image available</span>
                    </div>
                  )}
                  
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {selectedProduct.images.slice(1, 5).map((image, index) => (
                        <div key={index} className="aspect-square overflow-hidden rounded-lg">
                          <img 
                            src={image} 
                            alt={`${selectedProduct.name} ${index + 2}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold">{selectedProduct.name}</h2>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < Math.floor(selectedProduct.rating) 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {selectedProduct.rating.toFixed(1)} ({selectedProduct.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">${selectedProduct.price.toFixed(2)}</span>
                    {selectedProduct.discountPrice && (
                      <span className="ml-2 text-gray-500 line-through">
                        ${selectedProduct.discountPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                    <p>{selectedProduct.category.name}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Merchant</h3>
                    <p>{selectedProduct.merchant.companyName}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <Badge className={getStatusBadgeColor(selectedProduct.status)}>
                      {selectedProduct.status.charAt(0).toUpperCase() + selectedProduct.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Stock</h3>
                    <p>{selectedProduct.stock} units</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Featured</h3>
                    <p>{selectedProduct.featured ? 'Yes' : 'No'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                    <p>{new Date(selectedProduct.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <p className="text-gray-700">{selectedProduct.description}</p>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsProductDetailsOpen(false)}>
                  Close
                </Button>
                <Button 
                  variant={selectedProduct.status === 'active' ? 'destructive' : 'default'}
                  onClick={() => {
                    handleToggleProductStatus(selectedProduct._id, selectedProduct.status);
                    setIsProductDetailsOpen(false);
                  }}
                >
                  {selectedProduct.status === 'active' ? 'Deactivate' : 'Activate'} Product
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Bulk Action Dialog */}
      <Dialog open={isBulkActionDialogOpen} onOpenChange={setIsBulkActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Apply an action to {selectedProductIds.length} selected products.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger>
                <SelectValue placeholder="Select an action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activate">Activate Products</SelectItem>
                <SelectItem value="deactivate">Deactivate Products</SelectItem>
                <SelectItem value="feature">Add to Featured</SelectItem>
                <SelectItem value="unfeature">Remove from Featured</SelectItem>
                <SelectItem value="delete">Delete Products</SelectItem>
              </SelectContent>
            </Select>
            
            {bulkAction === 'delete' && (
              <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-md">
                <p className="text-sm">
                  <strong>Warning:</strong> This action will permanently delete the selected products and cannot be undone.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={bulkAction === 'delete' ? 'destructive' : 'default'}
              onClick={handleBulkAction}
              disabled={!bulkAction}
            >
              Apply to {selectedProductIds.length} Products
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}