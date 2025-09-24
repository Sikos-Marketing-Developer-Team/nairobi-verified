import { scrollToTop } from "@/hooks/useScrollToTop";
import { Merchant } from "@/types/merchantManagement";
import { XCircle, CheckCircle, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";

// Merchant Details Modal Component - FIXED VERSION
interface MerchantDetailsModalProps {
  merchant: Merchant;
  onClose: () => void;
  onVerify: (merchantId: string) => void; // Change to accept merchantId
  onToggleStatus: (merchantId: string, isActive: boolean) => void; // Also fix this one
}

const MerchantDetailsModal: React.FC<MerchantDetailsModalProps> = ({ 
  merchant, 
  onClose, 
  onVerify, 
  onToggleStatus 
}) => {
  const [verifyingMerchantId, setVerifyingMerchantId] = useState<string | null>(null);
  const [togglingStatusMerchantId, setTogglingStatusMerchantId] = useState<string | null>(null);

  useEffect(() => {
    scrollToTop('smooth');
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  function handleVerifyMerchant(_id: string): void {
    setVerifyingMerchantId(_id);
    Promise.resolve(onVerify(_id))
      .finally(() => setVerifyingMerchantId(null));
  }

  function handleToggleStatus(_id: string, isActive: boolean): void {
    setTogglingStatusMerchantId(_id);
    Promise.resolve(onToggleStatus(_id, isActive))
      .finally(() => setTogglingStatusMerchantId(null));
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out animate-slideInUp shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Merchant Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* ... your existing modal content ... */}

        {/* Action Buttons - FIXED */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
          >
            Close
          </button>
         {!merchant.verified && (
  <button
    onClick={() => handleVerifyMerchant(merchant._id)}
    disabled={verifyingMerchantId === merchant._id}
    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all duration-200 disabled:opacity-50"
    title="Verify Merchant"
  >
    {verifyingMerchantId === merchant._id ? (
      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
    ) : (
      <CheckCircle className="w-4 h-4" />
    )}
  </button>
)}

<button
  onClick={() => handleToggleStatus(merchant._id, merchant.isActive ?? false)}
  disabled={togglingStatusMerchantId === merchant._id}
  className={`p-2 rounded-full transition-all duration-200 disabled:opacity-50 ${
    merchant.isActive 
      ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
      : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
  }`}
  title={merchant.isActive ? 'Deactivate' : 'Activate'}
>
  {togglingStatusMerchantId === merchant._id ? (
    <div className={`w-4 h-4 border-2 rounded-full animate-spin ${
      merchant.isActive ? 'border-red-600 border-t-transparent' : 'border-green-600 border-t-transparent'
    }`} />
  ) : (
    <UserCheck className="w-4 h-4" />
  )}
</button>
          <button
            onClick={() => {
              onToggleStatus(merchant._id, merchant.isActive ?? false); // Ensure boolean
              onClose();
            }}
            className={`px-4 py-2 text-white rounded-md transition-colors duration-200 ${
              merchant.isActive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {merchant.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  );
};