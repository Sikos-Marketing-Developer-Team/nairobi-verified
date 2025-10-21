// src/components/ProtectedRoute.tsx
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireMerchant?: boolean;
}

const ProtectedRoute = ({ children, requireMerchant = false }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && requireMerchant && isAuthenticated && user?.role !== 'merchant') {
      console.log('❌ Access denied to merchant route:', {
        isAuthenticated,
        userRole: user?.role,
        isMerchant: user?.isMerchant,
        requireMerchant
      });
      
      toast({
        title: 'Access Denied',
        description: 'Merchant Dashboard is for Merchants only',
        variant: 'destructive',
        position: 'top-center',
        style: {
          background: 'crimson',
          color: 'white',
        },
      });
    }
  }, [isLoading, requireMerchant, isAuthenticated, user, toast]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    console.log('🔒 Not authenticated, redirecting to auth page');
    return <Navigate to="/auth" replace />;
  }

  // Check merchant role - CRITICAL FIX: Check role properly
  if (requireMerchant) {
    const isMerchantUser = user?.role === 'merchant' || user?.isMerchant;
    
    if (!isMerchantUser) {
      console.log('⛔ User is not a merchant, redirecting to user dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;