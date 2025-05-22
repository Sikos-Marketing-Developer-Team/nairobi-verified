"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  AlertCircle, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Filter, 
  Loader2, 
  Search, 
  User 
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AuditLog {
  _id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export default function AuditLogsPage() {
  const { toast } = useToast();
  
  // State for audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [userFilter, setUserFilter] = useState<string>("");
  const [resourceFilter, setResourceFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  
  // Mock data for demonstration
  useEffect(() => {
    // In a real application, this would be an API call
    const mockAuditLogs: AuditLog[] = [
      {
        _id: "1",
        userId: "user1",
        userName: "Admin User",
        userRole: "admin",
        action: "CREATE",
        resource: "USER",
        resourceId: "user123",
        details: "Created new user account",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        timestamp: new Date().toISOString(),
      },
      {
        _id: "2",
        userId: "user2",
        userName: "John Doe",
        userRole: "admin",
        action: "UPDATE",
        resource: "PRODUCT",
        resourceId: "prod456",
        details: "Updated product price from $99 to $89",
        ipAddress: "192.168.1.2",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      },
      {
        _id: "3",
        userId: "user3",
        userName: "Jane Smith",
        userRole: "merchant",
        action: "DELETE",
        resource: "ORDER",
        resourceId: "order789",
        details: "Deleted pending order",
        ipAddress: "192.168.1.3",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)",
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      },
      {
        _id: "4",
        userId: "user4",
        userName: "Sarah Johnson",
        userRole: "admin",
        action: "LOGIN",
        resource: "AUTH",
        details: "User logged in successfully",
        ipAddress: "192.168.1.4",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
      },
      {
        _id: "5",
        userId: "user5",
        userName: "Michael Brown",
        userRole: "content_admin",
        action: "UPDATE",
        resource: "CONTENT",
        resourceId: "page123",
        details: "Updated homepage banner",
        ipAddress: "192.168.1.5",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        timestamp: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
      },
      {
        _id: "6",
        userId: "user6",
        userName: "Emily Wilson",
        userRole: "product_admin",
        action: "CREATE",
        resource: "CATEGORY",
        resourceId: "cat123",
        details: "Created new product category 'Electronics'",
        ipAddress: "192.168.1.6",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        timestamp: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
      },
      {
        _id: "7",
        userId: "user7",
        userName: "David Lee",
        userRole: "user_admin",
        action: "UPDATE",
        resource: "USER",
        resourceId: "user456",
        details: "Changed user role from client to merchant",
        ipAddress: "192.168.1.7",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)",
        timestamp: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
      },
      {
        _id: "8",
        userId: "user8",
        userName: "Lisa Taylor",
        userRole: "order_admin",
        action: "UPDATE",
        resource: "ORDER",
        resourceId: "order101",
        details: "Changed order status from 'Processing' to 'Shipped'",
        ipAddress: "192.168.1.8",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        timestamp: new Date(Date.now() - 25200000).toISOString(), // 7 hours ago
      },
      {
        _id: "9",
        userId: "user9",
        userName: "Robert Johnson",
        userRole: "admin",
        action: "LOGOUT",
        resource: "AUTH",
        details: "User logged out",
        ipAddress: "192.168.1.9",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        timestamp: new Date(Date.now() - 28800000).toISOString(), // 8 hours ago
      },
      {
        _id: "10",
        userId: "user10",
        userName: "Jennifer Adams",
        userRole: "merchant",
        action: "CREATE",
        resource: "PRODUCT",
        resourceId: "prod789",
        details: "Added new product 'Wireless Headphones'",
        ipAddress: "192.168.1.10",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        timestamp: new Date(Date.now() - 32400000).toISOString(), // 9 hours ago
      },
    ];
    
    setTimeout(() => {
      setAuditLogs(mockAuditLogs);
      setFilteredLogs(mockAuditLogs);
      setTotalLogs(mockAuditLogs.length);
      setTotalPages(Math.ceil(mockAuditLogs.length / 10));
      setIsLoading(false);
    }, 1000); // Simulate loading delay
  }, []);
  
  // Apply filters
  useEffect(() => {
    let filtered = [...auditLogs];
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.includes(searchTerm)
      );
    }
    
    // Apply action filter
    if (actionFilter) {
      filtered = filtered.filter(log => log.action === actionFilter);
    }
    
    // Apply user filter
    if (userFilter) {
      filtered = filtered.filter(log => log.userId === userFilter);
    }
    
    // Apply resource filter
    if (resourceFilter) {
      filtered = filtered.filter(log => log.resource === resourceFilter);
    }
    
    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        switch (dateFilter) {
          case "today":
            return logDate.toDateString() === now.toDateString();
          case "yesterday": {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            return logDate.toDateString() === yesterday.toDateString();
          }
          case "thisWeek": {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            return logDate >= weekStart;
          }
          case "thisMonth": {
            return logDate.getMonth() === now.getMonth() && 
                   logDate.getFullYear() === now.getFullYear();
          }
          default:
            return true;
        }
      });
    }
    
    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter(log => {
        switch (activeTab) {
          case "user":
            return log.resource === "USER";
          case "product":
            return log.resource === "PRODUCT";
          case "order":
            return log.resource === "ORDER";
          case "auth":
            return log.resource === "AUTH";
          case "content":
            return log.resource === "CONTENT";
          default:
            return true;
        }
      });
    }
    
    setFilteredLogs(filtered);
    setTotalPages(Math.ceil(filtered.length / 10));
  }, [searchTerm, actionFilter, userFilter, resourceFilter, dateFilter, activeTab, auditLogs]);
  
  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'LOGIN':
        return 'bg-purple-100 text-purple-800';
      case 'LOGOUT':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getResourceBadgeColor = (resource: string) => {
    switch (resource) {
      case 'USER':
        return 'bg-indigo-100 text-indigo-800';
      case 'PRODUCT':
        return 'bg-emerald-100 text-emerald-800';
      case 'ORDER':
        return 'bg-amber-100 text-amber-800';
      case 'AUTH':
        return 'bg-sky-100 text-sky-800';
      case 'CONTENT':
        return 'bg-fuchsia-100 text-fuchsia-800';
      case 'CATEGORY':
        return 'bg-lime-100 text-lime-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'merchant':
        return 'bg-blue-100 text-blue-800';
      case 'client':
        return 'bg-green-100 text-green-800';
      case 'content_admin':
        return 'bg-pink-100 text-pink-800';
      case 'product_admin':
        return 'bg-yellow-100 text-yellow-800';
      case 'user_admin':
        return 'bg-indigo-100 text-indigo-800';
      case 'order_admin':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleExportLogs = () => {
    try {
      // Convert logs to CSV
      const headers = ["User", "Role", "Action", "Resource", "Details", "IP Address", "Timestamp"];
      const csvContent = [
        headers.join(","),
        ...filteredLogs.map(log => [
          log.userName,
          log.userRole,
          log.action,
          log.resource,
          `"${log.details.replace(/"/g, '""')}"`, // Escape quotes in CSV
          log.ipAddress,
          new Date(log.timestamp).toLocaleString()
        ].join(","))
      ].join("\n");
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: "Audit logs have been exported to CSV."
      });
    } catch (err) {
      console.error("Error exporting logs:", err);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Failed to export audit logs."
      });
    }
  };
  
  const resetFilters = () => {
    setSearchTerm("");
    setActionFilter("");
    setUserFilter("");
    setResourceFilter("");
    setDateFilter("all");
    setActiveTab("all");
    setCurrentPage(1);
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <Button onClick={handleExportLogs}>
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="all">All Logs</TabsTrigger>
            <TabsTrigger value="user">User</TabsTrigger>
            <TabsTrigger value="product">Product</TabsTrigger>
            <TabsTrigger value="order">Order</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search logs..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={dateFilter} onValueChange={(value) => setDateFilter(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Date filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="thisWeek">This Week</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={actionFilter} onValueChange={(value) => setActionFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="CREATE">Create</SelectItem>
                    <SelectItem value="UPDATE">Update</SelectItem>
                    <SelectItem value="DELETE">Delete</SelectItem>
                    <SelectItem value="LOGIN">Login</SelectItem>
                    <SelectItem value="LOGOUT">Logout</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={resourceFilter} onValueChange={(value) => setResourceFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Resource" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Resources</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="PRODUCT">Product</SelectItem>
                    <SelectItem value="ORDER">Order</SelectItem>
                    <SelectItem value="AUTH">Authentication</SelectItem>
                    <SelectItem value="CONTENT">Content</SelectItem>
                    <SelectItem value="CATEGORY">Category</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>
              Showing {filteredLogs.length} of {totalLogs} total logs
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
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No logs found matching your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead className="hidden md:table-cell">Details</TableHead>
                      <TableHead className="hidden lg:table-cell">IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{log.userName}</span>
                            <Badge className={`mt-1 ${getRoleBadgeColor(log.userRole)}`}>
                              {log.userRole.replace('_', ' ')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getActionBadgeColor(log.action)}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getResourceBadgeColor(log.resource)}>
                            {log.resource}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-xs truncate">
                          {log.details}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell whitespace-nowrap">
                          {log.ipAddress}
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
    </AdminLayout>
  );
}