"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
  const [isActive, setIsActive] = useState(false);
  const [selectedType, setSelectedType] = useState<"client" | "merchant" | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem('token', data.token);
      router.push("/dashboard");
    } catch (error: unknown) {
      setError((error as any).response?.data?.message || "Login failed");
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/auth/register/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess("Registration successful! Please check your email for verification.");
      setTimeout(() => router.push("/auth/signin"), 3000);
    } catch (error) {
      setError((error as any).response?.data?.message || "Signup failed");
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = "/api/auth/google";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await handleSignup(e as any);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientClick = () => {
    setSelectedType("client");
    router.push("/auth/register/client");
  };

  const handleMerchantClick = () => {
    setSelectedType("merchant");
    router.push("/auth/register/merchant");
  };

  const handleSignInClick = () => {
    setIsActive(true);
    setTimeout(() => {
      router.push("/auth/signin");
    }, 400);
  };

  return (
    <div className="wrapper">
      <div className={`form-box ${isActive ? 'active' : ''}`}>
        <h2 className="title animation" style={{ "--i": 0, "--j": 21 } as any}>Choose Account Type</h2>
        <p className="text-sm text-gray-600 mb-6 animation" style={{ "--i": 1, "--j": 22 } as any}>
          Select your account type to get started
        </p>

        <div className="account-type-buttons">
          <button
            onClick={handleClientClick}
            className="account-type-btn client animation"
            style={{ "--i": 2, "--j": 23 } as any}
          >
            Register as Client
          </button>
          <button
            onClick={handleMerchantClick}
            className="account-type-btn merchant animation"
            style={{ "--i": 3, "--j": 24 } as any}
          >
            Register as Merchant
          </button>
        </div>

        <div className="linkTxt animation" style={{ "--i": 4, "--j": 25 } as any}>
          <p>Already have an account? <button onClick={handleSignInClick} className="login-link">Sign In</button></p>
        </div>
      </div>

      <div className={`info-text ${isActive ? 'active' : ''}`}>
        <h2 className="animation" style={{ "--i": 0, "--j": 20 } as any}>Welcome Back!</h2>
        <p className="animation" style={{ "--i": 1, "--j": 21 } as any}>Nairobi Verified, where Security is ensured.</p>
      </div>
    </div>
  );
}