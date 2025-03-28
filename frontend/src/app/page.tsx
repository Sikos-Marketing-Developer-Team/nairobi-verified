"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Home() {
  const [isActive, setIsActive] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [signupData, setSignupData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username: loginData.username,
        password: loginData.password,
      });
      const { token } = res.data;
      localStorage.setItem('token', token);
      router.push("/dashboard");
    } catch (error: unknown) {
      setError((error as any).response?.data?.message || "Login failed");
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", {
        name: signupData.username,
        email: signupData.email,
        password: signupData.password,
      });
      const { token } = res.data;
      localStorage.setItem('token', token);
      router.push("/dashboard");
    } catch (error) {
      setError((error as any).response?.data?.message || "Signup failed");
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="wrapper">
      <span className="rotate-bg"></span>
      <span className="rotate-bg2"></span>

      <div className="form-box login home-p">
        <h2 className="title animation" style={{ "--i": 0, "--j": 21 } as any}>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-box animation" style={{ "--i": 1, "--j": 22 } as any}>
            <input
              type="text"
              name="username"
              value={loginData.username}
              onChange={handleLoginChange}
              required
            />
            <label>Username</label>
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

          <button type="submit" className="btn animation" style={{ "--i": 3, "--j": 24 } as any}>
            Login
          </button>

         

          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <Image
                  src="/google.svg"
                  alt="Google logo"
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
              </span>
              Sign in with Google
            </button>
          </div>
        </form>

        <div className="linkTxt animation" style={{ "--i": 5, "--j": 25 } as any}>
            <p>Don't have an account? <a href="/auth/signup" className="register-link" >Sign Up</a></p>
          </div>
      </div>

      <div className="info-text login">
        <h2 className="animation" style={{ "--i": 0, "--j": 20 } as any}>Welcome Back!</h2>
        <p className="animation" style={{ "--i": 1, "--j": 21 } as any}>Nairobi Verified, where Security is ensured.</p>
      </div>

      <div className={`form-box register ${isActive ? 'active' : ''}`}>
        <h2 className="title animation" style={{ "--i": 17, "--j": 0 } as any}>Sign Up</h2>
        <form onSubmit={handleSignup}>
          <div className="input-box animation" style={{ "--i": 18, "--j": 1 } as any}>
            <input
              type="text"
              name="username"
              value={signupData.username}
              onChange={handleSignupChange}
              required
            />
            <label>Username</label>
            <i className="bx bxs-user"></i>
          </div>

          <div className="input-box animation" style={{ "--i": 19, "--j": 2 } as any}>
            <input
              type="email"
              name="email"
              value={signupData.email}
              onChange={handleSignupChange}
              required
            />
            <label>Email</label>
            <i className="bx bxs-envelope"></i>
          </div>

          <div className="input-box animation" style={{ "--i": 20, "--j": 3 } as any}>
            <input
              type="password"
              name="password"
              value={signupData.password}
              onChange={handleSignupChange}
              required
            />
            <label>Password</label>
            <i className="bx bxs-lock-alt"></i>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button type="submit" className="btn animation" style={{ "--i": 21, "--j": 4 } as any}>
            Sign Up
          </button>

          <div className="linkTxt animation" style={{ "--i": 22, "--j": 5 } as any}>
            <p>
              Already have an account?{" "}
              <a href="#" className="login-link" onClick={(e) => { e.preventDefault(); setIsActive(false); }}>
                Login
              </a>
            </p>
          </div>
        </form>
      </div>

      <div className={`info-text register ${isActive ? 'active' : ''}`}>
        <h2 className="animation" style={{ "--i": 17, "--j": 0 } as any}>Welcome Back!</h2>
        <p className="animation" style={{ "--i": 18, "--j": 1 } as any}>Nairobi Verified, where Security is ensured.</p>
      </div>
    </div>
  );
}