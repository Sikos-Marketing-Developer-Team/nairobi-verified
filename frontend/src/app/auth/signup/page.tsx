"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isActive, setIsActive] = useState(true); // Controls UI switching between login/signup
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle sign-up
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to register. Try again.");
      }

      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => setIsActive(false), 2000); // Switch to login UI

      // Automatically sign in after signup
      await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: true,
        callbackUrl: "/dashboard",
      });
    } catch (error) {
      setError((error as Error).message || "Something went wrong.");
    }
  };

  return (
    <div>
      <div className={`form-box register ${isActive ? "active" : ""}`}>
        <h2 className="title">Sign Up</h2>
        <form onSubmit={handleRegister}>
          <div className="input-box">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
            <label>Username</label>
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
            <label>Email</label>
            <i className="bx bxs-envelope"></i>
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

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <button type="submit" className="btn">
            Sign Up
          </button>

          <div className="linkTxt">
            <p>
              Already have an account?{" "}
              <a
                href="#"
                className="login-link"
                onClick={(e) => {
                  e.preventDefault();
                  setIsActive(false);
                }}
              >
                Login
              </a>
            </p>
          </div>
        </form>
      </div>

      <div className={`info-text register ${isActive ? "active" : ""}`}>
        <h2>Welcome!</h2>
        <p>Join Nairobi Verified, where security is ensured.</p>
      </div>
    </div>
  );
}
