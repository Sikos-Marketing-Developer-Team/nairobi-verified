import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '@/lib/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { User, AuthContextType } from '@/types/authContext.ts';

type ReactNode = React.ReactNode;

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// LocalStorage keys
const LS_USER_KEY = 'currentUser';
const LS_AUTH_CHECKED_KEY = 'authChecked';

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize user from localStorage if available
    const storedUser = localStorage.getItem(LS_USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LS_USER_KEY);
    }
  }, [user]);

  // Show toast notification helper
  const showToast = useCallback((title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    toast({
      title,
      description,
      variant,
      position: 'top-center',
      style: {
        background: variant === 'destructive' ? 'crimson' : '#16a34a',
        color: 'white',
      },
    });
  }, [toast]);

  // Check authentication and handle OAuth callback
  useEffect(() => {
    const checkAuth = async () => {
      // Skip if we've already checked auth in this session
      if (sessionStorage.getItem(LS_AUTH_CHECKED_KEY)) {
        setIsLoading(false);
        return;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        // Check session status
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'https://nairobi-cbd-backend.onrender.com/api'}/auth/check`,
          { 
            credentials: 'include',
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success && data.isAuthenticated && data.user) {
          handleSuccessfulAuth(data.user);
          return;
        }

        // Fallback to getMe for OAuth callback
        try {
          const meResponse = await authAPI.getMe();
          handleSuccessfulAuth(meResponse.data.data);
        } catch (getMeError) {
          console.log('User not authenticated, continuing with guest mode');
        }
      } catch (error: any) {
        console.warn('Auth check failed:', error.message);
        handleAuthError(error);
      } finally {
        setIsLoading(false);
        sessionStorage.setItem(LS_AUTH_CHECKED_KEY, 'true');
      }
    };

    const handleSuccessfulAuth = (userData: User) => {
      // Block admin users
      if (userData.role === 'admin') {
        showToast('Admin Access', 'Please use the dedicated admin dashboard to access admin features.', 'destructive');
        setUser(null);
        return;
      }

      setUser(userData);
      const redirectPath = userData.isMerchant || userData.businessName 
        ? '/merchant/dashboard' 
        : '/dashboard';
      
      navigate(redirectPath, { replace: true });
      showToast('Login Successful', 'Your session has been restored');
    };

    const handleAuthError = (error: any) => {
      const urlParams = new URLSearchParams(location.search);
      if (urlParams.get('error') === 'authentication_failed') {
        showToast(
          'Authentication Failed',
          urlParams.get('message') || 'Failed to authenticate. Please try again.',
          'destructive'
        );
      }
    };

    checkAuth();
  }, [navigate, location, showToast]);

  // Auth functions
  const handleAuthAction = async (
    action: () => Promise<any>,
    successMessage: string,
    errorPrefix: string
  ) => {
    setIsLoading(true);
    try {
      const response = await action();
      return response;
    } catch (error: any) {
      console.error(`${errorPrefix}:`, error);
      showToast(
        `${errorPrefix} Failed`,
        error.response?.data?.error || 'An unexpected error occurred',
        'destructive'
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    return handleAuthAction(async () => {
      const response = await authAPI.login(email, password);
      const { user } = response.data;
      
      if (user.role === 'admin') {
        showToast('Admin Access Restricted', 'Admin users must use the dedicated admin dashboard.', 'destructive');
        throw new Error('Admin access restricted');
      }
      
      setUser(user);
      navigate(user.isMerchant || user.businessName 
        ? '/merchant/dashboard' 
        : '/dashboard', 
        { replace: true }
      );
      showToast('Login Successful', 'You have been logged in',);
      return response;
    }, 'Login', 'Login');
  };

  const googleAuth = async (credential: string) => {
    return handleAuthAction(async () => {
      const response = await authAPI.googleAuth(credential);
      const { user } = response.data;
      
      if (user.role === 'admin') {
        showToast('Admin Access Restricted', 'Admin users must use the dedicated admin dashboard.', 'destructive');
        throw new Error('Admin access restricted');
      }
      
      setUser(user);
      navigate(user.isMerchant || user.businessName 
        ? '/merchant/dashboard' 
        : '/dashboard', 
        { replace: true }
      );
      showToast('Google Login Successful', 'You have been logged in with Google');
      return response;
    }, 'Google Login', 'Google Authentication');
  };

  const register = async (userData: any) => {
    return handleAuthAction(async () => {
      const response = await authAPI.register(userData);
      setUser(response.data.user);
      navigate('/dashboard', { replace: true });
      showToast('Registration Successful', 'Your account has been created');
      return response;
    }, 'Registration', 'Registration');
  };

  const registerMerchant = async (merchantData: any) => {
    return handleAuthAction(async () => {
      const response = await authAPI.registerMerchant(merchantData);
      setUser(response.data.user);
      navigate('/merchant/dashboard', { replace: true });
      showToast('Merchant Registration Successful', 'Your merchant account has been created');
      return response;
    }, 'Merchant Registration', 'Merchant Registration');
  };

  const logout = async () => {
    return handleAuthAction(async () => {
      await authAPI.logout();
      setUser(null);
      localStorage.removeItem(LS_USER_KEY);
      navigate('/', { replace: true });
      showToast('Logout Successful', 'You have been logged out', 'destructive'
      );
    }, 'Logout', 'Logout');
  };

  const forgotPassword = async (email: string) => {
    return handleAuthAction(async () => {
      const response = await authAPI.forgotPassword(email);
      showToast('Password Reset Email Sent', 'Check your email for instructions');
      return response;
    }, 'Password Reset', 'Password Reset');
  };

  const resetPassword = async (token: string, password: string) => {
    return handleAuthAction(async () => {
      const response = await authAPI.resetPassword(token, password);
      showToast('Password Reset Successful', 'Your password has been updated');
      navigate('/auth', { replace: true });
      return response;
    }, 'Password Reset', 'Password Reset');
  };

  const updateProfile = async (userData: any) => {
    return handleAuthAction(async () => {
      const response = await authAPI.updateProfile(userData);
      setUser(prev => prev ? { ...prev, ...userData } : null);
      showToast('Profile Updated', 'Your profile has been updated');
      return response;
    }, 'Profile Update', 'Profile Update');
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;