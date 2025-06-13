
import React, { useState, useRef } from 'react';
import { CheckCircle, Clock, Upload, FileText, AlertCircle, MessageSquare, X, Eye, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import { Link } from 'react-router-dom';
import { merchantsAPI } from '@/lib/api';

const MerchantVerification = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  
  const verificationData = {
    status: 'pending', // verified, pending, rejected, incomplete
    submittedDate: '2024-01-10',
    reviewedDate: '2024-01-12',
    verificationSteps: [
      { 
        id: 1, 
        title: 'Application Submitted', 
        completed: true, 
        date: '2024-01-10',
        description: 'Your verification application has been received'
      },
      { 
        id: 2, 
        title: 'Documents Reviewed', 
        completed: true, 
        date: '2024-01-11',
        description: 'All submitted documents have been reviewed'
      },
      { 
        id: 3, 
        title: 'Physical Verification', 
        completed: true, 
        date: '2024-01-12',
        description: 'Your business location has been verified'
      },
      { 
        id: 4, 
        title: 'Verification Complete', 
        completed: true, 
        date: '2024-01-12',
        description: 'Your business is now verified and visible to customers'
      }
    ],
    documents: [
      { 
        id: 1,
        type: 'Business Registration', 
        status: 'pending', 
        uploadDate: '2024-05-10',
        notes: 'Under review',
        fileName: 'business_registration.pdf',
        fileUrl: 'https://www.africau.edu/images/default/sample.pdf'
      },
      { 
        id: 2,
        type: 'ID Document', 
        status: 'pending', 
        uploadDate: '2024-05-10',
        notes: 'Under review',
        fileName: 'id_document.pdf',
        fileUrl: 'https://www.africau.edu/images/default/sample.pdf'
      },
      { 
        id: 3,
        type: 'Utility Bill', 
        status: 'rejected', 
        uploadDate: '2024-05-10',
        notes: 'Document is too old. Please upload a utility bill from the last 3 months.',
        fileName: 'utility_bill.pdf',
        fileUrl: 'https://www.africau.edu/images/default/sample.pdf'
      }
    ],
    requiredDocuments: [
      'Business Registration',
      'ID Document',
      'Utility Bill',
      'Business Photos'
    ]
  };

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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
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
      // Convert document type to API field name
      const fieldMap: Record<string, string> = {
        "Business Registration": "businessRegistration",
        "ID Document": "idDocument",
        "Utility Bill": "utilityBill",
        "Business Photos": "additionalDocs"
      };
      
      const fieldName = fieldMap[documentType] || "additionalDocs";
      
      // Use the merchantsAPI to upload the document
      // Mock merchant ID for demo purposes
      const merchantId = "60d0fe4f5311236168a109cd"; 
      
      // In a real app, you would get the merchant ID from context or redux
      // Here we're using the API from src/lib/api.ts
      // import { merchantsAPI } from '@/lib/api';
      
      // Use the actual API to upload the document
      await merchantsAPI.uploadDocuments(merchantId, { [fieldName]: selectedFile });
      
      // Create a new document object to add to the state
      const newDoc = {
        id: Date.now(),
        type: documentType,
        status: 'pending',
        uploadDate: new Date().toISOString().split('T')[0],
        notes: 'Under review',
        fileName: selectedFile.name,
        fileUrl: URL.createObjectURL(selectedFile)
      };
      
      // Update the documents state with the new document
      setDocuments(prevDocs => [...prevDocs, newDoc]);
      
      toast({
        title: "Document uploaded",
        description: `${documentType} has been uploaded successfully and is pending review.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setDocumentType('');
    }
  };
  
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Verification Status</h1>
              <p className="text-gray-600 mt-2">Track your business verification progress</p>
            </div>
            <Link to="/merchant/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Current Status */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon(verificationData.status)}
                <div>
                  <h3 className="text-xl font-semibold capitalize">
                    {verificationData.status === 'verified' ? 'Business Verified' : 
                     verificationData.status === 'pending' ? 'Verification Pending' :
                     verificationData.status === 'rejected' ? 'Verification Rejected' :
                     'Verification Incomplete'}
                  </h3>
                  <p className="text-gray-600">
                    {verificationData.status === 'verified' ? 
                      `Verified on ${verificationData.reviewedDate}` :
                      `Submitted on ${verificationData.submittedDate}`}
                  </p>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(verificationData.status)}`}>
                {verificationData.status}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Verification Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {verificationData.verificationSteps.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-4">
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
                          <span className="text-sm text-gray-500">{step.date}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Document Status */}
          <Card>
            <CardHeader>
              <CardTitle>Document Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...verificationData.documents, ...documents].map((doc) => (
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
                        {doc.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Uploaded: {doc.uploadDate}</p>
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
                      
                      {doc.status === 'rejected' && (
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
                ))}
                
                {/* Missing Documents */}
                {verificationData.requiredDocuments
                  .filter(reqDoc => ![...verificationData.documents, ...documents].some(doc => doc.type === reqDoc))
                  .map((missingDoc, index) => (
                    <div key={`missing-${index}`} className="border border-dashed rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <span className="font-medium">{missingDoc}</span>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Missing
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">This document is required for verification</p>
                      
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
                  ))
                }
              </div>
              
              <div className="mt-6">
                <Button 
                  className="w-full bg-primary hover:bg-primary-dark"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        {verificationData.status === 'verified' && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Your business is now visible</h4>
                    <p className="text-sm text-gray-600">Customers can find and visit your verified business profile</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Keep your profile updated</h4>
                    <p className="text-sm text-gray-600">Regularly update your business hours, contact information, and photos</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Monitor your performance</h4>
                    <p className="text-sm text-gray-600">Track profile views and customer interactions from your dashboard</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Support */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">
                  Have questions about your verification status or need assistance?
                </p>
              </div>
              <Button variant="outline">
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
            <DialogTitle>Upload Document</DialogTitle>
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
                {verificationData.requiredDocuments.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document File
              </label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-primary"
                onClick={openFileSelector}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {selectedFile ? (
                  <div>
                    <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
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
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || !documentType}>
              Upload Document
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MerchantVerification;
