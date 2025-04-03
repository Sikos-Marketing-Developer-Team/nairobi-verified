"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";

export default function LandingPage() {
  const [isActive, setIsActive] = useState(false);
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
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
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", loginData);
      localStorage.setItem('token', res.data.token);
      router.push("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      localStorage.setItem('token', res.data.token);
      setSuccess("Registration successful! Redirecting to sign in...");
      setTimeout(() => router.push("/auth/signin"), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="wrapper">
      <div className={`form-box ${isActive ? 'active' : ''}`}>
        {!isActive ? (
          <>
            <h2 className="title animation" style={{ "--i": 0, "--j": 21 } as any}>Sign Up</h2>
            <form onSubmit={handleSignup}>
              <div className="input-box animation" style={{ "--i": 1, "--j": 22 } as any}>
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
              <div className="input-box animation" style={{ "--i": 2, "--j": 23 } as any}>
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
              <div className="input-box animation" style={{ "--i": 3, "--j": 24 } as any}>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
                <label>Phone</label>
                <i className="bx bxs-phone"></i>
              </div>
              <div className="input-box animation" style={{ "--i": 4, "--j": 25 } as any}>
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
              <div className="input-box animation" style={{ "--i": 5, "--j": 26 } as any}>
                <input
                  type="password"
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
                className="btn animation"
                style={{ "--i": 6, "--j": 27 } as any}
                disabled={isLoading}
              >
                {isLoading ? "Signing Up..." : "Sign Up"}
              </button>
              <div className="mt-4 animation" style={{ "--i": 7, "--j": 28 } as any}>
                <button type="button" onClick={handleGoogleSignUp} className="google-btn">
                  <Image src="/google.svg" alt="Google logo" width={20} height={20} className="h-5 w-5" />
                  Sign Up with Google
                </button>
              </div>
              <div className="linkTxt animation" style={{ "--i": 8, "--j": 29 } as any}>
                <p>
                  Already have an account?{" "}
                  <button onClick={() => setIsActive(true)} className="login-link">Sign In</button>
                </p>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 className="title animation" style={{ "--i": 0, "--j": 21 } as any}>Sign In</h2>
            <form onSubmit={handleLogin}>
              <div className="input-box animation" style={{ "--i": 1, "--j": 22 } as any}>
                <input
                  type="text"
                  name="username"
                  value={loginData.username}
                  onChange={handleLoginChange}
                  required
                />
                <label>Username or Email</label>
                <i className="bx bxs-user"></i>
              </div>
              <div className="input-box animation" style={{ "--i": 2, "--j": 23 } as any}>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
                <label>Password</label>
                <i className="bx bxs-lock-alt"></i>
              </div>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <button
                type="submit"
                className="btn animation"
                style={{ "--i": 3, "--j": 24 } as any}
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
              <div className="mt-4 animation" style={{ "--i": 4, "--j": 25 } as any}>
                <button type="button" onClick={handleGoogleSignUp} className="google-btn">
                  <Image src="/google.svg" alt="Google logo" width={20} height={20} className="h-5 w-5" />
                  Sign In with Google
                </button>
              </div>
              <div className="linkTxt animation" style={{ "--i": 5, "--j": 26 } as any}>
                <p>
                  Don’t have an account?{" "}
                  <button onClick={() => setIsActive(false)} className="login-link">Sign Up</button>
                </p>
              </div>
            </form>
          </>
        )}
      </div>

      <div className={`info-text ${isActive ? 'active' : ''}`}>
        <h2 className="animation" style={{ "--i": 0, "--j": 20 } as any}>Welcome Back!</h2>
        <p className="animation" style={{ "--i": 1, "--j": 21 } as any}>Nairobi Verified, where Security is ensured.</p>
      </div>
    </div>
  );
}