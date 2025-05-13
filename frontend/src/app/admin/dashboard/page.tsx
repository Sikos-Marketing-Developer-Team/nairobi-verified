"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api";

interface Merchant {
  id: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  location: string;
  isVerified: boolean;
  documents: {
    businessRegistration: string;
    taxCertificate: string;
    idDocument: string;
  };
  createdAt: string;
}

export default function AdminDashboard() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const response = await apiService.admin.getPendingVerifications();
      setMerchants(response.data.merchants || []);
    } catch (error) {
      console.error("Error fetching merchants:", error);
      setError("Failed to load merchants. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (merchantId: string, action: "verify" | "reject") => {
    try {
      await apiService.admin.processMerchantVerification(
        merchantId, 
        action, 
        action === "reject" ? "Rejected by admin" : ""
      );

      setSuccess(`Merchant ${action === "verify" ? "verified" : "rejected"} successfully`);
      fetchMerchants(); // Refresh the list
    } catch (error) {
      console.error("Error updating merchant status:", error);
      setError("Failed to update merchant status. Please try again later.");
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.auth.logout();
      router.push("/auth/signin");
    } catch (error) {
      console.error("Logout failed:", error);
      setError("Logout failed. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="wrapper">Loading...</div>;
  }

  return (
    <div className="wrapper">
      <div className="form-box">
        <div className="flex justify-between items-center mb-6">
          <h2 className="title">Admin Dashboard</h2>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {merchants.map((merchant) => (
                <tr key={merchant.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {merchant.companyName}
                    </div>
                    <div className="text-sm text-gray-500">{merchant.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{merchant.companyEmail}</div>
                    <div className="text-sm text-gray-500">{merchant.companyPhone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      merchant.isVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {merchant.isVerified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-x-2">
                      {Object.entries(merchant.documents).map(([type, url]) => (
                        <a
                          key={type}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          {type.replace(/([A-Z])/g, " $1").trim()}
                        </a>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {!merchant.isVerified && (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleVerification(merchant.id, "verify")}
                          className="text-green-600 hover:text-green-900"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleVerification(merchant.id, "reject")}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 