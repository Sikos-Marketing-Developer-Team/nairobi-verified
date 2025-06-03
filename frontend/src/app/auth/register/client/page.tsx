"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
// (feat: Implement authentication and cart context providers)

export default function ClientRegister() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, error: authError, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccess("");

    // Basic validation
    if (!formData.firstName || !formData.lastName) {
      setFormError("First name and last name are required");
      return;
    }

    if (!formData.email) {
      setFormError("Email is required");
      return;
    }

    if (!formData.password) {
      setFormError("Password is required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setFormError("Password must be at least 8 characters long");
      return;
    }

    try {
      console.log("Attempting to register client user...");
      
      // Use the register function from AuthContext
      const result = await register({
        email: formData.email,
        password: formData.password,
        fullName: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        role: 'client'
      });
      
      // The register function will handle the redirect
      setSuccess("Registration successful!");
      // Redirect will be handled by the AuthContext
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
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Create Client Account</h2>
              <p className="text-gray-600 mt-2">Join Nairobi Verified to shop from verified vendors</p>
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
                  Phone Number (Optional)
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
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-orange-600 hover:text-orange-500 font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
// (feat: Implement authentication and cart context providers)
  );
}