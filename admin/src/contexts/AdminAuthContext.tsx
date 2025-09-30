import * as React from 'react';
const { createContext, useContext, useEffect, useState } = React;
type ReactNode = React.ReactNode;
import { adminAPI } from '../lib/api';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  lastLogin?: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      // Check if there's a token in localStorage first
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.log('No token found in localStorage');
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      console.log('Checking auth with token:', token.substring(0, 20) + '...');
      const response = await adminAPI.checkAuth();
      if (response.data.success && (response.data.admin || response.data.user)) {
        const adminUser = response.data.admin || response.data.user;
        setUser(adminUser);
        setIsAuthenticated(true);
        console.log('Auth check successful, user:', adminUser.email);
      } else {
        console.log('Auth check failed, invalid response');
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('adminToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await adminAPI.login(email, password);
      if (response.data.success && (response.data.admin || response.data.user)) {
        const adminUser = response.data.admin || response.data.user;
        const token = response.data.token;
        
        // Store token in localStorage
        if (token) {
          localStorage.setItem('adminToken', token);
        }
        
        setUser(adminUser);
        setIsAuthenticated(true);
        toast.success('Login successful!');
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await adminAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Remove token from localStorage
      localStorage.removeItem('adminToken');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AdminAuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
