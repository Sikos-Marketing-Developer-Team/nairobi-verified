import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const MerchantAuth = () => {
  const { merchantLogin, googleAuth, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect to merchant dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/merchant/dashboard" replace />;
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    setLocalLoading(true);
    setErrors({});

    try {
      await merchantLogin(formData.email, formData.password);
      
      toast({
        title: 'Merchant Login Successful',
        description: 'Welcome to your merchant dashboard',
      });
    } catch (error: any) {
      console.error('Merchant login error:', error);
      
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'An error occurred during login';
      
      setErrors({ general: errorMessage });
      
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
  if (!credentialResponse.credential) {
    toast({
      title: 'Google Authentication Failed',
      description: 'No credential received from Google',
      variant: 'destructive',
    });
    return;
  }

  setGoogleLoading(true);
  setErrors({});

  try {
    console.log('🏪 Merchant Auth: Calling Google OAuth');
    await googleAuth(credentialResponse.credential);
    
    // Success - toast is shown in AuthContext
  } catch (error: any) {
    console.error('Google auth error:', error);
    
    // Check if this is a "wrong account type" error
    if (error.response?.data?.redirectTo === '/dashboard' ||
        error.response?.data?.error?.includes('user')) {
      toast({
        title: 'User Account Detected',
        description: 'This email is registered as a user account, not a merchant. Redirecting to user login...',
        variant: 'destructive',
      });
      
      // Redirect to user login after 2 seconds
      setTimeout(() => {
        window.location.href = '/auth';
      }, 2000);
    } else if (error.response?.data?.error?.includes('not verified')) {
      toast({
        title: 'Merchant Account Not Verified',
        description: 'Your merchant account needs to be verified before you can log in.',
        variant: 'destructive',
      });
    } else {
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'Failed to authenticate with Google';
      
      setErrors({ general: errorMessage });
      
      toast({
        title: 'Google Authentication Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  } finally {
    setGoogleLoading(false);
  }
};

  const handleGoogleError = () => {
    toast({
      title: 'Google Authentication Failed',
      description: 'Google authentication was cancelled or failed',
      variant: 'destructive',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4 py-4">
      <div className="w-full max-w-[90vw] sm:max-w-sm space-y-4">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-block p-2 bg-white rounded-full shadow-sm mb-1">
            <div className="text-xl font-bold inter bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              NV
            </div>
          </div>
          <h1 className="text-xl font-bold inter">
            <span className="text-blue-600">Nairobi</span>
            <span className="text-indigo-600"> Verified</span>
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Merchant Portal - Sign In
          </p>
        </div>

        <Card className="shadow-md border-t-2 border-blue-600">
          <CardHeader className="space-y-0.5 py-3">
            <CardTitle className="text-center text-lg font-semibold">
              Merchant Sign In
            </CardTitle>
            <div className="text-center text-xs text-gray-500">
              Access your business account
            </div>
          </CardHeader>
          <CardContent className="px-4">
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800" role="alert">
                {errors.general}
              </div>
            )}

            {/* COMMENTED OUT: Email/Password login - Using Google OAuth only */}
            {/* 
            <form onSubmit={handleSubmit} className="space-y-2" noValidate>
              <div className="relative">
                <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Business Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`pl-8 text-sm h-9 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                  required
                  aria-describedby={errors.email ? "email-error" : undefined}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p id="email-error" className="text-red-500 text-xs mt-1" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="relative">
                <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`pl-8 pr-8 text-sm h-9 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  required
                  aria-describedby={errors.password ? "password-error" : undefined}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {errors.password && (
                  <p id="password-error" className="text-red-500 text-xs mt-1" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-600 h-3.5 w-3.5" 
                  />
                  <span className="ml-1 text-gray-600">Remember me</span>
                </label>
                <a 
                  href="/auth/merchant/forgot-password" 
                  className="text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
                >
                  Forgot password?
                </a>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm h-9"
                disabled={localLoading || isLoading}
                aria-live="polite"
              >
                {(localLoading || isLoading) ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />
                    Signing In...
                  </>
                ) : (
                  'Sign In as Merchant'
                )}
              </Button>
            </form>

            <div className="mt-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-gradient-to-br from-blue-50 to-indigo-50 px-2 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>
            */}

            {/* Google Sign In - Primary merchant login method */}
            <div className="space-y-3">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">Sign in with your Google account to continue</p>
              </div>
              <div className="w-full mt-3">
                {googleLoading ? (
                  <Button 
                    variant="outline" 
                    className="w-full bg-white hover:bg-gray-50 text-sm h-9"
                    disabled={true}
                  >
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />
                    Connecting...
                  </Button>
                ) : (
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    theme="outline"
                    size="large"
                    width="100%"
                    text="signin_with"
                  />
                )}
              </div>
            </div>

            <div className="text-center mt-3 text-xs">
              <span className="text-gray-600">
                Don't have a merchant account?
              </span>
              <a
                href="/auth/register/merchant"
                className="ml-1 text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline"
              >
                Register your business
              </a>
            </div>

            <div className="text-center mt-2 text-xs">
              <span className="text-gray-600">
                Are you a customer?
              </span>
              <a
                href="/auth"
                className="ml-1 text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline"
              >
                Sign in as customer
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MerchantAuth;