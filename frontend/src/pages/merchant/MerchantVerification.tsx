import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Download,
  Trash2,
  Eye
} from "lucide-react";

interface DocumentStatus {
  uploaded: boolean;
  status: "pending" | "under_review" | "approved" | "rejected";
  rejectionReason?: string;
  uploadedAt?: string;
  url?: string;
}

interface VerificationStatus {
  verified: boolean;
  verificationStatus: "not_started" | "pending" | "under_review" | "approved" | "rejected";
  documentsCompleteness: number;
  documents: {
    businessRegistration: DocumentStatus;
    idDocument: DocumentStatus;
    utilityBill: DocumentStatus;
    additionalDocs: DocumentStatus[];
  };
  documentReviewStatus: {
    status: "pending" | "under_review" | "approved" | "rejected";
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;
  };
}

interface VerificationHistory {
  _id: string;
  action: string;
  status: string;
  performedBy: string;
  notes: string;
  timestamp: string;
}

const MerchantVerification = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [verificationHistory, setVerificationHistory] = useState<VerificationHistory[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchVerificationStatus();
    fetchVerificationHistory();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/merchants/dashboard/verification/status");
      setVerificationStatus(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load verification status");
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationHistory = async () => {
    try {
      const response = await axios.get("/api/merchants/dashboard/verification/history");
      setVerificationHistory(response.data.data || []);
    } catch (err: any) {
      console.error("Failed to load verification history:", err);
    }
  };

  const handleFileUpload = async (documentType: string, file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload only PDF or image files (JPEG, PNG)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    try {
      setUploading(documentType);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("documents", file);
      formData.append("documentType", documentType);

      const response = await axios.post(
        "/api/merchants/dashboard/verification/documents",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      setSuccess(`${getDocumentLabel(documentType)} uploaded successfully`);
      await fetchVerificationStatus();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to upload ${getDocumentLabel(documentType)}`);
    } finally {
      setUploading(null);
    }
  };

  const handleRequestVerification = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await axios.post("/api/merchants/dashboard/verification/request");
      
      setSuccess("Verification request submitted successfully! Our team will review your documents within 24-48 hours.");
      await fetchVerificationStatus();
      await fetchVerificationHistory();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit verification request");
    } finally {
      setLoading(false);
    }
  };

  const getDocumentLabel = (documentType: string): string => {
    const labels: { [key: string]: string } = {
      businessRegistration: "Business Registration",
      idDocument: "ID Document",
      utilityBill: "Utility Bill",
      additionalDocs: "Additional Document"
    };
    return labels[documentType] || documentType;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "under_review":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      approved: "default",
      rejected: "destructive",
      under_review: "secondary",
      pending: "outline"
    };

    const labels: { [key: string]: string } = {
      approved: "Approved",
      rejected: "Rejected",
      under_review: "Under Review",
      pending: "Pending",
      not_started: "Not Started"
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const DocumentUploadCard = ({ 
    documentType, 
    documentStatus,
    required = true 
  }: { 
    documentType: string;
    documentStatus: DocumentStatus;
    required?: boolean;
  }) => {
    const fileInputId = `file-input-${documentType}`;

    return (
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(documentStatus.status)}
              <div>
                <CardTitle className="text-base">
                  {getDocumentLabel(documentType)}
                  {required && <span className="text-red-500 ml-1">*</span>}
                </CardTitle>
                {documentStatus.uploaded && documentStatus.uploadedAt && (
                  <CardDescription className="text-xs mt-1">
                    Uploaded: {new Date(documentStatus.uploadedAt).toLocaleDateString()}
                  </CardDescription>
                )}
              </div>
            </div>
            {getStatusBadge(documentStatus.status)}
          </div>
        </CardHeader>
        <CardContent>
          {documentStatus.rejectionReason && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{documentStatus.rejectionReason}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {documentStatus.uploaded && documentStatus.url ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(documentStatus.url, "_blank")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Document
                </Button>
                {documentStatus.status === "rejected" && (
                  <label htmlFor={fileInputId} className="flex-1">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full"
                      disabled={uploading === documentType}
                      asChild
                    >
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading === documentType ? "Uploading..." : "Re-upload"}
                      </span>
                    </Button>
                  </label>
                )}
              </div>
            ) : (
              <label htmlFor={fileInputId}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed"
                  disabled={uploading === documentType}
                  asChild
                >
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading === documentType ? "Uploading..." : "Upload Document"}
                  </span>
                </Button>
              </label>
            )}

            <input
              id={fileInputId}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(documentType, file);
              }}
            />

            <p className="text-xs text-gray-500">
              Accepted formats: PDF, JPEG, PNG (Max 5MB)
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading && !verificationStatus) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const canRequestVerification = 
    verificationStatus &&
    verificationStatus.documentsCompleteness >= 75 &&
    verificationStatus.verificationStatus === "not_started";

  const isUnderReview = 
    verificationStatus?.verificationStatus === "under_review" ||
    verificationStatus?.verificationStatus === "pending";

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Verification Center</h1>
          <p className="text-gray-600 mt-1">
            Upload required documents to get your business verified
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/merchant/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      {/* Alert Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Important Notice for Merchants Without Documents */}
      {verificationStatus && verificationStatus.documentsCompleteness === 0 && (
        <Alert className="border-orange-500 bg-orange-50">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <div className="ml-2">
            <h3 className="font-bold text-orange-800 mb-2">⚠️ Action Required: Upload Verification Documents</h3>
            <AlertDescription className="text-orange-700">
              <p className="mb-2">
                Your merchant account was created by our admin team, but we still need your verification documents to complete your profile and enable full access to all features.
              </p>
              <p className="font-semibold">
                Please upload the three required documents below to get your business verified:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Business Registration Certificate</li>
                <li>Valid ID Document (National ID or Passport)</li>
                <li>Proof of Address (Recent Utility Bill)</li>
              </ul>
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Verification Status Overview */}
      {verificationStatus && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Verification Status</CardTitle>
              {getStatusBadge(verificationStatus.verificationStatus)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Document Completeness</span>
                <span className="font-bold">{verificationStatus.documentsCompleteness}%</span>
              </div>
              <Progress value={verificationStatus.documentsCompleteness} className="h-2" />
            </div>

            {verificationStatus.documentReviewStatus.reviewNotes && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Review Notes:</strong> {verificationStatus.documentReviewStatus.reviewNotes}
                </AlertDescription>
              </Alert>
            )}

            {verificationStatus.verified ? (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">
                  🎉 Congratulations! Your business is verified and can now display the verified badge.
                </AlertDescription>
              </Alert>
            ) : canRequestVerification ? (
              <Button 
                onClick={handleRequestVerification} 
                className="w-full"
                disabled={loading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit for Verification
              </Button>
            ) : isUnderReview ? (
              <Alert className="border-blue-500 bg-blue-50">
                <Clock className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-700">
                  Your documents are currently under review. We'll notify you once the review is complete.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please upload all required documents (at least 75% complete) to request verification.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Document Upload Section */}
      {verificationStatus && (
        <div>
          <h2 className="text-xl font-bold mb-4">Required Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentUploadCard
              documentType="businessRegistration"
              documentStatus={verificationStatus.documents.businessRegistration}
              required={true}
            />
            <DocumentUploadCard
              documentType="idDocument"
              documentStatus={verificationStatus.documents.idDocument}
              required={true}
            />
            <DocumentUploadCard
              documentType="utilityBill"
              documentStatus={verificationStatus.documents.utilityBill}
              required={true}
            />
          </div>
        </div>
      )}

      {/* Verification History */}
      {verificationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Verification History</CardTitle>
            <CardDescription>Track all verification-related activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {verificationHistory.map((entry) => (
                <div key={entry._id} className="flex items-start gap-4 border-l-2 border-gray-200 pl-4 pb-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(entry.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{entry.action}</p>
                      {getStatusBadge(entry.status)}
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Verification Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <p><strong>Business Registration:</strong> Upload your official business registration certificate or license</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <p><strong>ID Document:</strong> Valid national ID, passport, or driver's license of the business owner</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <p><strong>Utility Bill:</strong> Recent utility bill (water, electricity, or internet) showing business address</p>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p>All documents must be clear, legible, and in PDF or image format (max 5MB each)</p>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p>Verification typically takes 24-48 hours after submission</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantVerification;
