"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { FaUpload, FaFileExcel, FaFileAlt, FaCheck, FaTimes, FaInfoCircle, FaDownload } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Papa from "papaparse";

interface Business {
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

interface ImportResult {
  success: boolean;
  business: {
    id?: string;
    name: string;
    email: string;
  };
  error?: string;
}

export default function BulkImportBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<{ successful: ImportResult[], failed: ImportResult[] } | null>(null);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Real data template for download
  const templateData: Business[] = [
    {
      name: "Business Name",
      email: "business@example.com",
      phone: "+254712345678",
      address: "Business Address, City",
      category: "Restaurant",
      description: "Detailed description of the business",
      openingHours: "Mon-Fri: 8am-8pm, Sat-Sun: 10am-6pm",
      website: "https://businesswebsite.com",
      socialMedia: {
        facebook: "https://facebook.com/businessname",
        twitter: "https://twitter.com/businessname",
        instagram: "https://instagram.com/businessname"
      }
    }
  ];

  // Generate CSV template for download
  const generateTemplate = () => {
    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'business_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrors({});

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const parsedBusinesses = results.data.map((row: any, index: number) => {
            // Validate required fields
            const rowErrors: Record<string, string> = {};
            const requiredFields = ['name', 'email', 'phone', 'address', 'category', 'description', 'openingHours'];
            
            requiredFields.forEach(field => {
              if (!row[field]) {
                rowErrors[field] = `${field} is required`;
              }
            });

            // Validate email format
            if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
              rowErrors.email = 'Invalid email format';
            }

            // Validate phone format
            if (row.phone && !/^\+?[0-9]{10,15}$/.test(row.phone.replace(/\s/g, ''))) {
              rowErrors.phone = 'Invalid phone format';
            }

            // Store errors if any
            if (Object.keys(rowErrors).length > 0) {
              setErrors(prev => ({
                ...prev,
                [index]: rowErrors
              }));
            }

            // Parse social media if present
            const socialMedia: any = {};
            if (row.facebook) socialMedia.facebook = row.facebook;
            if (row.twitter) socialMedia.twitter = row.twitter;
            if (row.instagram) socialMedia.instagram = row.instagram;

            return {
              name: row.name,
              email: row.email,
              phone: row.phone,
              address: row.address,
              category: row.category,
              description: row.description,
              openingHours: row.openingHours,
              website: row.website || '',
              socialMedia: Object.keys(socialMedia).length > 0 ? socialMedia : undefined
            };
          }).filter((business: any) => business.name && business.email); // Filter out empty rows

          setBusinesses(parsedBusinesses);
          setStep(2);
          toast.success(`Parsed ${parsedBusinesses.length} businesses from CSV`);
        } catch (error) {
          console.error('Error parsing CSV:', error);
          toast.error('Error parsing CSV file. Please check the format.');
        } finally {
          setIsUploading(false);
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        toast.error('Error parsing CSV file. Please check the format.');
        setIsUploading(false);
      }
    });
  };

  // Handle import submission
  const handleImport = async () => {
    if (businesses.length === 0) {
      toast.error('No businesses to import');
      return;
    }

    // Check for validation errors
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix validation errors before importing');
      return;
    }

    // Confirm import with user
    if (!window.confirm(`Are you sure you want to import ${businesses.length} businesses? This will create accounts for each business and send emails with temporary passwords.`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.admin.bulkImportBusinesses(businesses);
      setResults(response.data.results);
      setStep(3);
      
      const successCount = response.data.results.successful.length;
      const failCount = response.data.results.failed.length;
      
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} businesses`);
      }
      
      if (failCount > 0) {
        toast.error(`Failed to import ${failCount} businesses. See details below.`);
      }
      
      // Log activity
      try {
        await apiService.admin.logActivity({
          action: 'bulk_import_businesses',
          details: {
            totalCount: businesses.length,
            successCount,
            failCount
          }
        });
      } catch (logError) {
        console.error('Error logging activity:', logError);
      }
    } catch (error: any) {
      console.error('Import error:', error);
      
      // Handle specific error messages from the backend
      const errorMessage = error.response?.data?.message || 
                          'Error importing businesses. Please try again.';
      
      toast.error(errorMessage);
      
      // If there are validation errors returned from the backend
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        toast.error(`${backendErrors.length} validation errors found. Please fix and try again.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setBusinesses([]);
    setResults(null);
    setStep(1);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Navigate to dashboard
  const goToDashboard = () => {
    router.push('/admin/dashboard');
  };

  return (
    <AdminLayout notificationCount={0}>
      <div className="space-y-6">
        <Breadcrumbs />
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Bulk Import Businesses</h1>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {/* Step indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex flex-col items-center ${step >= 1 ? 'text-orange-500' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-orange-500 bg-orange-50' : 'border-gray-300'}`}>
                  <FaUpload />
                </div>
                <span className="mt-2 text-sm font-medium">Upload CSV</span>
              </div>
              <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
              <div className={`flex flex-col items-center ${step >= 2 ? 'text-orange-500' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-orange-500 bg-orange-50' : 'border-gray-300'}`}>
                  <FaFileAlt />
                </div>
                <span className="mt-2 text-sm font-medium">Review Data</span>
              </div>
              <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
              <div className={`flex flex-col items-center ${step >= 3 ? 'text-orange-500' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-orange-500 bg-orange-50' : 'border-gray-300'}`}>
                  <FaCheck />
                </div>
                <span className="mt-2 text-sm font-medium">Complete</span>
              </div>
            </div>
          </div>

          {/* Step 1: Upload CSV */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 text-center">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <FaFileExcel className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Upload Business CSV</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Upload a CSV file containing business information. Make sure to follow the template format.
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      ref={fileInputRef}
                      disabled={isUploading}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                      disabled={isUploading}
                    >
                      {isUploading ? 'Uploading...' : 'Select CSV File'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaInfoCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Need a template?</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Download our CSV template to ensure your data is formatted correctly.</p>
                      <button
                        type="button"
                        onClick={generateTemplate}
                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaDownload className="mr-1.5 h-4 w-4" />
                        Download Template
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Review Data */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Review Business Data</h2>
                <div className="text-sm text-gray-500">
                  {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'} found
                </div>
              </div>

              {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaTimes className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Validation Errors</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>Please fix the following errors before importing:</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          {Object.entries(errors).map(([rowIndex, rowErrors]) => (
                            <li key={rowIndex}>
                              Row {parseInt(rowIndex) + 1} ({businesses[parseInt(rowIndex)]?.name || 'Unknown'}):
                              <ul className="list-disc pl-5">
                                {Object.entries(rowErrors).map(([field, error]) => (
                                  <li key={field}>{error}</li>
                                ))}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {businesses.map((business, index) => (
                      <tr key={index} className={errors[index] ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {business.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {business.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {business.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {business.address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {business.category}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                  disabled={isLoading || Object.keys(errors).length > 0}
                >
                  {isLoading ? 'Importing...' : 'Import Businesses'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 3 && results && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <FaCheck className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">Import Complete</h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Successfully imported {results.successful.length} businesses.</p>
                  {results.failed.length > 0 && (
                    <p className="text-red-500">Failed to import {results.failed.length} businesses.</p>
                  )}
                </div>
              </div>

              {results.successful.length > 0 && (
                <div>
                  <h4 className="text-md font-medium mb-2">Successfully Imported:</h4>
                  <div className="bg-green-50 p-4 rounded-md max-h-60 overflow-y-auto">
                    <ul className="divide-y divide-green-200">
                      {results.successful.map((result, index) => (
                        <li key={index} className="py-2">
                          <div className="flex items-center">
                            <FaCheck className="text-green-500 mr-2" />
                            <span className="font-medium">{result.business.name}</span>
                            <span className="ml-2 text-sm text-gray-500">({result.business.email})</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {results.failed.length > 0 && (
                <div>
                  <h4 className="text-md font-medium mb-2">Failed to Import:</h4>
                  <div className="bg-red-50 p-4 rounded-md max-h-60 overflow-y-auto">
                    <ul className="divide-y divide-red-200">
                      {results.failed.map((result, index) => (
                        <li key={index} className="py-2">
                          <div className="flex items-center">
                            <FaTimes className="text-red-500 mr-2" />
                            <span className="font-medium">{result.business.name}</span>
                            <span className="ml-2 text-sm text-gray-500">({result.business.email})</span>
                          </div>
                          <div className="mt-1 text-sm text-red-700">{result.error}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Import More Businesses
                </button>
                <button
                  type="button"
                  onClick={goToDashboard}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Information about the workflow */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Business Onboarding Workflow</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-md font-medium">1. Import Businesses</h3>
              <p className="text-sm text-gray-600">
                Upload a CSV file with business information to add them to the platform.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-md font-medium">2. Automatic Account Creation</h3>
              <p className="text-sm text-gray-600">
                The system creates user accounts for each business with temporary passwords.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-md font-medium">3. Welcome Email</h3>
              <p className="text-sm text-gray-600">
                Each business receives a welcome email with their login credentials and instructions.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-md font-medium">4. First Login</h3>
              <p className="text-sm text-gray-600">
                Businesses log in using the temporary password and are prompted to change it immediately.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-md font-medium">5. Profile Completion</h3>
              <p className="text-sm text-gray-600">
                Businesses complete their profiles, upload documents, and set up their store.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}