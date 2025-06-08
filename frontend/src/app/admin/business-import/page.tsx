"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../../components/MainLayout';
import { toast } from 'react-hot-toast';

interface ImportStatus {
  total: number;
  processed: number;
  success: number;
  failed: number;
  errors: string[];
}

export default function BusinessImport() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus>({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    errors: [],
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/businesses/bulk-import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Import failed');
      }

      const data = await response.json();
      setImportStatus(data);
      
      if (data.failed === 0) {
        toast.success('All businesses imported successfully!');
        router.push('/admin/merchants');
      } else {
        toast.error(`${data.failed} businesses failed to import`);
      }
    } catch (error) {
      toast.error('Failed to import businesses');
      console.error('Import error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Import Businesses
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-orange-50 file:text-orange-700
                hover:file:bg-orange-100
                dark:file:bg-orange-900 dark:file:text-orange-300"
            />
          </div>

          <button
            onClick={handleImport}
            disabled={!file || isLoading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium
              ${!file || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700'
              }`}
          >
            {isLoading ? 'Importing...' : 'Import Businesses'}
          </button>
        </div>

        {importStatus.total > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Import Status
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {importStatus.total}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Processed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {importStatus.processed}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                <p className="text-sm text-green-500 dark:text-green-400">Success</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-300">
                  {importStatus.success}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                <p className="text-sm text-red-500 dark:text-red-400">Failed</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-300">
                  {importStatus.failed}
                </p>
              </div>
            </div>

            {importStatus.errors.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Errors
                </h3>
                <div className="bg-red-50 dark:bg-red-900 rounded-lg p-4">
                  <ul className="text-sm text-red-600 dark:text-red-300 space-y-1">
                    {importStatus.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
} 