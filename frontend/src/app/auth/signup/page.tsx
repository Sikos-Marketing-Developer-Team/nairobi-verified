"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
// import MainLayout from "@/components/MainLayout";

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
  
    try {
      // For development/demo purposes - simulate successful registration
      // In production, uncomment the actual API call
      
      // Send registration request to backend
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signup`, formData);
  
      if (res.status === 201) {
        // Extract token from response
        const { token } = res.data;
  
        // Store token in localStorage (or use cookies for better security)
        localStorage.setItem("token", token);
  
        // Redirect to dashboard after successful signup
        router.push("/dashboard");
      }
      
      
      // Demo mode - create a mock token
      localStorage.setItem("token", "signup-demo-token-" + Math.random().toString(36).substring(2));
      
      // Redirect to dashboard after successful signup
      router.push("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else if (error.message === 'Network Error') {
          setError("Cannot connect to server. Please try again later.");
        } else {
          setError("Sign up failed: " + error.message);
        }
      } else {
        setError("An unexpected error occurred during sign-up");
      }
    }
  };
  
  const handleGoogleSignIn = () => {
    // For development/demo purposes - simulate successful Google login
    // In production, uncomment the actual redirect
    /*
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`; // Redirect to Google auth
    */
    
    // Demo mode - create a mock token and redirect
    localStorage.setItem('token', 'google-signup-demo-token-' + Math.random().toString(36).substring(2));
    router.push("/dashboard");
  };


  return (
    // <MainLayout className="bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        <div className="wrapper sign-in-form max-w-4xl mx-auto">
          <div className="form-box register">
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

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button type="submit" className="btn">Sign Up</button>

          <div className="mt-4">
            <button 
              type="button"
              onClick={handleGoogleSignIn}
              className="google-btn flex items-center gap-2 p-2 border rounded-lg"
            >
              <Image src="/google.svg" alt="Google logo" width={20} height={20} className="h-5 w-5" />
              Sign up with Google
            </button>
          </div>
        </form>
      
        <div className="linkTxt">
            <p className="p-2 mt-4 text-center ">
            <span className="text-dark font-semibold text-sm">Already have an account?</span>
              <br/>
              <a href="/auth/signin" className="login-link">Login</a>
            </p>
          </div>
      </div>
      <div className="info-text register">
        <h2 className="well">Welcome!</h2>
        <hr className="my-4" />
        <p className="wel">Nairobi Verified, where Security is ensured.</p>
          </div>
        </div>
      </div>
    // </MainLayout>
  );
}
