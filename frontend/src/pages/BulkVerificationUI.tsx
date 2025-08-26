import { Button } from "react-day-picker";
import { toast } from "sonner";

// components/BulkVerificationUI.tsx
const BulkVerificationUI = () => {
  const [selectedMerchants, setSelectedMerchants] = useState([]);
  const [merchants, setMerchants] = useState([]);

  const handleBulkAction = (action: 'verify' | 'reject') => {
    fetch('/api/admin/dashboard/merchants/bulk-verify', {
      method: 'POST',
      body: JSON.stringify({
        merchantIds: selectedMerchants,
        action
      })
    })
    .then(res => res.json())
    .then(data => {
      // Show modified count and updated data
      toast.success(`${data.modifiedCount} merchants ${action}ed`);
    });
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button onClick={() => handleBulkAction('verify')}>Verify Selected</Button>
        <Button onClick={() => handleBulkAction('reject')}>Reject Selected</Button>
      </div>
      
      {/* Merchant list with checkboxes */}
      {merchants.map(merchant => (
        <div key={merchant.id} className="flex items-center p-2 border-b">
          <input 
            type="checkbox" 
            checked={selectedMerchants.includes(merchant.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedMerchants([...selectedMerchants, merchant.id]);
              } else {
                setSelectedMerchants(selectedMerchants.filter(id => id !== merchant.id));
              }
            }}
          />
          <span className="ml-2">{merchant.businessName}</span>
          <span className={`ml-4 px-2 py-1 text-xs rounded ${
            merchant.documentStatus === 'complete' ? 'bg-green-100 text-green-800' :
            merchant.documentStatus === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {merchant.documentStatus}
          </span>
        </div>
      ))}
    </div>
  );
};

function useState(arg0: undefined[]): [any, any] {
    throw new Error("Function not implemented.");
}
