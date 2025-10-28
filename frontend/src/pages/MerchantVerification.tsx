import { CheckCircle, Clock, Upload, FileText, AlertCircle, MessageSquare, X, Eye, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { merchantsAPI } from '@/lib/api';
import { VerificationStep, Document, VerificationData } from '@/interfaces/verification';

const MerchantVerification = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null); // NEW: File preview state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([
    'Business Registration Certificate',
    'National ID/Passport',
    'Business Permit',
    'KRA Pin Certificate',
    'Utility Bill (Recent)'
  ]);

  // NEW STATE: Track upload success for prominent display
  const [uploadSuccess, setUploadSuccess] = useState<{show: boolean; documentType: string; fileName: string} | null>(null);

  // Document type to backend field mapping
  const documentTypeMapping: { [key: string]: string } = {
    'Business Registration Certificate': 'businessRegistration',
    'Business Permit': 'businessRegistration', 
    'National ID/Passport': 'idDocument',
    'Utility Bill (Recent)': 'utilityBill',
    'KRA Pin Certificate': 'additionalDocs'
  };

  // Load verification data from actual API
  useEffect(() => {
    const loadVerificationData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard overview which contains verification status
        const overviewResponse = await merchantsAPI.getDashboardOverview();
        
        if (overviewResponse.data.success) {
          const data = overviewResponse.data.data;
          setVerificationData({
            status: data.verificationStatus?.isVerified
              ? 'verified'
              : (data.verificationStatus?.isRejected
                ? 'rejected'
                : 'pending') as 'verified' | 'pending' | 'rejected',
            submittedDate: data.verificationStatus?.verifiedDate || new Date().toISOString().split('T')[0],
            verificationSteps: [
              { 
                id: 1, 
                title: 'Profile Completion', 
                completed: data.profileCompletion?.percentage === 100,
                date: data.merchant?.memberSince,
                description: `Profile ${data.profileCompletion?.percentage || 0}% complete`
              },
              { 
                id: 2, 
                title: 'Document Submission', 
                completed: data.profileCompletion?.documentsPercentage === 100,
                date: null,
                description: `Documents ${data.profileCompletion?.documentsPercentage || 0}% complete`
              },
              { 
                id: 3, 
                title: 'Verification Review', 
                completed: data.verificationStatus?.isVerified,
                date: data.verificationStatus?.verifiedDate,
                description: data.verificationStatus?.isVerified ? 'Verified successfully' : 'Under review'
              }
            ]
          });
        } else {
          throw new Error('Failed to load verification status');
        }

        // Try to get verification history for documents
        try {
          const historyResponse = await merchantsAPI.getVerificationHistory();
          if (historyResponse.data.success && historyResponse.data.data) {
            const docs = historyResponse.data.data.map((item: any, index: number) => ({
              id: item.id || index,
              type: item.documentType || 'Unknown Document',
              status: item.status || 'pending',
              uploadDate: item.uploadedAt || new Date().toISOString().split('T')[0],
              notes: item.notes,
              fileName: item.originalName || 'document',
              fileUrl: item.cloudinaryUrl || '#'
            }));
            setDocuments(docs);
          }
        } catch (error) {
          console.log('No verification history available, using empty documents');
          setDocuments([]);
        }

      } catch (error) {
        console.error('Error loading verification data:', error);
        toast({
          title: "Error",
          description: "Failed to load verification data. Please try again.",
          variant: "destructive",
        });
        
        // Set fallback data
        setVerificationData({
          status: 'pending',
          submittedDate: new Date().toISOString().split('T')[0],
          verificationSteps: [
            { 
              id: 1, 
              title: 'Profile Completion', 
              completed: false, 
              date: null,
              description: 'Complete your business profile'
            },
            { 
              id: 2, 
              title: 'Document Submission', 
              completed: false, 
              date: null,
              description: 'Upload required business documents'
            },
            { 
              id: 3, 
              title: 'Verification Review', 
              completed: false, 
              date: null,
              description: 'Our team will review your submission'
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.isMerchant) {
      loadVerificationData();
    }
  }, [user, toast]);

  // NEW: Auto-hide success message after 5 seconds
  useEffect(() => {
    if (uploadSuccess?.show) {
      const timer = setTimeout(() => {
        setUploadSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-amber-600 bg-amber-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'pending':
        return <Clock className="h-6 w-6 text-amber-600" />;
      case 'rejected':
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Clock className="h-6 w-6 text-gray-600" />;
    }
  };
  
  // NEW: Enhanced file change handler with preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload PDF, JPG, or PNG files only",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For PDFs, clear any previous image preview
        setFilePreview(null);
      }
    }
  };

  // NEW: Clear file selection and preview
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      toast({
        title: "Error",
        description: "Please select a document type and file",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      // Map frontend document type to backend field name
      const backendFieldName = documentTypeMapping[documentType] || 'additionalDocs';
      
      // Build payload object matching the expected Record<string, File> signature
      const file = selectedFile as File;
      const payload: Record<string, File> = {};
      payload[backendFieldName] = file;
      
      // Use centralized API for upload
      const response = await merchantsAPI.uploadVerificationDocuments(payload);
      
      if (response.data.success) {
        // Add the new document to the state
        const newDoc: Document = {
          id: Date.now(),
          type: documentType,
          status: 'pending',
          uploadDate: new Date().toISOString().split('T')[0],
          notes: 'Under review - awaiting verification',
          fileName: selectedFile.name,
          fileUrl: URL.createObjectURL(selectedFile)
        };
        
        setDocuments(prevDocs => [...prevDocs, newDoc]);
        
        // NEW: Show prominent success message
        setUploadSuccess({
          show: true,
          documentType,
          fileName: selectedFile.name
        });
        
        toast({
          title: "Document uploaded successfully",
          description: `${documentType} has been uploaded and is pending review.`,
        });
        
        // Refresh verification status
        try {
          const overviewResponse = await merchantsAPI.getDashboardOverview();
          if (overviewResponse.data.success) {
            const data = overviewResponse.data.data;
            setVerificationData({
              status: data.verificationStatus?.isVerified ? 'verified' : 'pending',
              submittedDate: data.verificationStatus?.verifiedDate || new Date().toISOString().split('T')[0],
              verificationSteps: verificationData?.verificationSteps || []
            });
          }
        } catch (refreshError) {
          console.error('Error refreshing status:', refreshError);
        }
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.message 
        || error.message 
        || "There was an error uploading your document. Please try again.";
        
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setFilePreview(null);
      setDocumentType('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const [overviewResponse, historyResponse] = await Promise.all([
        merchantsAPI.getDashboardOverview(),
        merchantsAPI.getVerificationHistory()
      ]);

      if (overviewResponse.data.success) {
        const data = overviewResponse.data.data;
        setVerificationData({
          status: data.verificationStatus?.isVerified ? 'verified' : 'pending',
          submittedDate: data.verificationStatus?.verifiedDate || new Date().toISOString().split('T')[0],
          verificationSteps: verificationData?.verificationSteps || []
        });
      }

      if (historyResponse.data.success && historyResponse.data.data) {
        const docs = historyResponse.data.data.map((item: any, index: number) => ({
          id: item.id || index,
          type: item.documentType || 'Unknown Document',
          status: item.status || 'pending',
          uploadDate: item.uploadedAt || new Date().toISOString().split('T')[0],
          notes: item.notes,
          fileName: item.originalName || 'document',
          fileUrl: item.cloudinaryUrl || '#'
        }));
        setDocuments(docs);
      }

      toast({
        title: "Refreshed",
        description: "Verification data updated successfully",
      });
    } catch (error) {
      console.error('Refresh error:', error);
      toast({
        title: "Refresh failed",
        description: "Could not update verification data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get missing documents
  const missingDocuments = requiredDocuments.filter(reqDoc => 
    !documents.some(doc => doc.type === reqDoc)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Clock className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-600">Loading verification status...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* NEW: Prominent Upload Success Banner */}
        {uploadSuccess?.show && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-in slide-in-from-top duration-500">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-800">Document Uploaded Successfully!</h3>
              <p className="text-green-700 text-sm">
                <strong>{uploadSuccess.documentType}</strong> ({uploadSuccess.fileName}) has been uploaded and is now pending review.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUploadSuccess(null)}
              className="text-green-600 hover:text-green-800 hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Verification</h1>
              <p className="text-gray-600 mt-2">Complete your verification to unlock all features</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link to="/merchant/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {verificationData ? getStatusIcon(verificationData.status) : <Clock className="h-6 w-6 text-gray-600" />}
                <div>
                  <h3 className="text-xl font-semibold capitalize">
                    {verificationData?.status === 'verified' ? 'Business Verified' : 
                     verificationData?.status === 'pending' ? 'Verification in Progress' :
                     verificationData?.status === 'rejected' ? 'Verification Requires Attention' :
                     'Verification Not Started'}
                  </h3>
                  <p className="text-gray-600">
                    {verificationData?.submittedDate ? 
                      `Application submitted on ${new Date(verificationData.submittedDate).toLocaleDateString()}` :
                      'Start your verification process to get verified'}
                  </p>
                </div>
              </div>
              {verificationData && (
                <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(verificationData.status)}`}>
                  {verificationData.status}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Verification Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {verificationData?.verificationSteps?.map((step: VerificationStep, index: number) => (
                  <div key={step.id || index} className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <span className="text-gray-400 text-sm">{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                          {step.title}
                        </h4>
                        {step.date && (
                          <span className="text-sm text-gray-500">
                            {new Date(step.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No verification steps available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Document Status */}
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <span className="font-medium">{doc.type}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                          doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {doc.status || 'pending'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">File: {doc.fileName}</p>
                      {doc.notes && (
                        <p className="text-sm text-gray-500 mt-2 italic">{doc.notes}</p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedDocument(doc);
                            setPreviewOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(doc.fileUrl, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        
                        {(doc.status === 'rejected' || !doc.status) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-primary border-primary hover:bg-primary/10"
                            onClick={() => {
                              setDocumentType(doc.type);
                              setUploadDialogOpen(true);
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Replace
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No documents uploaded yet</p>
                    <p className="text-sm mt-2">Upload required documents to start verification</p>
                  </div>
                )}
                
                {/* Missing Documents */}
                {missingDocuments.map((missingDoc, index) => (
                  <div key={`missing-${index}`} className="border border-dashed rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <span className="font-medium">{missingDoc}</span>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Required
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">This document is required for business verification</p>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mt-3 text-primary border-primary hover:bg-primary/10"
                      onClick={() => {
                        setDocumentType(missingDoc);
                        setUploadDialogOpen(true);
                      }}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Upload Document
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Button 
                  className="w-full bg-primary hover:bg-primary-dark"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        {verificationData?.status === 'verified' && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Verification Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Verified Badge</h4>
                    <p className="text-sm text-gray-600">Display verified status to build customer trust</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Enhanced Visibility</h4>
                    <p className="text-sm text-gray-600">Get priority placement in search results</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Full Platform Access</h4>
                    <p className="text-sm text-gray-600">Access all merchant features and analytics</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Support */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help with Verification?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">
                  Have questions about required documents or verification process?
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={() => window.open('/contact', '_blank')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Document Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Document Preview: {selectedDocument?.type}</span>
              <DialogClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </DialogTitle>
          </DialogHeader>
          <div className="h-[70vh] overflow-hidden rounded-md border">
            {selectedDocument && (
              <iframe
                src={`${selectedDocument.fileUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full"
                title={selectedDocument.type}
              />
            )}
          </div>
          <div className="flex justify-between">
            <div className="text-sm text-gray-500">
              <p>File: {selectedDocument?.fileName}</p>
              <p>Uploaded: {selectedDocument?.uploadDate}</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => window.open(selectedDocument?.fileUrl, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Upload Document Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Verification Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select document type</option>
                {requiredDocuments.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document File
              </label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={openFileSelector}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    openFileSelector();
                  }
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  aria-label="Select document file"
                />
                {selectedFile ? (
                  <div className="space-y-3">
                    {/* NEW: File Preview */}
                    {filePreview ? (
                      <div className="flex flex-col items-center">
                        <img 
                          src={filePreview} 
                          alt="Document preview" 
                          className="max-h-32 max-w-full object-contain border rounded mb-2"
                        />
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, JPG or PNG (max. 10MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => {
              setUploadDialogOpen(false);
              handleRemoveFile();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || !documentType || uploading}
              className="bg-primary hover:bg-primary-dark"
            >
              {uploading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Document'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MerchantVerification;