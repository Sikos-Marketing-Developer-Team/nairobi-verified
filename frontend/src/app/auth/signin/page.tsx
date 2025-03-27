"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SignIn() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username: formData.username,
        password: formData.password,
      });
      const { token } = res.data;
      localStorage.setItem('token', token); // Store JWT for local auth
      router.push("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred during login");
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:5000/api/auth/google"; // Redirect to Google auth
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
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button type="submit" className="btn">Login</button>
          <div className="mt-4">
            <button type="button" onClick={handleGoogleSignIn} className="google-btn">
              <Image src="/google.svg" alt="Google logo" width={20} height={20} className="h-5 w-5" />
              Sign in with Google
            </button>
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