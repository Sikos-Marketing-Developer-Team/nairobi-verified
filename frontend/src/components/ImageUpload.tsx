import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import Image from 'next/image';
import { FiUpload, FiX } from 'react-icons/fi';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  folder?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  folder,
  className = '',
}) => {
  const [mounted, setMounted] = useState(false);
  const { upload, isUploading, error } = useMediaUpload();

  useEffect(() => {
    setMounted(true);
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        const file = acceptedFiles[0];
        const result = await upload(file, {
          folder,
          onSuccess: (data) => {
            onChange(data.url);
          },
        });
      } catch (error) {
        console.error('Upload error:', error);
      }
    },
    [upload, onChange, folder]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });

  if (!mounted) {
    return null; // Return null on server-side and first render
  }

  return (
    <div className={`relative ${className}`}>
      {value ? (
        <div className="relative group">
          <div className="relative w-[300px] h-[300px]">
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="rounded-lg object-cover"
              sizes="(max-width: 300px) 100vw, 300px"
            />
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-500'}
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <FiUpload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            {isDragActive
              ? 'Drop the image here'
              : 'Drag and drop an image, or click to select'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supports: JPEG, PNG, GIF, WebP (max 5MB)
          </p>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          {isUploading && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="bg-orange-500 h-1 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 