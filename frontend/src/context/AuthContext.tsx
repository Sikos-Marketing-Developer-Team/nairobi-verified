'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { apiService } from '../lib/api';
import { User, LoginCredentials, RegisterData } from '../types/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<{ success: boolean; user?: any; error?: string }>;
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
        // First check if we have a token in cookies
        const token = Cookies.get('token');
        const userInfo = Cookies.get('user_info');
        
        if (token && userInfo) {
          // If we have local tokens, set the user from cookies first for faster UI loading
          try {
            const userData = JSON.parse(userInfo);
            setUser(userData);
          } catch (e) {
            console.error('Failed to parse user info from cookies:', e);
          }
          
          // Then verify with the server
          try {
            const response = await apiService.auth.check();
            if (response.data.isAuthenticated) {
              setUser(response.data.user);
            } else {
              // If server says not authenticated but we have cookies, clear them
              Cookies.remove('token');
              Cookies.remove('user_role');
              Cookies.remove('user_info');
              localStorage.removeItem('token');
              setUser(null);
            }
          } catch (err: any) {
            console.error('Auth check failed:', err);
            // Don't clear cookies on network errors to allow offline usage
            if (err.response) {
              // Only clear on actual auth errors, not network errors
              Cookies.remove('token');
              Cookies.remove('user_role');
              Cookies.remove('user_info');
              localStorage.removeItem('token');
              setUser(null);
            }
          }
        } else {
          // No token in cookies, try to get user info from server
          try {
            const response = await apiService.auth.check();
            if (response.data.isAuthenticated) {
              setUser(response.data.user);
              // Save the user info to cookies
              Cookies.set('token', response.data.token, { expires: 7 });
              Cookies.set('user_role', response.data.user.role, { expires: 7 });
              Cookies.set('user_info', JSON.stringify(response.data.user), { expires: 7 });
              localStorage.setItem('token', response.data.token);
            } else {
              setUser(null);
            }
          } catch (err: any) {
            console.error('Auth check failed:', err);
            setUser(null);
          }
        }
      } catch (err: any) {
        console.error('Auth check process failed:', err);
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
      const { user, token } = response.data;
      
      // Save token and user info
      Cookies.set('token', token, { 
        expires: credentials.rememberMe ? 30 : 1, // 30 days if remember me, 1 day if not
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      Cookies.set('user_role', user.role, { 
        expires: credentials.rememberMe ? 30 : 1,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      Cookies.set('user_info', JSON.stringify(user), { 
        expires: credentials.rememberMe ? 30 : 1,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      // Also save to localStorage for the API interceptor
      localStorage.setItem('token', token);
      
      setUser(user);
      
      // Redirect based on user role
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'merchant') {
        router.push('/vendor/dashboard');
      } else {
        router.push('/dashboard');
      }
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
      console.log('Backend URL:', process.env.NEXT_PUBLIC_API_URL || 'https://nairobi-verified-backend.onrender.com/api');
      
      const endpoint = data.role === 'merchant' ? '/auth/register/merchant' : '/auth/register/client';
      const response = await apiService.auth.register(data);
      console.log('Registration successful:', response.data);
      
      const { user, token } = response.data;
      
      // Save token and user info
      Cookies.set('token', token, { expires: 7 });
      Cookies.set('user_role', user.role, { expires: 7 });
      Cookies.set('user_info', JSON.stringify(user), { expires: 7 });
      
      // Also save to localStorage for the API interceptor
      localStorage.setItem('token', token);
      
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
          (process.env.NEXT_PUBLIC_API_URL || 'https://nairobi-verified-backend.onrender.com/api');
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
      // Clear all auth cookies
      Cookies.remove('token');
      Cookies.remove('user_role');
      Cookies.remove('user_info');
      Cookies.remove('auth_token');
      
      // Clear localStorage
      localStorage.removeItem('token');
      
      // Reset user state
      setUser(null);
      setIsLoading(false);
      
      // Redirect to home page
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