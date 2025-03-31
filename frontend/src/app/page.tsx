"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [isActive, setIsActive] = useState(false);
  const [selectedType, setSelectedType] = useState<"client" | "merchant" | null>(null);
  const router = useRouter();


  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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


  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/auth/register/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess("Registration successful! Please check your email for verification.");
      setTimeout(onSuccess, 3000);
    } catch (error) {

      setError((error as any).response?.data?.message || "Signup failed");
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-box">
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

      <div className="input-box">
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <label>Email Address</label>
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
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        <label>Password</label>
        <i className={`bx ${showPassword ? 'bxs-show' : 'bxs-hide'} cursor-pointer`} 
           onClick={() => setShowPassword(!showPassword)}></i>
      </div>

      <div className="input-box">
        <input
          type={showPassword ? "text" : "password"}
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
        className="btn"
        disabled={isLoading}
      >
        {isLoading ? "Registering..." : "Register"}
      </button>

      <div className="divider">
        <span>or</span>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignUp}
        className="google-btn"
      >
        <i className="bx bxl-google"></i>
        Sign up with Google
      </button>

      <div className="mt-4 text-center">
        <p className="text-sm">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/signin")}
            className="forgot-password"
          >
            Login
          </button>
        </p>
      </div>
    </form>
  );
}

         

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register/merchant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess("Registration successful! Please check your email for verification.");
      setTimeout(onSuccess, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-box">
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleInputChange}
          required
        />
        <label>Company Name</label>
        <i className="bx bxs-building"></i>
      </div>

      <div className="input-box">
        <input
          type="email"
          name="companyEmail"
          value={formData.companyEmail}
          onChange={handleInputChange}
          required
        />
        <label>Company Email</label>
        <i className="bx bxs-envelope"></i>
      </div>

      <div className="input-box">
        <input
          type="tel"
          name="companyPhone"
          value={formData.companyPhone}
          onChange={handleInputChange}
          required
        />
        <label>Company Phone Number</label>
        <i className="bx bxs-phone"></i>
      </div>

      <div className="input-box">
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          required
        />
        <label>Company Location</label>
        <i className="bx bxs-map"></i>
      </div>

      <div className="input-box">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        <label>Password</label>
        <i className={`bx ${showPassword ? 'bxs-show' : 'bxs-hide'} cursor-pointer`} 
           onClick={() => setShowPassword(!showPassword)}></i>
      </div>

      <div className="input-box">
        <input
          type={showPassword ? "text" : "password"}
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
        className="btn"
        disabled={isLoading}
      >
        {isLoading ? "Registering..." : "Register"}
      </button>

      <div className="mt-4 text-center">
        <p className="text-sm">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/signin")}
            className="forgot-password"
          >
            Login
          </button>
        </p>
      </div>
    </form>
  );
}