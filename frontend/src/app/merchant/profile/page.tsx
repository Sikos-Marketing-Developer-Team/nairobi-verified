"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface MerchantProfile {
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
}

export default function MerchantProfile() {
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/profile`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setProfile(data.profile);
    } catch (error) {
      setError("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    
    // Add file to the appropriate field based on document type
    if (documentType === 'businessRegistration') {
      formData.append("businessRegistration", file);
    } else if (documentType === 'taxCertificate') {
      formData.append("taxCertificate", file);
    } else if (documentType === 'idDocument') {
      formData.append("idDocument", file);
    }

    try {
      // Use the merchant controller endpoint that now uses Cloudinary
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchant/upload-documents`, {
        method: "POST",
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const data = await response.json();
      
      // Update the profile with the new document URL from Cloudinary
      setProfile(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          documents: {
            ...prev.documents,
            [documentType]: data.documents[documentType]?.url || ''
          }
        };
      });
      
      setSuccess("Document uploaded successfully and pending verification");
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return <div className="wrapper">Loading...</div>;
  }

  if (!profile) {
    return <div className="wrapper">Profile not found</div>;
  }

  return (
    <div className="wrapper">
      <div className="form-box">
        <h2 className="title">Merchant Profile</h2>
        
        {!profile.isVerified && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="bx bxs-info-circle text-yellow-400 text-xl"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Your account is pending verification. Please upload all required documents to complete the verification process.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <p className="mt-1 text-sm text-gray-900">{profile.companyName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{profile.companyEmail}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{profile.companyPhone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="mt-1 text-sm text-gray-900">{profile.location}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Verification Documents</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Business Registration</label>
                <div className="mt-1 flex items-center">
                  {profile.documents.businessRegistration ? (
                    <a
                      href={profile.documents.businessRegistration}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Document
                    </a>
                  ) : (
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, "businessRegistration")}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tax Certificate</label>
                <div className="mt-1 flex items-center">
                  {profile.documents.taxCertificate ? (
                    <a
                      href={profile.documents.taxCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Document
                    </a>
                  ) : (
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, "taxCertificate")}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ID Document</label>
                <div className="mt-1 flex items-center">
                  {profile.documents.idDocument ? (
                    <a
                      href={profile.documents.idDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Document
                    </a>
                  ) : (
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, "idDocument")}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          {profile.isVerified && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className="bx bxs-check-circle text-green-400 text-xl"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Your account has been verified. You can now start selling your products.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 