"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUser,
  faStore,
  faHeart,
  faShoppingCart,
  faPhone,
  faBolt,
  faChevronDown,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

export default function JoinPlatform() {
  const [isActive, setIsActive] = useState(false);
  const [selectedType, setSelectedType] = useState<"client" | "merchant" | null>(null);
  const router = useRouter();

  const handleAccountTypeSelect = (type: "client" | "merchant") => {
    setSelectedType(type);
    setIsActive(true);
  };

  const handleBack = () => {
    setIsActive(false);
    setSelectedType(null);
  };

  return (
    <div className="wrapper join-platform">
      <div className={`form-box ${isActive ? 'active' : ''}`}>
        {/* Would Look best with a logo at the top (Logo with a clear background) */}
        {!isActive ? (
          <div className="account-type-buttons">
            <h4 className="title">Choose Account Type</h4>
            <p className="p text-gray-600 mb-6">
              Select your account type to get started
            </p>
            <button
              type="button"
              className="account-type-btn"
              onClick={() => handleAccountTypeSelect("client")}
            >
             <span className="personna p-2">
             <FontAwesomeIcon icon={faUser} style={{ color: "#EC5C0B"}} /></span> Register as Client
            </button>
            <button
              type="button"
              className="account-type-btn merchant"
              onClick={() => handleAccountTypeSelect("merchant")}
            >
              <span className="personna p-2">
             <FontAwesomeIcon icon={faStore} style={{ color: "#000000"}} />
             </span> Register as Merchant
            </button>
          </div>
        ) : (
          <div className="registration-form">
            <button
              type="button"
              onClick={handleBack}
              className="text-sm text-gray-600 hover:text-gray-800 mb-4 flex items-center"
            >
              <i className="bx bx-arrow-back mr-1"></i>
              Back
            </button>
            {selectedType === "client" ? (
              <ClientRegisterForm onSuccess={() => router.push("/auth/signin")} />
            ) : (
              <MerchantRegisterForm onSuccess={() => router.push("/auth/signin")} />
            )}
          </div>
        )}
      </div>

      <div className={`info-text ${isActive ? 'active' : ''}`}>
        <h2 className="well">Welcome !</h2>
        <hr className="my-4" />
        <p className="wel">Nairobi Verified, where Security is ensured.</p>
      </div>
    </div>
  );
}

function ClientRegisterForm({ onSuccess }: { onSuccess: () => void }) {
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
      setTimeout(onSuccess, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = "/api/auth/google";
  };

  return (
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

      <div className="divider">
        <span>or</span>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignUp}
        className="google-btn"
      >
        <i className="bx bxl-google"></i>
        Sign up with Google
      </button>

      <div className="mt-4 text-center">
        <p className="text-sm">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/signin")}
            className="forgot-password"
          >
            Login
          </button>
        </p>
      </div>
    </form>
  );
}

function MerchantRegisterForm({ onSuccess }: { onSuccess: () => void }) {
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
      setTimeout(onSuccess, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
          <button
            type="button"
            onClick={() => router.push("/auth/signin")}
            className="forgot-password"
          >
            Login
          </button>
        </p>
      </div>
    </form>
  );
}