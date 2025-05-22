"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { FiUser, FiLock, FiAlertCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
// (feat: Implement authentication and cart context providers)

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [formError, setFormError] = useState("");
  const { login, isLoading, error: authError, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, router, redirectPath]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          rememberMe: formData.rememberMe,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (!data.user?.role) {
        throw new Error("User role not found in response");
      }

      // Redirect based on role
      const redirectUrl = data.user.role === "merchant" ? "/vendor/profile" : "/dashboard";
      router.push(redirectUrl);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    setFormError("");
    
    // Basic validation
    if (!formData.email) {
      setFormError("Email is required");
      return;
    }
    
    if (!formData.password) {
      setFormError("Password is required");
      return;
    }
    
    try {
      await login({
        email: formData.email,
        password: formData.password
      });
      // No need to redirect here as the useEffect will handle it
    } catch (error) {
      // Error is handled by the auth context
      console.error("Login failed:", error);
// (feat: Implement authentication and cart context providers)
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`;
  };

  const handleRegisterClick = (type: "client" | "merchant") => {
    router.push(`/auth/register/${type}`);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="wrapper sign-in-form max-w-4xl mx-auto">
        <div className="form-box">
          <h2 className="title animation" style={{ "--i": 17, "--j": 0 } as any}>
            Sign In
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="input-box animation" style={{ "--i": 18, "--j": 1 } as any}>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
              <label>Username or Email</label>
              <i className="bx bxs-user"></i>
            </div>
            <div className="input-box animation" style={{ "--i": 19, "--j": 2 } as any}>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <label>Password</label>
              <i className="bx bxs-lock-alt"></i>
            </div>
            <div className="remember-forgot animation" style={{ "--i": 20, "--j": 3 } as any}>
              <label>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => router.push("/auth/forgot-password")}
                className="forgot-password"
              >
                Forgot Password?
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-sm mb-4 animation" style={{ "--i": 21, "--j": 4 } as any}>
                {error}
              </p>
            )}
            <button
              type="submit"
              className="btn animation"
              style={{ "--i": 22, "--j": 5 } as any}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
            <div className="divider animation" style={{ "--i": 23, "--j": 6 } as any}>
              <span>or</span>
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="google-btn animation"
              style={{ "--i": 24, "--j": 7 } as any}
            >
              <i className="bx bxl-google"></i>
              Continue with Google
            </button>
            <div className="register-link animation" style={{ "--i": 25, "--j": 8 } as any}>
              <p>
                <span>Don't have an account?</span>
                <br />
                Register as
                <button
                  type="button"
                  onClick={() => handleRegisterClick("client")}
                  className="register-btn"
                  title="Client"
                >
                  Client
                </button>
                {" or "}
                <button
                  type="button"
                  onClick={() => handleRegisterClick("merchant")}
                  className="register-btn"
                  title="Merchant"
                >
                  Merchant
                </button>
              </p>
            </div>
          </form>
        </div>
        <div className="info-text">
          <h2 className="animation well" style={{ "--i": 0, "--j": 17 } as any}>
            Welcome Back!
          </h2>
          <hr className="my-4" />
          <p className="animation wel" style={{ "--i": 1, "--j": 18 } as any}>
            Sign in to access your account and continue your journey with us.
          </p>
        </div>
      </div>
    </div>
)
    // Redirect to Google OAuth endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`;
  };

  return (
    <MainLayout className="bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
              <p className="text-gray-600 mt-2">Welcome back! Please sign in to your account</p>
            </div>
            
            {(formError || authError) && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                <FiAlertCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-red-600 text-sm">{formError || authError}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-orange-600 hover:text-orange-500"
                >
                  Forgot password?
                </Link>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
              
              <div className="mt-6 flex items-center justify-center">
                <div className="border-t border-gray-300 flex-grow mr-3"></div>
                <span className="text-sm text-gray-500">Or continue with</span>
                <div className="border-t border-gray-300 flex-grow ml-3"></div>
              </div>
              
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="mt-4 w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <FcGoogle className="h-5 w-5 mr-2" />
                Google
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/auth/register/client" className="text-orange-600 hover:text-orange-500 font-medium">
                  Register as Client
                </Link>
                {" or "}
                <Link href="/auth/register/merchant" className="text-orange-600 hover:text-orange-500 font-medium">
                  Register as Merchant
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