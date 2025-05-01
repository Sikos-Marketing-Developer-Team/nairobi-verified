// Testing
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [isActive, setIsActive] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/check`, {
          credentials: "include",
        });
        
        const data = await response.json();
        if (data.isAuthenticated) {
          localStorage.setItem('user', JSON.stringify(data.user));
          redirectUser(data.user.role);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuthStatus();
  }, []);

  const redirectUser = (role: string) => {
    const redirectUrl = role === 'merchant' ? '/vendor/profile' : '/dashboard';
    window.location.href = redirectUrl;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          rememberMe: formData.rememberMe,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      console.log("Login response:", data);

      if (!data.user?.role) {
        throw new Error("User role not found in response");
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Wait briefly to ensure cookie is set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect based on role
      redirectUser(data.user.role);

    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`;
  };

  const handleRegisterClick = (type: 'client' | 'merchant') => {
    setIsActive(true);
    setTimeout(() => {
      router.push(`/auth/register/${type}`);
    }, 400);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="wrapper sign-in-form max-w-4xl mx-auto">
        <div className="form-box">
          <h2 className="title animation" style={{ "--i": 17, "--j": 0 } as any}>Sign In</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-box animation" style={{ "--i": 18, "--j": 1 } as any}>
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
            <div className="input-box animation" style={{ "--i": 19, "--j": 2 } as any}>
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
            <div className="remember-forgot animation" style={{ "--i": 20, "--j": 3 } as any}>
              <label>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => router.push('/auth/forgot-password')}
                className="forgot-password"
              >
                Forgot Password?
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-sm mb-4 animation" style={{ "--i": 21, "--j": 4 } as any}>
                {error}
              </p>
            )}
            <button
              type="submit"
              className="btn animation"
              style={{ "--i": 22, "--j": 5 } as any}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
            <div className="divider animation" style={{ "--i": 23, "--j": 6 } as any}>
              <span>or</span>
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="google-btn animation"
              style={{ "--i": 24, "--j": 7 } as any}
            >
              <i className="bx bxl-google"></i>
              Continue with Google
            </button>
            <div className="register-link animation" style={{ "--i": 25, "--j": 8 } as any}>
              <p>
                <span>Don't have an account?</span><br/>
                Register as <button
                  type="button"
                  onClick={() => handleRegisterClick('client')}
                  className="register-btn"
                  title="Client"
                >
                  Client
                </button>
                {" or "}
                <button
                  type="button"
                  onClick={() => handleRegisterClick('merchant')}
                  className="register-btn"
                  title="Merchant"
                >
                  Merchant
                </button>
              </p>
            </div>
          </form>
        </div>
        <div className="info-text">
          <h2 className="animation well" style={{ "--i": 0, "--j": 17 } as any}>Welcome Back!</h2>
          <hr className="my-4"/>
          <p className="animation wel" style={{ "--i": 1, "--j": 18 } as any}>
            Sign in to access your account and continue your journey with us.
          </p>
        </div>
      </div>
    </div>
  );
}