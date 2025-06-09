"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'react-hot-toast';
import { FiUpload, FiFile, FiDownload, FiInfo } from 'react-icons/fi';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ImportStatus {
  total: number;
  processed: number;
  success: number;
  failed: number;
  errors: string[];
}

interface MerchantData {
  name: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  description: string;
  openingHours: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

export default function MerchantImport() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<MerchantData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<ImportStatus>({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    errors: [],
  });
  const [activeTab, setActiveTab] = useState("upload");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      parseCSV(selectedFile);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const parseCSV = async (file: File) => {
    try {
      const text = await file.text();
      const rows = text.split("\n");
      const headers = rows[0].split(",");
      
      const data = rows.slice(1)
        .filter(row => row.trim() !== '')
        .map((row) => {
          const values = row.split(",");
          return {
            name: values[0]?.trim() || '',
            email: values[1]?.trim() || '',
            phone: values[2]?.trim() || '',
            address: values[3]?.trim() || '',
            category: values[4]?.trim() || '',
            description: values[5]?.trim() || '',
            openingHours: values[6]?.trim() || '',
            website: values[7]?.trim() || '',
            socialMedia: {
              facebook: values[8]?.trim() || '',
              twitter: values[9]?.trim() || '',
              instagram: values[10]?.trim() || '',
            },
          };
        });

      setPreview(data);
      setImportStatus({
        ...importStatus,
        total: data.length
      });
      
      if (data.length > 0) {
        setActiveTab("preview");
      }
    } catch (error) {
      console.error("Error parsing CSV:", error);
      toast.error('Error reading CSV file. Please check the format.');
    }
  };

  const handleImport = async () => {
    if (!file || preview.length === 0) {
      toast.error('Please select a valid file first');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    
    try {
      // Get existing merchants from localStorage
      const existingMerchantsJSON = localStorage.getItem('merchants');
      const existingMerchants = existingMerchantsJSON ? JSON.parse(existingMerchantsJSON) : [];
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(30);
      
      // Process merchants
      const successfulImports: any[] = [];
      const failedImports: string[] = [];
      
      // Check for duplicates and validate
      const existingEmails = new Set(existingMerchants.map((m: any) => m.email));
      
      for (let i = 0; i < preview.length; i++) {
        const merchant = preview[i];
        
        // Simulate progress
        if (i % 5 === 0) {
          setProgress(30 + Math.min(60 * (i / preview.length), 60));
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Validate merchant data
        if (!merchant.email || !merchant.email.includes('@')) {
          failedImports.push(`Row ${i + 2}: Invalid email format for ${merchant.name}`);
          continue;
        }
        
        if (!merchant.phone) {
          failedImports.push(`Row ${i + 2}: Missing required field "phone" for ${merchant.name}`);
          continue;
        }
        
        if (existingEmails.has(merchant.email)) {
          failedImports.push(`Row ${i + 2}: Duplicate email ${merchant.email} for ${merchant.name}`);
          continue;
        }
        
        // Add to successful imports
        const newMerchant = {
          id: Math.floor(Math.random() * 10000).toString(),
          name: merchant.name,
          businessName: merchant.name, // Using name as business name if not provided
          email: merchant.email,
          phone: merchant.phone,
          address: merchant.address,
          isVerified: false,
          verificationStatus: 'pending',
          salesAmount: 'KSh 0.00',
          earnings: 'KSh 0.00',
          withdrawal: 'KSh 0.00',
          createdAt: new Date().toISOString(),
          category: merchant.category,
          description: merchant.description,
          openingHours: merchant.openingHours,
          website: merchant.website,
          socialMedia: merchant.socialMedia
        };
        
        successfulImports.push(newMerchant);
        existingEmails.add(merchant.email);
      }
      
      // Update progress to 90%
      setProgress(90);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Save to localStorage
      const updatedMerchants = [...existingMerchants, ...successfulImports];
      localStorage.setItem('merchants', JSON.stringify(updatedMerchants));
      
      // Complete the progress
      setProgress(100);
      
      // Set import status
      const status: ImportStatus = {
        total: preview.length,
        processed: preview.length,
        success: successfulImports.length,
        failed: failedImports.length,
        errors: failedImports
      };
      
      setImportStatus(status);
      setActiveTab("results");
      
      if (status.failed === 0) {
        toast.success(`All ${status.total} merchants imported successfully!`);
      } else {
        toast.error(`${status.failed} merchants failed to import`);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import merchants');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    // In a real application, this would download a template file
    // For demonstration, we'll create a simple CSV template
    const template = 'Name,Email,Phone,Address,Category,Description,OpeningHours,Website,Facebook,Twitter,Instagram\n';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'merchant-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Import Merchants</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Bulk import merchants from a CSV file
            </p>
          </div>
          <Button variant="outline" onClick={downloadTemplate} className="flex items-center gap-2">
            <FiDownload className="h-4 w-4" />
            Download Template
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="preview" disabled={preview.length === 0}>Preview</TabsTrigger>
            <TabsTrigger value="results" disabled={importStatus.processed === 0}>Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload CSV File</CardTitle>
                <CardDescription>
                  Upload a CSV file containing merchant information. Make sure to follow the template format.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                  <div className="mx-auto flex flex-col items-center justify-center">
                    <FiUpload className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Drag and drop your CSV file
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      or click to browse files
                    </p>
                    <input
                      type="file"
                      id="file-upload"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer"
                    >
                      Select File
                    </label>
                  </div>
                </div>
                
                {file && (
                  <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <FiFile className="h-5 w-5 text-orange-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setFile(null);
                        setPreview([]);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => file && preview.length > 0 ? setActiveTab("preview") : null}
                  disabled={!file || preview.length === 0}
                >
                  Continue to Preview
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="preview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview Merchants</CardTitle>
                <CardDescription>
                  Review the merchants that will be imported. Total: {preview.length} merchants.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-800">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {preview.slice(0, 10).map((merchant, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">{merchant.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{merchant.email}</td>
                          <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{merchant.phone}</td>
                          <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{merchant.address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {preview.length > 10 && (
                  <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Showing 10 of {preview.length} merchants
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("upload")}>
                  Back
                </Button>
                <Button 
                  onClick={handleImport}
                  disabled={isLoading}
                >
                  {isLoading ? 'Importing...' : 'Import Merchants'}
                </Button>
              </CardFooter>
            </Card>
            
            {isLoading && (
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Importing merchants...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="results" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Import Results</CardTitle>
                <CardDescription>
                  Summary of the merchant import process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {importStatus.total}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Processed</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {importStatus.processed}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">Success</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {importStatus.success}
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">Failed</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {importStatus.failed}
                    </p>
                  </div>
                </div>
                
                {importStatus.errors.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Errors
                    </h3>
                    <Alert variant="destructive">
                      <FiInfo className="h-4 w-4" />
                      <AlertTitle>Import Errors</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          {importStatus.errors.map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
                
                {importStatus.success > 0 && (
                  <Alert className="mt-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">
                    <FiInfo className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>
                      {importStatus.success} merchants were successfully imported.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("preview")}>
                  Back
                </Button>
                <Button onClick={() => router.push('/admin/merchants')}>
                  Go to Merchants
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}