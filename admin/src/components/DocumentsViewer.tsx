import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Loader2,
  Calendar,
  User,
  Building
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface DocumentInfo {
  path?: string;
  uploadedAt?: string;
  originalName?: string;
  fileSize?: number;
  mimeType?: string;
  description?: string;
}

interface DocumentAnalysis {
  businessRegistration: DocumentInfo | null;
  idDocument: DocumentInfo | null;
  utilityBill: DocumentInfo | null;
  additionalDocs: DocumentInfo[];
}

interface MerchantDocumentsData {
  merchant: {
    id: string;
    businessName: string;
    email: string;
    verified: boolean;
    verifiedDate?: string;
    createdAt: string;
  };
  documents: {
    businessRegistration?: DocumentInfo;
    idDocument?: DocumentInfo;
    utilityBill?: DocumentInfo;
    additionalDocs?: DocumentInfo[];
    documentsSubmittedAt?: string;
    documentReviewStatus?: string;
  };
  analysis: {
    documentAnalysis: DocumentAnalysis;
    requiredDocsSubmitted: number;
    totalRequiredDocs: number;
    canBeVerified: boolean;
    completionPercentage: string;
  };
}

interface DocumentsViewerProps {
  merchantId: string;
  merchantName: string;
  onClose: () => void;
}

const DocumentsViewer: React.FC<DocumentsViewerProps> = ({ 
  merchantId, 
  merchantName, 
  onClose 
}) => {
  const [documentsData, setDocumentsData] = useState<MerchantDocumentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [merchantId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminAPI.getMerchantDocuments(merchantId);
      
      if (response.data.success) {
        setDocumentsData(response.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch documents');
      }
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch documents');
      toast({
        title: 'Error',
        description: 'Failed to fetch merchant documents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (docType: string, documentInfo: DocumentInfo) => {
    try {
      setPreviewLoading(true);
      
      const response = await adminAPI.viewMerchantDocument(merchantId, docType);
      
      // Create blob URL for preview
      const blob = new Blob([response.data], { type: documentInfo.mimeType || 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Clean up previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setPreviewUrl(url);
      
      // Open in new tab for better viewing
      window.open(url, '_blank');
      
    } catch (err: any) {
      console.error('Error viewing document:', err);
      toast({
        title: 'Error',
        description: 'Failed to load document preview',
        variant: 'destructive',
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownloadDocument = async (docType: string, documentInfo: DocumentInfo) => {
    try {
      const response = await adminAPI.viewMerchantDocument(merchantId, docType);
      
      // Create download
      const blob = new Blob([response.data], { type: documentInfo.mimeType || 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = documentInfo.originalName || `${docType}_${merchantName}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Document downloaded successfully',
      });
      
    } catch (err: any) {
      console.error('Error downloading document:', err);
      toast({
        title: 'Error',
        description: 'Failed to download document',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDocumentStatus = (docInfo: DocumentInfo | null): { 
    status: 'uploaded' | 'missing'; 
    color: string; 
    icon: React.ReactNode; 
  } => {
    if (docInfo?.path) {
      return {
        status: 'uploaded',
        color: 'text-green-600 bg-green-100',
        icon: <CheckCircle className="h-4 w-4" />
      };
    }
    return {
      status: 'missing',
      color: 'text-red-600 bg-red-100',
      icon: <XCircle className="h-4 w-4" />
    };
  };

  const renderDocumentCard = (
    title: string,
    docType: string,
    documentInfo: DocumentInfo | null,
    required: boolean = true
  ) => {
    const { status, color, icon } = getDocumentStatus(documentInfo);
    
    return (
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-400" />
            <div>
              <h4 className="font-medium text-gray-900">{title}</h4>
              {required && (
                <span className="text-xs text-red-500">Required</span>
              )}
            </div>
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            {icon}
            <span className="capitalize">{status}</span>
          </div>
        </div>

        {documentInfo?.path ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium">File:</span>
                <span>{documentInfo.originalName || 'Document file'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3" />
                <span>Uploaded: {formatDate(documentInfo.uploadedAt)}</span>
              </div>
              {documentInfo.fileSize && (
                <div className="flex items-center space-x-2">
                  <span>Size: {formatFileSize(documentInfo.fileSize)}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => handleViewDocument(docType, documentInfo)}
                disabled={previewLoading}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {previewLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
                <span>View</span>
              </button>
              
              <button
                onClick={() => handleDownloadDocument(docType, documentInfo)}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                <Download className="h-3 w-3" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">
            No document uploaded yet
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-700">Loading documents...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Error Loading Documents</h3>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex space-x-3">
            <button
              onClick={fetchDocuments}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!documentsData) return null;

  const { merchant, documents, analysis } = documentsData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 my-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Building className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Merchant Documents</h2>
              <p className="text-sm text-gray-500">{merchant.businessName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Status Overview */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analysis.completionPercentage}%</div>
              <div className="text-sm text-gray-600">Documents Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analysis.requiredDocsSubmitted}</div>
              <div className="text-sm text-gray-600">Required Docs</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${merchant.verified ? 'text-green-600' : 'text-orange-600'}`}>
                {merchant.verified ? 'Verified' : 'Pending'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${analysis.canBeVerified ? 'text-green-600' : 'text-gray-400'}`}>
                {analysis.canBeVerified ? 'Ready' : 'Not Ready'}
              </div>
              <div className="text-sm text-gray-600">For Verification</div>
            </div>
          </div>
        </div>

        {/* Document List */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {renderDocumentCard(
              'Business Registration Certificate',
              'businessRegistration',
              documents.businessRegistration || null,
              true
            )}
            
            {renderDocumentCard(
              'ID Document',
              'idDocument',
              documents.idDocument || null,
              true
            )}
            
            {renderDocumentCard(
              'Utility Bill / Proof of Address',
              'utilityBill',
              documents.utilityBill || null,
              true
            )}
          </div>

          {/* Additional Documents */}
          {documents.additionalDocs && documents.additionalDocs.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Documents</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {documents.additionalDocs.map((doc, index) => 
                  renderDocumentCard(
                    doc.description || `Additional Document ${index + 1}`,
                    `additionalDocs[${index}]`,
                    doc,
                    false
                  )
                )}
              </div>
            </div>
          )}

          {/* Document Submission Info */}
          {documents.documentsSubmittedAt && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Documents submitted on:</span>
                <span className="text-sm text-blue-700">{formatDate(documents.documentsSubmittedAt)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          
          {analysis.canBeVerified && !merchant.verified && (
            <button
              onClick={() => {
                toast({
                  title: 'Info',
                  description: 'Use the main merchant verification button to verify this merchant',
                });
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Ready for Verification
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsViewer;