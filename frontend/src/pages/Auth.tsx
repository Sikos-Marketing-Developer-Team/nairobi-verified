import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

const Auth = () => {
  const { login, googleAuth, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  // FIX: Use useEffect to handle redirect instead of immediate Navigate
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔄 Auth component: User is authenticated, allowing context to handle redirect');
      // Don't navigate here - let the AuthContext handle the redirect
      // This prevents the race condition
    }
  }, [isAuthenticated]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      setLocalLoading(true);
      try {
        await login(formData.email, formData.password);
        // REMOVED: Don't show toast here - it's already handled in AuthContext
        // REMOVED: Don't navigate here - it's handled in AuthContext
      } catch (error: unknown) {
        console.error('Login error:', error);
        const err = error as { response?: { data?: { error?: string } } };
        toast({
          title: 'Login Failed',
          description: err.response?.data?.error || 'An error occurred during login',
          variant: 'destructive',
        });
      } finally {
        setLocalLoading(false);
      }
    } else {
      toast({
        title: 'Registration Not Available Here',
        description: 'Please use the registration page to create an account',
        variant: 'destructive',
      });
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
  try {
    console.log('👤 User Auth: Calling Google OAuth');
    await googleAuth(credentialResponse.credential);
    // Success handling is in AuthContext now
  } catch (error: unknown) {
    console.error('Google auth error:', error);
    
    const err = error as { response?: { data?: { error?: string; redirectTo?: string } } };
    
    // Check if this is a "wrong account type" error
    if (err.response?.data?.error?.includes('merchant') || 
        err.response?.data?.redirectTo === '/merchant/dashboard') {
      toast({
        title: 'Merchant Account Detected',
        description: 'This email is registered as a merchant. Please use the merchant login page.',
        variant: 'destructive',
        action: (
          <a 
            href="/merchant/sign-in" 
            className="text-white underline"
          >
            Go to Merchant Login
          </a>
        ),
      });
    } else {
      toast({
        title: 'Google Authentication Failed',
        description: err.response?.data?.error || 'Failed to authenticate with Google',
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

  // FIX: Remove the conditional return with Navigate - it causes the race condition
  // if (isAuthenticated) {
  //   return <Navigate to="/dashboard" />;
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center px-2 py-5">
      <div className="w-full max-w-[90vw] sm:max-w-sm space-y-4">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-block p-2 bg-white rounded-full shadow-sm mb-1">
            <div className="text-xl font-bold inter bg-gradient-to-r from-primary to-secondary-dark bg-clip-text text-transparent">
              NV
            </div>
          </div>
          <h1 className="text-xl font-bold inter">
            <span className="text-primary">Nairobi</span>
            <span className="text-secondary-dark"> Verified</span>
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isLogin ? 'Welcome back!' : 'Join our trusted marketplace'}
          </p>
        </div>

        <Card className="shadow-md border-t-2 border-primary">
          <CardHeader className="space-y-0.5 py-3">
            <CardTitle className="text-center text-lg font-semibold">
              {isLogin ? 'Sign In' : 'Create Account'}
            </CardTitle>
            <div className="text-center text-xs text-gray-500">
              Enter your credentials to {isLogin ? 'access your account' : 'create your account'}
            </div>
          </CardHeader>
          <CardContent className="px-4">
            <form onSubmit={handleSubmit} className="space-y-2">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-8 text-sm h-9"
                      required
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="pl-8 text-sm h-9"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-8 text-sm h-9"
                  required
                />
              </div>

              {!isLogin && (
                <div className="relative">
                  <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-8 text-sm h-9"
                    required
                  />
                </div>
              )}

              <div className="relative">
                <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-8 pr-8 text-sm h-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {!isLogin && (
                <div className="relative">
                  <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-8 text-sm h-9"
                    required
                  />
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5" />
                    <span className="ml-1 text-gray-600">Remember me</span>
                  </label>
                  <Link to="/auth/forgot-password" className="text-primary hover:text-primary-dark">
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-dark text-white text-sm h-9"
                disabled={localLoading || isLoading}
              >
                {(localLoading || isLoading) ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-gradient-to-br from-orange-50 to-yellow-50 px-2 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="w-full mt-3">
                {googleLoading ? (
                  <Button 
                    variant="outline" 
                    className="w-full bg-white hover:bg-gray-50 text-sm h-9"
                    disabled={true}
                  >
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
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
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </span>
              {isLogin ? (
                <Link
                  to="/auth/register"
                  className="ml-1 text-primary hover:text-primary-dark font-medium"
                >
                  Sign up
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="ml-1 text-primary hover:text-primary-dark font-medium"
                >
                  Sign in
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {isLogin && (
          <div className="mt-3 text-center text-xs text-gray-500">
            <p>Are you a business owner?</p>
            <Link to="/merchant/sign-in" className="text-primary hover:text-primary-dark font-medium">
              Sign in here
            </Link>
            <br/>
               or
               <br/>       <Link to="/auth/register/merchant" className="text-primary hover:text-primary-dark font-medium">
              Register your business
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;