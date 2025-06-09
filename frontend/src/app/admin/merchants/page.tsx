"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Trash2, 
  XCircle 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { 
  sendEmail, 
  generateVerificationApprovalEmail, 
  generateVerificationRejectionEmail 
} from "@/services/notification";

interface Merchant {
  _id: string;
  fullName: string;
  email: string;
  companyName: string;
  phone: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationDocuments: {
    businessRegistration?: string;
    identificationDocument?: string;
    addressProof?: string;
  };
}

export default function AdminMerchantsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // State for merchants
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [filteredMerchants, setFilteredMerchants] = useState<Merchant[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // State for merchant details
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");
  
  // Fetch merchants from localStorage or use mock data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Check if we have merchants in localStorage
      const storedMerchantsJSON = localStorage.getItem('merchants');
      let merchantsData: Merchant[] = [];
      
      if (storedMerchantsJSON) {
        try {
          // Parse stored merchants
          const parsedMerchants = JSON.parse(storedMerchantsJSON);
          
          // Map the imported merchants to match our Merchant interface
          merchantsData = parsedMerchants.map((m: any) => ({
            _id: m.id || m._id || String(Math.floor(Math.random() * 10000)),
            fullName: m.name || m.fullName || '',
            email: m.email || '',
            companyName: m.businessName || m.companyName || '',
            phone: m.phone || '',
            isVerified: m.isVerified || false,
            isActive: m.status === 'active' || m.isActive || true,
            createdAt: m.createdAt || new Date().toISOString(),
            lastLogin: m.lastLogin || null,
            verificationStatus: m.verificationStatus || 'pending',
            verificationDocuments: {
              businessRegistration: m.documents?.businessRegistration || '',
              identificationDocument: m.documents?.idDocument || '',
              addressProof: m.documents?.addressProof || ''
            }
          }));
        } catch (error) {
          console.error("Error parsing merchants from localStorage:", error);
          // If there's an error, use mock data
          merchantsData = getMockMerchants();
        }
      } else {
        // If no merchants in localStorage, use mock data
        merchantsData = getMockMerchants();
        
        // Save mock data to localStorage for future use
        localStorage.setItem('merchants', JSON.stringify(merchantsData));
      }
      
      setMerchants(merchantsData);
      setFilteredMerchants(merchantsData);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Function to get mock merchants data
  const getMockMerchants = (): Merchant[] => {
    return [
      {
        _id: "1",
        fullName: "John Doe",
        email: "john@example.com",
        companyName: "Doe Enterprises",
        phone: "+254712345678",
        isVerified: true,
        isActive: true,
        createdAt: "2023-01-15T08:30:00Z",
        lastLogin: "2023-06-20T14:45:00Z",
        verificationStatus: 'approved',
        verificationDocuments: {
          businessRegistration: "https://example.com/docs/business1.pdf",
          identificationDocument: "https://example.com/docs/id1.pdf",
          addressProof: "https://example.com/docs/address1.pdf"
        }
      },
      {
        _id: "2",
        fullName: "Jane Smith",
        email: "jane@example.com",
        companyName: "Smith Traders",
        phone: "+254723456789",
        isVerified: false,
        isActive: true,
        createdAt: "2023-02-20T10:15:00Z",
        verificationStatus: 'pending',
        verificationDocuments: {
          businessRegistration: "https://example.com/docs/business2.pdf",
          identificationDocument: "https://example.com/docs/id2.pdf"
        }
      },
      {
        _id: "3",
        fullName: "Robert Johnson",
        email: "robert@example.com",
        companyName: "Johnson Supplies",
        phone: "+254734567890",
        isVerified: false,
        isActive: false,
        createdAt: "2023-03-10T09:45:00Z",
        verificationStatus: 'rejected',
        verificationDocuments: {
          businessRegistration: "https://example.com/docs/business3.pdf"
        }
      }
    ];
  };
  
  // Apply search filter
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredMerchants(merchants);
    } else {
      const filtered = merchants.filter(
        merchant =>
          merchant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          merchant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          merchant.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMerchants(filtered);
    }
  }, [searchTerm, merchants]);
  
  // Apply status and verification filters
  useEffect(() => {
    let filtered = [...merchants];
    
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter(merchant => merchant.isActive);
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter(merchant => !merchant.isActive);
      }
    }
    
    if (verificationFilter !== "all") {
      if (verificationFilter === "verified") {
        filtered = filtered.filter(merchant => merchant.isVerified);
      } else if (verificationFilter === "unverified") {
        filtered = filtered.filter(merchant => !merchant.isVerified);
      } else if (verificationFilter === "pending") {
        filtered = filtered.filter(merchant => merchant.verificationStatus === 'pending');
      } else if (verificationFilter === "rejected") {
        filtered = filtered.filter(merchant => merchant.verificationStatus === 'rejected');
      }
    }
    
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        merchant =>
          merchant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          merchant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          merchant.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredMerchants(filtered);
  }, [statusFilter, verificationFilter, merchants, searchTerm]);
  
  const handleViewDetails = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setIsDetailsOpen(true);
  };
  
  const handleVerification = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setVerificationNotes("");
    setIsVerificationDialogOpen(true);
  };
  
  const handleDeleteMerchant = (merchant: Merchant) => {
    if (confirm(`Are you sure you want to delete ${merchant.companyName}? This action cannot be undone.`)) {
      // Filter out the merchant to delete
      const updatedMerchants = merchants.filter(m => m._id !== merchant._id);
      
      // Update state
      setMerchants(updatedMerchants);
      setFilteredMerchants(filteredMerchants.filter(m => m._id !== merchant._id));
      
      // Update localStorage
      localStorage.setItem('merchants', JSON.stringify(updatedMerchants));
      
      // Show success message
      toast({
        title: "Merchant Deleted",
        description: `${merchant.companyName} has been deleted successfully.`
      });
    }
  };
  
  const handleApproveVerification = async () => {
    if (!selectedMerchant) return;
    
    // In a real application, this would be an API call
    const updatedMerchants = merchants.map(merchant => {
      if (merchant._id === selectedMerchant._id) {
        return {
          ...merchant,
          isVerified: true,
          verificationStatus: 'approved' as const
        };
      }
      return merchant;
    });
    
    // Update state
    setMerchants(updatedMerchants);
    setFilteredMerchants(
      filteredMerchants.map(merchant => {
        if (merchant._id === selectedMerchant._id) {
          return {
            ...merchant,
            isVerified: true,
            verificationStatus: 'approved' as const
          };
        }
        return merchant;
      })
    );
    
    // Update localStorage
    localStorage.setItem('merchants', JSON.stringify(updatedMerchants));
    
    // Send verification approval email
    try {
      const dashboardUrl = `${window.location.origin}/merchant/dashboard`;
      const emailOptions = generateVerificationApprovalEmail(
        selectedMerchant.fullName,
        selectedMerchant.email,
        selectedMerchant.companyName,
        dashboardUrl
      );
      
      const emailResult = await sendEmail(emailOptions);
      
      if (emailResult.success) {
        toast({
          title: "Verification Approved",
          description: `${selectedMerchant.companyName} has been verified successfully and notification email sent.`
        });
      } else {
        toast({
          title: "Verification Approved",
          description: `${selectedMerchant.companyName} has been verified successfully but notification email failed to send.`
        });
        console.error("Email sending failed:", emailResult.error);
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast({
        title: "Verification Approved",
        description: `${selectedMerchant.companyName} has been verified successfully but notification email failed to send.`
      });
    }
    
    setIsVerificationDialogOpen(false);
  };
  
  const handleRejectVerification = async () => {
    if (!selectedMerchant || !verificationNotes.trim()) return;
    
    // In a real application, this would be an API call
    const updatedMerchants = merchants.map(merchant => {
      if (merchant._id === selectedMerchant._id) {
        return {
          ...merchant,
          isVerified: false,
          verificationStatus: 'rejected' as const
        };
      }
      return merchant;
    });
    
    // Update state
    setMerchants(updatedMerchants);
    setFilteredMerchants(
      filteredMerchants.map(merchant => {
        if (merchant._id === selectedMerchant._id) {
          return {
            ...merchant,
            isVerified: false,
            verificationStatus: 'rejected' as const
          };
        }
        return merchant;
      })
    );
    
    // Update localStorage
    localStorage.setItem('merchants', JSON.stringify(updatedMerchants));
    
    // Send verification rejection email
    try {
      const supportUrl = `${window.location.origin}/merchant/support`;
      const emailOptions = generateVerificationRejectionEmail(
        selectedMerchant.fullName,
        selectedMerchant.email,
        selectedMerchant.companyName,
        verificationNotes,
        supportUrl
      );
      
      const emailResult = await sendEmail(emailOptions);
      
      if (emailResult.success) {
        toast({
          title: "Verification Rejected",
          description: `${selectedMerchant.companyName}'s verification has been rejected and notification email sent.`
        });
      } else {
        toast({
          title: "Verification Rejected",
          description: `${selectedMerchant.companyName}'s verification has been rejected but notification email failed to send.`
        });
        console.error("Email sending failed:", emailResult.error);
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast({
        title: "Verification Rejected",
        description: `${selectedMerchant.companyName}'s verification has been rejected but notification email failed to send.`
      });
    }
    
    setIsVerificationDialogOpen(false);
  };
  
  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
    );
  };
  
  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Merchant Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage all merchants and their verification status
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => router.push('/admin/merchants/import')} className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Import
            </Button>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/admin/merchants/add')} className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Merchant
              </Button>
              <Button onClick={() => router.push('/admin/merchants/add-sample')} variant="outline" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                Add Sample Data
              </Button>
            </div>
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
                    placeholder="Search merchants by name, email or company..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={verificationFilter} onValueChange={(value) => setVerificationFilter(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by verification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Verification</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setVerificationFilter("all");
                }}>
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Merchants Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <CardTitle>Merchants</CardTitle>
                <CardDescription>
                  Showing {filteredMerchants.length} of {merchants.length} total merchants
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Total:</span> 
                  <span className="ml-1 font-bold text-gray-900 dark:text-gray-100">{merchants.length}</span>
                </Badge>
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30">
                  <span className="font-semibold text-green-700 dark:text-green-300">Verified:</span> 
                  <span className="ml-1 font-bold text-green-900 dark:text-green-100">
                    {merchants.filter(m => m.isVerified).length}
                  </span>
                </Badge>
                <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/30">
                  <span className="font-semibold text-yellow-700 dark:text-yellow-300">Pending:</span> 
                  <span className="ml-1 font-bold text-yellow-900 dark:text-yellow-100">
                    {merchants.filter(m => m.verificationStatus === 'pending').length}
                  </span>
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            ) : filteredMerchants.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No merchants found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  No merchants match your current filter criteria. Try adjusting your filters or search terms.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setVerificationFilter("all");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                      <TableHead className="font-semibold">Company</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMerchants.map((merchant) => (
                      <TableRow key={merchant._id}>
                        <TableCell className="font-medium">{merchant.companyName}</TableCell>
                        <TableCell>{merchant.fullName}</TableCell>
                        <TableCell>{merchant.email}</TableCell>
                        <TableCell>{getStatusBadge(merchant.isActive)}</TableCell>
                        <TableCell>{getVerificationBadge(merchant.verificationStatus)}</TableCell>
                        <TableCell>{new Date(merchant.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(merchant)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleVerification(merchant)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Verification
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteMerchant(merchant)}
                                className="text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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
          </CardContent>
        </Card>
      </div>
      
      {/* Merchant Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Merchant Details</DialogTitle>
            <DialogDescription>
              View detailed information about this merchant.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMerchant && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Company Information</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Company Name:</span> {selectedMerchant.companyName}</p>
                    <p><span className="font-medium">Status:</span> {selectedMerchant.isActive ? 'Active' : 'Inactive'}</p>
                    <p><span className="font-medium">Verification:</span> {selectedMerchant.verificationStatus}</p>
                    <p><span className="font-medium">Joined:</span> {new Date(selectedMerchant.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Contact Person:</span> {selectedMerchant.fullName}</p>
                    <p><span className="font-medium">Email:</span> {selectedMerchant.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedMerchant.phone}</p>
                    <p><span className="font-medium">Last Login:</span> {selectedMerchant.lastLogin ? new Date(selectedMerchant.lastLogin).toLocaleString() : 'Never'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Verification Documents</h3>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedMerchant.verificationDocuments.businessRegistration && (
                    <div className="border rounded-md p-3">
                      <p className="text-sm font-medium mb-2">Business Registration</p>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(selectedMerchant.verificationDocuments.businessRegistration, '_blank')}>
                        View Document
                      </Button>
                    </div>
                  )}
                  
                  {selectedMerchant.verificationDocuments.identificationDocument && (
                    <div className="border rounded-md p-3">
                      <p className="text-sm font-medium mb-2">Identification</p>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(selectedMerchant.verificationDocuments.identificationDocument, '_blank')}>
                        View Document
                      </Button>
                    </div>
                  )}
                  
                  {selectedMerchant.verificationDocuments.addressProof && (
                    <div className="border rounded-md p-3">
                      <p className="text-sm font-medium mb-2">Address Proof</p>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(selectedMerchant.verificationDocuments.addressProof, '_blank')}>
                        View Document
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
            {selectedMerchant && (
              <Button onClick={() => {
                setIsDetailsOpen(false);
                handleVerification(selectedMerchant);
              }}>
                Manage Verification
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Verification Dialog */}
      <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merchant Verification</DialogTitle>
            <DialogDescription>
              Review and update the verification status for this merchant.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMerchant && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selectedMerchant.companyName}</p>
                <p className="text-sm text-gray-500">Current status: {getVerificationBadge(selectedMerchant.verificationStatus)}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Verification Documents:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedMerchant.verificationDocuments.businessRegistration && (
                    <Button variant="outline" size="sm" onClick={() => window.open(selectedMerchant.verificationDocuments.businessRegistration, '_blank')}>
                      Business Registration
                    </Button>
                  )}
                  
                  {selectedMerchant.verificationDocuments.identificationDocument && (
                    <Button variant="outline" size="sm" onClick={() => window.open(selectedMerchant.verificationDocuments.identificationDocument, '_blank')}>
                      Identification
                    </Button>
                  )}
                  
                  {selectedMerchant.verificationDocuments.addressProof && (
                    <Button variant="outline" size="sm" onClick={() => window.open(selectedMerchant.verificationDocuments.addressProof, '_blank')}>
                      Address Proof
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Notes (required for rejection)
                </label>
                <textarea
                  id="notes"
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  placeholder="Enter verification notes or rejection reason..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVerificationDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectVerification} disabled={!verificationNotes.trim()}>
              Reject
            </Button>
            <Button onClick={handleApproveVerification}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}