"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignIn() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Check for superadmin credentials
    if (formData.username === "admin" && formData.password === "admin123") {
      router.push("/admin/dashboard");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setSuccess("Login successful!");
      setTimeout(() => {
        // Redirect based on user role
        if (data.user.role === "merchant") {
          router.push("/merchant/profile");
        } else {
          router.push("/dashboard");
        }
      }, 1000);
    } catch (error) {
      setError((error as any).response?.data?.message || "An error occurred during login");
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "/api/auth/google";
  };

  const handleRegisterClick = () => {
    setIsActive(true);
    setTimeout(() => {
      router.push("/");
    }, 600); // Wait for animation to complete
  };

  return (
    <div className="wrapper">
      <div className={`form-box ${isActive ? 'active' : ''}`}>
        <h2 className="title">Welcome Back</h2>
        <p className="text-sm text-gray-600 mb-6">
          Sign in to your account to continue
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-box">
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

          <div className="input-box">
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

          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Remember me</span>
            </label>
            <Link
              href="/auth/forgot-password"
              className="forgot-password"
            >
              Forgot Password?
            </Link>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

          <button
            type="submit"
            className="btn"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="google-btn"
          >
            <i className="bx bxl-google"></i>
            Continue with Google
          </button>

          <div className="mt-4 text-center">
            <p className="text-sm">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={handleRegisterClick}
                className="forgot-password"
              >
                Register
              </button>
            </p>
          </div>
        </form>

        <div className="linkTxt animation" style={{ "--i": 5, "--j": 25 } as any}>
            <p>Don't have an account? <a href="/auth/signup" className="register-link" >Sign Up</a></p>
          </div>

      </div>

      <div className={`info-text ${isActive ? 'active' : ''}`}>
        <h2>Welcome!</h2>
        <p>Nairobi Verified, where Security is ensured.</p>
      </div>
    </div>
  );
}