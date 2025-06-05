"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { 
  FiArrowLeft, FiLock, FiCheck, FiInfo, FiEye, FiEyeOff
} from 'react-icons/fi';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Password visibility state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: ''
  });
  
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
    
    // Check password strength if new password field
    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }
    
    // Clear success message when user makes changes
    if (successMessage) {
      setSuccessMessage(null);
    }
  };
  
  // Check password strength
  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength({ score: 0, feedback: '' });
      return;
    }
    
    let score = 0;
    let feedback = '';
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Provide feedback based on score
    if (score < 3) {
      feedback = 'Weak password. Try adding numbers, symbols, and mixed case letters.';
    } else if (score < 5) {
      feedback = 'Moderate password. For better security, make it longer and more complex.';
    } else {
      feedback = 'Strong password!';
    }
    
    // Normalize score to 0-3 range
    const normalizedScore = Math.min(Math.floor(score / 2), 3);
    
    setPasswordStrength({ score: normalizedScore, feedback });
  };
  
  // Get password strength color
  const getStrengthColor = () => {
    switch (passwordStrength.score) {
      case 0: return 'bg-gray-200 dark:bg-gray-700';
      case 1: return 'bg-red-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-green-500';
      default: return 'bg-gray-200 dark:bg-gray-700';
    }
  };
  
  // Get password strength label
  const getStrengthLabel = () => {
    switch (passwordStrength.score) {
      case 0: return '';
      case 1: return 'Weak';
      case 2: return 'Moderate';
      case 3: return 'Strong';
      default: return '';
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    if (field === 'current') setShowCurrentPassword(!showCurrentPassword);
    if (field === 'new') setShowNewPassword(!showNewPassword);
    if (field === 'confirm') setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Validate form
  const validateForm = () => {
    let valid = true;
    const newErrors = { ...formErrors };
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
      valid = false;
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
      valid = false;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
      valid = false;
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
      valid = false;
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
      valid = false;
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Replace with actual API call when backend is ready
      // const response = await fetch('/api/user/change-password', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     currentPassword: formData.currentPassword,
      //     newPassword: formData.newPassword
      //   })
      // });
      // const data = await response.json();
      // if (!response.ok) {
      //   throw new Error(data.message || 'Failed to change password');
      // }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setPasswordStrength({ score: 0, feedback: '' });
      setSuccessMessage('Password changed successfully');
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-[150px]">
        <div className="mb-6">
          <Link href="/account/edit-profile" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400">
            <FiArrowLeft className="mr-2" />
            Back to Edit Profile
          </Link>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Change Password</h1>
            
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
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mb-6">
              <div className="flex items-start">
                <FiInfo className="text-blue-500 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-blue-800 dark:text-blue-300 font-medium mb-1">Password Security Tips</h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 list-disc list-inside space-y-1">
                    <li>Use at least 8 characters, ideally 12 or more</li>
                    <li>Include a mix of uppercase and lowercase letters</li>
                    <li>Add numbers and special characters</li>
                    <li>Avoid using personal information or common words</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiLock className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      formErrors.currentPassword ? 'border-red-500 dark:border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {formErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.currentPassword}</p>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiLock className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      formErrors.newPassword ? 'border-red-500 dark:border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {formErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.newPassword}</p>
                )}
                
                {/* Password strength meter */}
                {formData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center mb-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getStrengthColor()}`} 
                          style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                        {getStrengthLabel()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {passwordStrength.feedback}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiLock className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      formErrors.confirmPassword ? 'border-red-500 dark:border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.confirmPassword}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-4">
                <Link href="/account/edit-profile">
                  <button type="button" className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Cancel
                  </button>
                </Link>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md flex items-center ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FiCheck className="mr-2" />
                      Change Password
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