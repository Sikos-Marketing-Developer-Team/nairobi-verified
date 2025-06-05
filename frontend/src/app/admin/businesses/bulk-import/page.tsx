"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { FiUpload, FiFile, FiCheck, FiX } from "react-icons/fi";
import { apiService } from "@/lib/api";

interface BusinessData {
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

export default function BulkImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<BusinessData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFile(file);

    try {
      const text = await file.text();
      const rows = text.split("\n");
      const headers = rows[0].split(",");
      
      const data = rows.slice(1).map((row) => {
        const values = row.split(",");
        return {
          name: values[0]?.trim(),
          email: values[1]?.trim(),
          phone: values[2]?.trim(),
          address: values[3]?.trim(),
          category: values[4]?.trim(),
          description: values[5]?.trim(),
          openingHours: values[6]?.trim(),
          website: values[7]?.trim(),
          socialMedia: {
            facebook: values[8]?.trim(),
            twitter: values[9]?.trim(),
            instagram: values[10]?.trim(),
          },
        };
      });

      setPreview(data);
    } catch (error) {
      toast.error("Error reading CSV file");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  const handleImport = async () => {
    if (!file || preview.length === 0) return;

    try {
      setIsLoading(true);
      setProgress(0);

      // Process businesses in batches of 5
      const batchSize = 5;
      const batches = Math.ceil(preview.length / batchSize);

      for (let i = 0; i < batches; i++) {
        const batch = preview.slice(i * batchSize, (i + 1) * batchSize);
        await Promise.all(
          batch.map((business) =>
            apiService.admin.businesses.bulkImport([business])
          )
        );
        setProgress(((i + 1) / batches) * 100);
      }

      toast.success("Businesses imported successfully!");
      router.push("/admin/businesses");
    } catch (error) {
      toast.error("Error importing businesses");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/templates/business-import-template.csv";
    link.download = "business-import-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Bulk Import Businesses
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={downloadTemplate}
            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <FiFile className="mr-2 h-5 w-5 text-gray-400" />
            Download Template
          </button>
        </div>
      </div>

      <div className="mt-8">
        <div
          {...getRootProps()}
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md ${
            isDragActive ? "border-orange-500 bg-orange-50" : ""
          }`}
        >
          <div className="space-y-1 text-center">
            <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
              >
                <span>Upload a CSV file</span>
                <input {...getInputProps()} className="sr-only" />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              CSV file with business details
            </p>
          </div>
        </div>

        {file && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiFile className="h-5 w-5 text-gray-400" />
                <span className="ml-2 text-sm text-gray-900">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview([]);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {preview.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">
              Preview ({preview.length} businesses)
            </h3>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.map((business, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {business.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {business.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {business.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {business.category}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="mt-8">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-orange-600 bg-orange-200">
                    Progress
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-orange-600">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-orange-200">
                <div
                  style={{ width: `${progress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500"
                ></div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!file || isLoading}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Importing..." : "Import Businesses"}
          </button>
        </div>
      </div>
    </div>
  );
} 