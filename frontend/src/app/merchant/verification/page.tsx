"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  FileText, 
  Store, 
  Upload, 
  XCircle 
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Merchant {
  _id: string;
  fullName: string;
  email: string;
  companyName: string;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationDocuments?: {
    businessRegistration?: string;
    identificationDocument?: string;
    addressProof?: string;
    taxCertificate?: string;
  };
}

export default function MerchantVerificationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("business");
  
  // Document states
  const [businessDoc, setBusinessDoc] = useState<File | null>(null);
  const [idDoc, setIdDoc] = useState<File | null>(null);
  const [addressDoc, setAddressDoc] = useState<File | null>(null);
  const [taxDoc, setTaxDoc] = useState<File | null>(null);
  
  // Fetch merchant data
  useEffect(() => {
    // In a real application, this would be an API call to get the logged-in merchant
    // For demo purposes, we'll use localStorage
    const fetchMerchant = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const currentMerchantJSON = localStorage.getItem('currentMerchant');
        if (!currentMerchantJSON) {
          // Not logged in, redirect to login
          router.push('/merchant/login');
          return;
        }
        
        const currentMerchant = JSON.parse(currentMerchantJSON);
        
        // Get full merchant details
        const merchantsJSON = localStorage.getItem('merchants');
        if (!merchantsJSON) {
          throw new Error("Merchant data not found");
        }
        
        const merchants = JSON.parse(merchantsJSON);
        const merchantData = merchants.find((m: any) => m._id === currentMerchant.id || m.email === currentMerchant.email);
        
        if (!merchantData) {
          throw new Error("Merchant not found");
        }
        
        setMerchant(merchantData);
      } catch (error) {
        console.error("Error fetching merchant:", error);
        toast({
          title: "Error",
          description: "Failed to load merchant data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMerchant();
  }, [router, toast]);
  
  // Handle document upload
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    switch (docType) {
      case 'business':
        setBusinessDoc(file);
        break;
      case 'id':
        setIdDoc(file);
        break;
      case 'address':
        setAddressDoc(file);
        break;
      case 'tax':
        setTaxDoc(file);
        break;
    }
  };
  
  // Submit verification documents
  const handleSubmitVerification = async () => {
    if (!merchant) return;
    
    // Check if at least business registration and ID are uploaded
    if (!businessDoc && !idDoc) {
      toast({
        title: "Missing Documents",
        description: "Please upload at least your business registration and identification documents.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate document upload with progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // In a real application, this would be an API call to upload documents
      // For demo purposes, we'll update localStorage
      
      const merchantsJSON = localStorage.getItem('merchants');
      if (!merchantsJSON) {
        throw new Error("Merchant data not found");
      }
      
      const merchants = JSON.parse(merchantsJSON);
      const updatedMerchants = merchants.map((m: any) => {
        if (m._id === merchant._id) {
          return {
            ...m,
            verificationStatus: 'pending',
            verificationDocuments: {
              businessRegistration: businessDoc ? URL.createObjectURL(businessDoc) : m.verificationDocuments?.businessRegistration,
              identificationDocument: idDoc ? URL.createObjectURL(idDoc) : m.verificationDocuments?.identificationDocument,
              addressProof: addressDoc ? URL.createObjectURL(addressDoc) : m.verificationDocuments?.addressProof,
              taxCertificate: taxDoc ? URL.createObjectURL(taxDoc) : m.verificationDocuments?.taxCertificate
            }
          };
        }
        return m;
      });
      
      localStorage.setItem('merchants', JSON.stringify(updatedMerchants));
      
      // Update current merchant
      const updatedMerchant = updatedMerchants.find((m: any) => m._id === merchant._id);
      setMerchant(updatedMerchant);
      
      toast({
        title: "Documents Submitted",
        description: "Your verification documents have been submitted successfully. We'll review them shortly.",
      });
    } catch (error) {
      console.error("Error submitting documents:", error);
      toast({
        title: "Error",
        description: "Failed to submit documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading verification page...</p>
        </div>
      </div>
    );
  }
  
  if (!merchant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-bold">Error Loading Data</h2>
          <p className="mt-2 text-gray-600">Unable to load merchant data. Please try again later.</p>
          <Button className="mt-4" onClick={() => router.push('/merchant/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Merchant Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {merchant.companyName}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Business Verification
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/merchant/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Business Verification</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Complete the verification process to unlock all features
            </p>
          </div>
          
          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
              <CardDescription>
                Current status of your business verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                {merchant.verificationStatus === 'approved' ? (
                  <>
                    <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-green-600 dark:text-green-400">Verified</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Your business has been verified. You have access to all features.
                      </p>
                    </div>
                  </>
                ) : merchant.verificationStatus === 'rejected' ? (
                  <>
                    <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
                      <XCircle className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Verification Failed</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Your verification was not approved. Please update your documents and try again.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-amber-100 dark:bg-amber-900/20 p-3 rounded-full">
                      <Clock className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-amber-600 dark:text-amber-400">Pending Verification</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {merchant.verificationDocuments?.businessRegistration 
                          ? "Your documents are under review. This usually takes 1-2 business days."
                          : "Please upload your verification documents to complete the process."}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Document Upload Section */}
          {merchant.verificationStatus !== 'approved' && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Verification Documents</CardTitle>
                <CardDescription>
                  Please provide the following documents to verify your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="business">Business Registration</TabsTrigger>
                    <TabsTrigger value="id">Identification</TabsTrigger>
                    <TabsTrigger value="address">Address Proof</TabsTrigger>
                    <TabsTrigger value="tax">Tax Certificate</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="business" className="mt-6">
                    <div className="space-y-4">
                      <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertTitle>Business Registration Certificate</AlertTitle>
                        <AlertDescription>
                          Upload your business registration certificate or license. This document is required for verification.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                        <div className="mx-auto flex flex-col items-center justify-center">
                          <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Upload Business Registration
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            PDF, JPG, or PNG files up to 5MB
                          </p>
                          <input
                            type="file"
                            id="business-doc"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleDocumentChange(e, 'business')}
                            className="hidden"
                          />
                          <label
                            htmlFor="business-doc"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer"
                          >
                            Select File
                          </label>
                        </div>
                      </div>
                      
                      {businessDoc && (
                        <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-orange-500 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{businessDoc.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{(businessDoc.size / 1024).toFixed(2)} KB</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setBusinessDoc(null)}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="id" className="mt-6">
                    <div className="space-y-4">
                      <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertTitle>Identification Document</AlertTitle>
                        <AlertDescription>
                          Upload a valid government-issued ID (National ID, Passport, or Driver's License). This document is required for verification.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                        <div className="mx-auto flex flex-col items-center justify-center">
                          <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Upload Identification Document
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            PDF, JPG, or PNG files up to 5MB
                          </p>
                          <input
                            type="file"
                            id="id-doc"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleDocumentChange(e, 'id')}
                            className="hidden"
                          />
                          <label
                            htmlFor="id-doc"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer"
                          >
                            Select File
                          </label>
                        </div>
                      </div>
                      
                      {idDoc && (
                        <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-orange-500 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{idDoc.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{(idDoc.size / 1024).toFixed(2)} KB</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setIdDoc(null)}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="address" className="mt-6">
                    <div className="space-y-4">
                      <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertTitle>Proof of Address</AlertTitle>
                        <AlertDescription>
                          Upload a document showing your business address (utility bill, lease agreement, etc.). This helps verify your business location.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                        <div className="mx-auto flex flex-col items-center justify-center">
                          <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Upload Address Proof
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            PDF, JPG, or PNG files up to 5MB
                          </p>
                          <input
                            type="file"
                            id="address-doc"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleDocumentChange(e, 'address')}
                            className="hidden"
                          />
                          <label
                            htmlFor="address-doc"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer"
                          >
                            Select File
                          </label>
                        </div>
                      </div>
                      
                      {addressDoc && (
                        <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-orange-500 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{addressDoc.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{(addressDoc.size / 1024).toFixed(2)} KB</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setAddressDoc(null)}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tax" className="mt-6">
                    <div className="space-y-4">
                      <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertTitle>Tax Certificate</AlertTitle>
                        <AlertDescription>
                          Upload your tax registration certificate or business tax compliance document. This is optional but recommended.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                        <div className="mx-auto flex flex-col items-center justify-center">
                          <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Upload Tax Certificate
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            PDF, JPG, or PNG files up to 5MB
                          </p>
                          <input
                            type="file"
                            id="tax-doc"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleDocumentChange(e, 'tax')}
                            className="hidden"
                          />
                          <label
                            htmlFor="tax-doc"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer"
                          >
                            Select File
                          </label>
                        </div>
                      </div>
                      
                      {taxDoc && (
                        <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-orange-500 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{taxDoc.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{(taxDoc.size / 1024).toFixed(2)} KB</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setTaxDoc(null)}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                
                {isUploading && (
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading documents...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleSubmitVerification} 
                  disabled={isUploading || (!businessDoc && !idDoc)}
                >
                  {isUploading ? "Uploading..." : "Submit Documents"}
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {/* Verification Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Benefits of Verification</CardTitle>
              <CardDescription>
                Why you should complete the verification process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex space-x-4">
                  <div className="bg-green-100 dark:bg-green-900/20 p-3 h-fit rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Increased Trust</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Verified businesses display a trust badge that increases customer confidence and conversion rates.
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <div className="bg-green-100 dark:bg-green-900/20 p-3 h-fit rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Better Visibility</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Verified businesses rank higher in search results and are featured in promotional campaigns.
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <div className="bg-green-100 dark:bg-green-900/20 p-3 h-fit rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Lower Fees</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Verified merchants enjoy reduced transaction fees and special pricing on premium features.
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <div className="bg-green-100 dark:bg-green-900/20 p-3 h-fit rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Advanced Features</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Access to advanced analytics, bulk product uploads, and premium customer support.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}