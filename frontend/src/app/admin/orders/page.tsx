"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertCircle, 
  Calendar, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Eye, 
  Loader2, 
  MoreHorizontal, 
  Search, 
  XCircle 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  merchantId: string;
  merchantName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrdersPage() {
  const { toast } = useToast();
  
  // State for orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // State for order details
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  
  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockOrders: Order[] = [
        {
          _id: "1",
          orderNumber: "ORD-2023-001",
          customerId: "c1",
          customerName: "John Doe",
          customerEmail: "john@example.com",
          merchantId: "m1",
          merchantName: "Tech Store",
          items: [
            {
              productId: "p1",
              productName: "Smartphone X",
              quantity: 1,
              unitPrice: 999.99,
              totalPrice: 999.99
            },
            {
              productId: "p2",
              productName: "Phone Case",
              quantity: 2,
              unitPrice: 19.99,
              totalPrice: 39.98
            }
          ],
          totalAmount: 1039.97,
          status: 'completed',
          paymentStatus: 'paid',
          paymentMethod: 'credit_card',
          shippingAddress: {
            street: "123 Main St",
            city: "Nairobi",
            state: "Nairobi",
            postalCode: "00100",
            country: "Kenya"
          },
          createdAt: "2023-06-15T10:30:00Z",
          updatedAt: "2023-06-15T14:45:00Z"
        },
        {
          _id: "2",
          orderNumber: "ORD-2023-002",
          customerId: "c2",
          customerName: "Jane Smith",
          customerEmail: "jane@example.com",
          merchantId: "m2",
          merchantName: "Fashion Outlet",
          items: [
            {
              productId: "p3",
              productName: "Designer Dress",
              quantity: 1,
              unitPrice: 149.99,
              totalPrice: 149.99
            }
          ],
          totalAmount: 149.99,
          status: 'processing',
          paymentStatus: 'paid',
          paymentMethod: 'mpesa',
          shippingAddress: {
            street: "456 Oak Ave",
            city: "Mombasa",
            state: "Mombasa",
            postalCode: "80100",
            country: "Kenya"
          },
          createdAt: "2023-06-18T09:15:00Z",
          updatedAt: "2023-06-18T09:30:00Z"
        },
        {
          _id: "3",
          orderNumber: "ORD-2023-003",
          customerId: "c3",
          customerName: "Robert Johnson",
          customerEmail: "robert@example.com",
          merchantId: "m3",
          merchantName: "Home Goods",
          items: [
            {
              productId: "p4",
              productName: "Coffee Table",
              quantity: 1,
              unitPrice: 299.99,
              totalPrice: 299.99
            },
            {
              productId: "p5",
              productName: "Floor Lamp",
              quantity: 2,
              unitPrice: 89.99,
              totalPrice: 179.98
            }
          ],
          totalAmount: 479.97,
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: 'bank_transfer',
          shippingAddress: {
            street: "789 Pine Rd",
            city: "Kisumu",
            state: "Kisumu",
            postalCode: "40100",
            country: "Kenya"
          },
          createdAt: "2023-06-20T15:45:00Z",
          updatedAt: "2023-06-20T15:45:00Z"
        },
        {
          _id: "4",
          orderNumber: "ORD-2023-004",
          customerId: "c4",
          customerName: "Mary Williams",
          customerEmail: "mary@example.com",
          merchantId: "m1",
          merchantName: "Tech Store",
          items: [
            {
              productId: "p6",
              productName: "Wireless Headphones",
              quantity: 1,
              unitPrice: 199.99,
              totalPrice: 199.99
            }
          ],
          totalAmount: 199.99,
          status: 'cancelled',
          paymentStatus: 'refunded',
          paymentMethod: 'credit_card',
          shippingAddress: {
            street: "101 Elm St",
            city: "Nakuru",
            state: "Nakuru",
            postalCode: "20100",
            country: "Kenya"
          },
          createdAt: "2023-06-22T11:30:00Z",
          updatedAt: "2023-06-23T09:15:00Z"
        }
      ];
      
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
      setTotalPages(1);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Apply search filter
  useEffect(() => {
    let filtered = [...orders];
    
    // Apply search term
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        order =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.merchantName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Apply payment status filter
    if (paymentStatusFilter) {
      filtered = filtered.filter(order => order.paymentStatus === paymentStatusFilter);
    }
    
    // Apply date range filter
    if (dateRangeFilter) {
      const now = new Date();
      let startDate: Date;
      
      switch (dateRangeFilter) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'yesterday':
          startDate = new Date(now.setDate(now.getDate() - 1));
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(0); // Beginning of time
      }
      
      filtered = filtered.filter(order => new Date(order.createdAt) >= startDate);
    }
    
    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, paymentStatusFilter, dateRangeFilter, orders]);
  
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };
  
  const handleUpdateOrderStatus = (order: Order) => {
    setSelectedOrder(order);
    setIsUpdateStatusOpen(true);
  };
  
  const confirmUpdateStatus = (newStatus: Order['status']) => {
    if (!selectedOrder) return;
    
    // In a real application, this would be an API call
    const updatedOrders = orders.map(order => {
      if (order._id === selectedOrder._id) {
        return {
          ...order,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    setFilteredOrders(
      filteredOrders.map(order => {
        if (order._id === selectedOrder._id) {
          return {
            ...order,
            status: newStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return order;
      })
    );
    
    toast({
      title: "Order Status Updated",
      description: `Order ${selectedOrder.orderNumber} status changed to ${newStatus}.`
    });
    
    setIsUpdateStatusOpen(false);
  };
  
  const confirmUpdatePaymentStatus = (newStatus: Order['paymentStatus']) => {
    if (!selectedOrder) return;
    
    // In a real application, this would be an API call
    const updatedOrders = orders.map(order => {
      if (order._id === selectedOrder._id) {
        return {
          ...order,
          paymentStatus: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    setFilteredOrders(
      filteredOrders.map(order => {
        if (order._id === selectedOrder._id) {
          return {
            ...order,
            paymentStatus: newStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return order;
      })
    );
    
    toast({
      title: "Payment Status Updated",
      description: `Order ${selectedOrder.orderNumber} payment status changed to ${newStatus}.`
    });
    
    setIsUpdateStatusOpen(false);
  };
  
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'refunded':
        return <Badge className="bg-purple-100 text-purple-800">Refunded</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };
  
  const getPaymentStatusBadge = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-purple-100 text-purple-800">Refunded</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Order Management</h1>
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
                    placeholder="Search orders..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Order Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={paymentStatusFilter} onValueChange={(value) => setPaymentStatusFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={dateRangeFilter} onValueChange={(value) => setDateRangeFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPaymentStatusFilter("");
                  setDateRangeFilter("");
                }}>
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              Showing {filteredOrders.length} of {orders.length} total orders
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
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No orders found matching your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Merchant</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.merchantName}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewOrderDetails(order)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Update Status
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download Invoice
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
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              View detailed information about this order.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">{selectedOrder.orderNumber}</h3>
                  <p className="text-sm text-gray-500">
                    <Calendar className="inline-block mr-1 h-4 w-4" />
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {getStatusBadge(selectedOrder.status)}
                  {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h4>
                  <div className="border rounded-md p-3 space-y-1">
                    <p><span className="font-medium">Name:</span> {selectedOrder.customerName}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.customerEmail}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Merchant Information</h4>
                  <div className="border rounded-md p-3 space-y-1">
                    <p><span className="font-medium">Name:</span> {selectedOrder.merchantName}</p>
                    <p><span className="font-medium">ID:</span> {selectedOrder.merchantId}</p>
                  </div>
                </div>
                
                {selectedOrder.shippingAddress && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Shipping Address</h4>
                    <div className="border rounded-md p-3 space-y-1">
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Information</h4>
                  <div className="border rounded-md p-3 space-y-1">
                    <p><span className="font-medium">Method:</span> {selectedOrder.paymentMethod.replace('_', ' ').toUpperCase()}</p>
                    <p><span className="font-medium">Status:</span> {selectedOrder.paymentStatus.toUpperCase()}</p>
                    <p><span className="font-medium">Total:</span> {formatCurrency(selectedOrder.totalAmount)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Order Items</h4>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(selectedOrder.totalAmount)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderDetailsOpen(false)}>Close</Button>
            <Button onClick={() => {
              setIsOrderDetailsOpen(false);
              handleUpdateOrderStatus(selectedOrder!);
            }}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Update Status Dialog */}
      <Dialog open={isUpdateStatusOpen} onOpenChange={setIsUpdateStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status for order {selectedOrder?.orderNumber}.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Order Status</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant={selectedOrder.status === 'pending' ? 'default' : 'outline'}
                    onClick={() => confirmUpdateStatus('pending')}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={selectedOrder.status === 'processing' ? 'default' : 'outline'}
                    onClick={() => confirmUpdateStatus('processing')}
                  >
                    Processing
                  </Button>
                  <Button
                    variant={selectedOrder.status === 'completed' ? 'default' : 'outline'}
                    onClick={() => confirmUpdateStatus('completed')}
                  >
                    Completed
                  </Button>
                  <Button
                    variant={selectedOrder.status === 'cancelled' ? 'default' : 'outline'}
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={() => confirmUpdateStatus('cancelled')}
                  >
                    Cancelled
                  </Button>
                  <Button
                    variant={selectedOrder.status === 'refunded' ? 'default' : 'outline'}
                    className="bg-purple-600 text-white hover:bg-purple-700"
                    onClick={() => confirmUpdateStatus('refunded')}
                  >
                    Refunded
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Payment Status</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant={selectedOrder.paymentStatus === 'pending' ? 'default' : 'outline'}
                    onClick={() => confirmUpdatePaymentStatus('pending')}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={selectedOrder.paymentStatus === 'paid' ? 'default' : 'outline'}
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={() => confirmUpdatePaymentStatus('paid')}
                  >
                    Paid
                  </Button>
                  <Button
                    variant={selectedOrder.paymentStatus === 'failed' ? 'default' : 'outline'}
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={() => confirmUpdatePaymentStatus('failed')}
                  >
                    Failed
                  </Button>
                  <Button
                    variant={selectedOrder.paymentStatus === 'refunded' ? 'default' : 'outline'}
                    className="bg-purple-600 text-white hover:bg-purple-700"
                    onClick={() => confirmUpdatePaymentStatus('refunded')}
                  >
                    Refunded
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStatusOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}