"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signup`,
        {
          fullName: formData.username,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        },
        { withCredentials: true }
      );

      if (res.status === 201) {
        setSuccess("Registration successful! Please check your email for verification.");
        router.push("/auth/verify-email");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Sign up failed: " + error.message);
      } else {
        setError("An unexpected error occurred during sign-up");
      }
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`;
  };

  if (isLoading) return <div>Loading...</div>;

  return (
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
            {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

            <button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? "Signing Up..." : "Sign Up"}
            </button>

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
            <p className="p-2 mt-4 text-center">
              <span className="text-dark font-semibold text-sm">Already have an account?</span>
              <br />
              <a href="/auth/signin" className="login-link">
                Login
              </a>
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
  );
}