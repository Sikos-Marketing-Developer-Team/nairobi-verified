"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ClientRegister() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

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
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="form-box">
        <h2 className="title">Client Registration</h2>
        <p className="text-sm text-gray-600 mb-6">
          Create your account to start shopping with verified merchants.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
            <label>Full Name</label>
            <i className="bx bxs-user"></i>
          </div>

          <div className="input-box">
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

          <div className="input-box">
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

          <div className="input-box">
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

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

          <button
            type="submit"
            className="btn"
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>

          <div className="mt-4 text-center">
            <p className="text-sm">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="forgot-password"
              >
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>

      <div className="info-text">
        <h2>Welcome!</h2>
        <p>Join Nairobi Verified as a Client and enjoy shopping from verified merchants.</p>
      </div>
    </div>
  );
} 