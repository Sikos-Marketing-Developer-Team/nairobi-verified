import React, { useState, useEffect } from 'react';
import { 
  Store,
  FileText,
  XCircle
} from 'lucide-react';
import { adminAPI } from '../lib/api';
import { toast } from 'sonner';

interface Merchant {
  _id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  verified: boolean;
  isActive: boolean;
  createdAt: string;
}

const MerchantsManagement: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);

  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getMerchants();
      if (response.data.success) {
        setMerchants(response.data.merchants || []);
      }
    } catch (error: any) {
      console.error('Failed to load merchants:', error);
      toast.error('Failed to load merchants');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Merchants Management</h1>
          <p className="mt-2 text-sm text-gray-700">Manage merchant accounts and verification</p>
        </div>
      </div>

      {/* Merchants List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="px-4 py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading merchants...</p>
          </div>
        ) : merchants.length === 0 ? (
          <div className="text-center py-12">
            <Store className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No merchants found</h3>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {merchants.map((merchant) => (
              <li key={merchant._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <Store className="h-6 w-6 text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{merchant.businessName}</div>
                      <div className="text-sm text-gray-500">{merchant.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      merchant.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {merchant.verified ? 'Verified' : 'Pending'}
                    </span>
                    <button
                      onClick={() => setShowDocumentsModal(true)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FileText className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Simple Documents Modal */}
      {showDocumentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Merchant Documents</h2>
              <button
                onClick={() => setShowDocumentsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600">Document management functionality is available.</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowDocumentsModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantsManagement;
