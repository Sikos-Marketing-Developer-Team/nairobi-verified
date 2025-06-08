"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import { toast } from "react-hot-toast";
import { FaEye, FaEyeSlash, FaLock, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from "react-icons/fa";

interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
  met: boolean;
}

export default function FirstLoginPasswordChange() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const router = useRouter();

  // Password requirements
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    {
      id: "length",
      label: "At least 8 characters long",
      validator: (password) => password.length >= 8,
      met: false,
    },
    {
      id: "uppercase",
      label: "Contains at least one uppercase letter",
      validator: (password) => /[A-Z]/.test(password),
      met: false,
    },
    {
      id: "lowercase",
      label: "Contains at least one lowercase letter",
      validator: (password) => /[a-z]/.test(password),
      met: false,
    },
    {
      id: "number",
      label: "Contains at least one number",
      validator: (password) => /[0-9]/.test(password),
      met: false,
    },
    {
      id: "special",
      label: "Contains at least one special character",
      validator: (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      met: false,
    },
  ]);

  // Check if this is the user's first login
  useEffect(() => {
    const checkFirstLogin = async () => {
      try {
        const response = await apiService.auth.me();
        const user = response.data.user;
        
        // Check if this is the first login (you might need to adjust this logic based on your backend)
        if (user && user.requirePasswordChange) {
          setIsFirstLogin(true);
        } else {
          // If not first login, redirect to dashboard
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error checking first login status:", error);
        toast.error("Authentication error. Please log in again.");
        router.push("/auth/signin");
      }
    };

    checkFirstLogin();
  }, [router]);

  // Update password requirements validation
  useEffect(() => {
    setPasswordRequirements((prevRequirements) =>
      prevRequirements.map((req) => ({
        ...req,
        met: req.validator(newPassword),
      }))
    );
  }, [newPassword]);

  // Calculate password strength
  const passwordStrength = passwordRequirements.filter((req) => req.met).length;
  const getStrengthLabel = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 4) return "Medium";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordStrength < 3) {
      toast.error("Password is too weak. Please meet more requirements.");
      return;
    }

    setIsLoading(true);
    try {
      // Use the auth API endpoint for changing password
      await apiService.auth.changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully!");
      
      // Redirect to dashboard after successful password change
      setTimeout(() => {
        // Redirect based on user role
        const userRole = localStorage.getItem('userRole') || 'client';
        if (userRole === 'merchant') {
          router.push("/vendor/dashboard");
        } else if (userRole === 'admin') {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      }, 1500);
    } catch (error: any) {
      console.error("Password change error:", error);
      
      // Handle specific error messages from the backend
      const errorMessage = error.response?.data?.message || 
                          "Failed to change password. Please try again.";
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isFirstLogin) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
          <p className="text-center mt-4 text-gray-600">Checking your account status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-500 mb-4">
            <FaLock className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Change Your Password</h2>
          <p className="mt-2 text-gray-600">
            For security reasons, you need to change your temporary password before continuing.
          </p>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-6">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {newPassword && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500">Password Strength: {getStrengthLabel()}</span>
                <span className="text-xs font-medium text-gray-500">
                  {passwordStrength} / {passwordRequirements.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${getStrengthColor()}`}
                  style={{ width: `${(passwordStrength / passwordRequirements.length) * 100}%` }}
                ></div>
              </div>
              <ul className="mt-2 space-y-1">
                {passwordRequirements.map((req) => (
                  <li key={req.id} className="flex items-center text-sm">
                    {req.met ? (
                      <FaCheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <FaTimesCircle className="h-4 w-4 text-gray-300 mr-2" />
                    )}
                    <span className={req.met ? "text-gray-700" : "text-gray-500"}>
                      {req.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`appearance-none block w-full px-3 py-2 border ${
                  confirmPassword && newPassword !== confirmPassword
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="mt-1 text-sm text-red-600">Passwords don't match</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || newPassword !== confirmPassword || passwordStrength < 3}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {isLoading ? "Changing Password..." : "Change Password"}
            </button>
          </div>
        </form>

        <div className="mt-6 bg-yellow-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Important Security Notice</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Choose a strong, unique password that you don't use for other accounts. Never share your password with anyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}