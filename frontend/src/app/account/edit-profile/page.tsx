"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { 
  FiArrowLeft, FiUser, FiMail, FiPhone, FiCamera, FiCheck, FiLock
} from 'react-icons/fi';

// Mock user data - will be replaced with API call
const mockUser = {
  _id: '1',
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '0712345678',
  avatar: null,
  createdAt: '2023-01-15T12:00:00.000Z'
};

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState(mockUser);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  
  // Avatar state
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  // Form validation
  const [formErrors, setFormErrors] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Replace with actual API call when backend is ready
        // const response = await fetch('/api/auth/me');
        // const data = await response.json();
        // setUser(data.user);
        // setFormData({
        //   fullName: data.user.fullName,
        //   email: data.user.email,
        //   phone: data.user.phone || ''
        // });
        // setAvatar(data.user.avatar);
        
        // Using mock data for now
        setTimeout(() => {
          setUser(mockUser);
          setFormData({
            fullName: mockUser.fullName,
            email: mockUser.email,
            phone: mockUser.phone || ''
          });
          setAvatar(mockUser.avatar);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Failed to load user data');
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear success message when user makes changes
    if (successMessage) {
      setSuccessMessage(null);
    }
  };
  
  // Handle avatar click
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle avatar change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should not exceed 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      setAvatarFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      // Clear success message when user makes changes
      if (successMessage) {
        setSuccessMessage(null);
      }
    }
  };
  
  // Validate form
  const validateForm = () => {
    let valid = true;
    const newErrors = { ...formErrors };
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      valid = false;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }
    
    if (formData.phone && !/^(?:\+254|0)[17]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Kenyan phone number';
      valid = false;
    }
    
    setFormErrors(newErrors);
    return valid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Replace with actual API call when backend is ready
      // First, upload avatar if changed
      // let avatarUrl = user.avatar;
      // if (avatarFile) {
      //   const formData = new FormData();
      //   formData.append('avatar', avatarFile);
      //   const avatarResponse = await fetch('/api/user/avatar', {
      //     method: 'POST',
      //     body: formData
      //   });
      //   const avatarData = await avatarResponse.json();
      //   avatarUrl = avatarData.avatarUrl;
      // }
      
      // Then update profile
      // const response = await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     fullName: formData.fullName,
      //     email: formData.email,
      //     phone: formData.phone,
      //     avatar: avatarUrl
      //   })
      // });
      // const data = await response.json();
      // if (!response.ok) {
      //   throw new Error(data.message || 'Failed to update profile');
      // }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setUser({
        ...user,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        avatar: avatar
      });
      
      setSuccessMessage('Profile updated successfully');
      setSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8 mt-[150px]">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-[150px]">
        <div className="mb-6">
          <Link href="/account" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400">
            <FiArrowLeft className="mr-2" />
            Back to Account
          </Link>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h1>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-md">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-md">
                <p className="text-green-600 dark:text-green-400">{successMessage}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Avatar */}
              <div className="mb-6 flex flex-col items-center">
                <div 
                  className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 cursor-pointer group"
                  onClick={handleAvatarClick}
                >
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt={formData.fullName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-orange-100 dark:bg-orange-900 text-orange-500 dark:text-orange-300 text-4xl font-bold">
                      {formData.fullName.charAt(0)}
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiCamera className="text-white text-xl" />
                  </div>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Click to change profile picture
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiUser className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      formErrors.fullName ? 'border-red-500 dark:border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                {formErrors.fullName && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.fullName}</p>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiMail className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      formErrors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiPhone className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full pl-10 px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      formErrors.phone ? 'border-red-500 dark:border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0712 345 678"
                  />
                </div>
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Format: 07XX XXX XXX or +254 7XX XXX XXX
                </p>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <Link href="/account/change-password" className="text-sm text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 flex items-center">
                  <FiLock className="mr-1" />
                  Change Password
                </Link>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Link href="/account">
                  <button type="button" className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Cancel
                  </button>
                </Link>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md flex items-center ${
                    submitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheck className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}