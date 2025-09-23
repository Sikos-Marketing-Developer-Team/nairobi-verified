import { useState, useEffect, Key } from "react";
import { Button } from "@/components/ui/button"; // ✅ adjust to your UI library
import { toast } from "sonner";

interface Merchant {
  id: Key;
  businessName: string;
  documentStatus: "pending_review" | "complete" | "incomplete";
}

const BulkVerificationUI = () => {
  const [selectedMerchants, setSelectedMerchants] = useState<Key[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);

  // ✅ Fetch merchants with docs awaiting review
  useEffect(() => {
    fetch("/api/merchants?documentStatus=pending_review")
      .then((res) => res.json())
      .then((data) => setMerchants(data))
      .catch((err) => console.error("Failed to load merchants", err));
  }, []);

  const handleBulkAction = (action: "verify" | "reject") => {
    fetch("/api/admin/dashboard/merchants/bulk-verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        merchantIds: selectedMerchants,
        action,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        toast.success(`${data.modifiedCount} merchants ${action}ed`);

        // ✅ Update local state with the updated merchants returned
        if (data.updatedMerchants) {
          setMerchants((prev) =>
            prev.map((m) =>
              data.updatedMerchants.find((um: Merchant) => um.id === m.id) || m
            )
          );
        }
        setSelectedMerchants([]); // Clear selection
      })
      .catch((err) => {
        console.error(err);
        toast.error("Bulk action failed");
      });
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button
          onClick={() => handleBulkAction("verify")}
          disabled={selectedMerchants.length === 0}
        >
          Verify Selected
        </Button>
        <Button
          onClick={() => handleBulkAction("reject")}
          disabled={selectedMerchants.length === 0}
        >
          Reject Selected
        </Button>
      </div>

      {/* Merchant list with checkboxes */}
      {merchants.map((merchant) => (
        <div key={merchant.id} className="flex items-center p-2 border-b">
          <input
            type="checkbox"
            checked={selectedMerchants.includes(merchant.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedMerchants([...selectedMerchants, merchant.id]);
              } else {
                setSelectedMerchants(
                  selectedMerchants.filter((id) => id !== merchant.id)
                );
              }
            }}
          />
          <span className="ml-2">{merchant.businessName}</span>
          <span
            className={`ml-4 px-2 py-1 text-xs rounded ${
              merchant.documentStatus === "complete"
                ? "bg-green-100 text-green-800"
                : merchant.documentStatus === "pending_review"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {merchant.documentStatus}
          </span>
        </div>
      ))}
    </div>
  );
};

export default BulkVerificationUI;
