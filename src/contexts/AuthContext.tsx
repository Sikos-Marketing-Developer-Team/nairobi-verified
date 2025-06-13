import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

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
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (userData: any) => Promise<void>;
  refreshUser: () => Promise<boolean>;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authAPI.getMe();
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // No need to clear localStorage with session auth
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { user } = response.data;
      
      setUser(user);
      
      // Redirect based on user role or isMerchant flag
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.isMerchant || user.businessName) {
        navigate('/merchant/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(userData);
      const { user } = response.data;
      
      // With session auth, user is automatically logged in
      setUser(user);
      navigate('/');
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
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
      
      // With session auth, merchant is automatically logged in
      setUser(user);
      navigate('/merchant/dashboard');
      return response.data;
    } catch (error) {
      console.error('Merchant registration failed:', error);
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
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // With session auth, just clear the user state
      setUser(null);
      navigate('/');
      setIsLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    try {
      const response = await authAPI.forgotPassword(email);
      return response.data;
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (token: string, password: string) => {
    try {
      const response = await authAPI.resetPassword(token, password);
      return response.data;
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (userData: any) => {
    setIsLoading(true);
    try {
      // For session auth, we'll need to implement this API call
      // For now, we'll just update the local state
      setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
      
      return userData;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh user data function
  const refreshUser = async (): Promise<boolean> => {
    try {
      const response = await authAPI.getMe();
      const userData = response.data;
      
      setUser(userData);
      
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