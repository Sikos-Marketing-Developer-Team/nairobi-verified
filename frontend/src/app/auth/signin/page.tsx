"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignIn() {
  const [isActive, setIsActive] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      setError("An error occurred during Google sign in");
    }
  };

  const handleRegisterClick = (type: 'client' | 'merchant') => {
    setIsActive(true);
    setTimeout(() => {
      router.push(`/auth/register/${type}`);
    }, 400);
  };

  return (
    <div className="wrapper">
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
              Remember me
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
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => handleRegisterClick('client')}
                className="register-btn"
              >
                Register as Client
              </button>
              {" or "}
              <button
                type="button"
                onClick={() => handleRegisterClick('merchant')}
                className="register-btn"
              >
                Merchant
              </button>
            </p>
          </div>
        </form>
      </div>

      <div className="info-text">
        <h2 className="animation" style={{ "--i": 0, "--j": 17 } as any}>Welcome Back!</h2>
        <p className="animation" style={{ "--i": 1, "--j": 18 } as any}>
          Sign in to access your account and continue your journey with us.
        </p>
      </div>
    </div>
  );
}