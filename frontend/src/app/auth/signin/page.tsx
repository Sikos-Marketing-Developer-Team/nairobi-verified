"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignIn() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    
    try {
      const result = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        rememberMe: formData.rememberMe,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      setSuccess("Login successful! Redirecting...");
      router.push("/dashboard");
    } catch (error) {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch (error) {
      setError("An error occurred during Google sign-in");
    }
  };

  return (
    <div className="wrapper">
      <div className="form-box login">
        <h2 className="title">Login</h2>
        <form onSubmit={handleLogin}>
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
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required 
            />
            <label>Password</label>
            <i className="bx bxs-lock-alt"></i>
          </div>

          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="mr-2"
              />
              Remember me
            </label>
            <Link 
              href="/auth/forgot-password"
              className="text-sm text-primary hover:text-primary-dark"
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
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="google-btn"
              disabled={isLoading}
            >
              <Image
                src="/google.svg"
                alt="Google logo"
                width={20}
                height={20}
                className="h-5 w-5"
              />
              Sign in with Google
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm">
              Don't have an account?{" "}
              <Link 
                href="/auth/register"
                className="text-primary hover:text-primary-dark"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>

      <div className="info-text login">
        <h2>Welcome Back!</h2>
        <p>Nairobi Verified, where Security is ensured.</p>
      </div>
    </div>
  );
} 