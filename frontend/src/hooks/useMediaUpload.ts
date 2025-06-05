import { useState } from 'react';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface UploadOptions {
  folder?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export const useMediaUpload = () => {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const upload = async (file: File, options: UploadOptions = {}) => {
    try {
      setState({
        isUploading: true,
        progress: 0,
        error: null,
      });

      const result = await apiService.media.upload(file, options.folder);

      setState({
        isUploading: false,
        progress: 100,
        error: null,
      });

      options.onSuccess?.(result.data);
      toast.success('File uploaded successfully');
      return result.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to upload file';
      setState({
        isUploading: false,
        progress: 0,
        error: errorMessage,
      });
      options.onError?.(error);
      toast.error(errorMessage);
      throw error;
    }
  };

  const deleteMedia = async (publicId: string) => {
    try {
      await apiService.media.delete(publicId);
      toast.success('File deleted successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete file';
      toast.error(errorMessage);
      throw error;
    }
  };

  return {
    ...state,
    upload,
    deleteMedia,
  };
}; 