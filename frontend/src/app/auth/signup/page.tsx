"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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
      // Send request to backend API for user registration
      const response = await axios.post("http://localhost:5000/api/auth/signup", formData);

      if (response.status === 201) {
        // Auto-login after successful registration
        await signIn("credentials", {
          username: formData.username,
          password: formData.password,
          redirect: false,
        });

        router.push("/dashboard"); // Redirect to dashboard
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("An error occurred during sign-up");
      }
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
            <p className="p-2">
              Already have an account? {" "}
              <a href="/auth/signin" className="login-link">Login</a>
            </p>
          </div>
      </div>
      <div className="info-text register">
        <h2>Welcome Back!</h2>
        <p>Nairobi Verified, where Security is ensured.</p>
      </div>
    </div>
  );
}
