import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  displayName: string;
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'client' | 'merchant';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/check`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.isAuthenticated) {
          setAuthState({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          router.push('/auth/signin');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        router.push('/auth/signin');
      }
    };

    checkAuth();
  }, [router]);

  return authState;
};