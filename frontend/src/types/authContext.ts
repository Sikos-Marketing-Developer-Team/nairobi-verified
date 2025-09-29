export type User = {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  businessName?: string;
  email: string;
  role?: 'user' | 'merchant' | 'admin';
  avatar?: string;
  isVerified?: boolean;
  isMerchant?: boolean;
  [key: string]: any;
};

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  registerMerchant: (merchantData: any) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (userData: any) => Promise<void>;
  refreshUser: () => Promise<boolean>;
  googleAuth: (credential: string) => Promise<any>;
  merchantLogin: (email: string, password: string) => Promise<void>;
};
