import React, { useState, useEffect } from 'react';
import { CheckCircle, X, FileText, MapPin, Phone, Mail, Download, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import { adminAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const AdminVerifications = () => {
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [filter, setFilter] = useState('all');
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const { toast } = useToast();

  // Fetch verification requests
  useEffect(() => {
    fetchVerificationRequests();
  }, [filter]);

  const fetchVerificationRequests = async () => {
    setIsLoading(true);
    try {
      let params = {};
      
      if (filter === 'pending') {
        params.documentStatus = 'pending_review';
        params.verified = false;
      } else if (filter === 'approved') {
        params.verified = true;
      } else if (filter === 'rejected') {
        params.verified = false;
        params.rejectionReason = { $exists: true };
      }

      const response = await adminAPI.getMerchants(params);
      
      // Transform the data to match the expected format
      const transformedRequests = response.data.data.map(merchant => ({
        id: merchant._id,
        businessName: merchant.businessName,
        ownerName: merchant.ownerName || `${merchant.firstName || ''} ${merchant.lastName || ''}`.trim(),
        email: merchant.email,
        phone: merchant.phone,
        category: merchant.businessType,
        address: merchant.address,
        submittedDate: new Date(merchant.createdAt).toLocaleDateString(),
        status: merchant.verified ? 'approved' : (merchant.rejectionReason ? 'rejected' : 'pending'),
        documents: [
          { 
            type: 'Business Registration', 
            url: merchant.documents?.businessRegistration || '', 
            verified: merchant.verified && !!merchant.documents?.businessRegistration 
          },
          { 
            type: 'ID Document', 
            url: merchant.documents?.idDocument || '', 
            verified: merchant.verified && !!merchant.documents?.idDocument 
          },
          { 
            type: 'Utility Bill', 
            url: merchant.documents?.utilityBill || '', 
            verified: merchant.verified && !!merchant.documents?.utilityBill 
          }
        ],
        rejectionReason: merchant.rejectionReason,
        verificationNotes: merchant.verificationNotes
      }));

      setVerificationRequests(transformedRequests);
    } catch (error) {
      console.error('Failed to fetch verification requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch verification requests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = verificationRequests.filter(request => 
    filter === 'all' || request.status === filter
  );

  const handleApprove = async (merchantId) => {
    setIsProcessing(true);
    try {
      await adminAPI.approveMerchant(merchantId, adminNotes);
      toast({
        title: "Success",
        description: "Merchant has been approved successfully.",
      });
      setAdminNotes('');
      await fetchVerificationRequests();
      // Update selected merchant if it's the one being approved
      if (selectedMerchant?.id === merchantId) {
        const updatedMerchant = { ...selectedMerchant, status: 'approved' };
        setSelectedMerchant(updatedMerchant);
      }
    } catch (error) {
      console.error('Failed to approve merchant:', error);
      toast({
        title: "Error",
        description: "Failed to approve merchant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (merchantId) => {
    if (!adminNotes.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await adminAPI.rejectMerchantVerification(merchantId, adminNotes, adminNotes);
      toast({
        title: "Success",
        description: "Merchant application has been rejected.",
      });
      setAdminNotes('');
      await fetchVerificationRequests();
      // Update selected merchant if it's the one being rejected
      if (selectedMerchant?.id === merchantId) {
        const updatedMerchant = { ...selectedMerchant, status: 'rejected', rejectionReason: adminNotes };
        setSelectedMerchant(updatedMerchant);
      }
    } catch (error) {
      console.error('Failed to reject merchant:', error);
      toast({
        title: "Error",
        description: "Failed to reject merchant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Merchant Verifications</h1>
            <p className="text-gray-600 mt-2">Review and process merchant verification requests</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading verification requests...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Merchant Verifications</h1>
          <p className="text-gray-600 mt-2">Review and process merchant verification requests</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Verification Queue */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Verification Queue ({filteredRequests.length})</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('pending')}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={filter === 'approved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('approved')}
                  >
                    Approved
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredRequests.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No {filter === 'all' ? '' : filter} verification requests found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredRequests.map((request) => (
                      <div
                        key={request.id}
                        className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
                          selectedMerchant?.id === request.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => setSelectedMerchant(request)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{request.businessName}</h4>
                            <p className="text-sm text-gray-500">{request.ownerName}</p>
                            <p className="text-xs text-gray-400">{request.submittedDate}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : request.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Verification Details */}
          <div className="lg:col-span-2">
            {selectedMerchant ? (
              <div className="space-y-6">
                {/* Merchant Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedMerchant.businessName}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedMerchant.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : selectedMerchant.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedMerchant.status}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{selectedMerchant.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{selectedMerchant.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium">{selectedMerchant.address}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-medium">{selectedMerchant.category}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents Review */}
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedMerchant.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{doc.type}</p>
                              <p className="text-sm text-gray-500">PDF Document</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              doc.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {doc.verified ? 'Verified' : 'Pending'}
                            </span>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Verification Actions */}
                {selectedMerchant.status === 'pending' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Verification Decision</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Admin Notes {selectedMerchant.status === 'pending' ? '(Required for rejection)' : '(Optional)'}
                          </label>
                          <textarea
                            className="w-full p-3 border border-gray-300 rounded-md"
                            rows={3}
                            placeholder={selectedMerchant.status === 'pending' 
                              ? "Add notes about this verification or reason for rejection..." 
                              : "View admin notes..."}
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            disabled={selectedMerchant.status !== 'pending'}
                          />
                          {selectedMerchant.rejectionReason && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                              <p className="text-sm text-red-700">{selectedMerchant.rejectionReason}</p>
                            </div>
                          )}
                          {selectedMerchant.verificationNotes && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-sm font-medium text-blue-800">Verification Notes:</p>
                              <p className="text-sm text-blue-700">{selectedMerchant.verificationNotes}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-4">
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(selectedMerchant.id)}
                            disabled={isProcessing || selectedMerchant.status === 'approved'}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            {selectedMerchant.status === 'approved' ? 'Already Approved' : 'Approve Merchant'}
                          </Button>
                          
                          <Button
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleReject(selectedMerchant.id)}
                            disabled={isProcessing || selectedMerchant.status === 'rejected' || selectedMerchant.status === 'approved'}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <X className="h-4 w-4 mr-2" />
                            )}
                            {selectedMerchant.status === 'rejected' ? 'Already Rejected' : 'Reject Application'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a merchant from the queue to review their verification request</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVerifications;
