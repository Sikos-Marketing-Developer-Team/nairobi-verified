"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MerchantRegister() {
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    location: "",
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
      const response = await fetch("/api/auth/register/merchant", {
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
        <h2 className="title">Merchant Registration</h2>
        <p className="text-sm text-gray-600 mb-6">
          Please provide your company details to register as a merchant.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              required
            />
            <label>Company Name</label>
            <i className="bx bxs-building"></i>
          </div>

          <div className="input-box">
            <input
              type="email"
              name="companyEmail"
              value={formData.companyEmail}
              onChange={handleInputChange}
              required
            />
            <label>Company Email</label>
            <i className="bx bxs-envelope"></i>
          </div>

          <div className="input-box">
            <input
              type="tel"
              name="companyPhone"
              value={formData.companyPhone}
              onChange={handleInputChange}
              required
            />
            <label>Company Phone Number</label>
            <i className="bx bxs-phone"></i>
          </div>

          <div className="input-box">
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
            />
            <label>Company Location</label>
            <i className="bx bxs-map"></i>
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
        <p>Join Nairobi Verified as a Merchant and showcase your products to our verified customers.</p>
      </div>
    </div>
  );
} 