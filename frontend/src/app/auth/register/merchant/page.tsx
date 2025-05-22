"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle, FiMapPin, FiShoppingBag } from "react-icons/fi";
// (feat: Implement authentication and cart context providers)

export default function MerchantRegister() {
  const [formData, setFormData] = useState({
    businessName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    businessType: "",
    location: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, error: authError, isAuthenticated } = useAuth();
  const router = useRouter();

  const businessTypes = [
    "Retail Store",
    "Restaurant",
    "Electronics",
    "Fashion",
    "Grocery",
    "Beauty & Health",
    "Home & Garden",
    "Other"
  ];

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/merchant/profile');
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    if (!formData.businessName) {
      setFormError("Business name is required");
      return;
    }

    if (!formData.firstName || !formData.lastName) {
      setFormError("First name and last name are required");
      return;
    }

    if (!formData.email) {
      setFormError("Email is required");
      return;
    }

    if (!formData.phone) {
      setFormError("Phone number is required");
      return;
    }

    if (!formData.businessType) {
      setFormError("Business type is required");
      return;
    }

    if (!formData.location) {
      setFormError("Business location is required");
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register/merchant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fullName: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          companyName: formData.businessName,
          location: formData.location
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess("Registration successful! Please check your email for verification.");
      router.push("/auth/verify-email");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = () => {
    router.push("/auth/signin");
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4">
      <div className="wrapper merchant-registration-form max-w-4xl mx-auto">
        <div className="form-box merchant">
          <h2 className="title animation" style={{ "--i": 17, "--j": 0 } as any}>Merchant Registration</h2>
          <p className="p text-sm mb-6 animation" style={{ "--i": 18, "--j": 1 } as any}>
            Join Nairobi Verified as a trusted merchant
          </p>
          <form onSubmit={handleSubmit}>
            <div className="input-box animation" style={{ "--i": 19, "--j": 2 } as any}>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                required
              />
              <label>Business Name</label>
              <i className="bx bxs-store"></i>
            </div>
            <div className="input-box animation" style={{ "--i": 20, "--j": 3 } as any}>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                required
              />
              <label>Owner Name</label>
              <i className="bx bxs-user"></i>
            </div>
            <div className="input-box animation" style={{ "--i": 21, "--j": 4 } as any}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <label>Email Address</label>
              <i className="bx bxs-envelope"></i>
            </div>
            <div className="input-box animation" style={{ "--i": 22, "--j": 5 } as any}>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
              <label>Phone Number</label>
              <i className="bx bxs-phone"></i>
            </div>
            <div className="input-box animation" style={{ "--i": 23, "--j": 6 } as any}>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              >
                <option value="">Select Business Type</option>
                {businessTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <i className="bx bxs-category"></i>
            </div>
            <div className="input-box animation" style={{ "--i": 24, "--j": 7 } as any}>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
              <label>Business Location</label>
              <i className="bx bxs-map"></i>
            </div>
            <div className="input-box animation" style={{ "--i": 25, "--j": 8 } as any}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <label>Password</label>
              <i className={`bx ${showPassword ? 'bxs-show' : 'bxs-hide'} cursor-pointer`} 
                 onClick={() => setShowPassword(!showPassword)}></i>
            </div>
            <div className="input-box animation" style={{ "--i": 26, "--j": 9 } as any}>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              <label>Confirm Password</label>
              <i className="bx bxs-lock-alt"></i>
            </div>
            {error && <p className="text-red-500 text-sm mb-4 animation" style={{ "--i": 27, "--j": 10 } as any}>{error}</p>}
            {success && <p className="text-green-500 text-sm mb-4 animation" style={{ "--i": 27, "--j": 10 } as any}>{success}</p>}
            <button
              type="submit"
              className="btn animation"
              style={{ "--i": 28, "--j": 11 } as any}
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
            <div className="mt-6 text-center animation" style={{ "--i": 29, "--j": 12 } as any}>
              <p className="text-sm">
                <span className="text-black"> Already have an account?{" "}</span>
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="forgot-password"
                  title="login"
                >
                  Login
                </button>
              </p>
            </div>
          </form>
        </div>
        <div className="info-text merchant">
          <h2 className="animation well" style={{ "--i": 0, "--j": 17 } as any}>Welcome!</h2>
          <hr className="my-4"/>
          <p className="animation wel" style={{ "--i": 1, "--j": 18 } as any}>Join Nairobi Verified as a trusted merchant and grow your business.</p>
        </div>
      </div>
    </div>
      // Register the merchant
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: 'merchant',
        // Additional merchant data will be handled in the merchant profile setup
      });
      
      setSuccess("Registration successful! Redirecting to complete your profile...");
      
      // Redirect will be handled by the useEffect when isAuthenticated changes
    } catch (error) {
      // Error is handled by the auth context
      console.error("Registration failed:", error);
    }
  };

  return (
    <MainLayout className="bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Create Merchant Account</h2>
              <p className="text-gray-600 mt-2">Join Nairobi Verified as a trusted vendor</p>
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
                    placeholder="business@example.com"
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
              
              <div className="mb-4">
                <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiShoppingBag className="text-gray-400" />
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
                    placeholder="e.g., Moi Avenue, Nairobi CBD"
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
              
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  By registering, you agree to our{" "}
                  <Link href="/terms" className="text-orange-600 hover:text-orange-500">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-orange-600 hover:text-orange-500">
                    Privacy Policy
                  </Link>
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create Merchant Account"}
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