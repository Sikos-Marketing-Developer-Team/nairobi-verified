import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

// Define types
type User = {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  businessName?: string;
  email: string;
  role?: 'user' | 'merchant' | 'admin';
  avatar?: string;
  isVerified?: boolean;
  isMerchant?: boolean;
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  registerMerchant: (merchantData: any) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (userData: any) => Promise<void>;
  refreshUser: () => Promise<boolean>;
  googleAuth: () => void;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check authentication and handle OAuth callback
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authAPI.getMe();
        const user = response.data.data;
        setUser(user);

        // Redirect based on user role or isMerchant flag
        if (user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (user.isMerchant || user.businessName) {
          navigate('/merchant/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
        toast({
          title: 'Login Successful',
          description: 'You have been logged in with Google',
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate, toast]);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { user } = response.data;
      
      setUser(user);
      
      // Redirect based on user role or isMerchant flag
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.isMerchant || user.businessName) {
        navigate('/merchant/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
      toast({
        title: 'Login Successful',
        description: 'You have been logged in',
      });
    } catch (error: any) {
      console.error('Login failed:', error);
      toast({
        title: 'Login Failed',
        description: error.response?.data?.error || 'An error occurred during login',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Google auth function
  const googleAuth = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://nairobi-cbd-backend.onrender.com/api';
    window.location.href = `${apiUrl}/auth/google`;
  };

  // Register function
  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(userData);
      const { user } = response.data;
      
      setUser(user);
      navigate('/dashboard', { replace: true });
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created',
      });
      return response.data;
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast({
        title: 'Registration Failed',
        description: error.response?.data?.error || 'An error occurred during registration',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register merchant function
  const registerMerchant = async (merchantData: any) => {
    setIsLoading(true);
    try {
      const response = await authAPI.registerMerchant(merchantData);
      const { user } = response.data;
      
      setUser(user);
      navigate('/merchant/dashboard', { replace: true });
      toast({
        title: 'Merchant Registration Successful',
        description: 'Your merchant account has been created',
      });
      return response.data;
    } catch (error: any) {
      console.error('Merchant registration failed:', error);
      toast({
        title: 'Merchant Registration Failed',
        description: error.response?.data?.error || 'An error occurred during merchant registration',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
      setUser(null);
      navigate('/', { replace: true });
      toast({
        title: 'Logout Successful',
        description: 'You have been logged out',
      });
    } catch (error: any) {
      console.error('Logout failed:', error);
      toast({
        title: 'Logout Failed',
        description: error.response?.data?.error || 'An error occurred during logout',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    try {
      const response = await authAPI.forgotPassword(email);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your email for password reset instructions',
      });
      return response.data;
    } catch (error: any) {
      console.error('Forgot password failed:', error);
      toast({
        title: 'Forgot Password Failed',
        description: error.response?.data?.error || 'An error occurred while sending reset email',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (token: string, password: string) => {
    try {
      const response = await authAPI.resetPassword(token, password);
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been updated',
      });
      navigate('/auth', { replace: true });
      return response.data;
    } catch (error: any) {
      console.error('Reset password failed:', error);
      toast({
        title: 'Reset Password Failed',
        description: error.response?.data?.error || 'An error occurred while resetting password',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await authAPI.updateProfile(userData);
      setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
      return response.data;
    } catch (error: any) {
      console.error('Update profile failed:', error);
      toast({
        title: 'Update Profile Failed',
        description: error.response?.data?.error || 'An error occurred while updating profile',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data function
  const refreshUser = async (): Promise<boolean> => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.data);
      return true;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return false;
    }
  };

  // Context value
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    googleAuth,
    register,
    registerMerchant,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;