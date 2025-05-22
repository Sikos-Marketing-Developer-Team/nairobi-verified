"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Trash, 
  UserPlus, 
  XCircle 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  companyName?: string;
  createdAt: string;
  lastLogin?: string;
}

interface UserActivityLog {
  _id: string;
  userId: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const router = useRouter();
  
  // State for users
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userActivityLogs, setUserActivityLogs] = useState<UserActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // State for user editing
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    isActive: true,
    isVerified: false,
  });
  
  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter]);
  
  // Apply search filter
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        user =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.companyName && user.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        limit: 10,
      };
      
      if (roleFilter) params.role = roleFilter;
      if (statusFilter === "active") params.isActive = true;
      if (statusFilter === "inactive") params.isActive = false;
      if (statusFilter === "verified") params.isVerified = true;
      if (statusFilter === "unverified") params.isVerified = false;
      
      const response = await apiService.admin.getUsers(params);
      
      setUsers(response.data.users);
      setFilteredUsers(response.data.users);
      setTotalPages(response.data.totalPages);
      setTotalUsers(response.data.total);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to load users. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchUserActivityLogs = async (userId: string) => {
    try {
      // This endpoint needs to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/users/${userId}/activity`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user activity logs");
      }
      
      const data = await response.json();
      setUserActivityLogs(data.logs || []);
    } catch (err: any) {
      console.error("Error fetching user activity logs:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user activity logs."
      });
      setUserActivityLogs([]);
    }
  };
  
  const handleViewUserDetails = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
    fetchUserActivityLogs(user._id);
  };
  
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
    });
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsConfirmDeleteOpen(true);
  };
  
  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // This endpoint needs to be implemented in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/users/${selectedUser._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      
      // Remove user from state
      setUsers(prev => prev.filter(u => u._id !== selectedUser._id));
      setFilteredUsers(prev => prev.filter(u => u._id !== selectedUser._id));
      
      toast({
        title: "User deleted",
        description: `${selectedUser.fullName} has been deleted successfully.`
      });
      
      setIsConfirmDeleteOpen(false);
    } catch (err: any) {
      console.error("Error deleting user:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete user."
      });
    }
  };
  
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    try {
      const response = await apiService.admin.updateUser(selectedUser._id, editFormData);
      
      // Update user in state
      setUsers(prev => 
        prev.map(u => 
          u._id === selectedUser._id ? response.data.user : u
        )
      );
      setFilteredUsers(prev => 
        prev.map(u => 
          u._id === selectedUser._id ? response.data.user : u
        )
      );
      
      toast({
        title: "User updated",
        description: `${selectedUser.fullName}'s information has been updated successfully.`
      });
      
      setIsEditDialogOpen(false);
    } catch (err: any) {
      console.error("Error updating user:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update user information."
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setEditFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleRoleChange = (value: string) => {
    setEditFormData(prev => ({
      ...prev,
      role: value
    }));
  };
  
  const handleStatusChange = (value: string) => {
    setEditFormData(prev => ({
      ...prev,
      isActive: value === 'active'
    }));
  };
  
  const handleVerificationChange = (value: string) => {
    setEditFormData(prev => ({
      ...prev,
      isVerified: value === 'verified'
    }));
  };
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'merchant':
        return 'bg-blue-100 text-blue-800';
      case 'client':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Button onClick={() => router.push('/admin/users/create')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New User
          </Button>
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
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="merchant">Merchant</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("");
                  setStatusFilter("");
                  setCurrentPage(1);
                }}>
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Showing {filteredUsers.length} of {totalUsers} total users
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
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No users found matching your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">
                          {user.fullName}
                          {user.companyName && (
                            <div className="text-sm text-gray-500">{user.companyName}</div>
                          )}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.isActive ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                          )}
                          {user.role === 'merchant' && (
                            <div className="mt-1">
                              {user.isVerified ? (
                                <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800">Unverified</Badge>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewUserDetails(user)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete User
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
      
      {/* User Details Dialog */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <Tabs defaultValue="profile">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="mt-1">{selectedUser.fullName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1">{selectedUser.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Role</h3>
                    <p className="mt-1">
                      <Badge className={getRoleBadgeColor(selectedUser.role)}>
                        {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <p className="mt-1">
                      {selectedUser.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                      )}
                    </p>
                  </div>
                  {selectedUser.role === 'merchant' && (
                    <>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Company Name</h3>
                        <p className="mt-1">{selectedUser.companyName || 'N/A'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Verification Status</h3>
                        <p className="mt-1">
                          {selectedUser.isVerified ? (
                            <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">Unverified</Badge>
                          )}
                        </p>
                      </div>
                    </>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Joined Date</h3>
                    <p className="mt-1">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Last Login</h3>
                    <p className="mt-1">{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsUserDetailsOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    setIsUserDetailsOpen(false);
                    handleEditUser(selectedUser);
                  }}>
                    Edit User
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="activity" className="mt-4">
                {userActivityLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No activity logs found for this user.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Action</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Date & Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userActivityLogs.map((log) => (
                          <TableRow key={log._id}>
                            <TableCell className="font-medium">{log.action}</TableCell>
                            <TableCell>{log.details}</TableCell>
                            <TableCell>{log.ipAddress}</TableCell>
                            <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateUser}>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={editFormData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={editFormData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={editFormData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="merchant">Merchant</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={editFormData.isActive ? 'active' : 'inactive'} 
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {editFormData.role === 'merchant' && (
                <div className="space-y-2">
                  <Label htmlFor="verification">Verification Status</Label>
                  <Select 
                    value={editFormData.isVerified ? 'verified' : 'unverified'} 
                    onValueChange={handleVerificationChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select verification status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="unverified">Unverified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Confirm Delete Dialog */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="py-4">
              <p><strong>Name:</strong> {selectedUser.fullName}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}