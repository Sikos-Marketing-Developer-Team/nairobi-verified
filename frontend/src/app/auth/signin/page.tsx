"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      // Try to sign in with email/password
      const result = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials");
        return;
      }

      // Successful login
      router.push("/dashboard"); // Redirect to dashboard or home page
    } catch (error) {
      setError("An error occurred during login");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn("google", {
        callbackUrl: "/dashboard", // Redirect to dashboard after Google sign-in
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

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button type="submit" className="btn">
            Login
          </button>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="google-btn"
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
        </form>
      </div>

      <div className="info-text login">
        <h2>Welcome Back!</h2>
        <p>Nairobi Verified, where Security is ensured.</p>
      </div>

      {/* Registration form commented out
      <div className={`form-box register ${isActive ? 'active' : ''}`}>
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

          <button type="submit" className="btn">
            Sign Up
          </button>

          <div className="linkTxt">
            <p>Already have an account? <a href="#" className="login-link" onClick={(e) => { e.preventDefault(); setIsActive(false); }}>Login</a></p>
          </div>
        </form>
      </div>

      <div className={`info-text register ${isActive ? 'active' : ''}`}>
        <h2>Welcome Back!</h2>
        <p>Nairobi Verified, where Security is ensured.</p>
      </div>
      */}
    </div>
  );
} 