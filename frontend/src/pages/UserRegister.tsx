import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, CheckCircle } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

const UserRegister = () => {
  const { register, googleAuth, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [hasInteractedWithPassword, setHasInteractedWithPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  // Password requirements configuration
  const passwordRequirements = [
    { id: 'length', text: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    { id: 'uppercase', text: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { id: 'lowercase', text: 'One lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
    { id: 'number', text: 'One number', test: (pwd: string) => /[0-9]/.test(pwd) },
    { id: 'special', text: 'One special character', test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }
  ];

  // Validate password against all requirements
  const validatePassword = (password: string) => {
    const errors: string[] = [];
    passwordRequirements.forEach(req => {
      if (!req.test(password)) {
        errors.push(req.text);
      }
    });
    return errors;
  };

  // Check if password meets all requirements
  const isPasswordValid = (password: string) => {
    return passwordRequirements.every(req => req.test(password));
  };

  const handlePasswordChange = (value: string) => {
    setFormData(prev => ({ ...prev, password: value }));
    setHasInteractedWithPassword(true);
    
    // Validate password and update errors
    const errors = validatePassword(value);
    setPasswordErrors(errors);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'password') {
      handlePasswordChange(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }

    // Check if password meets all requirements
    if (!isPasswordValid(formData.password)) {
      toast({
        title: "Password doesn't meet requirements",
        description: "Please check the password requirements below",
        variant: "destructive"
      });
      return;
    }
    
    setLocalLoading(true);
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created',
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error.response?.data?.error || 'An error occurred during registration',
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
      await googleAuth(credentialResponse.credential);
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created with Google',
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

  const isFormValid = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.phone &&
      formData.password &&
      formData.confirmPassword &&
      isPasswordValid(formData.password) &&
      formData.password === formData.confirmPassword
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <Header />
      
      <div className="max-w-md mx-auto px-4 py-12">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold inter">
            <span className="text-primary">Nairobi</span>
            <span className="text-secondary-dark"> Verified</span>
          </h1>
          <p className="mt-2 text-gray-600">
            Join our trusted marketplace
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-semibold">
              Create Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              {/* Password Section */}
              <div className="space-y-3">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${
                      hasInteractedWithPassword && formData.password && !isPasswordValid(formData.password) 
                        ? 'border-red-500 focus:ring-red-500' 
                        : ''
                    }`}
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

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword 
                        ? 'border-red-500 focus:ring-red-500' 
                        : ''
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}

                {/* Password Requirements */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Password Requirements:
                  </h4>
                  <div className="grid grid-cols-1 gap-1">
                    {passwordRequirements.map((req) => {
                      const isMet = req.test(formData.password);
                      return (
                        <div key={req.id} className="flex items-center text-xs">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${
                            isMet ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            {isMet && (
                              <CheckCircle className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <span className={isMet ? 'text-green-600 font-medium' : 'text-gray-500'}>
                            {req.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Current Errors Display */}
                  {hasInteractedWithPassword && passwordErrors.length > 0 && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-700 text-xs font-medium mb-1">
                        Missing requirements:
                      </p>
                      <ul className="text-red-600 text-xs list-disc list-inside">
                        {passwordErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700">Password Strength:</span>
                        <span className={`text-xs font-bold ${
                          isPasswordValid(formData.password) 
                            ? 'text-green-600' 
                            : passwordErrors.length <= 2 
                              ? 'text-yellow-600' 
                              : 'text-red-600'
                        }`}>
                          {isPasswordValid(formData.password) 
                            ? 'Strong' 
                            : passwordErrors.length <= 2 
                              ? 'Medium' 
                              : 'Weak'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            isPasswordValid(formData.password) 
                              ? 'bg-green-500 w-full' 
                              : passwordErrors.length <= 2 
                                ? 'bg-yellow-500 w-2/3' 
                                : 'bg-red-500 w-1/3'
                          }`}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="rounded border-gray-300 text-primary focus:ring-primary" 
                  required 
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-dark text-white"
                disabled={localLoading || isLoading || !isFormValid()}
              >
                {(localLoading || isLoading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
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
                    text="continue_with"
                  />
                )}
              </div>
            </div>

            <div className="text-center mt-4">
              <span className="text-gray-600">
                Already have an account?
              </span>
              <Link
                to="/auth"
                className="ml-2 text-primary hover:text-primary-dark font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Are you a business owner?</p>
          <Link to="/auth/register/merchant" className="text-primary hover:text-primary-dark font-medium">
            Register your business here
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UserRegister;