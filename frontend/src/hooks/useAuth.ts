import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { User } from '@/types';
import { toast } from 'react-hot-toast';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiService.auth.check()
        .then(response => {
          setUser(response.data.user);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await apiService.auth.login(email, password, rememberMe);
      const { token, user, requirePasswordChange } = response.data;
      
      localStorage.setItem('token', token);
      if (user?.role) {
        localStorage.setItem('userRole', user.role);
      }
      
      setUser(user);
      setIsAuthenticated(true);
      
      // Check if password change is required
      if (requirePasswordChange) {
        setRequirePasswordChange(true);
        // Redirect to password change page
        router.push('/auth/change-password');
        toast.success('Please change your temporary password before continuing');
        return { user, requirePasswordChange: true };
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  }, [router]);

  const register = useCallback(async (userData: any) => {
    try {
      const response = await apiService.auth.register(userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      
      return user;
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiService.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const check = useCallback(async () => {
    try {
      const response = await apiService.auth.check();
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data.user;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  }, []);

  const me = useCallback(async () => {
    try {
      const response = await apiService.auth.me();
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data.user;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      const response = await apiService.auth.changePassword(currentPassword, newPassword);
      setRequirePasswordChange(false);
      
      // Update user in state if returned in response
      if (response.data?.user) {
        setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    user,
    loading,
    isAuthenticated,
    requirePasswordChange,
    login,
    register,
    logout,
    check,
    me,
    changePassword,
  };
};