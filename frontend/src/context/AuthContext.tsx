'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { apiService } from '@/lib/api';
import { User, LoginCredentials, RegisterData } from '@/types/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.auth.check();
        if (response.data.isAuthenticated) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.auth.login(credentials.email, credentials.password, credentials.rememberMe);
      const user = response.data.user;
      setUser(user);
      router.push(user.role === 'admin' ? '/admin/dashboard' : user.role === 'merchant' ? '/vendor/dashboard' : '/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Registering user with data:', {
        ...data,
        password: '[REDACTED]' // Don't log the actual password
      });
      
      // Verify backend URL from environment
      console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000');
      
      const endpoint = data.role === 'merchant' ? '/api/auth/register/merchant' : '/api/auth/register/client';
      const response = await apiService.auth.register(data, endpoint);
      console.log('Registration successful:', response.data);
      
      const { user, token } = response.data;
      
      // Save token and user info
      Cookies.set('auth_token', token, { expires: 7 });
      Cookies.set('user_info', JSON.stringify(user), { expires: 7 });
      
      setUser(user);
      
      // Redirect based on user role
      if (data.role === 'merchant') {
        router.push('/merchant/profile');
      } else {
        router.push('/auth/verify-email');
      }
      
      return { success: true, user };
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Extract error message from response if available
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Add more context for network errors
      if (!err.response && err.message.includes('Network Error')) {
        errorMessage = 'Network error: Unable to connect to the server. Please check that the backend server is running at ' + 
          (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000');
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiService.auth.logout();
    } catch (err) {
      console.error('Logout API call failed:', err);
    } finally {
      setUser(null);
      setIsLoading(false);
      router.push('/');
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiService.auth.forgotPassword(email);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to process password reset request.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiService.auth.resetPassword(token, password);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;