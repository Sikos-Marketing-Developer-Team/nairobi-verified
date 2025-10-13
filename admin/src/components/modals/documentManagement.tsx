import React, { useState } from 'react';
import { merchantsAPI } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from '../ui/sonner';

interface DocumentManagementProps {
  merchantId: string;
  onClose: () => void;
}

const DocumentManagement: React.FC<DocumentManagementProps> = ({ merchantId, onClose }) => {
  const [files, setFiles] = useState<{
    businessRegistration: File | null;
    idDocument: File | null;
    utilityBill: File | null;
    additionalDocs: File[];
  }>({
    businessRegistration: null,
    idDocument: null,
    utilityBill: null,
    additionalDocs: [],
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (name === 'additionalDocs' && files) {
      setFiles(prev => ({ ...prev, additionalDocs: Array.from(files) }));
    } else if (files && files[0]) {
      setFiles(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError(null);

    try {
      // Filter out null values to match Record<string, File | File[]>
      const documents: Record<string, File | File[]> = {};
      if (files.businessRegistration) {
        documents.businessRegistration = files.businessRegistration;
      }
      if (files.idDocument) {
        documents.idDocument = files.idDocument;
      }
      if (files.utilityBill) {
        documents.utilityBill = files.utilityBill;
      }
      if (files.additionalDocs.length > 0) {
        documents.additionalDocs = files.additionalDocs;
      }

      if (Object.keys(documents).length === 0) {
        throw new Error('No files selected for upload');
      }

      const response = await merchantsAPI.uploadDocuments(merchantId, documents);
      toast.success(response.data.message || 'Documents uploaded successfully');
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to upload documents';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Upload Merchant Documents</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-4">
          <Label htmlFor="businessRegistration">Business Registration</Label>
          <Input
            type="file"
            id="businessRegistration"
            name="businessRegistration"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="idDocument">ID Document</Label>
          <Input
            type="file"
            id="idDocument"
            name="idDocument"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="utilityBill">Utility Bill</Label>
          <Input
            type="file"
            id="utilityBill"
            name="utilityBill"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="additionalDocs">Additional Documents</Label>
          <Input
            type="file"
            id="additionalDocs"
            name="additionalDocs"
            accept=".jpg,.jpeg,.png,.pdf"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload Documents'}
        </Button>
      </form>
    </div>
  );
};

export default DocumentManagement;