import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

const MerchantAuth = () => {
  const { merchantLogin, googleAuth, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Redirect to merchant dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/merchant/dashboard" />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLocalLoading(true);
    try {
      // Use merchant login function instead of regular login
      await merchantLogin(formData.email, formData.password);
      toast({
        title: 'Merchant Login Successful',
        description: 'Welcome to your merchant dashboard',
      });
    } catch (error: any) {
      console.error('Merchant login error:', error);
      toast({
        title: 'Login Failed',
        description: error.response?.data?.error || 'An error occurred during login',
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
    try {
      // You might want to create a separate googleMerchantAuth function
      // or modify googleAuth to handle merchant authentication
      await googleAuth(credentialResponse.credential
        // , 'merchant'
    );
      toast({
        title: 'Merchant Login Successful',
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-2 py-2">
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
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Business Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-8 text-sm h-9"
                  required
                />
              </div>

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

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-600 h-3.5 w-3.5" />
                  <span className="ml-1 text-gray-600">Remember me</span>
                </label>
                <a href="/auth/merchant/forgot-password" className="text-blue-600 hover:text-blue-800">
                  Forgot password?
                </a>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm h-9"
                disabled={localLoading || isLoading}
              >
                {(localLoading || isLoading) ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
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
                Don't have a merchant account?
              </span>
              <a
                href="/auth/register/merchant"
                className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
              >
                Register your business
              </a>
            </div>

            <div className="text-center mt-2 text-xs">
              <span className="text-gray-600">
                Are you a customer?
              </span>
              <a
                href="/auth/login"
                className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
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