import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Eye, 
  Download, 
  X, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { adminAPI } from '../lib/api';
import { toast } from 'sonner';

interface DocumentInfo {
  submitted: boolean;
  path: string | null;
  required: boolean;
  uploadedAt?: string;
}

interface DocumentsData {
  merchantInfo: {
    businessName: string;
    email: string;
    verified: boolean;
    verifiedDate?: string;
    createdAt: string;
  };
  documents: {
    businessRegistration: DocumentInfo;
    idDocument: DocumentInfo;
    utilityBill: DocumentInfo;
    additionalDocs?: DocumentInfo;
  };
  analysis: {
    completionPercentage: number;
    totalRequired: number;
    totalSubmitted: number;
    missingDocuments: string[];
  };
}

interface MerchantDocumentsProps {
  merchantId: string;
  onClose: () => void;
}

const MerchantDocuments: React.FC<MerchantDocumentsProps> = ({ merchantId, onClose }) => {
  const [documentsData, setDocumentsData] = useState<DocumentsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [merchantId]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminAPI.getMerchantDocuments(merchantId);
      if (response.data.success) {
        setDocumentsData(response.data.data);
      } else {
        setError('Failed to load documents');
      }
    } catch (error) {
      console.error('Failed to load merchant documents:', error);
      setError('Failed to load documents');
      toast.error('Failed to load merchant documents');
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentStatusIcon = (doc: DocumentInfo) => {
    if (!doc.required) return <Clock className="h-4 w-4 text-gray-400" />;
    if (doc.submitted) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getDocumentStatusText = (doc: DocumentInfo) => {
    if (!doc.required) return 'Optional';
    if (doc.submitted) return 'Submitted';
    return 'Missing';
  };

  const getDocumentStatusColor = (doc: DocumentInfo) => {
    if (!doc.required) return 'text-gray-500';
    if (doc.submitted) return 'text-green-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDocument = (path: string) => {
    if (path) {
      window.open(path, '_blank');
    }
  };

  const handleDownloadDocument = (path: string, filename: string) => {
    if (path) {
      const link = document.createElement('a');
      link.href = path;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Loading documents...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !documentsData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Documents</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={loadDocuments}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const documents = [
    {
      key: 'businessRegistration',
      label: 'Business Registration',
      info: documentsData.documents.businessRegistration
    },
    {
      key: 'idDocument',
      label: 'ID Document',
      info: documentsData.documents.idDocument
    },
    {
      key: 'utilityBill',
      label: 'Utility Bill',
      info: documentsData.documents.utilityBill
    },
    {
      key: 'additionalDocs',
      label: 'Additional Documents',
      info: documentsData.documents.additionalDocs
    }
  ].filter(doc => doc.info);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Merchant Documents</h2>
              <p className="text-gray-600">{documentsData.merchantInfo.businessName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Merchant Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{documentsData.merchantInfo.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <div className="flex items-center gap-2">
                  {documentsData.merchantInfo.verified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className={documentsData.merchantInfo.verified ? 'text-green-600' : 'text-yellow-600'}>
                    {documentsData.merchantInfo.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Applied</p>
                <p className="font-medium">{formatDate(documentsData.merchantInfo.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Document Completion */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Document Completion</h3>
              <span className="text-2xl font-bold text-blue-600">
                {documentsData.analysis.completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${documentsData.analysis.completionPercentage}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              {documentsData.analysis.totalSubmitted} of {documentsData.analysis.totalRequired} required documents submitted
            </div>
            {documentsData.analysis.missingDocuments.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-red-600 font-medium">Missing documents:</p>
                <p className="text-sm text-red-500">{documentsData.analysis.missingDocuments.join(', ')}</p>
              </div>
            )}
          </div>

          {/* Documents List */}
          <div className="space-y-4">
            {documents.map((doc) => doc.info && (
              <div key={doc.key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900">{doc.label}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {getDocumentStatusIcon(doc.info)}
                        <span className={`text-sm ${getDocumentStatusColor(doc.info)}`}>
                          {getDocumentStatusText(doc.info)}
                        </span>
                        {doc.info.submitted && doc.info.uploadedAt && (
                          <span className="text-sm text-gray-500">
                            • Uploaded {formatDate(doc.info.uploadedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {doc.info.submitted && doc.info.path && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDocument(doc.info!.path!)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(doc.info!.path!, `${doc.label}.pdf`)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
              {!documentsData.merchantInfo.verified && documentsData.analysis.completionPercentage === 100 && (
                <button
                  onClick={() => {
                    // TODO: Implement verification action
                    toast.success('Merchant verification initiated');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve Merchant
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantDocuments;
