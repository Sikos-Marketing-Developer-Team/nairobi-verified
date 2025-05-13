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

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      
      try {
        // Check if we have a token
        const token = Cookies.get('auth_token');
        
        if (token) {
          // Get user info from cookie or API
          const userInfoCookie = Cookies.get('user_info');
          
          if (userInfoCookie) {
            setUser(JSON.parse(userInfoCookie));
          } else {
            // Fetch user info from API
            const response = await apiService.auth.me();
            const userData = response.data.data;
            
            setUser(userData);
            Cookies.set('user_info', JSON.stringify(userData), { expires: 7 });
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        // Clear cookies if auth check fails
        Cookies.remove('auth_token');
        Cookies.remove('user_info');
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
      const response = await apiService.auth.login(credentials.email, credentials.password);
      const { user, token } = response.data.data;
      
      // Save token and user info
      Cookies.set('auth_token', token, { expires: 7 });
      Cookies.set('user_info', JSON.stringify(user), { expires: 7 });
      
      setUser(user);
      
      // Redirect based on user role
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'merchant') {
        router.push('/merchant/profile');
      } else {
        router.push('/');
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
      const response = await apiService.auth.register(data);
      const { user, token } = response.data.data;
      
      // Save token and user info
      Cookies.set('auth_token', token, { expires: 7 });
      Cookies.set('user_info', JSON.stringify(user), { expires: 7 });
      
      setUser(user);
      
      // Redirect based on user role
      if (data.role === 'merchant') {
        router.push('/merchant/profile');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Call logout API
      await apiService.auth.logout();
    } catch (err) {
      console.error('Logout API call failed:', err);
    } finally {
      // Clear cookies and state regardless of API success
      Cookies.remove('auth_token');
      Cookies.remove('user_info');
      setUser(null);
      setIsLoading(false);
      
      // Redirect to home
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