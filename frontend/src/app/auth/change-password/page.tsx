"use client";

import FirstLoginPasswordChange from "@/components/auth/FirstLoginPasswordChange";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function ChangePasswordPage() {
  const [loading, setLoading] = useState(true);
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await apiService.auth.me();
        const user = response.data.user;
        
        if (!user) {
          // Not authenticated, redirect to login
          router.push("/auth/signin");
          return;
        }
        
        // Check if password change is required
        setRequirePasswordChange(!!user.requirePasswordChange);
        setLoading(false);
        
        // If password change is not required, redirect to dashboard
        if (!user.requirePasswordChange) {
          toast.error("Password change not required");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        toast.error("Authentication error. Please log in again.");
        router.push("/auth/signin");
      }
    };

    checkAuthStatus();
  }, [router]);

  if (loading) {
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

  return <FirstLoginPasswordChange />;
}