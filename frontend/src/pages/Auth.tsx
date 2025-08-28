import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

const Auth = () => {
  const { login, googleAuth, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
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

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

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
        toast({
          title: 'Login Successful',
          description: 'You have been logged in',
        });
      } catch (error: any) {
        console.error('Login error:', error);
        toast({
          title: 'Login Failed',
          description: error.response?.data?.error || 'An error occurred during login',
          variant: 'destructive',
        });
      } finally {
        setLocalLoading(false);
      }
    } else {
      // Registration is handled in UserRegister component
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
      await googleAuth(credentialResponse.credential);
      toast({
        title: 'Login Successful',
        description: 'You have been logged in with Google',
      });
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast({
        title: 'Google Authentication Failed',
        description: error.response?.data?.error || 'Failed to authenticate with Google',
        variant: 'destructive',
      });
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center px-4 py-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-block p-4 bg-white rounded-full shadow-md mb-2">
            <div className="text-3xl font-bold inter bg-gradient-to-r from-primary to-secondary-dark bg-clip-text text-transparent">
              NV
            </div>
          </div>
          <h1 className="text-3xl font-bold inter">
            <span className="text-primary">Nairobi</span>
            <span className="text-secondary-dark"> Verified</span>
          </h1>
          <p className="mt-2 text-gray-600">
            {isLogin ? 'Welcome back!' : 'Join our trusted marketplace'}
          </p>
        </div>

        <Card className="shadow-xl border-t-4 border-primary mt-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-semibold">
              {isLogin ? 'Sign In' : 'Create Account'}
            </CardTitle>
            <div className="text-center text-sm text-gray-500">
              Enter your credentials to {isLogin ? 'access your account' : 'create your account'}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>

              {!isLogin && (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              )}

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {!isLogin && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link to="/auth/forgot-password" className="text-sm text-primary hover:text-primary-dark">
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-dark text-white"
                disabled={localLoading || isLoading}
              >
                {(localLoading || isLoading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gradient-to-br from-orange-50 to-yellow-50 px-2 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="w-full mt-4">
                {googleLoading ? (
                  <Button 
                    variant="outline" 
                    className="w-full bg-white hover:bg-gray-50"
                    disabled={true}
                  >
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connecting with Google...
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

            <div className="text-center mt-4">
              <span className="text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </span>
              {isLogin ? (
                <Link
                  to="/auth/register"
                  className="ml-2 text-primary hover:text-primary-dark font-medium"
                >
                  Sign up
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="ml-2 text-primary hover:text-primary-dark font-medium"
                >
                  Sign in
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {isLogin && (
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Are you a business owner?</p>
            <Link to="/auth/register/merchant" className="text-primary hover:text-primary-dark font-medium">
              Register your business here
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;