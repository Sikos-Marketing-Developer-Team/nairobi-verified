import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { authAPI } from '@/lib/api';
import { usePageLoading } from '@/hooks/use-loading';
import { Skeleton } from '@/components/ui/skeleton';

const ForgotPassword = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isPageLoading = usePageLoading(400);
  
  // Check if this is for merchant password reset
  const isMerchantReset = location.pathname.includes('/merchant/');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the forgot password API endpoint
      // CORRECT - using the named export from authAPI
await authAPI.forgotPassword(email);
      
      setIsSubmitted(true);
      toast({
        title: "Email Sent",
        description: "If your email is registered with us, you'll receive a password reset link shortly.",
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      toast({
        title: "Request Failed",
        description: "We couldn't process your request. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          {/* Logo Skeleton */}
          <div className="text-center space-y-4">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>

          {/* Form Card Skeleton */}
          <div className="bg-white rounded-lg shadow-xl border-t-4 border-primary p-6 space-y-6">
            <div className="text-center space-y-2">
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-12 w-full" />
              </div>
              <Skeleton className="h-12 w-full" />
              <div className="text-center">
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center px-4">
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
            {isSubmitted ? 'Check your email' : (isMerchantReset ? 'Recover your merchant account' : 'Recover your account')}
          </p>
        </div>

        <Card className="shadow-xl border-t-4 border-primary">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-semibold">
              {isSubmitted ? 'Email Sent' : 'Forgot Password'}
            </CardTitle>
            <div className="text-center text-sm text-gray-500">
              {isSubmitted ? 'Check your inbox for recovery instructions' : (isMerchantReset ? 'Enter your business email to receive a reset link' : 'Enter your email to receive a reset link')}
            </div>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  We've sent recovery instructions to your email address. Please check your inbox and follow the instructions to reset your password.
                </p>
                <p className="text-gray-600">
                  If you don't see the email, check your spam folder.
                </p>
                <Button 
                  onClick={() => setIsSubmitted(false)} 
                  variant="outline" 
                  className="mt-4"
                >
                  Try again
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-gray-600 mb-4">
                  Enter your email address and we'll send you instructions to reset your password.
                </div>
                
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary-dark text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Recovery Email'
                  )}
                </Button>

                <div className="text-center mt-4">
                  <Link to="/auth/login" className="text-primary hover:text-primary-dark">
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;