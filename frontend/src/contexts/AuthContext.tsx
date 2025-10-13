import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '@/lib/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { User, AuthContextType } from '@/types/authContext.ts';

type ReactNode = React.ReactNode;

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// CRITICAL FIX: Remove localStorage initialization - always fetch fresh from session
const LS_AUTH_CHECKED_KEY = 'authChecked';

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // CRITICAL FIX: Start with null, don't load from localStorage
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

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

  // CRITICAL FIX: Always check session on mount, ignore localStorage
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Checking authentication...');
      
      try {
        // Use authAPI.getMe() instead of direct fetch to maintain consistency
        console.log('🔄 Checking session via getMe...');
        const meResponse = await authAPI.getMe();
        console.log('✅ getMe successful:', meResponse.data.data.email);
        handleSuccessfulAuth(meResponse.data.data);
      } catch (getMeError) {
        console.log('❌ No active session, user is guest');
        setUser(null);
      } finally {
        setIsLoading(false);
        // Mark that we've checked auth in this session
        sessionStorage.setItem(LS_AUTH_CHECKED_KEY, 'true');
      }
    };

    const handleSuccessfulAuth = (userData: User) => {
      console.log('🎯 Setting user data:', {
        id: userData.id || userData._id,
        email: userData.email,
        role: userData.role, // ← NOW INCLUDING ROLE
        isMerchant: userData.isMerchant,
        businessName: userData.businessName
      });

      // Block admin users
      if (userData.role === 'admin') {
        showToast('Admin Access', 'Please use the dedicated admin dashboard to access admin features.', 'destructive');
        setUser(null);
        return;
      }

      // CRITICAL FIX: Ensure role is included in user state
      setUser({
        ...userData,
        role: userData.role || 'user' // ← DEFAULT TO 'user' IF NOT PROVIDED
      });
      
      // Don't navigate if already on correct page
      const isMerchant = userData.isMerchant || userData.businessName;
      const targetPath = isMerchant ? '/merchant/dashboard' : '/dashboard';
      
      if (location.pathname === '/auth') {
        console.log('🚀 Redirecting to:', targetPath);
        navigate(targetPath, { replace: true });
        showToast('Login Successful', 'Your session has been restored');
      }
    };

    // Only check auth once per page load
    if (!sessionStorage.getItem(LS_AUTH_CHECKED_KEY)) {
      checkAuth();
    } else {
      setIsLoading(false);
    }

    // Clear auth check flag when navigating away
    return () => {
      sessionStorage.removeItem(LS_AUTH_CHECKED_KEY);
    };
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
      const { user: userData } = response.data;
      
      if (userData.role === 'admin') {
        showToast('Admin Access Restricted', 'Admin users must use the dedicated admin dashboard.', 'destructive');
        throw new Error('Admin access restricted');
      }
      
      console.log('👤 User login successful:', userData.email);
      
      // CRITICAL FIX: Set user state WITH role
      setUser({
        ...userData,
        role: userData.role || 'user' // ← ENSURING ROLE IS INCLUDED
      });
      
      // CRITICAL FIX: Clear session check flag to force re-check on next mount
      sessionStorage.removeItem(LS_AUTH_CHECKED_KEY);
      
      // CRITICAL FIX: Wait for state update and then navigate
      const targetPath = userData.isMerchant || userData.businessName 
        ? '/merchant/dashboard' 
        : '/dashboard';
      
      console.log('🚀 Navigating to:', targetPath);
      navigate(targetPath, { replace: true });
      
      showToast('Login Successful', 'You have been logged in');
      return response;
    }, 'Login', 'Login');
  };

  const merchantLogin = async (email: string, password: string) => {
    return handleAuthAction(async () => {
      console.log('🏪 Merchant login attempt:', email);
      const response = await authAPI.loginMerchant(email, password);
      const { user: userData } = response.data;
      
      if (userData.role === 'admin') {
        showToast('Admin Access Restricted', 'Admin users must use the dedicated admin dashboard.', 'destructive');
        throw new Error('Admin access restricted');
      }
      
      console.log('✅ Merchant login successful:', {
        id: userData.id,
        email: userData.email,
        role: userData.role, // ← NOW LOGGING ROLE
        businessName: userData.businessName
      });
      
      // CRITICAL FIX: Set user state WITH role
      setUser({
        ...userData,
        role: userData.role || 'merchant' // ← ENSURING ROLE IS INCLUDED
      });
      
      // Clear session check flag to force re-check on next mount
      sessionStorage.removeItem(LS_AUTH_CHECKED_KEY);
      
      console.log('🚀 Navigating to merchant dashboard');
      navigate('/merchant/dashboard', { replace: true });
      
      showToast('Merchant Login Successful', 'Welcome to your merchant dashboard');
      return response;
    }, 'Merchant Login', 'Merchant Login');
  };

  const googleAuth = async (credential: string) => {
    return handleAuthAction(async () => {
      const response = await authAPI.googleAuth(credential);
      const { user: userData } = response.data;
      
      if (userData.role === 'admin') {
        showToast('Admin Access Restricted', 'Admin users must use the dedicated admin dashboard.', 'destructive');
        throw new Error('Admin access restricted');
      }
      
      // CRITICAL FIX: Set user state WITH role
      setUser({
        ...userData,
        role: userData.role || 'user' // ← ENSURING ROLE IS INCLUDED
      });
      
      sessionStorage.removeItem(LS_AUTH_CHECKED_KEY);
      
      const targetPath = userData.isMerchant || userData.businessName 
        ? '/merchant/dashboard' 
        : '/dashboard';
      
      console.log('🚀 Navigating to:', targetPath);
      navigate(targetPath, { replace: true });
      
      showToast('Google Login Successful', 'You have been logged in with Google');
      return response;
    }, 'Google Login', 'Google Authentication');
  };

  const register = async (userData: any) => {
    return handleAuthAction(async () => {
      const response = await authAPI.register(userData);
      // CRITICAL FIX: Set user state WITH role
      setUser({
        ...response.data.user,
        role: response.data.user.role || 'user' // ← ENSURING ROLE IS INCLUDED
      });
      sessionStorage.removeItem(LS_AUTH_CHECKED_KEY);
      navigate('/dashboard', { replace: true });
      showToast('Registration Successful', 'Your account has been created');
      return response;
    }, 'Registration', 'Registration');
  };

  const registerMerchant = async (merchantData: any) => {
    return handleAuthAction(async () => {
      const response = await authAPI.registerMerchant(merchantData);
      // CRITICAL FIX: Set user state WITH role
      setUser({
        ...response.data.user,
        role: response.data.user.role || 'merchant' // ← ENSURING ROLE IS INCLUDED
      });
      sessionStorage.removeItem(LS_AUTH_CHECKED_KEY);
      navigate('/merchant/dashboard', { replace: true });
      showToast('Merchant Registration Successful', 'Your merchant account has been created');
      return response;
    }, 'Merchant Registration', 'Merchant Registration');
  };

  const logout = async () => {
    return handleAuthAction(async () => {
      await authAPI.logout();
      // CRITICAL FIX: Set user to null BEFORE navigation
      setUser(null);
      sessionStorage.removeItem(LS_AUTH_CHECKED_KEY);
      navigate('/', { replace: true });
      showToast('Logout Successful', 'You have been logged out', 'destructive');
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
      // CRITICAL FIX: Preserve role when updating profile
      setUser(prev => prev ? { ...prev, ...userData, role: prev.role } : null);
      showToast('Profile Updated', 'Your profile has been updated');
      return response;
    }, 'Profile Update', 'Profile Update');
  };

  const refreshUser = async (): Promise<boolean> => {
    try {
      console.log('🔄 Refreshing user data...');
      const response = await authAPI.getMe();
      console.log('✅ User data refreshed:', response.data.data.email);
      // CRITICAL FIX: Ensure role is included when refreshing
      setUser({
        ...response.data.data,
        role: response.data.data.role || 'user'
      });
      return true;
    } catch (error) {
      console.error('❌ Failed to refresh user data:', error);
      // If refresh fails, log the user out
      setUser(null);
      return false;
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    merchantLogin,
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