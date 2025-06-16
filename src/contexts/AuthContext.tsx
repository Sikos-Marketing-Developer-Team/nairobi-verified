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
  logout: () => Promise<void>;
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

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authAPI.getMe();
        setUser(response.data.data); // Adjust for backend response structure
      } catch (error) {
        console.error('Failed to fetch user data:', error);
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
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.isMerchant || user.businessName) {
        navigate('/merchant/dashboard');
      } else {
        navigate('/dashboard');
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
      setUser(user);
      navigate('/dashboard');
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
      setUser(user);
      navigate('/merchant/dashboard');
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
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
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
      const response = await authAPI.updateProfile(userData);
      setUser(prevUser => prevUser ? { ...prevUser, ...response.data.data } : null);
      return response.data;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async (): Promise<boolean> => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.data); // Adjust for backend response structure
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

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;