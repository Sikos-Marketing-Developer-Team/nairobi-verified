import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '@/lib/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { User, AuthContextType } from '@/types/authContext.ts';

type ReactNode = React.ReactNode;

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session management keys
const LS_AUTH_CHECKED_KEY = 'authChecked';
const LS_USER_ROLE_KEY = 'userRole'; // NEW: Store role separately for persistence

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  // Enhanced user state setter that persists role
  const setUserWithPersistence = useCallback((userData: User | null) => {
    if (userData && userData.role) {
      // Store role in sessionStorage for persistence
      sessionStorage.setItem(LS_USER_ROLE_KEY, userData.role);
      console.log('💾 Stored user role:', userData.role);
    } else if (userData === null) {
      // Clear stored role on logout
      sessionStorage.removeItem(LS_USER_ROLE_KEY);
      console.log('🧹 Cleared stored role');
    }
    
    setUser(userData);
  }, []);

  // CRITICAL FIX: Enhanced auth check with role persistence
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Checking authentication with role persistence...');
      
      try {
        console.log('🔄 Checking session via getMe...');
        const meResponse = await authAPI.getMe();
        const userData = meResponse.data.data;
        
        console.log('✅ getMe successful:', {
          email: userData.email,
          role: userData.role,
          hasStoredRole: sessionStorage.getItem(LS_USER_ROLE_KEY)
        });

        handleSuccessfulAuth(userData);
      } catch (getMeError) {
        console.log('❌ No active session, user is guest');
        // Even if session fails, try to restore from stored role if available
        const storedRole = sessionStorage.getItem(LS_USER_ROLE_KEY);
        if (storedRole) {
          console.log('🔄 Restoring from stored role:', storedRole);
          // We have a stored role but no active session - redirect to login
          if (location.pathname.startsWith('/merchant/')) {
            console.log('🔒 Merchant route without session, redirecting to login');
            navigate('/auth', { replace: true });
          }
        }
        setUserWithPersistence(null);
      } finally {
        setIsLoading(false);
        sessionStorage.setItem(LS_AUTH_CHECKED_KEY, 'true');
      }
    };

    const handleSuccessfulAuth = (userData: User) => {
      console.log('🎯 Setting user data with role persistence:', {
        id: userData.id || userData._id,
        email: userData.email,
        role: userData.role,
        isMerchant: userData.isMerchant,
        businessName: userData.businessName
      });

      // Block admin users
      if (userData.role === 'admin') {
        showToast('Admin Access', 'Please use the dedicated admin dashboard to access admin features.', 'destructive');
        setUserWithPersistence(null);
        return;
      }

      // CRITICAL FIX: Determine role intelligently based on multiple signals
      let determinedRole: 'user' | 'merchant' | 'admin' = 'user';
      
      if (userData.role) {
        // Backend explicitly provided role - trust it
        determinedRole = userData.role;
      } else if (userData.isMerchant || userData.businessName) {
        // Has merchant indicators - must be a merchant
        determinedRole = 'merchant';
      } else {
        // Fallback to stored role only if no other signals
        const storedRole = sessionStorage.getItem(LS_USER_ROLE_KEY) as 'user' | 'merchant' | 'admin';
        determinedRole = storedRole || 'user';
      }
      
      console.log('🎯 Determined role:', determinedRole, {
        fromBackend: userData.role,
        isMerchant: userData.isMerchant,
        hasBusinessName: !!userData.businessName,
        stored: sessionStorage.getItem(LS_USER_ROLE_KEY)
      });

      const userWithRole = {
        ...userData,
        role: determinedRole
      };

      setUserWithPersistence(userWithRole);
      
      // Smart navigation based on role and current route
      const isMerchant = userWithRole.role === 'merchant' || userWithRole.isMerchant || userWithRole.businessName;
      const targetPath = isMerchant ? '/merchant/dashboard' : '/dashboard';
      
      // Only navigate if we're on auth page or if we're on a merchant route without merchant role
      if (location.pathname === '/auth') {
        console.log('🚀 Redirecting to:', targetPath);
        navigate(targetPath, { replace: true });
        showToast('Login Successful', 'Your session has been restored');
      } else if (location.pathname.startsWith('/merchant/') && !isMerchant) {
        console.log('⚠️ Non-merchant on merchant route, redirecting to user dashboard');
        navigate('/dashboard', { replace: true });
      }
    };

    // Check auth on mount and also when route changes to merchant routes
    if (!sessionStorage.getItem(LS_AUTH_CHECKED_KEY) || location.pathname.startsWith('/merchant/')) {
      checkAuth();
    } else {
      setIsLoading(false);
    }

    // Clear auth check flag when navigating away
    return () => {
      // Don't clear the checked flag immediately to prevent excessive API calls
      setTimeout(() => {
        if (!location.pathname.startsWith('/merchant/')) {
          sessionStorage.removeItem(LS_AUTH_CHECKED_KEY);
        }
      }, 1000);
    };
  }, [navigate, location, showToast, setUserWithPersistence]);

  // Enhanced auth check for merchant routes
  useEffect(() => {
    // Additional check when navigating to merchant routes
    if (location.pathname.startsWith('/merchant/') && user && user.role !== 'merchant') {
      console.log('🛑 Unauthorized merchant route access, redirecting...');
      navigate('/dashboard', { replace: true });
      showToast('Access Denied', 'Merchant dashboard is for merchants only', 'destructive');
    }
  }, [location.pathname, user, navigate, showToast]);

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
      
      // CRITICAL FIX: Set user state WITH role persistence
      setUserWithPersistence({
        ...userData,
        role: userData.role || 'user'
      });
      
      sessionStorage.removeItem(LS_AUTH_CHECKED_KEY);
      
      const targetPath = userData.role === 'merchant' || userData.isMerchant || userData.businessName 
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
    
    // Step 1: Login
    const response = await authAPI.loginMerchant(email, password);
    const { user: userData } = response.data;
    
    if (userData.role === 'admin') {
      showToast('Admin Access Restricted', 'Admin users must use the dedicated admin dashboard.', 'destructive');
      throw new Error('Admin access restricted');
    }
    
    console.log('✅ Merchant login successful:', {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      businessName: userData.businessName
    });
    
    // ✅ CRITICAL FIX: Verify session works BEFORE navigating
    console.log('🔍 Verifying session...');
    try {
      const meResponse = await authAPI.getMe();
      console.log('✅ Session verified:', meResponse.data.data);
      
      // Now we know the session works, set user state
      const verifiedUser = meResponse.data.data;
      setUserWithPersistence({
        ...verifiedUser,
        role: verifiedUser.role || 'merchant'
      });
      
      sessionStorage.removeItem(LS_AUTH_CHECKED_KEY);
      
      console.log('🚀 Navigating to merchant dashboard');
      navigate('/merchant/dashboard', { replace: true });
      
      showToast('Merchant Login Successful', 'Welcome to your merchant dashboard');
      return response;
    } catch (sessionError) {
      console.error('❌ Session verification failed:', sessionError);
      showToast(
        'Session Error', 
        'Login successful but session could not be established. Please try again.',
        'destructive'
      );
      throw new Error('Session verification failed');
    }
  }, 'Merchant Login', 'Merchant Login');
};

  const googleAuth = async (credential: string) => {
  return handleAuthAction(async () => {
    console.log('Google OAuth initiated');
    const response = await authAPI.googleAuth(credential);
    const { user: userData, redirectTo } = response.data;
    
    console.log('Google OAuth response:', {
      email: userData.email,
      isMerchant: userData.isMerchant,
      role: userData.role,
      redirectTo: redirectTo
    });
    
    if (userData.role === 'admin') {
      showToast('Admin Access Restricted', 'Admin users must use the dedicated admin dashboard.', 'destructive');
      throw new Error('Admin access restricted');
    }
    
    // CRITICAL FIX: Use redirectTo from backend response
    const targetPath = redirectTo || (userData.role === 'merchant' || userData.isMerchant || userData.businessName 
      ? '/merchant/dashboard' 
      : '/dashboard');
    
    console.log('Target path:', targetPath);
    
    // Set user state WITH role persistence
    setUserWithPersistence({
      ...userData,
      role: userData.role || (userData.isMerchant ? 'merchant' : 'user')
    });
    
    sessionStorage.removeItem(LS_AUTH_CHECKED_KEY);
    
    console.log('Navigating to:', targetPath);
    navigate(targetPath, { replace: true });
    
    const accountType = userData.isMerchant ? 'merchant' : 'user';
    showToast(
      'Google Login Successful', 
      `Logged in as ${accountType}. Redirecting to ${accountType === 'merchant' ? 'merchant dashboard' : 'dashboard'}`
    );
    
    return response;
  }, 'Google Login', 'Google Authentication');
};

  const register = async (userData: any) => {
    return handleAuthAction(async () => {
      const response = await authAPI.register(userData);
      // CRITICAL FIX: Set user state WITH role persistence
      setUserWithPersistence({
        ...response.data.user,
        role: response.data.user.role || 'user'
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
      // CRITICAL FIX: Set user state WITH role persistence
      setUserWithPersistence({
        ...response.data.user,
        role: response.data.user.role || 'merchant'
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
      // CRITICAL FIX: Clear all persistence
      setUserWithPersistence(null);
      sessionStorage.removeItem(LS_AUTH_CHECKED_KEY);
      sessionStorage.removeItem(LS_USER_ROLE_KEY);
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
      setUserWithPersistence(user ? { ...user, ...userData, role: user.role } : null);
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
      setUserWithPersistence({
        ...response.data.data,
        role: response.data.data.role || sessionStorage.getItem(LS_USER_ROLE_KEY) as 'user' | 'merchant' | 'admin' || 'user'
      });
      return true;
    } catch (error) {
      console.error('❌ Failed to refresh user data:', error);
      // If refresh fails, log the user out
      setUserWithPersistence(null);
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