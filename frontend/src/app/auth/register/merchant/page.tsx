"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MerchantRegister() {
  const [isActive, setIsActive] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    businessType: "",
    location: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      setTimeout(() => {
        router.push("/auth/verify-email");
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = () => {
    setIsActive(true);
    setTimeout(() => {
      router.push("/auth/signin");
    }, 400);
  };

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
  );
}