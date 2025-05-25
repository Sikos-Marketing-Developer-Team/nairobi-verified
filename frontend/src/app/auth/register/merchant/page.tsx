'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle, FiMapPin, FiShoppingBag, FiHome, FiTag } from "react-icons/fi";

export default function MerchantRegister() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    location: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, error: authError, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/vendor/dashboard');
    }
  }, [isAuthenticated, router]);
  
  // Check backend connection on page load
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        // Try to connect to the backend health check endpoint
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Short timeout to quickly identify connection issues
          signal: AbortSignal.timeout(3000)
        });
        console.log('Backend connection successful');
      } catch (error) {
        console.error('Backend connection check failed:', error);
        setFormError(
          "Warning: Unable to connect to the backend server. Please ensure the backend is running at " + 
          (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000')
        );
      }
    };
    
    checkBackendConnection();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');

    if (!formData.companyName) {
      setFormError('Business name is required');
      return;
    }
    if (!formData.fullName) {
      setFormError('Full name is required');
      return;
    }
    if (!formData.email) {
      setFormError('Email is required');
      return;
    }
    if (!formData.phone) {
      setFormError('Phone number is required');
      return;
    }
    if (!formData.location) {
      setFormError('Business location is required');
      return;
    }
    if (!formData.password) {
      setFormError('Password is required');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }

    try {
      console.log("Attempting to register merchant user...");
      
      // Use the register function from AuthContext
      const result = await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        companyName: formData.companyName,
        location: formData.location,
        role: 'merchant',
      });
      
      if (result?.success) {
        setSuccess("Registration successful! Please check your email for verification.");
        // Redirect will be handled by the useEffect when isAuthenticated changes
      } else if (result?.error) {
        setFormError(result.error);
      }
    } catch (error) {
      // Fallback error handling
      console.error("Registration failed:", error);
      
      // Provide more helpful error message for network errors
      if (error instanceof Error) {
        if (error.message.includes('Network Error') || error.message.includes('network error')) {
          setFormError(
            "Unable to connect to the server. Please check that the backend server is running and your internet connection is working."
          );
        } else {
          setFormError(error.message);
        }
      } else {
        setFormError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <MainLayout className="bg-gray-100 py-10">
      <div className="container mx-auto px-4">
<<<<<<< Updated upstream
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Merchant Registration</h2>
              <p className="text-gray-600 mt-2">Join Nairobi Verified as a trusted merchant</p>
            </div>

            {(formError || authError) && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                <FiAlertCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-red-600 text-sm">{formError || authError}</p>
              </div>
            )}
            {success && (
              <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md flex items-start">
                <FiCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiShoppingBag className="text-gray-400" />
                  </div>
                  <input
                    id="companyName"
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Your Business Name"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="+254 123 456 789"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMapPin className="text-gray-400" />
                  </div>
                  <input
                    id="location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Nairobi, Kenya"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {showPassword ? (
                      <FiEyeOff className="text-gray-400 cursor-pointer" onClick={() => setShowPassword(false)} />
                    ) : (
                      <FiEye className="text-gray-400 cursor-pointer" onClick={() => setShowPassword(true)} />
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/signin" className="text-orange-600 hover:text-orange-500 font-medium">
                  Sign In
                </Link>
              </p>
            </div>
=======
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="md:flex">
              {/* Form Section */}
              <div className="md:w-2/3 p-6 md:p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Create Merchant Account</h2>
                  <p className="text-gray-600 mt-2">Join Nairobi Verified as a trusted merchant and grow your business</p>
                </div>
                
                {(formError || authError) && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                    <FiAlertCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-red-600 text-sm">{formError || authError}</p>
                  </div>
                )}
                
                {success && (
                  <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md flex items-start">
                    <FiCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-green-600 text-sm">{success}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  {/* Business Information */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Business Information</h3>
                    
                    <div className="mb-4">
                      <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                        Business Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiShoppingBag className="text-gray-400" />
                        </div>
                        <input
                          id="businessName"
                          type="text"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleInputChange}
                          className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Your Business Name"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
                        Business Type
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiTag className="text-gray-400" />
                        </div>
                        <select
                          id="businessType"
                          name="businessType"
                          value={formData.businessType}
                          onChange={handleInputChange}
                          className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="">Select Business Type</option>
                          {businessTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Business Location
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMapPin className="text-gray-400" />
                        </div>
                        <input
                          id="location"
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="e.g., Nairobi CBD, Westlands"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Personal Information */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Personal Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiUser className="text-gray-400" />
                          </div>
                          <input
                            id="firstName"
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="John"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiUser className="text-gray-400" />
                          </div>
                          <input
                            id="lastName"
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMail className="text-gray-400" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiPhone className="text-gray-400" />
                        </div>
                        <input
                          id="phone"
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="+254 7XX XXX XXX"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Account Security */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Account Security</h3>
                    
                    <div className="mb-4">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="text-gray-400" />
                        </div>
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <FiEyeOff className="text-gray-400 hover:text-gray-600" />
                          ) : (
                            <FiEye className="text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Password must be at least 8 characters long
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="text-gray-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Creating Account..." : "Create Merchant Account"}
                  </button>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      Already have an account?{" "}
                      <Link href="/auth/signin" className="text-orange-600 hover:text-orange-500 font-medium">
                        Sign In
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
              
              {/* Info Section */}
              <div className="md:w-1/3 bg-gradient-to-br from-orange-600 to-orange-500 text-white p-6 md:p-8 flex flex-col justify-center">
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">Why Join as a Merchant?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <FiCheckCircle className="mt-1 mr-2 flex-shrink-0" />
                      <span>Reach more customers in Nairobi</span>
                    </li>
                    <li className="flex items-start">
                      <FiCheckCircle className="mt-1 mr-2 flex-shrink-0" />
                      <span>Showcase your products to targeted buyers</span>
                    </li>
                    <li className="flex items-start">
                      <FiCheckCircle className="mt-1 mr-2 flex-shrink-0" />
                      <span>Build trust with verified merchant status</span>
                    </li>
                    <li className="flex items-start">
                      <FiCheckCircle className="mt-1 mr-2 flex-shrink-0" />
                      <span>Manage orders and inventory efficiently</span>
                    </li>
                    <li className="flex items-start">
                      <FiCheckCircle className="mt-1 mr-2 flex-shrink-0" />
                      <span>Access business analytics and insights</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-4">Need Help?</h3>
                  <p className="mb-4">
                    If you have any questions about the registration process or need assistance, please contact our support team.
                  </p>
                  <div className="flex items-center">
                    <FiPhone className="mr-2" />
                    <span>+254 700 000 000</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <FiMail className="mr-2" />
                    <span>support@nairobiverifed.com</span>
                  </div>
                </div>
              </div>
            </div>
>>>>>>> Stashed changes
          </div>
        </div>
      </div>
    </MainLayout>
  );
<<<<<<< Updated upstream
}
=======
}
>>>>>>> Stashed changes
