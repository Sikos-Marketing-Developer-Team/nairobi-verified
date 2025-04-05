"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";

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
      // Send registration request to backend
      const res = await axios.post("http://localhost:5000/api/auth/signup", formData);
  
      if (res.status === 201) {
        // Extract token from response
        const { token } = res.data;
  
        // Store token in localStorage (or use cookies for better security)
        localStorage.setItem("token", token);
  
        // Redirect to dashboard after successful signup
        router.push("/dashboard");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("An error occurred during sign-up");
      }
    }
  };
  
  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:5000/api/auth/google"; // Redirect to Google auth
  };


  return (
    <div className="wrapper sign-in-form">
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
  );
}
